// EXPORTS: IMember, IFeeRecord, ITransfer, IActivity, IOrgInfo, INotice, MOCK_MEMBERS, MOCK_FEE_RECORDS, MOCK_TRANSFERS, MOCK_ACTIVITIES, MOCK_ORG_INFO, MOCK_NOTICES

export interface IMember {
  id: string;
  name: string;
  branch: string;
  joinDate: string;
  phone: string;
  gender: '男' | '女';
  isReported: boolean;
  source: 'mock' | 'user';
}

export interface IFeeRecord {
  id: string;
  memberId: string;
  memberName: string;
  month: string;
  amount: number;
  status: '已缴' | '未缴';
  payTime?: string;
  source: 'mock' | 'user';
}

export interface ITransfer {
  id: string;
  applicantName: string;
  fromOrg: string;
  toOrg: string;
  applyTime: string;
  status: '待审核' | '已通过' | '已驳回';
  reviewTime?: string;
  rejectReason?: string;
  source: 'mock' | 'user';
}

export interface IActivity {
  id: string;
  title: string;
  template: '主题团日' | '青年大学习' | '志愿服务' | '自定义';
  time: string;
  participantCount: number;
  participants: string[];
  status: '未开始' | '进行中' | '已结束';
  photos: string[];
  source: 'mock' | 'user';
}

export interface IOrgInfo {
  branchName: string;
  schoolName: string;
  superiorLeague: string;
  establishDate: string;
  secretaryName: string;
  secretaryPhone: string;
  cadres: {
    secretary: { name: string; phone: string; duty: string };
    orgCommittee: { name: string; phone: string; duty: string };
    propagandaCommittee: { name: string; phone: string; duty: string };
  };
  source: 'mock' | 'user';
}

export interface INotice {
  id: string;
  title: string;
  content: string;
  publisher: string;
  publishTime: string;
  viewCount: number;
  isPinned: boolean;
  source: 'mock' | 'user';
}

export const MOCK_MEMBERS: IMember[] = [
  { id: '1', name: '张明', branch: '高一(1)班团支部', joinDate: '2023-09-01', phone: '13800138001', gender: '男', isReported: true, source: 'mock' },
  { id: '2', name: '李华', branch: '高一(1)班团支部', joinDate: '2023-09-15', phone: '13800138002', gender: '女', isReported: true, source: 'mock' },
  { id: '3', name: '王芳', branch: '高一(2)班团支部', joinDate: '2023-10-01', phone: '13800138003', gender: '女', isReported: true, source: 'mock' },
  { id: '4', name: '陈伟', branch: '高一(2)班团支部', joinDate: '2023-10-20', phone: '13800138004', gender: '男', isReported: false, source: 'mock' },
  { id: '5', name: '刘洋', branch: '高二(1)班团支部', joinDate: '2022-09-01', phone: '13800138005', gender: '男', isReported: true, source: 'mock' },
  { id: '6', name: '赵雪', branch: '高二(1)班团支部', joinDate: '2022-11-10', phone: '13800138006', gender: '女', isReported: true, source: 'mock' },
];

function genFeeRecords(): IFeeRecord[] {
  const records: IFeeRecord[] = [];
  const months = ['2026-06', '2026-07', '2026-08'];
  let id = 1;
  MOCK_MEMBERS.forEach((m) => {
    months.forEach((month) => {
      const paid = !(m.id === '4' && month === '2026-08');
      records.push({
        id: String(id++),
        memberId: m.id,
        memberName: m.name,
        month,
        amount: 0.2,
        status: paid ? '已缴' : '未缴',
        payTime: paid ? `${month}-15 10:00` : undefined,
        source: 'mock',
      });
    });
  });
  return records;
}

export const MOCK_FEE_RECORDS: IFeeRecord[] = genFeeRecords();

export const MOCK_TRANSFERS: ITransfer[] = [
  { id: '1', applicantName: '周杰', fromOrg: '初三(3)班团支部', toOrg: '高一(1)班团支部', applyTime: '2026-08-20 09:30', status: '待审核', source: 'mock' },
  { id: '2', applicantName: '吴敏', fromOrg: '高一(1)班团支部', toOrg: '高二(1)班团支部', applyTime: '2026-07-15 14:00', status: '已通过', reviewTime: '2026-07-16 10:00', source: 'mock' },
  { id: '3', applicantName: '孙磊', fromOrg: '高二(2)班团支部', toOrg: '高一(2)班团支部', applyTime: '2026-06-10 11:00', status: '已驳回', reviewTime: '2026-06-11 09:00', rejectReason: '转入组织信息有误，请核实后重新申请', source: 'mock' },
];

export const MOCK_ACTIVITIES: IActivity[] = [
  { id: '1', title: '"五四"青年节主题团日活动', template: '主题团日', time: '2026-05-04 14:00', participantCount: 5, participants: ['1', '2', '3', '5', '6'], status: '已结束', photos: [], source: 'mock' },
  { id: '2', title: '青年大学习第8期', template: '青年大学习', time: '2026-08-15 19:00', participantCount: 4, participants: ['1', '2', '3', '5'], status: '进行中', photos: [], source: 'mock' },
  { id: '3', title: '社区志愿服务活动', template: '志愿服务', time: '2026-09-10 09:00', participantCount: 0, participants: [], status: '未开始', photos: [], source: 'mock' },
  { id: '4', title: '入团宣誓仪式', template: '自定义', time: '2026-08-01 15:00', participantCount: 6, participants: ['1', '2', '3', '4', '5', '6'], status: '已结束', photos: [], source: 'mock' },
];

export const MOCK_ORG_INFO: IOrgInfo = {
  branchName: 'XX中学高一年级团总支',
  schoolName: 'XX中学',
  superiorLeague: '共青团XX中学委员会',
  establishDate: '2020-09-01',
  secretaryName: '王老师',
  secretaryPhone: '13900139000',
  cadres: {
    secretary: { name: '王老师', phone: '13900139000', duty: '主持团总支全面工作' },
    orgCommittee: { name: '张明', phone: '13800138001', duty: '负责组织建设、团员发展与关系转接' },
    propagandaCommittee: { name: '李华', phone: '13800138002', duty: '负责宣传工作、团课与思想教育' },
  },
  source: 'mock',
};

export const MOCK_NOTICES: INotice[] = [
  { id: '1', title: '关于开展2026年秋季团员报到工作的通知', content: '全体团员：请于2026年9月1日前完成线上团员报到工作，具体操作流程见附件。', publisher: '团总支', publishTime: '2026-08-20 09:00', viewCount: 28, isPinned: true, source: 'mock' },
  { id: '2', title: '9月份团费收缴通知', content: '请各支部于9月25日前完成本月团费收缴工作，统一上缴至团总支。', publisher: '组织委员', publishTime: '2026-08-25 10:30', viewCount: 15, isPinned: false, source: 'mock' },
  { id: '3', title: '"青年大学习"第9期学习通知', content: '第9期青年大学习已上线，请全体团员于本周五前完成学习。', publisher: '宣传委员', publishTime: '2026-08-28 14:00', viewCount: 22, isPinned: false, source: 'mock' },
];
