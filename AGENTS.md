# 高中/中职团支部团务工作台 - 需求拆解文档

## 产品概述

- **产品类型**: Web 团务管理工作台（中后台应用）
- **场景类型**: <scene_type>prototype-app</scene_type>
- **目标用户**: 高中/中职团支部书记、组织委员、宣传委员等团干部
- **核心价值**: 一站式管理团员、团费、组织关系、团课活动等团务工作，本地数据持久化，提升团务效率
- **界面语言**: 中文
- **主题偏好**: user_specified（团徽红 #C41E3A + 浅蓝 #4086D0 + 纯白，浅色主题）
- **导航模式**: 路径导航
- **导航布局**: Sidebar（左侧可折叠侧边导航）

---

## 页面结构总览

> **说明**：8 个功能模块全部为一级页面，通过左侧导航切换；新增/编辑/审核等操作为弹窗形式，不单独成页

| 页面名称 | 文件名 | 路由 | 页面类型 | 入口来源 |
|---------|-------|------|---------|---------|
| 工作台首页 | `DashboardPage.tsx` | `/` | 一级 | 导航 |
| 团员管理 | `MembersPage.tsx` | `/members` | 一级 | 导航 |
| 团费管理 | `FeePage.tsx` | `/fee` | 一级 | 导航 |
| 组织关系转接 | `TransferPage.tsx` | `/transfer` | 一级 | 导航 |
| 团课活动 | `ActivitiesPage.tsx` | `/activities` | 一级 | 导航 |
| 组织信息 | `OrgInfoPage.tsx` | `/org-info` | 一级 | 导航 |
| 通知公告 | `NoticePage.tsx` | `/notice` | 一级 | 导航 |
| 数据统计 | `StatisticsPage.tsx` | `/statistics` | 一级 | 导航 |

---

## 页面布局建议

- **布局模式**: 左侧 Sidebar + 右侧主内容区的经典中后台布局；内容区采用卡片网格 + 表格混合布局
- **视觉重心**: 列表/卡片数据为主体，操作按钮（新增、导入导出、审核等）在页面顶部醒目位置
- **结果承载区**: 每个列表页以数据表格为核心结果承载区，初始态为 mock 示例数据 + 空状态提示兼容
- **弹窗表单**: 新增/编辑/审核等操作为居中弹窗（Dialog），操作完成后 toast 反馈并刷新列表
- **首页布局**: 2×2 卡片网格（待办事项 4 项）+ 2×2 数据概览卡片，信息一目了然

---

## 导航配置

- **导航布局**: Sidebar（左侧可折叠）
- **导航项**（8 个一级页面）:

| 导航文字 | 路由 | 图标(建议) |
|---------|------|-----------|
| 工作台首页 | `/` | Home / LayoutDashboard |
| 团员管理 | `/members` | Users |
| 团费管理 | `/fee` | Wallet / Receipt |
| 组织关系转接 | `/transfer` | ArrowLeftRight / Repeat |
| 团课活动 | `/activities` | Calendar / BookOpen |
| 组织信息 | `/org-info` | Building2 / Info |
| 通知公告 | `/notice` | Bell / Megaphone |
| 数据统计 | `/statistics` | BarChart3 / PieChart |

- **附加**: 顶部/侧边底部放置「一键导出 Excel 备份」全局操作入口

---

## 数据来源声明

