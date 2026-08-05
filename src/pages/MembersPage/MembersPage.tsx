import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Upload, Download, Edit2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useMembers } from '@/hooks/useTwbStore';
import { exportToExcel, importFromExcel } from '@/utils/excel';
import type { IMember } from '@/data/twb';

const BRANCH_OPTIONS = [
  '高一(1)班团支部',
  '高一(2)班团支部',
  '高二(1)班团支部',
  '高二(2)班团支部',
];

export default function MembersPage() {
  const { members, addMember, updateMember, deleteMember, batchAdd } = useMembers();
  const [keyword, setKeyword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    branch: BRANCH_OPTIONS[0],
    joinDate: '',
    phone: '',
    gender: '男' as '男' | '女',
    isReported: true,
  });
  const [formError, setFormError] = useState('');

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return members;
    return members.filter(
      (m) => m.name.toLowerCase().includes(kw) || m.branch.toLowerCase().includes(kw),
    );
  }, [members, keyword]);

  // 快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        openAdd();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleExport();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({
      name: '',
      branch: BRANCH_OPTIONS[0],
      joinDate: '',
      phone: '',
      gender: '男',
      isReported: true,
    });
    setFormError('');
    setDialogOpen(true);
  };

  const openEdit = (member: IMember) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      branch: member.branch,
      joinDate: member.joinDate,
      phone: member.phone,
      gender: member.gender,
      isReported: member.isReported,
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      setFormError('请输入姓名');
      return;
    }
    if (editingId) {
      updateMember(editingId, form);
      toast.success('团员信息已更新');
    } else {
      addMember(form);
      toast.success('团员添加成功');
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMember(deleteId);
      toast.success('团员已删除');
      setDeleteId(null);
    }
  };

  const handleExport = () => {
    const data = members.map((m) => ({
      姓名: m.name,
      性别: m.gender,
      所在支部: m.branch,
      入团时间: m.joinDate,
      联系电话: m.phone,
      是否已报到: m.isReported ? '是' : '否',
    }));
    exportToExcel({ 团员信息: data }, `团员信息_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('导出成功');
  };

  const handleImport = async (file: File) => {
    try {
      const rows = await importFromExcel<Record<string, string>>(file);
      if (!rows.length) {
        toast.error('文件为空或格式不正确');
        return;
      }
      const newMembers: Omit<IMember, 'id' | 'source'>[] = rows
        .filter((r) => r['姓名'])
        .map((r, idx) => ({
          name: String(r['姓名'] || ''),
          branch: String(r['所在支部'] || BRANCH_OPTIONS[0]),
          joinDate: String(r['入团时间'] || ''),
          phone: String(r['联系电话'] || ''),
          gender: (r['性别'] === '女' ? '女' : '男') as '男' | '女',
          isReported: String(r['是否已报到'] || '是') === '是',
        }));
      batchAdd(newMembers);
      toast.success(`成功导入 ${newMembers.length} 条团员信息`);
    } catch {
      toast.error('导入失败，请检查文件格式');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">团员管理</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle>团员信息列表</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索姓名/支部"
                className="pl-9"
              />
            </div>
            <Button onClick={openAdd}>
              <Plus className="size-4" /> 新增团员
            </Button>
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload className="size-4" /> 批量导入
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
              }}
            />
            <Button variant="secondary" onClick={handleExport}>
              <Download className="size-4" /> 导出 Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">姓名</TableHead>
                  <TableHead className="whitespace-nowrap">性别</TableHead>
                  <TableHead className="whitespace-nowrap">所在支部</TableHead>
                  <TableHead className="whitespace-nowrap">入团时间</TableHead>
                  <TableHead className="whitespace-nowrap">联系电话</TableHead>
                  <TableHead className="whitespace-nowrap">报到状态</TableHead>
                  <TableHead className="whitespace-nowrap text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      暂无团员数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>{m.gender}</TableCell>
                      <TableCell>{m.branch}</TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {m.joinDate}
                      </TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {m.phone}
                      </TableCell>
                      <TableCell>
                        <Badge variant={m.isReported ? 'default' : 'secondary'}>
                          {m.isReported ? '已报到' : '未报到'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(m)}
                            aria-label="编辑"
                          >
                            <Edit2 className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteId(m.id)}
                            aria-label="删除"
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
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

      {/* 新增/编辑弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? '修改团员信息' : '新增团员'}</DialogTitle>
            <DialogDescription>
              {editingId ? '修改团员的详细信息' : '填写新团员的基本信息'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名 *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="请输入姓名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">性别</Label>
                <select
                  id="gender"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.gender}
                  onChange={(e) =>
                    setForm({ ...form, gender: e.target.value as '男' | '女' })
                  }
                >
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">所在支部</Label>
              <select
                id="branch"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
              >
                {BRANCH_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">联系电话</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="请输入联系电话"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isReported"
                type="checkbox"
                checked={form.isReported}
                onChange={(e) => setForm({ ...form, isReported: e.target.checked })}
                className="size-4"
              />
              <Label htmlFor="isReported">已报到</Label>
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
            <Button onClick={handleSubmit}>
              {editingId ? '保存修改' : '确认添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              删除后数据将无法恢复，确定要删除该团员吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
