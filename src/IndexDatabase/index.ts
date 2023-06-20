
import { isEmpty, log } from '@frade-sam/samtools';
import { IndexDBTable } from '../table/IndexTable';
import * as Joi from 'joi';
import { Fields } from '../table/abstract';
type IndexDBEvent = 'connect' | 'insert';

type EventFunc = (payload: Payload) => void;

type Payload = {
    code: number;
    message: string;
    data?: any
}

function createSchema(config:Fields) {
    return Joi.object(Object.entries(config).reduce((a, b) => {
        const [key, conf] = b;
        let field = Joi[conf.type]();
        if(conf.required) {
            field = field.required();
        }
        a[key] = field;
        return a;
    }, {}))
}

export default class IndexDatabase {
    constructor(private readonly name: string, private readonly debug?: boolean) { }
    private events: Map<IndexDBEvent, EventFunc[]> = new Map();
    private tables: Map<string, IndexDBTable> = new Map();
    private db:IDBDatabase;
    private _open: boolean = false;

    public get version() {
        const keys = this.name.split('');
        return keys.reduce((a, b) => a | b.charCodeAt(0), 0);
    }

    private get open() {
        return this._open;
    }

    private set open(value: boolean) {
        this._open = value;
    }

    private log(message: string) {
        log.info(`[indexDB:${this.name}(${this.version})]`, message)
    }

    private error(message: string) {
        log.error(`[indexDB:${this.name}(${this.version})]`, message) 
    }

    private getEvent(event: IndexDBEvent) {
        return this.events.get(event) ?? [];
    }

    private setEvent(event: IndexDBEvent, func:EventFunc) {
        const events = this.getEvent(event);
        events.push(func);
        this.events.set(event, events);
    }

    private on(event:IndexDBEvent, payload: Payload) {
        if(!this.open && isEmpty(this.db)) return;
        const events = this.getEvent(event);
        events.forEach((item) => {
            item(payload);
        })
    }

    public connect():Promise<IndexDatabase> {
        const db = window.indexedDB.open(this.name, this.version)
        return new Promise((reslove) => {
            db.onupgradeneeded = () => {
                this.db = db.result;
                this.open = true;
                this.log(`${this.name}链接成功`);
                this.on('connect', { code: 0, message: `${this.name}链接成功` });
                reslove(this);
            }
            db.onerror = (ev: any) => {
                this.open = false;
                this.db = undefined;
                this.error(`${this.name}链接失败(${ev.target.error})`)
                this.on('connect', { code: 1, message: ev.target.error })
                reslove(undefined);
            }
        })
    }

    public emit(event: IndexDBEvent, func:EventFunc) {
        if(!this.open && isEmpty(this.db)) return;
        this.setEvent(event, func)
    }

    public createTable<T>(name: string, schema:Fields):IndexDBTable<T> {
        if(this.tables.has(name)) {
            return this.tables.get(name);
        }
        const config = createSchema(schema);
        const table = new IndexDBTable<T>(this.name, name, config,this.db.transaction([name], 'readwrite').objectStore(name));
        this.tables.set(name, table);
        return table;
    }
}