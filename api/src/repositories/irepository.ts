export interface IRepository<T> {
  getByIdAsync(id: string): Promise<T | null>;
  getAllAsync(): Promise<T[]>;
  createAsync(item: T): Promise<T>;
  updateAsync(id: string, item: T): Promise<T | null>;
  deleteAsync(id: string): Promise<boolean>;
}