| 数据/操作 | 来源类型 | 实现要求 | mock 兜底 |
|---|---|---|---|
| 团员信息数据 | local-persist | localStorage key=`__twb_members`，JSON 数组存储，含姓名、支部、入团时间等字段 | 初始 5-8 条 source='mock' 示例团员 |
| 团费收缴记录 | local-persist | localStorage key=`__twb_feeRecords`，JSON 数组存储，含团员姓名、月份、金额、状态、缴费时间 | 初始近 3 个月 mock 收缴记录 |
| 组织关系转接记录 | local-persist | localStorage key=`__twb_transfers`，JSON 数组存储，含申请人、转出/转入组织、申请时间、审核状态 | 初始 3-5 条 mock 转接申请（含待审核/已通过/已驳回） |
| 团课活动数据 | local-persist | localStorage key=`__twb_activities`，JSON 数组存储，含主题、时间、参与人数、状态、照片、参与人员 | 初始 3-4 条 mock 活动（覆盖未开始/进行中/已结束） |
| 组织信息数据 | local-persist | localStorage key=`__twb_orgInfo`，JSON 对象存储，含支部基本信息 + 团干信息 | 初始 1 条 mock 支部信息 |
| 通知公告数据 | local-persist | localStorage key=`__twb_notices`，JSON 数组存储，含标题、发布时间、发布人、查看次数、是否置顶 | 初始 3-5 条 mock 公告 |
| 数据统计图表数据 | local-persist | 基于上述 localStorage 数据实时计算（报到率、收缴率、参与率），按学期/学年筛选聚合 | 依赖各模块 mock 数据自动计算 |
| 团员 Excel 批量导入 | import-export + real-file | `<input type="file">` 选择 xlsx 文件，SheetJS 解析后写入 `__twb_members` | 无 |
| 团员 Excel 导出 | import-export | SheetJS 生成 xlsx，Blob + a.click 触发下载 | 无 |
| 团费收缴报表导出 | import-export | SheetJS 生成 xlsx，Blob + a.click 触发下载 | 无 |
| 转接记录导出 | import-export | SheetJS 生成 xlsx，Blob + a.click 触发下载 | 无 |
| 活动台账导出 | import-export | SheetJS 生成 xlsx，Blob + a.click 触发下载 | 无 |
| 统计报表导出 | import-export | SheetJS 生成 xlsx，Blob + a.click 触发下载 | 无 |
| 一键导出 Excel 备份（全局） | import-export | 导出全部 localStorage 数据为多 sheet xlsx 备份文件 | 无 |
| 活动照片上传 | real-file | `<input type="file">` 选择图片，FileReader 转 base64 存入活动记录 | 无（可选默认占位图） |

---

## 功能列表

- **页面: 工作台首页 (`/`)**
  - **页面目标**: 一览全局待办与核心数据，快速进入各模块
  - **功能点**:
    - **展示待办事项**: 4 个待办卡片（待审核团员报到、待审核组织关系转接、待收缴团费、待发布团课活动），点击跳转对应模块并自动筛选
    - **展示数据概览**: 4 个 KPI 卡片（支部团员总数、已报到率、团费收缴率、本月团课完成率），数据从 localStorage 实时计算
    - **快捷入口**: 底部提供「新增团员」「发起转接」「发布活动」「发布公告」4 个快捷操作按钮
    - **数据自动刷新**: 切换模块后返回首页，概览数据自动更新

- **页面: 团员管理 (`/members`)**
  - **页面目标**: 维护支部团员信息，支持增删改查与批量导入导出
  - **功能点**:
    - **团员列表展示**: 表格展示姓名、所在支部、入团时间等字段，支持分页/搜索
    - **搜索团员**: 顶部搜索框按姓名/支部模糊筛选，即时过滤列表
    - **新增团员**:
      - 触发: 顶部「新增团员」按钮
      - 交互: 弹出 Dialog 表单（姓名、支部、入团时间等字段）
      - 提交: 写入 `__twb_members`，toast 成功提示
      - 数据校验: 入团时间格式校验（YYYY-MM-DD），前端正则校验
    - **批量导入团员**:
      - 触发: 顶部「批量导入」按钮
      - 交互: 选择 xlsx 文件，SheetJS 解析，预览确认后写入
      - 提交: 批量写入 `__twb_members`，toast 显示导入成功条数
    - **导出 Excel**: 顶部「导出 Excel」按钮，SheetJS 生成团员列表 xlsx 下载
    - **修改/删除团员**:
      - 触发: 表格行「操作」列 → 编辑/删除按钮
      - 交互: 编辑弹表单修改；删除弹确认框
      - 提交: 更新/删除 localStorage 数据，toast 反馈

