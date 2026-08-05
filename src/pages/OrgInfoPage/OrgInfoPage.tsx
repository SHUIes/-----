import { useState, useEffect } from 'react';
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
import { Building2, Phone, User, Award, Edit2, GraduationCap, Landmark, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useOrgInfo, useMembers } from '@/hooks/useTwbStore';
import { useAuth } from '@/hooks/useAuth';
import type { IOrgInfo } from '@/data/twb';

type EditType = 'basic' | 'secretary' | 'org' | 'propaganda' | 'password' | null;

export default function OrgInfoPage() {
  const { orgInfo, setOrgInfo } = useOrgInfo();
  const { members } = useMembers();
  const { changePassword } = useAuth();
  const [editType, setEditType] = useState<EditType>(null);
  const [form, setForm] = useState<Partial<IOrgInfo>>({});
  const [pwdForm, setPwdForm] = useState({ old: '', newP: '', confirm: '' });

  // 快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editType) {
        setEditType(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editType]);

  const openEdit = (type: EditType) => {
    setEditType(type);
    setPwdForm({ old: '', newP: '', confirm: '' });
    if (type === 'basic') {
      setForm({
        branchName: orgInfo.branchName,
        schoolName: orgInfo.schoolName,
        superiorLeague: orgInfo.superiorLeague,
        establishDate: orgInfo.establishDate,
        secretaryName: orgInfo.secretaryName,
        secretaryPhone: orgInfo.secretaryPhone,
      });
    } else if (type === 'secretary') {
      setForm({ cadres: { ...orgInfo.cadres, secretary: { ...orgInfo.cadres.secretary } } });
    } else if (type === 'org') {
      setForm({ cadres: { ...orgInfo.cadres, orgCommittee: { ...orgInfo.cadres.orgCommittee } } });
    } else if (type === 'propaganda') {
      setForm({ cadres: { ...orgInfo.cadres, propagandaCommittee: { ...orgInfo.cadres.propagandaCommittee } } });
    }
  };

  const handleSave = () => {
    if (editType === 'basic' && form.branchName) {
      setOrgInfo({
        ...orgInfo,
        branchName: form.branchName,
        schoolName: form.schoolName || orgInfo.schoolName,
        superiorLeague: form.superiorLeague || orgInfo.superiorLeague,
        establishDate: form.establishDate || orgInfo.establishDate,
        secretaryName: form.secretaryName || orgInfo.secretaryName,
        secretaryPhone: form.secretaryPhone || orgInfo.secretaryPhone,
      });
      toast.success('信息已更新');
      setEditType(null);
    } else if (editType === 'secretary' && form.cadres?.secretary) {
      setOrgInfo({ ...orgInfo, cadres: { ...orgInfo.cadres, secretary: form.cadres.secretary } });
      toast.success('信息已更新');
      setEditType(null);
    } else if (editType === 'org' && form.cadres?.orgCommittee) {
      setOrgInfo({ ...orgInfo, cadres: { ...orgInfo.cadres, orgCommittee: form.cadres.orgCommittee } });
      toast.success('信息已更新');
      setEditType(null);
    } else if (editType === 'propaganda' && form.cadres?.propagandaCommittee) {
      setOrgInfo({ ...orgInfo, cadres: { ...orgInfo.cadres, propagandaCommittee: form.cadres.propagandaCommittee } });
      toast.success('信息已更新');
      setEditType(null);
    } else if (editType === 'password') {
      if (!pwdForm.old) {
        toast.error('请输入当前密码');
        return;
      }
      if (!pwdForm.newP || pwdForm.newP.length < 4) {
        toast.error('新密码至少 4 位');
        return;
      }
      if (pwdForm.newP !== pwdForm.confirm) {
        toast.error('两次输入的新密码不一致');
        return;
      }
      const ok = changePassword(pwdForm.old, pwdForm.newP);
      if (ok) {
        toast.success('密码修改成功');
        setEditType(null);
      } else {
        toast.error('当前密码错误');
      }
    }
  };

  const cadreCards = [
    {
      key: 'secretary' as const,
      title: '书记',
      icon: Award,
      color: 'bg-primary/10 text-primary',
      data: orgInfo.cadres.secretary,
    },
    {
      key: 'orgCommittee' as const,
      title: '组织委员',
      icon: Building2,
      color: 'bg-secondary/10 text-secondary',
      data: orgInfo.cadres.orgCommittee,
    },
    {
      key: 'propagandaCommittee' as const,
      title: '宣传委员',
      icon: User,
      color: 'bg-amber-500/10 text-amber-600',
      data: orgInfo.cadres.propagandaCommittee,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">组织信息</h1>
      </div>

      {/* 支部基本信息 */}
      <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              支部基本信息
            </CardTitle>
            <Button variant="secondary" size="sm" onClick={() => openEdit('basic')}>
              <Edit2 className="size-3.5" /> 编辑
            </Button>
          </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">支部名称</p>
              <p className="text-base font-medium">{orgInfo.branchName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">所属学校/单位</p>
              <p className="text-base font-medium">{orgInfo.schoolName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">上级团委</p>
              <p className="text-base font-medium">{orgInfo.superiorLeague}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">成立时间</p>
              <p className="text-base font-medium tabular-nums">{orgInfo.establishDate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">书记姓名</p>
              <p className="text-base font-medium">{orgInfo.secretaryName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">联系电话</p>
              <p className="text-base font-medium tabular-nums">{orgInfo.secretaryPhone}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">团员总数</p>
              <p className="text-base font-medium tabular-nums text-primary">
                {members.length} 人
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 团干信息 */}
      <div>
        <h2 className="text-lg font-semibold mb-4">团干信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cadreCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.key}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`size-9 rounded-lg flex items-center justify-center ${card.color}`}>
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="text-base">{card.title}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(card.key as EditType)}>
                    <Edit2 className="size-4" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground" />
                    <span className="text-sm">{card.data.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" />
                    <span className="text-sm tabular-nums">{card.data.phone}</span>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">职责</p>
                    <p className="text-sm mt-1">{card.data.duty}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 账号安全 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lock className="size-5 text-primary" />
            账号安全
          </CardTitle>
          <Button variant="secondary" size="sm" onClick={() => openEdit('password')}>
            <Edit2 className="size-3.5" /> 修改密码
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            定期更换管理密码，保护本地数据安全。密码仅存储在您的浏览器中。
          </p>
        </CardContent>
      </Card>

      {/* 编辑弹窗 */}
      <Dialog open={!!editType} onOpenChange={(o) => !o && setEditType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editType === 'basic' && '编辑支部基本信息'}
              {editType === 'secretary' && '编辑书记信息'}
              {editType === 'org' && '编辑组织委员信息'}
              {editType === 'propaganda' && '编辑宣传委员信息'}
              {editType === 'password' && '修改管理密码'}
            </DialogTitle>
            <DialogDescription>修改信息后保存</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {editType === 'basic' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="branchName">支部名称</Label>
                  <Input
                    id="branchName"
                    value={form.branchName || ''}
                    onChange={(e) => setForm({ ...form, branchName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolName">所属学校/单位</Label>
                  <Input
                    id="schoolName"
                    value={form.schoolName || ''}
                    onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="superiorLeague">上级团委名称</Label>
                  <Input
                    id="superiorLeague"
                    value={form.superiorLeague || ''}
                    onChange={(e) => setForm({ ...form, superiorLeague: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estDate">成立时间</Label>
                  <Input
                    id="estDate"
                    value={form.establishDate || ''}
                    onChange={(e) => setForm({ ...form, establishDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secName">书记姓名</Label>
                  <Input
                    id="secName"
                    value={form.secretaryName || ''}
                    onChange={(e) => setForm({ ...form, secretaryName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secPhone">联系电话</Label>
                  <Input
                    id="secPhone"
                    value={form.secretaryPhone || ''}
                    onChange={(e) => setForm({ ...form, secretaryPhone: e.target.value })}
                  />
                </div>
              </>
            )}

            {editType === 'password' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="oldPwd">当前密码</Label>
                  <Input
                    id="oldPwd"
                    type="password"
                    value={pwdForm.old}
                    onChange={(e) => setPwdForm({ ...pwdForm, old: e.target.value })}
                    placeholder="请输入当前密码"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPwd">新密码</Label>
                  <Input
                    id="newPwd"
                    type="password"
                    value={pwdForm.newP}
                    onChange={(e) => setPwdForm({ ...pwdForm, newP: e.target.value })}
                    placeholder="至少4位"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPwd">确认新密码</Label>
                  <Input
                    id="confirmPwd"
                    type="password"
                    value={pwdForm.confirm}
                    onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                    placeholder="请再次输入新密码"
                  />
                </div>
              </>
            )}
            {(editType === 'secretary' || editType === 'org' || editType === 'propaganda') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="cadreName">姓名</Label>
                  <Input
                    id="cadreName"
                    value={
                      editType === 'secretary'
                        ? form.cadres?.secretary?.name || ''
                        : editType === 'org'
                          ? form.cadres?.orgCommittee?.name || ''
                          : form.cadres?.propagandaCommittee?.name || ''
                    }
                    onChange={(e) => {
                      if (!form.cadres) return;
                      const key =
                        editType === 'secretary'
                          ? 'secretary'
                          : editType === 'org'
                            ? 'orgCommittee'
                            : 'propagandaCommittee';
                      setForm({
                        ...form,
                        cadres: {
                          ...form.cadres,
                          [key]: { ...form.cadres[key], name: e.target.value },
                        },
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cadrePhone">联系电话</Label>
                  <Input
                    id="cadrePhone"
                    value={
                      editType === 'secretary'
                        ? form.cadres?.secretary?.phone || ''
                        : editType === 'org'
                          ? form.cadres?.orgCommittee?.phone || ''
                          : form.cadres?.propagandaCommittee?.phone || ''
                    }
                    onChange={(e) => {
                      if (!form.cadres) return;
                      const key =
                        editType === 'secretary'
                          ? 'secretary'
                          : editType === 'org'
                            ? 'orgCommittee'
                            : 'propagandaCommittee';
                      setForm({
                        ...form,
                        cadres: {
                          ...form.cadres,
                          [key]: { ...form.cadres[key], phone: e.target.value },
                        },
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cadreDuty">职责</Label>
                  <textarea
                    id="cadreDuty"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={
                      editType === 'secretary'
                        ? form.cadres?.secretary?.duty || ''
                        : editType === 'org'
                          ? form.cadres?.orgCommittee?.duty || ''
                          : form.cadres?.propagandaCommittee?.duty || ''
                    }
                    onChange={(e) => {
                      if (!form.cadres) return;
                      const key =
                        editType === 'secretary'
                          ? 'secretary'
                          : editType === 'org'
                            ? 'orgCommittee'
                            : 'propagandaCommittee';
                      setForm({
                        ...form,
                        cadres: {
                          ...form.cadres,
                          [key]: { ...form.cadres[key], duty: e.target.value },
                        },
                      });
                    }}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditType(null)}>
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
