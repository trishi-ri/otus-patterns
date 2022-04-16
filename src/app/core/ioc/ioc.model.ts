export interface IoC {
  resolve<T>(key: string, ...args: unknown[]): T;
}
