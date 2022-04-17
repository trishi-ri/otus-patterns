export interface UObject {
  getProperty<T>(key: string): T;
  setProperty<T>(key: string, newValue: T): void;
}
