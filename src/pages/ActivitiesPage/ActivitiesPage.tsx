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
import { Plus, Download, Upload, Users, Calendar, Image as ImageIcon, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useActivities, useMembers } from '@/hooks/useTwbStore';
import { exportToExcel } from '@/utils/excel';
import type { IActivity } from '@/data/twb';
import { Image } from '@/components/ui/image';

const TEMPLATES = [
  { name: '主题团日', desc: '主题团日活动，含理论学习、红色教育等' },
  { name: '青年大学习', desc: '青年大学习网上主题团课' },
  { name: '志愿服务', desc: '志愿服务、社会实践活动' },
  { name: '自定义', desc: '其他类型团课活动' },
] as const;

const TEMPLATE_CONTENTS: Record<string, string> = {
  主题团日: '活动流程：1. 奏唱团歌 2. 主题学习 3. 交流讨论 4. 总结讲话',
  青年大学习: '学习内容：观看本期青年大学习视频，完成课后习题，撰写学习心得',
  志愿服务: '服务内容：社区服务 / 敬老助残 / 环境保护 / 义务讲解',
  自定义: '',
};

export default function ActivitiesPage() {
  const { activities, addActivity, updateActivity } = useActivities();
  const { members } = useMembers();
  const [statusFilter, setStatusFilter] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<IActivity | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const participantFileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    template: '主题团日' as IActivity['template'],
    time: '',
    status: '未开始' as IActivity['status'],
  });
  const [formError, setFormError] = useState('');

  const filtered = useMemo(() => {
    let list = [...activities];
    if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter);
    }
    const kw = keyword.trim();
    if (kw) {
      list = list.filter((a) => a.title.includes(kw));
    }
    return list;
  }, [activities, statusFilter, keyword]);

  // 快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        openPublish();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleExport();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const openPublish = () => {
    setForm({
      title: '',
      template: '主题团日',
      time: '',
      status: '未开始',
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleTemplateChange = (t: string) => {
    const template = t as IActivity['template'];
    setForm((prev) => ({ ...prev, template }));
    if (!form.title && t !== '自定义') {
      setForm((prev) => ({ ...prev, title: `${t}活动` }));
    }
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      setFormError('请输入活动主题');
      return;
    }
    if (!form.time.trim()) {
      setFormError('请输入活动时间');
      return;
    }
    addActivity({
      title: form.title,
      template: form.template,
      time: form.time,
      participantCount: 0,
      participants: [],
      status: form.status,
      photos: [],
    });
    toast.success('活动发布成功');
    setDialogOpen(false);
  };

  const openDetail = (a: IActivity) => {
    setCurrentActivity(a);
    setDetailOpen(true);
  };

  const handlePhotoUpload = (files: FileList | null) => {
    if (!files || !currentActivity) return;
    const readers = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        }),
    );
    Promise.all(readers)
      .then((urls) => {
        const newPhotos = [...(currentActivity.photos || []), ...urls];
        updateActivity(currentActivity.id, { photos: newPhotos });
        setCurrentActivity({ ...currentActivity, photos: newPhotos });
        toast.success(`成功上传 ${urls.length} 张照片`);
      })
      .catch(() => toast.error('照片上传失败'));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpdateStatus = (id: string, status: IActivity['status']) => {
    updateActivity(id, { status });
    if (currentActivity?.id === id) {
      setCurrentActivity({ ...currentActivity, status });
    }
    toast.success(`状态已更新为「${status}」`);
  };

  const handleToggleParticipant = (memberId: string) => {
    if (!currentActivity) return;
    const participants = currentActivity.participants.includes(memberId)
      ? currentActivity.participants.filter((id) => id !== memberId)
      : [...currentActivity.participants, memberId];
    updateActivity(currentActivity.id, {
      participants,
      participantCount: participants.length,
    });
    setCurrentActivity({
      ...currentActivity,
      participants,
      participantCount: participants.length,
    });
  };

  const handleExport = () => {
    const data = filtered.map((a) => ({
      活动主题: a.title,
      活动模板: a.template,
      活动时间: a.time,
      参与人数: a.participantCount,
      活动状态: a.status,
    }));
    exportToExcel({ 活动台账: data }, `团课活动台账_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('导出成功');
  };

  const badgeVariant = (status: string) => {
    if (status === '未开始') return 'secondary';
    if (status === '进行中') return 'default';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">团课活动</h1>
      </div>

      {/* 活动模板快捷入口 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TEMPLATES.map((t) => (
          <Card
            key={t.name}
            className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 border-primary/20"
            onClick={() => {
              setForm({
                title: `${t.name}活动`,
                template: t.name as IActivity['template'],
                time: '',
                status: '未开始',
              });
              setFormError('');
              setDialogOpen(true);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="size-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {t.desc}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle>活动列表</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索活动主题"
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="未开始">未开始</SelectItem>
                <SelectItem value="进行中">进行中</SelectItem>
                <SelectItem value="已结束">已结束</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={openPublish}>
              <Plus className="size-4" /> 发布活动
            </Button>
            <Button variant="secondary" onClick={handleExport}>
              <Download className="size-4" /> 导出台账
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">活动主题</TableHead>
                  <TableHead className="whitespace-nowrap">活动模板</TableHead>
                  <TableHead className="whitespace-nowrap">活动时间</TableHead>
                  <TableHead className="whitespace-nowrap">参与人数</TableHead>
                  <TableHead className="whitespace-nowrap">活动状态</TableHead>
                  <TableHead className="whitespace-nowrap text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      暂无活动数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        <span className="block truncate max-w-[240px]">{a.title}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{a.template}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">{a.time}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="size-3.5 text-muted-foreground" />
                          <span className="tabular-nums">{a.participantCount} 人</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={badgeVariant(a.status) as 'default' | 'secondary' | 'outline'}>
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openDetail(a)}>
                          详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 发布活动弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>发布新活动</DialogTitle>
            <DialogDescription>填写活动基本信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>活动模板</Label>
              <Select value={form.template} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map((t) => (
                    <SelectItem key={t.name} value={t.name}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {TEMPLATE_CONTENTS[form.template] || '自定义活动内容'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="actTitle">活动主题 *</Label>
              <Input
                id="actTitle"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="请输入活动主题"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="actTime">活动时间 *</Label>
              <Input
                id="actTime"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                placeholder="例如：2026-09-10 14:00"
              />
            </div>
            <div className="space-y-2">
              <Label>活动状态</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as IActivity['status'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="未开始">未开始</SelectItem>
                  <SelectItem value="进行中">进行中</SelectItem>
                  <SelectItem value="已结束">已结束</SelectItem>
                </SelectContent>
              </Select>
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
            <Button onClick={handleSubmit}>发布活动</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 活动详情弹窗 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>活动详情</DialogTitle>
          </DialogHeader>
          {currentActivity && (
            <div className="space-y-5 py-2">
              <div>
                <h3 className="text-lg font-semibold">{currentActivity.title}</h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <span>
                    <Badge variant="outline">{currentActivity.template}</Badge>
                  </span>
                  <span className="tabular-nums">
                    <Calendar className="size-3.5 inline mr-1" />
                    {currentActivity.time}
                  </span>
                  <Badge variant={badgeVariant(currentActivity.status) as 'default' | 'secondary' | 'outline'}>
                    {currentActivity.status}
                  </Badge>
                </div>
              </div>

              {/* 状态切换 */}
              <div className="flex gap-2 flex-wrap">
                {(['未开始', '进行中', '已结束'] as const).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={currentActivity.status === s ? 'default' : 'secondary'}
                    onClick={() => handleUpdateStatus(currentActivity.id, s)}
                  >
                    标记为{s}
                  </Button>
                ))}
              </div>

              {/* 参与人员 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>
                    参与人员 ({currentActivity.participantCount}/{members.length})
                  </Label>
                  <input
                    ref={participantFileRef}
                    type="file"
                    className="hidden"
                    accept=".xlsx,.xls"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto border border-input rounded-md p-2 space-y-1">
                  {members.map((m) => {
                    const checked = currentActivity.participants.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleParticipant(m.id)}
                          className="size-4"
                        />
                        <span>{m.name}</span>
                        <span className="text-xs text-muted-foreground">{m.branch}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 活动照片 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>活动照片 ({currentActivity.photos?.length || 0})</Label>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-3.5" /> 上传照片
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e.target.files)}
                  />
                </div>
                {(!currentActivity.photos || currentActivity.photos.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-6 border border-dashed border-input rounded-md text-muted-foreground">
                    <ImageIcon className="size-8 mb-2 opacity-50" />
                    <p className="text-sm">暂无照片，点击上方按钮上传</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {currentActivity.photos.map((url, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-md overflow-hidden bg-muted"
                      >
                        <Image
                          src={url}
                          alt={`活动照片${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDetailOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