- **页面: 团费管理 (`/fee`)**
  - **页面目标**: 管理团费收缴记录，跟踪缴费状态
  - **功能点**:
    - **团费收缴记录列表**: 表格展示团员姓名、收缴月份、金额、收缴状态（已缴/未缴）、缴费时间
    - **按月份筛选**: 顶部月份选择器，筛选指定月份的收缴记录
    - **批量标记已缴**:
      - 触发: 勾选多行 + 顶部「批量标记已缴」按钮
      - 交互: 弹确认框，确认后批量更新状态
      - 提交: 更新 `__twb_feeRecords` 对应记录状态 + 缴费时间，toast 提示
    - **导出收缴报表**: 顶部「导出报表」按钮，生成 xlsx 下载
    - **未缴团员自动提醒**: 页面顶部 Badge/提示条显示本月未缴人数，点击自动筛选未缴记录

- **页面: 组织关系转接 (`/transfer`)**
  - **页面目标**: 审核转接申请，发起组织关系转接
  - **功能点**:
    - **转接申请列表**: 表格展示申请人、转出组织、转入组织、申请时间、审核状态（待审核/已通过/已驳回）
    - **审核通过/驳回**:
      - 触发: 表格行「操作」列 → 通过/驳回按钮
      - 交互: 驳回需填写原因（Textarea），通过直接确认
      - 提交: 更新 `__twb_transfers` 审核状态 + 审核时间 + 审核意见，toast 反馈
    - **查看转接详情**: 行「详情」按钮 → Dialog 展示完整转接信息
    - **发起转接**:
      - 触发: 顶部「发起转接」按钮
      - 交互: 弹出表单，转出组织自动填充当前支部名称（从 `__twb_orgInfo` 读取）
      - 提交: 写入 `__twb_transfers`，状态为「待审核」，toast 提示
    - **导出转接记录**: 顶部「导出记录」按钮，生成 xlsx 下载

- **页面: 团课活动 (`/activities`)**
  - **页面目标**: 管理团课与主题活动，记录参与情况
  - **功能点**:
    - **活动列表**: 表格/卡片展示活动主题、活动时间、参与人数、活动状态（未开始/进行中/已结束）
    - **发布新活动**:
      - 触发: 顶部「发布活动」按钮
      - 交互: 弹出表单，可选活动模板（主题团日/青年大学习/志愿服务）自动填充模板内容
      - 提交: 写入 `__twb_activities`，toast 提示
    - **上传活动照片**: 活动详情/编辑时支持上传多张照片，base64 存入活动记录
    - **记录参与人员**: 活动详情中勾选参与团员（从团员列表选择），更新参与人数
    - **导出活动台账**: 顶部「导出台账」按钮，生成 xlsx 下载

- **页面: 组织信息 (`/org-info`)**
  - **页面目标**: 维护支部基本信息与团干信息
  - **功能点**:
    - **支部基本信息展示**: 卡片展示支部名称、成立时间、书记姓名、联系电话、团员总数（团员总数自动从 `__twb_members` 计算）
    - **团干信息展示**: 三个卡片分别展示书记、组织委员、宣传委员信息（姓名、联系方式、职责）
    - **编辑组织信息**:
      - 触发: 各卡片右上角「编辑」按钮
      - 交互: 弹出对应表单（基本信息/团干信息）
      - 提交: 更新 `__twb_orgInfo`，toast 提示

- **页面: 通知公告 (`/notice`)**
  - **页面目标**: 发布和管理支部通知公告
  - **功能点**:
    - **公告列表**: 表格展示标题、发布时间、发布人、查看次数，置顶公告标红置顶
    - **发布新公告**:
      - 触发: 顶部「发布公告」按钮
      - 交互: 弹出表单（标题、内容、发布人、是否置顶）
      - 提交: 写入 `__twb_notices`，toast 提示
    - **设置置顶**: 行操作「置顶/取消置顶」切换，置顶公告始终排在列表顶部
    - **删除过期公告**: 行操作「删除」→ 确认框 → 删除 localStorage 记录，toast 反馈

