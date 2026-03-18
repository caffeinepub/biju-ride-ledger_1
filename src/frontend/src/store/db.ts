/**
 * IndexedDB wrapper for Biju's RideBook
 * Provides offline-safe persistence as a supplement to localStorage.
 */

const DB_NAME = "bijuridebook";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      for (const store of [
        "rides",
        "fuel",
        "odometer",
        "offdays",
        "shiftdata",
      ]) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "id" });
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function put(storeName: string, item: object): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

async function getByKey<T>(
  storeName: string,
  key: string,
): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

export const dbPutRide = (ride: object) => put("rides", ride).catch(() => {});
export const dbPutFuel = (fuel: object) => put("fuel", fuel).catch(() => {});
export const dbPutOdometer = (odo: object) =>
  put("odometer", odo).catch(() => {});
export const dbGetAllRides = <T>() => getAll<T>("rides").catch(() => [] as T[]);
export const dbGetAllFuel = <T>() => getAll<T>("fuel").catch(() => [] as T[]);
export const dbGetAllOdometer = <T>() =>
  getAll<T>("odometer").catch(() => [] as T[]);
export const dbPutOffDay = (item: object) =>
  put("offdays", item).catch(() => {});
export const dbGetAllOffDays = <T>() =>
  getAll<T>("offdays").catch(() => [] as T[]);
export const dbPutShift = (shift: object) =>
  put("shiftdata", shift).catch(() => {});
export const dbGetShift = <T>(id: string) =>
  getByKey<T>("shiftdata", id).catch(() => undefined);
