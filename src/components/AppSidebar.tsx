import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Wallet,
  ArrowLeftRight,
  BookOpen,
  Building2,
  Bell,
  BarChart3,
  Download,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { exportAllBackup } from '@/hooks/useTwbStore';
import { exportToExcel } from '@/utils/excel';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: '工作台首页', icon: LayoutDashboard },
  { path: '/members', label: '团员管理', icon: Users },
  { path: '/fee', label: '团费管理', icon: Wallet },
  { path: '/transfer', label: '组织关系转接', icon: ArrowLeftRight },
  { path: '/activities', label: '团课活动', icon: BookOpen },
  { path: '/org-info', label: '组织信息', icon: Building2 },
  { path: '/notice', label: '通知公告', icon: Bell },
  { path: '/statistics', label: '数据统计', icon: BarChart3 },
];

export default function AppSidebar() {
  const { pathname } = useLocation();
  const { state } = useSidebar();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const collapsed = state === 'collapsed';

  const handleBackup = () => {
    const data = exportAllBackup();
    const dateStr = new Date().toISOString().slice(0, 10);
    exportToExcel(
      {
        团员信息: data.members,
        团费记录: data.feeRecords,
        转接记录: data.transfers,
        团课活动: data.activities,
        组织信息: [data.orgInfo],
        通知公告: data.notices,
      },
      `团务工作备份_${dateStr}.xlsx`,
    );
    toast.success('备份导出成功');
  };

  const handleLogout = () => {
    logout();
    toast.success('已退出登录');
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:justify-center">
          <div className="size-8 shrink-0 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
            团
          </div>
          <div className="flex-1 min-w-0 group-data-[state=collapsed]:hidden">
            <div className="text-sm font-semibold truncate">团务工作台</div>
            <div className="text-xs text-muted-foreground truncate">团支部管理系统</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="p-2">
          <SidebarMenu>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? pathname === '/'
                  : pathname === item.path || pathname.startsWith(`${item.path}/`);
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild tooltip={item.label} isActive={isActive}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      className="flex items-center gap-2"
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="group-data-[state=collapsed]:hidden">
                        {item.label}
                      </span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2 space-y-2">
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={handleBackup}
            title={collapsed ? '一键备份' : undefined}
          >
            <Download className="size-4" />
            <span className="group-data-[state=collapsed]:hidden">一键备份</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-destructive hover:text-destructive"
            onClick={handleLogout}
            title={collapsed ? '退出登录' : undefined}
          >
            <LogOut className="size-4" />
            <span className="group-data-[state=collapsed]:hidden">退出登录</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