- **页面: 数据统计 (`/statistics`)**
  - **页面目标**: 可视化展示团务核心指标，支持筛选和导出
  - **功能点**:
    - **团员报到率柱状图**: Chart.js 柱状图，按支部/学期展示报到率对比（基于 `__twb_members` 计算）
    - **团费收缴率折线图**: Chart.js 折线图，按月份展示收缴率趋势（基于 `__twb_feeRecords` 计算）
    - **团课参与率饼图**: Chart.js 饼图，展示参与/未参与团员占比（基于 `__twb_activities` + `__twb_members` 计算）
    - **按学期/学年筛选**: 顶部筛选器，切换后图表数据重新计算渲染
    - **导出统计报表**: 顶部「导出报表」按钮，生成含图表数据的 xlsx 下载

---

## 数据共享配置

> **说明**：所有模块数据存储在 localStorage，各页面通过统一的存储键名读写，实现跨页面数据共享

| 存储键名 | 数据说明 | 使用页面 |
|---------|---------|---------|
| `__twb_members` | 团员信息列表，`IMember[]` | 团员管理、团费管理、组织关系转接、团课活动、数据统计、工作台首页 |
| `__twb_feeRecords` | 团费收缴记录，`IFeeRecord[]` | 团费管理、数据统计、工作台首页 |
| `__twb_transfers` | 组织关系转接记录，`ITransfer[]` | 组织关系转接、工作台首页 |
| `__twb_activities` | 团课活动数据，`IActivity[]` | 团课活动、数据统计、工作台首页 |
| `__twb_orgInfo` | 组织信息（支部+团干），`IOrgInfo` | 组织信息、组织关系转接（转出组织自动填充） |
| `__twb_notices` | 通知公告列表，`INotice[]` | 通知公告 |

```ts
interface IMember {
  id: string;
  name: string;
  branch: string;         // 所在支部
  joinDate: string;       // 入团时间 YYYY-MM-DD
  phone?: string;
  gender?: '男' | '女';
  isReported: boolean;    // 是否已报到
  source?: 'mock' | 'user';
}

interface IFeeRecord {
  id: string;
  memberId: string;
  memberName: string;
  month: string;          // 收缴月份 YYYY-MM
  amount: number;         // 金额
  status: '已缴' | '未缴';
  payTime?: string;       // 缴费时间
  source?: 'mock' | 'user';
}

interface ITransfer {
  id: string;
  applicantName: string;  // 申请人
  fromOrg: string;        // 转出组织
  toOrg: string;          // 转入组织
  applyTime: string;      // 申请时间
  status: '待审核' | '已通过' | '已驳回';
  reviewTime?: string;    // 审核时间
  rejectReason?: string;  // 驳回原因
  source?: 'mock' | 'user';
}

interface IActivity {
  id: string;
  title: string;          // 活动主题
  template?: '主题团日' | '青年大学习' | '志愿服务' | '自定义';
  time: string;           // 活动时间
  participantCount: number;
  participants: string[]; // 参与人员ID列表
  status: '未开始' | '进行中' | '已结束';
  photos?: string[];      // 活动照片 base64
  source?: 'mock' | 'user';
}

interface IOrgInfo {
  branchName: string;     // 支部名称
  establishDate: string;  // 成立时间
  secretaryName: string;  // 书记姓名
  secretaryPhone: string; // 联系电话
  totalMembers: number;   // 团员总数（计算值，可冗余存储）
  cadres: {
    secretary: { name: string; phone: string; duty: string };
    orgCommittee: { name: string; phone: string; duty: string };  // 组织委员
    propagandaCommittee: { name: string; phone: string; duty: string };  // 宣传委员
  };
  source?: 'mock' | 'user';
}

interface INotice {
  id: string;
  title: string;
  content: string;
  publisher: string;      // 发布人
  publishTime: string;    // 发布时间
  viewCount: number;      // 查看次数
  isPinned: boolean;      // 是否置顶
  source?: 'mock' | 'user';
}
```

---

## 全局交互与技术要点

### 快捷键支持
- `Ctrl/Cmd + N`: 新建（根据当前页面触发对应新增操作）
- `Ctrl/Cmd + S`: 保存/提交表单
- `Ctrl/Cmd + F`: 聚焦搜索框
- `Ctrl/Cmd + E`: 导出当前列表 Excel
- `Esc`: 关闭弹窗

