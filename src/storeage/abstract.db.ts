import { load } from '@fingerprintjs/fingerprintjs';
import { log } from '@frade-sam/samtools';

export function getFingerprintCode() {
  return load().then((code) => code.get()).then((code) => code.visitorId);
}

export type Table<T = any> = { id: number | string } & T;

export type Level = 'info' | 'error' | 'waring';

export abstract class AbstractTable<T = any, D = any> {
  constructor(protected db: D, protected name: string) { }

  protected log(level: Level, id: string, action: string, ...message: any) {
    if (level === 'error') {
      log.error(`[TABLE_${this.name}]:${action}${id}`, ...message);
    }
    if (level === 'info') {
      log.info(`[TABLE_${this.name}]:${action}${id}`, ...message);
    }
    if (level === 'waring') {
      log.warn(`[TABLE_${this.name}]:${action}${id}`, ...message);
    }
  }


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

  protected log(level: Level, action: string, ...message: any) {
    if (level === 'error') {
      log.error(`[DATA_${this.name}]:${action}${this.version}`, ...message);
    }
    if (level === 'info') {
      log.info(`[DATA_${this.name}]:${action}${this.version}`, ...message);
    }
    if (level === 'waring') {
      log.warn(`[DATA_${this.name}]:${action}${this.version}`, ...message);
    }
  }

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