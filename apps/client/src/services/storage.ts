interface KeyValueStorage {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
}

export const LocalStorage: KeyValueStorage = {
  get(key: string) {
    return localStorage.getItem(key) ?? undefined;
  },
  set(key: string, value: string) {
    localStorage.setItem(key, value);
  },
  delete(key: string) {
    localStorage.removeItem(key);
  },
};

export const REMEMBER_ME_KEY = "remember-me";
