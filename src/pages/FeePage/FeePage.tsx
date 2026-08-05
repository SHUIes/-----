import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Download, CheckCircle2, AlertTriangle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useFeeRecords, useMembers } from '@/hooks/useTwbStore';
import { exportToExcel } from '@/utils/excel';

export default function FeePage() {
  const { records, markPaid } = useFeeRecords();
  const { members } = useMembers();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [batchConfirm, setBatchConfirm] = useState(false);
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let list = records.filter((r) => r.month === month);
    if (showUnpaidOnly) list = list.filter((r) => r.status === '未缴');
    return list.sort((a, b) => (a.status === '未缴' ? -1 : 1));
  }, [records, month, showUnpaidOnly]);

  const unpaidCount = useMemo(
    () => records.filter((r) => r.month === month && r.status === '未缴').length,
    [records, month],
  );

  const totalAmount = useMemo(
    () =>
      records
        .filter((r) => r.month === month && r.status === '已缴')
        .reduce((sum, r) => sum + r.amount, 0),
    [records, month],
  );

  useEffect(() => {
    setSelectedIds([]);
  }, [month, showUnpaidOnly]);

  // 快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleExport();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filtered.filter((r) => r.status === '未缴').map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    }
  };

  const handleBatchMarkPaid = () => {
    if (selectedIds.length === 0) return;
    markPaid(selectedIds);
    toast.success(`已标记 ${selectedIds.length} 条记录为已缴`);
    setSelectedIds([]);
    setBatchConfirm(false);
  };

  const handleExport = () => {
    const data = filtered.map((r) => ({
      团员姓名: r.memberName,
      收缴月份: r.month,
      金额: r.amount,
      收缴状态: r.status,
      缴费时间: r.payTime || '',
    }));
    exportToExcel(
      { 团费收缴记录: data },
      `团费收缴报表_${month}.xlsx`,
    );
    toast.success('导出成功');
  };

  const unpaidIds = filtered.filter((r) => r.status === '未缴').map((r) => r.id);
  const allUnpaidSelected = unpaidIds.length > 0 && unpaidIds.every((id) => selectedIds.includes(id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">团费管理</h1>
      </div>

      {/* 未缴提醒 */}
      {unpaidCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <AlertTriangle className="size-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-medium text-amber-800">
              本月还有 <strong>{unpaidCount}</strong> 名团员未缴纳团费
            </span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
            onClick={() => setShowUnpaidOnly(!showUnpaidOnly)}
          >
            {showUnpaidOnly ? '显示全部' : '查看未缴名单'}
          </Button>
        </div>
      )}

      {/* 统计概览 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">本月应缴人数</p>
            <p className="text-2xl font-bold mt-1 tabular-nums">{members.length} 人</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">本月已缴金额</p>
            <p className="text-2xl font-bold mt-1 text-primary tabular-nums">
              ¥{totalAmount.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">本月收缴率</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600 tabular-nums">
              {members.length
                ? Math.round(((members.length - unpaidCount) / members.length) * 100)
                : 0}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle>团费收缴记录</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground whitespace-nowrap">月份：</label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="h-9 rounded-md border border-input px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <Button
              variant="secondary"
              disabled={selectedIds.length === 0}
              onClick={() => setBatchConfirm(true)}
            >
              <CheckCircle2 className="size-4" /> 批量标记已缴 ({selectedIds.length})
            </Button>
            <Button variant="secondary" onClick={handleExport}>
              <Download className="size-4" /> 导出报表
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap w-12">
                    <input
                      type="checkbox"
                      checked={allUnpaidSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="size-4"
                    />
                  </TableHead>
                  <TableHead className="whitespace-nowrap">团员姓名</TableHead>
                  <TableHead className="whitespace-nowrap">收缴月份</TableHead>
                  <TableHead className="whitespace-nowrap">金额</TableHead>
                  <TableHead className="whitespace-nowrap">收缴状态</TableHead>
                  <TableHead className="whitespace-nowrap">缴费时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      暂无收缴记录
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(r.id)}
                          onChange={(e) => handleSelect(r.id, e.target.checked)}
                          disabled={r.status === '已缴'}
                          className="size-4"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{r.memberName}</TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">{r.month}</TableCell>
                      <TableCell className="tabular-nums">¥{r.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === '已缴' ? 'default' : 'destructive'}>
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">
                        {r.payTime || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 批量确认 */}
      <AlertDialog open={batchConfirm} onOpenChange={setBatchConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量标记</AlertDialogTitle>
            <AlertDialogDescription>
              确定将选中的 {selectedIds.length} 条记录标记为已缴吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchMarkPaid}>确认标记</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
