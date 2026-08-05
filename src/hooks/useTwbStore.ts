import { useState, useEffect, useCallback } from 'react';
import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import type { IMember, IFeeRecord, ITransfer, IActivity, IOrgInfo, INotice } from '@/data/twb';
import {
  MOCK_MEMBERS,
  MOCK_FEE_RECORDS,
  MOCK_TRANSFERS,
  MOCK_ACTIVITIES,
  MOCK_ORG_INFO,
  MOCK_NOTICES,
} from '@/data/twb';

const KEYS = {
  members: '__twb_members',
  feeRecords: '__twb_feeRecords',
  transfers: '__twb_transfers',
  activities: '__twb_activities',
  orgInfo: '__twb_orgInfo',
  notices: '__twb_notices',
} as const;

function readOrInit<T>(key: string, initial: T): T {
  try {
    const raw = scopedStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
    scopedStorage.setItem(key, JSON.stringify(initial));
    return initial;
  } catch {
    return initial;
  }
}

function write<T>(key: string, value: T) {
  scopedStorage.setItem(key, JSON.stringify(value));
}

export function useMembers() {
  const [members, setMembers] = useState<IMember[]>(() => readOrInit(KEYS.members, MOCK_MEMBERS));

  useEffect(() => {
    write(KEYS.members, members);
  }, [members]);

  const addMember = useCallback((m: Omit<IMember, 'id' | 'source'>) => {
    setMembers((prev) => [...prev, { ...m, id: String(Date.now()), source: 'user' }]);
  }, []);

  const updateMember = useCallback((id: string, data: Partial<IMember>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
  }, []);

  const deleteMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const batchAdd = useCallback((list: Omit<IMember, 'id' | 'source'>[]) => {
    setMembers((prev) => [
      ...prev,
      ...list.map((m, i) => ({ ...m, id: `${Date.now()}-${i}`, source: 'user' as const })),
    ]);
  }, []);

  return { members, setMembers, addMember, updateMember, deleteMember, batchAdd };
}

export function useFeeRecords() {
  const [records, setRecords] = useState<IFeeRecord[]>(() =>
    readOrInit(KEYS.feeRecords, MOCK_FEE_RECORDS),
  );

  useEffect(() => {
    write(KEYS.feeRecords, records);
  }, [records]);

  const markPaid = useCallback((ids: string[]) => {
    const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    setRecords((prev) =>
      prev.map((r) =>
        ids.includes(r.id) ? { ...r, status: '已缴', payTime: now } : r,
      ),
    );
  }, []);

  return { records, setRecords, markPaid };
}

export function useTransfers() {
  const [transfers, setTransfers] = useState<ITransfer[]>(() =>
    readOrInit(KEYS.transfers, MOCK_TRANSFERS),
  );

  useEffect(() => {
    write(KEYS.transfers, transfers);
  }, [transfers]);

  const addTransfer = useCallback((t: Omit<ITransfer, 'id' | 'status' | 'source'>) => {
    setTransfers((prev) => [
      { ...t, id: String(Date.now()), status: '待审核', source: 'user' },
      ...prev,
    ]);
  }, []);

  const reviewTransfer = useCallback(
    (id: string, status: '已通过' | '已驳回', rejectReason?: string) => {
      const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
      setTransfers((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status, reviewTime: now, rejectReason } : t,
        ),
      );
    },
    [],
  );

  return { transfers, setTransfers, addTransfer, reviewTransfer };
}

export function useActivities() {
  const [activities, setActivities] = useState<IActivity[]>(() =>
    readOrInit(KEYS.activities, MOCK_ACTIVITIES),
  );

  useEffect(() => {
    write(KEYS.activities, activities);
  }, [activities]);

  const addActivity = useCallback((a: Omit<IActivity, 'id' | 'source'>) => {
    setActivities((prev) => [{ ...a, id: String(Date.now()), source: 'user' }, ...prev]);
  }, []);

  const updateActivity = useCallback((id: string, data: Partial<IActivity>) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
  }, []);

  return { activities, setActivities, addActivity, updateActivity };
}

export function useOrgInfo() {
  const [orgInfo, setOrgInfo] = useState<IOrgInfo>(() =>
    readOrInit(KEYS.orgInfo, MOCK_ORG_INFO),
  );

  useEffect(() => {
    write(KEYS.orgInfo, orgInfo);
  }, [orgInfo]);

  return { orgInfo, setOrgInfo };
}

export function useNotices() {
  const [notices, setNotices] = useState<INotice[]>(() =>
    readOrInit(KEYS.notices, MOCK_NOTICES),
  );

  useEffect(() => {
    write(KEYS.notices, notices);
  }, [notices]);

  const addNotice = useCallback((n: Omit<INotice, 'id' | 'viewCount' | 'source'>) => {
    setNotices((prev) => [
      { ...n, id: String(Date.now()), viewCount: 0, source: 'user' },
      ...prev,
    ]);
  }, []);

  const togglePin = useCallback((id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)),
    );
  }, []);

  const deleteNotice = useCallback((id: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notices, setNotices, addNotice, togglePin, deleteNotice };
}

export function exportAllBackup() {
  const data = {
    members: JSON.parse(scopedStorage.getItem(KEYS.members) || '[]'),
    feeRecords: JSON.parse(scopedStorage.getItem(KEYS.feeRecords) || '[]'),
    transfers: JSON.parse(scopedStorage.getItem(KEYS.transfers) || '[]'),
    activities: JSON.parse(scopedStorage.getItem(KEYS.activities) || '[]'),
    orgInfo: JSON.parse(scopedStorage.getItem(KEYS.orgInfo) || '{}'),
    notices: JSON.parse(scopedStorage.getItem(KEYS.notices) || '[]'),
  };
  return data;
}