### 弹窗与提示
- 所有新增/编辑/删除/审核操作使用居中 Dialog 弹窗
- 操作结果使用 toast 轻提示（成功/失败/警告）
- 删除、批量操作等不可逆行为使用确认弹窗二次确认

### 响应式适配
- 电脑端优先适配 1920×1080，无横向滚动条
- 侧边栏可折叠，折叠后仅显示图标
- 内容区采用 flex/grid 自适应，卡片等比缩放

### 配色规范
- 主色：团徽红 `#C41E3A`（导航高亮、主按钮、重要强调）
- 辅助色：浅蓝 `#4086D0`（数据图表、次要按钮）
- 背景：纯白 `#FFFFFF` + 浅灰分割
- 卡片：圆角 `12px`，轻阴影

-------

<scene_type>prototype-app</scene_type>

# UI 设计指南

## 1. 设计推导依据

- **参考意图**: Free —— 无参考材料，从团务工作语义与产品目标出发自主设计
- **核心情绪 / 应用类型**: 严肃端正、高效清晰的团务管理工作台，服务高中/中职团支部日常事务处理
- **独特记忆点**: 团徽红作为品牌锚点仅用于主行动与关键状态，浅蓝承担数据与辅助强调，卡片左上角细红边呼应团旗仪式感

## 2. Art Direction

- **方向名**: 团务政务极简
- **Design Style**: Swiss Minimalist + Soft Cards —— 政务工具需要秩序感与可信度，圆角卡片降低严肃感同时保持正式
- **DNA 参数**: 圆角 rounded-lg / 阴影 shadow-sm / 间距 standard (gap-4 / p-6) / 字体方向 端正无衬线 / 装饰手法 卡片左上细红边、图标线描风格
- **应用类型**: Tool —— 左侧导航 + 右侧内容区，任务驱动布局

## 3. Color System

**色彩关系**: 团徽红主色 + 纯白卡片底 + 浅蓝数据辅助 + 极浅灰背景
**配色设计理由**: 团徽红承担品牌识别与主行动，浅蓝用于数据可视化与次要强调，白色保证长时间办公可读性，整体符合团务工作庄重而不压抑的调性
**主色推导**: 以团徽红 #C41E3A 为锚点，转换为 HSL 并衍生浅红反馈底与深红按压态；浅蓝 #4086D0 作为数据与辅助色，与红色形成冷暖平衡
**使用比例**: 65% 中性（白/灰底+文字）/ 25% 辅助（浅蓝+浅灰）/ 10% primary（团徽红）；primary 仅用于主按钮、关键状态标签、导航激活、品牌标识

| 角色 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|---|---|---|---|---|
| bg | `--background` | `bg-background` | hsl(210 20% 98%) | 页面背景，极浅灰调减轻视觉疲劳 |
| card | `--card` | `bg-card` | hsl(0 0% 100%) | 纯白卡片，承载表格、表单与数据 |
| text | `--foreground` | `text-foreground` | hsl(215 25% 15%) | 标题与正文，深灰偏冷 |
| textMuted | `--muted-foreground` | `text-muted-foreground` | hsl(215 12% 45%) | 辅助说明、元信息 |
| primary | `--primary` | `bg-primary` / `text-primary` | hsl(350 73% 44%) | 团徽红，主交互与品牌锚点 |
| primaryForeground | `--primary-foreground` | `text-primary-foreground` | hsl(0 0% 100%) | 主色上的纯白文字 |
| accent | `--accent` | `bg-accent` | hsl(210 40% 96%) | hover/focus 浅底、选中态、菜单项背景 |
| accentForeground | `--accent-foreground` | `text-accent-foreground` | hsl(215 25% 25%) | accent 上的深灰文字 |
| border | `--border` | `border-border` | hsl(214 15% 90%) | 卡片、表格、输入框边界 |

