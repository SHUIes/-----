import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  ArrowLeftRight,
  Wallet,
  BookOpen,
  UserPlus,
  FileText,
  Megaphone,
  TrendingUp,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useMembers, useFeeRecords, useTransfers, useActivities, useOrgInfo } from '@/hooks/useTwbStore';
import { useMemo } from 'react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { members } = useMembers();
  const { records } = useFeeRecords();
  const { transfers } = useTransfers();
  const { activities } = useActivities();
  const { orgInfo } = useOrgInfo();

  const stats = useMemo(() => {
    const total = members.length;
    const reported = members.filter((m) => m.isReported).length;
    const reportRate = total ? Math.round((reported / total) * 100) : 0;

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthRecords = records.filter((r) => r.month === currentMonth);
    const paidCount = monthRecords.filter((r) => r.status === '已缴').length;
    const feeRate = monthRecords.length ? Math.round((paidCount / monthRecords.length) * 100) : 0;

    const currentMonthActivities = activities.filter((a) => a.time.startsWith(currentMonth));
    const finishedCount = currentMonthActivities.filter((a) => a.status === '已结束').length;
    const activityRate =
      currentMonthActivities.length > 0
        ? Math.round((finishedCount / currentMonthActivities.length) * 100)
        : 0;

    return { total, reportRate, feeRate, activityRate };
  }, [members, records, activities]);

  const todos = useMemo(
    () => [
      {
        label: '待审核团员报到',
        count: members.filter((m) => !m.isReported).length,
        icon: Users,
        path: '/members',
        color: 'text-primary',
      },
      {
        label: '待审核组织关系转接',
        count: transfers.filter((t) => t.status === '待审核').length,
        icon: ArrowLeftRight,
        path: '/transfer',
        color: 'text-secondary',
      },
      {
        label: '待收缴团费',
        count: records.filter((r) => r.status === '未缴').length,
        icon: Wallet,
        path: '/fee',
        color: 'text-amber-600',
      },
      {
        label: '待发布团课活动',
        count: activities.filter((a) => a.status === '未开始').length,
        icon: BookOpen,
        path: '/activities',
        color: 'text-emerald-600',
      },
    ],
    [members, transfers, records, activities],
  );

  const quickActions = [
    { label: '新增团员', icon: UserPlus, path: '/members', color: 'bg-primary text-primary-foreground' },
    { label: '发起转接', icon: ArrowLeftRight, path: '/transfer', color: 'bg-secondary text-secondary-foreground' },
    { label: '发布活动', icon: Megaphone, path: '/activities', color: 'bg-emerald-600 text-white' },
    { label: '发布公告', icon: FileText, path: '/notice', color: 'bg-amber-600 text-white' },
  ];

  return (
    <div className="space-y-6">
      {/* 欢迎区 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            欢迎来到 <span className="text-primary">{orgInfo.branchName}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {orgInfo.schoolName} · {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
        </div>
      </div>

      {/* 数据概览 */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="size-5 text-primary" />
          数据概览
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">支部团员总数</p>
                  <p className="text-3xl font-bold text-foreground mt-2 tabular-nums">
                    {stats.total}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">人</p>
                </div>
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="size-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已报到率</p>
                  <p className="text-3xl font-bold text-foreground mt-2 tabular-nums">
                    {stats.reportRate}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">团员报到情况</p>
                </div>
                <div className="size-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <CheckCircle2 className="size-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">团费收缴率</p>
                  <p className="text-3xl font-bold text-foreground mt-2 tabular-nums">
                    {stats.feeRate}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">本月收缴情况</p>
                </div>
                <div className="size-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Wallet className="size-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">本月团课完成率</p>
                  <p className="text-3xl font-bold text-foreground mt-2 tabular-nums">
                    {stats.activityRate}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">本月活动情况</p>
                </div>
                <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <BookOpen className="size-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 待办事项 */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="size-5 text-primary" />
          待办事项
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {todos.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.label}
                className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                onClick={() => navigate(item.path)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${item.color.replace('text-', 'bg-').replace('primary', 'primary/10').replace('secondary', 'secondary/10').replace('amber-600', 'amber-100').replace('emerald-600', 'emerald-100')}`}>
                      <Icon className={`size-6 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-2xl font-bold mt-1 tabular-nums">
                        {item.count}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          项
                        </span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 快捷入口 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">快捷入口</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="secondary"
                className="h-20 flex-col gap-2 rounded-xl hover:shadow-md transition-all"
                onClick={() => navigate(action.path)}
              >
                <Icon className="size-5" />
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
