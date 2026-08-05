import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Download, Eye, CheckCircle2, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useTransfers, useOrgInfo } from '@/hooks/useTwbStore';
import { exportToExcel } from '@/utils/excel';
import type { ITransfer } from '@/data/twb';

export default function TransferPage() {
  const { transfers, addTransfer, reviewTransfer } = useTransfers();
  const { orgInfo } = useOrgInfo();
  const [statusFilter, setStatusFilter] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentTransfer, setCurrentTransfer] = useState<ITransfer | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const [form, setForm] = useState({
    applicantName: '',
    fromOrg: orgInfo.branchName,
    toOrg: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setForm((prev) => ({ ...prev, fromOrg: orgInfo.branchName }));
  }, [orgInfo.branchName]);

  // 快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        openInitiate();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleExport();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const filtered = useMemo(() => {
    let list = [...transfers];
    if (statusFilter !== 'all') {
      list = list.filter((t) => t.status === statusFilter);
    }
    const kw = keyword.trim();
    if (kw) {
      list = list.filter(
        (t) =>
          t.applicantName.includes(kw) ||
          t.fromOrg.includes(kw) ||
          t.toOrg.includes(kw),
      );
    }
    return list.sort((a, b) => (a.status === '待审核' ? -1 : 1));
  }, [transfers, statusFilter, keyword]);

  const openInitiate = () => {
    setForm({
      applicantName: '',
      fromOrg: orgInfo.branchName,
      toOrg: '',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.applicantName.trim()) {
      setFormError('请输入申请人姓名');
      return;
    }
    if (!form.toOrg.trim()) {
      setFormError('请输入转入组织');
      return;
    }
    addTransfer({
      applicantName: form.applicantName,
      fromOrg: form.fromOrg,
      toOrg: form.toOrg,
      applyTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    });
    toast.success('转接申请已提交');
    setDialogOpen(false);
  };

  const handleApprove = (id: string) => {
    reviewTransfer(id, '已通过');
    toast.success('已通过转接申请');
  };

  const openReject = (t: ITransfer) => {
    setCurrentTransfer(t);
    setRejectReason('');
    setRejectOpen(true);
  };

  const handleReject = () => {
    if (!currentTransfer) return;
    if (!rejectReason.trim()) {
      toast.error('请填写驳回原因');
      return;
    }
    reviewTransfer(currentTransfer.id, '已驳回', rejectReason);
    toast.success('已驳回转接申请');
    setRejectOpen(false);
    setCurrentTransfer(null);
  };

  const openDetail = (t: ITransfer) => {
    setCurrentTransfer(t);
    setDetailOpen(true);
  };

  const handleExport = () => {
    const data = filtered.map((t) => ({
      申请人: t.applicantName,
      转出组织: t.fromOrg,
      转入组织: t.toOrg,
      申请时间: t.applyTime,
      审核状态: t.status,
      审核时间: t.reviewTime || '',
      驳回原因: t.rejectReason || '',
    }));
    exportToExcel({ 转接记录: data }, `组织关系转接记录_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('导出成功');
  };

  const badgeVariant = (status: string) => {
    if (status === '待审核') return 'secondary';
    if (status === '已通过') return 'default';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">组织关系转接</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle>转接申请列表</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索申请人/组织"
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="待审核">待审核</SelectItem>
                <SelectItem value="已通过">已通过</SelectItem>
                <SelectItem value="已驳回">已驳回</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={openInitiate}>
              <Plus className="size-4" /> 发起转接
            </Button>
            <Button variant="secondary" onClick={handleExport}>
              <Download className="size-4" /> 导出记录
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">申请人</TableHead>
                  <TableHead className="whitespace-nowrap">转出组织</TableHead>
                  <TableHead className="whitespace-nowrap">转入组织</TableHead>
                  <TableHead className="whitespace-nowrap">申请时间</TableHead>
                  <TableHead className="whitespace-nowrap">审核状态</TableHead>
                  <TableHead className="whitespace-nowrap text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      暂无转接申请
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.applicantName}</TableCell>
                      <TableCell>
                        <span className="block truncate max-w-[200px]">{t.fromOrg}</span>
                      </TableCell>
                      <TableCell>
                        <span className="block truncate max-w-[200px]">{t.toOrg}</span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {t.applyTime}
                      </TableCell>
                      <TableCell>
                        <Badge variant={badgeVariant(t.status) as 'default' | 'secondary' | 'destructive'}>
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openDetail(t)}
                            aria-label="详情"
                          >
                            <Eye className="size-4" />
                          </Button>
                          {t.status === '待审核' && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleApprove(t.id)}
                                aria-label="通过"
                              >
                                <CheckCircle2 className="size-4 text-emerald-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openReject(t)}
                                aria-label="驳回"
                              >
                                <XCircle className="size-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 发起转接弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>发起组织关系转接</DialogTitle>
            <DialogDescription>填写转接申请信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="applicant">申请人姓名 *</Label>
              <Input
                id="applicant"
                value={form.applicantName}
                onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
                placeholder="请输入申请人姓名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromOrg">转出组织（自动填充）</Label>
              <Input id="fromOrg" value={form.fromOrg} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toOrg">转入组织 *</Label>
              <Input
                id="toOrg"
                value={form.toOrg}
                onChange={(e) => setForm({ ...form, toOrg: e.target.value })}
                placeholder="请输入转入组织名称"
              />
            </div>
            {formError && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                {formError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>提交申请</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>转接详情</DialogTitle>
          </DialogHeader>
          {currentTransfer && (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">申请人</p>
                  <p className="text-sm font-medium mt-0.5">{currentTransfer.applicantName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">状态</p>
                  <p className="mt-0.5">
                    <Badge variant={badgeVariant(currentTransfer.status) as 'default' | 'secondary' | 'destructive'}>
                      {currentTransfer.status}
                    </Badge>
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">转出组织</p>
                <p className="text-sm mt-0.5">{currentTransfer.fromOrg}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">转入组织</p>
                <p className="text-sm mt-0.5">{currentTransfer.toOrg}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">申请时间</p>
                <p className="text-sm mt-0.5 tabular-nums">{currentTransfer.applyTime}</p>
              </div>
              {currentTransfer.reviewTime && (
                <div>
                  <p className="text-xs text-muted-foreground">审核时间</p>
                  <p className="text-sm mt-0.5 tabular-nums">{currentTransfer.reviewTime}</p>
                </div>
              )}
              {currentTransfer.rejectReason && (
                <div>
                  <p className="text-xs text-muted-foreground">驳回原因</p>
                  <p className="text-sm mt-0.5 text-destructive">{currentTransfer.rejectReason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDetailOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 驳回弹窗 */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>驳回转接申请</DialogTitle>
            <DialogDescription>请填写驳回原因</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="rejectReason">驳回原因 *</Label>
            <textarea
              id="rejectReason"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="请输入驳回原因"
            />
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setRejectOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              确认驳回
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