**语义色提示**:
- 成功: hsl(142 55% 38%) —— bg: hsl(142 60% 95%) / border: hsl(142 45% 75%) / text: hsl(142 55% 32%)
- 警告: hsl(38 90% 50%) —— bg: hsl(40 90% 95%) / border: hsl(38 80% 75%) / text: hsl(30 85% 40%)
- 错误: hsl(0 75% 50%) —— bg: hsl(0 80% 96%) / border: hsl(0 70% 80%) / text: hsl(0 70% 42%)
- 信息/数据蓝: hsl(210 62% 50%) —— bg: hsl(210 70% 95%) / border: hsl(210 55% 78%) / text: hsl(210 60% 42%)
- 所有语义色饱和度与 primary 对齐 ±10%，避免状态色刺眼

## 4. 字体与节奏

- **font-display**: Noto Sans SC —— 端正清晰，符合政务文书阅读习惯
- **font-body**: Noto Sans SC —— 中文办公场景首选，字号层级清晰
- **字号**: H1 text-2xl；H2 text-xl；body text-sm ~ text-base；muted text-xs ~ text-sm
- **圆角**: 中 (rounded-lg) —— 卡片与按钮统一 8px 圆角，正式又亲和

## 5. 全局布局契约

- **Reference Layout Use**: 按需求结构推导，左侧可折叠导航 + 右侧卡片化内容区
- **Page / Section Order**: 工作台首页 → 团员管理 → 团费管理 → 组织关系转接 → 团课活动 → 组织信息 → 通知公告 → 数据统计
- **Standard Content Zone**: `max-w-[1400px] mx-auto`，适配 1920×1080 桌面端
- **Shell / Frame Alignment**: 左侧导航固定宽度（展开 240px / 折叠 64px），内容区独立滚动，与导航同高对齐
- **Padding & Rhythm**: 内容区 `px-6 py-6`，卡片内 `p-6`，卡片间距 `gap-5`，保持 4px 倍数节奏
- **Full-bleed Zones**: 无全宽区域，所有卡片与表格受内容区约束
- **Local Narrowing**: 表单弹窗固定 max-w-lg，详情卡片可居中收窄
- **Overflow Strategy**: 数据表格使用 `overflow-x-auto` 包裹，保证无横向滚动条
- **Flexibility Boundary**: 允许移动端折叠导航默认收起、卡片单列排布；不允许改变主色、圆角、阴影语言

## 6. 视觉与动效

- **装饰**: 卡片左上 3px 红边、线描图标、浅灰细分割线
- **阴影/边界**: 轻 —— 卡片 shadow-sm + border，hover 时 shadow-md 轻微提升
- **动效**: 克制 —— 仅 hover 与弹窗过渡，duration-150 ease-out，无多余动画

## 7. 组件原则

- 主按钮用团徽红实底，次按钮用白底+红边框，危险操作用红底白字
- 表格行 hover 用 accent 浅底，选中行用浅红底 + 左边框
- 状态标签用实心小圆点 + 文字，不依赖纯颜色表达
- 弹窗带半透明遮罩，圆角与卡片一致，底部操作按钮右对齐
- 空状态用线描图标 + 灰色说明文字，居中展示

## 8. Image Direction

- **Image Role**: 无强制图片需求，优先通过排版、色彩与图标建立视觉记忆点
- **Image Art Direction**: 无强制图片需求
- **Image Prompt Keywords**: 无
- **Image Avoidance**: 避免通用商务人物素材、无意义渐变背景、卡通风格插图

## 9. Anti-patterns

- **Red overload**: 团徽红铺满按钮、标签、图标、边框、链接；primary 只用于主行动与关键锚点，其余交予浅蓝和中性色
- **Card bloat**: 每个模块堆砌大量装饰卡片；卡片只做信息承载，内部用分割线和间距组织层级
- **Status rainbow**: 成功/警告/错误/信息全部高饱和强对比；语义色饱和度与 primary 对齐，用浅底+文字标签表达
- **Mobile first drift**: 为适配移动端缩小字号、压缩间距到不可读；桌面端优先保证操作效率
- **Default SaaS blue**: 不自觉回到通用蓝主色；团徽红是本产品唯一品牌锚点，浅蓝只做数据辅助