import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, getUserId } from './firebase';

function kvRef(uid: string, key: string) {
  return doc(db, 'users', uid, 'kv', key.replace(/\//g, '_'));
}

function dailyRef(uid: string, prefix: string, date: string) {
  return doc(db, 'users', uid, 'daily', `${prefix}_${date}`);
}

export async function getData<T>(key: string): Promise<T | null> {
  const uid = await getUserId();
  const snap = await getDoc(kvRef(uid, key));
  if (!snap.exists()) return null;
  return snap.data().value as T;
}

export async function setData<T>(key: string, value: T): Promise<void> {
  const uid = await getUserId();
  await setDoc(kvRef(uid, key), { value });
}

export async function removeData(key: string): Promise<void> {
  const uid = await getUserId();
  await deleteDoc(kvRef(uid, key));
}

export async function getForDate<T>(prefix: string, date: string): Promise<T | null> {
  const uid = await getUserId();
  const snap = await getDoc(dailyRef(uid, prefix, date));
  if (!snap.exists()) return null;
  return snap.data().entries as T;
}

export async function setForDate<T>(prefix: string, date: string, value: T): Promise<void> {
  const uid = await getUserId();
  await setDoc(dailyRef(uid, prefix, date), { entries: value });
}

export async function appendToDate<T extends { id: string }>(
  prefix: string,
  date: string,
  entry: T
): Promise<void> {
  const existing = await getForDate<T[]>(prefix, date);
  const list = existing || [];
  list.push(entry);
  await setForDate(prefix, date, list);
}

export async function updateInDate<T extends { id: string }>(
  prefix: string,
  date: string,
  id: string,
  updater: (item: T) => T
): Promise<void> {
  const existing = await getForDate<T[]>(prefix, date);
  if (!existing) return;
  const updated = existing.map((item) => (item.id === id ? updater(item) : item));
  await setForDate(prefix, date, updated);
}

export async function removeFromDate<T extends { id: string }>(
  prefix: string,
  date: string,
  id: string
): Promise<void> {
  const existing = await getForDate<T[]>(prefix, date);
  if (!existing) return;
  const filtered = existing.filter((item) => item.id !== id);
  await setForDate(prefix, date, filtered);
}
