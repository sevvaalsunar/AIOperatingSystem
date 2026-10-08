export interface Repository<T extends { id: string | number }> {
  list(): Promise<T[]>;
  save(entity: T): Promise<T>;
  remove(id: T["id"]): Promise<void>;
}

export class LocalRepository<T extends { id: string | number }> implements Repository<T> {
  constructor(private key: string) {}

  async list(): Promise<T[]> {
    try { return JSON.parse(localStorage.getItem(this.key) || "[]") as T[]; }
    catch { return []; }
  }

  async save(entity: T): Promise<T> {
    const entities = await this.list();
    const index = entities.findIndex(item => item.id === entity.id);
    if (index >= 0) entities[index] = entity;
    else entities.unshift(entity);
    localStorage.setItem(this.key, JSON.stringify(entities));
    return entity;
  }

  async remove(id: T["id"]): Promise<void> {
    const entities = await this.list();
    localStorage.setItem(this.key, JSON.stringify(entities.filter(item => item.id !== id)));
  }
}

export const settingsStore = {
  get<T>(key: string, fallback: T): T {
    try { return JSON.parse(localStorage.getItem(`world.settings.${key}`) || "") as T; }
    catch { return fallback; }
  },
  set<T>(key: string, value: T) {
    localStorage.setItem(`world.settings.${key}`, JSON.stringify(value));
  },
};
