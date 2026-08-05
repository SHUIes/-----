import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, Shield, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const { hasPassword, login, setInitialPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 已登录直接跳首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password.trim()) {
      setError('请输入密码');
      return;
    }
    setLoading(true);
    const ok = login(password);
    setLoading(false);
    if (ok) {
      toast.success('登录成功，正在进入工作台');
      navigate('/', { replace: true });
    } else {
      setError('密码错误，请重试');
      toast.error('密码错误');
    }
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newPwd || newPwd.length < 4) {
      setError('密码至少 4 位');
      return;
    }
    if (newPwd !== confirmPwd) {
      setError('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    const ok = setInitialPassword(newPwd);
    setLoading(false);
    if (ok) {
      toast.success('初始密码设置成功，正在进入工作台');
      navigate('/', { replace: true });
    } else {
      setError('设置失败，请重试');
      toast.error('设置失败');
    }
  };

  // 未初始化完成不渲染（避免 hasPassword 闪烁）
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <div className="w-full max-w-md">
        {/* Logo 区 */}
        <div className="flex flex-col items-center mb-8">
          <div className="size-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg mb-4">
            <Shield className="size-8" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">团务工作台</h1>
          <p className="text-sm text-muted-foreground mt-1">团支部管理系统</p>
        </div>

        <Card className="border-t-4 border-t-primary shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {hasPassword ? (
                <>
                  <Lock className="size-5 text-primary" />
                  登录工作台
                </>
              ) : (
                <>
                  <KeyRound className="size-5 text-primary" />
                  设置初始密码
                </>
              )}
            </CardTitle>
            <CardDescription>
              {hasPassword
                ? '请输入管理密码进入工作台'
                : '首次使用，请设置管理密码以保护数据安全'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasPassword ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="loginPwd">密码</Label>
                  <Input
                    id="loginPwd"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入管理密码"
                    autoFocus
                    disabled={loading}
                  />
                </div>
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  <Lock className="size-4 mr-2" />
                  {loading ? '登录中...' : '登录'}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  密码本地存储，忘记密码请清除浏览器数据
                </p>
              </form>
            ) : (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPwd">设置密码</Label>
                  <Input
                    id="newPwd"
                    type="password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="请输入新密码（至少4位）"
                    autoFocus
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPwd">确认密码</Label>
                  <Input
                    id="confirmPwd"
                    type="password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    placeholder="请再次输入密码"
                    disabled={loading}
                  />
                </div>
                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                    {error}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  <KeyRound className="size-4 mr-2" />
                  {loading ? '设置中...' : '设置密码并进入'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          所有数据存储在本地浏览器，请妥善保管密码
        </p>
      </div>
    </div>
  );
}
