import { load } from '@fingerprintjs/fingerprintjs';

export function getFingerprintCode() {
  return load().then((code) => code.get()).then((code) => code.visitorId);
}

export type Table<T = any> = { id: number | string } & T;

export abstract class AbstractTable<T = any, D = any> {
  constructor(protected db: D, protected name: string) { }
  private tables: Table<T>[] = [];

  public abstract add(id: string, data: T): Promise<Table<T>>;

  public abstract find(id: string): Promise<Table<T>>;

  public abstract update(id: string, data: T): Promise<Table<T>>;

  public abstract delete(id: string): Promise<boolean>;
}

export abstract class AbstractDB {
  constructor(protected name: string) { }
  protected status: boolean;
  protected _version: string;

  public get version() {
    return this._version;
  }

  public set version(v: string) {
    this._version = v;
  }

  public abstract create(): Promise<AbstractDB>;

  public abstract close(): void;

  public abstract table<T = any>(name: string): AbstractTable<T>;
}