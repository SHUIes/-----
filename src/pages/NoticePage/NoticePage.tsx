import { useState, useMemo, useEffect, useRef } from 'react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pin, PinOff, Trash2, Eye, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useNotices } from '@/hooks/useTwbStore';
import type { INotice } from '@/data/twb';

export default function NoticePage() {
  const { notices, addNotice, togglePin, deleteNotice } = useNotices();
  const [keyword, setKeyword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentNotice, setCurrentNotice] = useState<INotice | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    content: '',
    publisher: '团总支',
    isPinned: false,
  });
  const [formError, setFormError] = useState('');

  const sortedNotices = useMemo(() => {
    let list = [...notices];
    const kw = keyword.trim();
    if (kw) {
      list = list.filter(
        (n) => n.title.includes(kw) || n.publisher.includes(kw),
      );
    }
    return list.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.publishTime.localeCompare(a.publishTime);
    });
  }, [notices, keyword]);

  // 快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        openPublish();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const openPublish = () => {
    setForm({ title: '', content: '', publisher: '团总支', isPinned: false });
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      setFormError('请输入公告标题');
      return;
    }
    if (!form.content.trim()) {
      setFormError('请输入公告内容');
      return;
    }
    addNotice({
      title: form.title,
      content: form.content,
      publisher: form.publisher,
      publishTime: new Date()
        .toLocaleString('zh-CN', { hour12: false })
        .replace(/\//g, '-'),
      isPinned: form.isPinned,
    });
    toast.success('公告发布成功');
    setDialogOpen(false);
  };

  const openDetail = (n: INotice) => {
    setCurrentNotice(n);
    setDetailOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteNotice(deleteId);
      toast.success('公告已删除');
      setDeleteId(null);
    }
  };

  const handleTogglePin = (id: string) => {
    togglePin(id);
    toast.success('置顶状态已更新');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">通知公告</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle>公告列表</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchRef}
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索公告标题"
                className="pl-9"
              />
            </div>
            <Button onClick={openPublish}>
              <Plus className="size-4" /> 发布公告
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap w-16">置顶</TableHead>
                  <TableHead className="whitespace-nowrap">标题</TableHead>
                  <TableHead className="whitespace-nowrap">发布人</TableHead>
                  <TableHead className="whitespace-nowrap">发布时间</TableHead>
                  <TableHead className="whitespace-nowrap">查看次数</TableHead>
                  <TableHead className="whitespace-nowrap text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedNotices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      暂无公告
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedNotices.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell>
                        {n.isPinned && (
                          <Badge variant="default" className="bg-primary">
                            <Pin className="size-3 mr-1" />
                            置顶
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-[320px]">
                        <span className="block truncate">{n.title}</span>
                      </TableCell>
                      <TableCell>{n.publisher}</TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">
                        {n.publishTime}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="size-3.5" />
                          <span className="tabular-nums">{n.viewCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openDetail(n)}
                            aria-label="查看"
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleTogglePin(n.id)}
                            aria-label={n.isPinned ? '取消置顶' : '置顶'}
                          >
                            {n.isPinned ? (
                              <PinOff className="size-4 text-amber-600" />
                            ) : (
                              <Pin className="size-4" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteId(n.id)}
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

      {/* 发布公告弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>发布新公告</DialogTitle>
            <DialogDescription>填写公告信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="noticeTitle">公告标题 *</Label>
              <Input
                id="noticeTitle"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="请输入公告标题"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noticePublisher">发布人</Label>
              <Input
                id="noticePublisher"
                value={form.publisher}
                onChange={(e) => setForm({ ...form, publisher: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noticeContent">公告内容 *</Label>
              <textarea
                id="noticeContent"
                className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="请输入公告内容"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="isPinned"
                type="checkbox"
                checked={form.isPinned}
                onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                className="size-4"
              />
              <Label htmlFor="isPinned">设为置顶公告</Label>
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
            <Button onClick={handleSubmit}>发布公告</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 公告详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{currentNotice?.title}</DialogTitle>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>发布人：{currentNotice?.publisher}</span>
              <span>发布时间：{currentNotice?.publishTime}</span>
              <span className="flex items-center gap-1">
                <Eye className="size-3.5" />
                {currentNotice?.viewCount} 次查看
              </span>
            </div>
          </DialogHeader>
          <div className="py-4">
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line leading-relaxed">
              {currentNotice?.content}
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDetailOpen(false)}>
              关闭
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
              删除后公告将无法恢复，确定要删除吗？
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
