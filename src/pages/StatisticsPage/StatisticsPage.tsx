import { useState, useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, TrendingUp, Users, Wallet, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { CHART_COLORS } from '@/lib/chart-colors';
import { useMembers, useFeeRecords, useActivities } from '@/hooks/useTwbStore';
import { exportToExcel } from '@/utils/excel';

export default function StatisticsPage() {
  const { members } = useMembers();
  const { records } = useFeeRecords();
  const { activities } = useActivities();
  const [period, setPeriod] = useState('semester');
  const [year, setYear] = useState('2026');

  // 快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleExport();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // 按支部统计报到率
  const branchReportData = useMemo(() => {
    const branches = Array.from(new Set(members.map((m) => m.branch)));
    return branches.map((branch) => {
      const branchMembers = members.filter((m) => m.branch === branch);
      const reported = branchMembers.filter((m) => m.isReported).length;
      const rate = branchMembers.length
        ? Math.round((reported / branchMembers.length) * 100)
        : 0;
      return { branch: branch.replace('团支部', ''), total: branchMembers.length, reported, rate };
    });
  }, [members]);

  // 团费收缴率月度趋势
  const feeTrendData = useMemo(() => {
    const monthsMap = new Map<string, { paid: number; total: number }>();
    records.forEach((r) => {
      if (!r.month.startsWith(year)) return;
      if (!monthsMap.has(r.month)) {
        monthsMap.set(r.month, { paid: 0, total: 0 });
      }
      const m = monthsMap.get(r.month)!;
      m.total += 1;
      if (r.status === '已缴') m.paid += 1;
    });
    const months = Array.from(monthsMap.keys()).sort();
    return {
      months,
      rates: months.map((m) => {
        const data = monthsMap.get(m)!;
        return data.total ? Math.round((data.paid / data.total) * 100) : 0;
      }),
    };
  }, [records, year]);

  // 团课参与率
  const participationData = useMemo(() => {
    const totalMembers = members.length;
    const participants = new Set<string>();
    const filtered = activities.filter((a) => a.time.startsWith(year));
    filtered.forEach((a) => a.participants.forEach((p) => participants.add(p)));
    const participatedCount = participants.size;
    const notParticipated = Math.max(0, totalMembers - participatedCount);
    return { participated: participatedCount, notParticipated };
  }, [members, activities, year]);

  const reportOption: EChartsOption = {
    color: [CHART_COLORS[0]],
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const list = Array.isArray(params) ? params : [params];
        return list.map((p) => `${p.name}<br/>报到率: ${p.value}%`).join('<br/>');
      },
    },
    grid: { left: '3%', right: '4%', bottom: '20%', containLabel: true },
    xAxis: {
      type: 'category',
      data: branchReportData.map((d) => d.branch),
      axisLabel: { interval: 0, rotate: 20 },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%' },
    },
    series: [
      {
        type: 'bar',
        data: branchReportData.map((d) => d.rate),
        barWidth: '40%',
        label: {
          show: true,
          position: 'top',
          formatter: (p) => `${p.value}%`,
        },
      },
    ],
  };

  const feeOption: EChartsOption = {
    color: [CHART_COLORS[1]],
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const list = Array.isArray(params) ? params : [params];
        return list.map((p) => `${p.name}<br/>收缴率: ${p.value}%`).join('<br/>');
      },
    },
    grid: { left: '3%', right: '4%', bottom: '20%', containLabel: true },
    xAxis: {
      type: 'category',
      data: feeTrendData.months,
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%' },
    },
    series: [
      {
        type: 'line',
        data: feeTrendData.rates,
        smooth: true,
        areaStyle: {
          opacity: 0.2,
        },
        label: {
          show: true,
          formatter: (p) => `${p.value}%`,
        },
      },
    ],
  };

  const activityOption: EChartsOption = {
    color: CHART_COLORS,
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const p = params as { name: string; value: number; percent: number };
        return `${p.name}: ${p.value}人 (${p.percent}%)`;
      },
    },
    legend: { type: 'scroll', bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['50%', '45%'],
        data: [
          { name: '已参与团员', value: participationData.participated },
          { name: '未参与团员', value: participationData.notParticipated },
        ],
        label: { show: false },
        emphasis: { label: { show: false } },
      },
    ],
  };

  const handleExport = () => {
    const data = {
      团员报到率: branchReportData.map((d) => ({
        支部: d.branch,
        总人数: d.total,
        已报到人数: d.reported,
        报到率: `${d.rate}%`,
      })),
      团费收缴率趋势: feeTrendData.months.map((m, i) => ({
        月份: m,
        收缴率: `${feeTrendData.rates[i]}%`,
      })),
      团课参与率: [
        { 类别: '已参与团员', 人数: participationData.participated },
        { 类别: '未参与团员', 人数: participationData.notParticipated },
      ],
    };
    exportToExcel(data, `统计报表_${year}.xlsx`);
    toast.success('统计报表导出成功');
  };

  const overviewStats = useMemo(
    () => [
      {
        label: '团员总数',
        value: members.length,
        unit: '人',
        icon: Users,
        color: 'text-primary',
      },
      {
        label: '平均报到率',
        value:
          branchReportData.length > 0
            ? Math.round(
                branchReportData.reduce((s, d) => s + d.rate, 0) / branchReportData.length,
              )
            : 0,
        unit: '%',
        icon: TrendingUp,
        color: 'text-secondary',
      },
      {
        label: '累计团费收缴',
        value: records.filter((r) => r.status === '已缴').reduce((s, r) => s + r.amount, 0).toFixed(2),
        unit: '元',
        icon: Wallet,
        color: 'text-amber-600',
      },
      {
        label: '活动参与率',
        value: members.length
          ? Math.round((participationData.participated / members.length) * 100)
          : 0,
        unit: '%',
        icon: BookOpen,
        color: 'text-emerald-600',
      },
    ],
    [members, branchReportData, records, participationData],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">数据统计</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semester">按学期</SelectItem>
              <SelectItem value="year">按学年</SelectItem>
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" onClick={handleExport}>
            <Download className="size-4" /> 导出报表
          </Button>
        </div>
      </div>

      {/* 概览卡 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-bold mt-2 tabular-nums">
                      {item.value}
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        {item.unit}
                      </span>
                    </p>
                  </div>
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className={`size-5 ${item.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 图表区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">团员报到率（按支部）</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts
              option={reportOption}
              theme="ud"
              style={{ height: '320px' }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">团费收缴率趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts
              option={feeOption}
              theme="ud"
              style={{ height: '320px' }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">团课参与率</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts
              option={activityOption}
              theme="ud"
              style={{ height: '320px' }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
