export declare function getFingerprintCode(): Promise<string>;
export declare type Table<T = any> = {
    id: number | string;
} & T;
export declare type Level = 'info' | 'error' | 'waring';
export declare abstract class AbstractTable<T = any, D = any> {
    protected config: DbConfig;
    protected db: D;
    protected name: string;
    constructor(config: DbConfig, db: D, name: string);
    protected log(level: Level, id: string, action: string, ...message: any): void;
    private tables;
    abstract add(id: string, data: T): Promise<Table<T>>;
    abstract find(id: string): Promise<Table<T>>;
    abstract update(id: string, data: T): Promise<Table<T>>;
    abstract delete(id: string): Promise<boolean>;
}
export declare type DbConfig = {
    name: string;
    debug?: boolean;
};
export declare abstract class AbstractDB {
    protected config: DbConfig;
    constructor(config: DbConfig);
    protected status: boolean;
    protected _version: string;
    protected log(level: Level, action: string, ...message: any): void;
    get version(): string;
    set version(v: string);
    abstract create(): Promise<AbstractDB>;
    abstract close(): void;
    abstract table<T = any>(name: string): AbstractTable<T>;
}
