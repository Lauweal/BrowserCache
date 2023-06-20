import { isEmpty, log } from "@frade-sam/samtools";
import * as Joi from 'joi';
import { LocalTable } from "../table/LocalTable";
import { Fields } from "../table/abstract";

type EventFunc = (payload: Payload) => void;

type IndexDBEvent = 'connect' | 'insert';

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

export default class LocalDatabase {
    constructor(private readonly name: string, private readonly debug?: boolean) {}
    private events: Map<IndexDBEvent, EventFunc[]> = new Map();
    private tables: Map<string, LocalTable> = new Map();
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

    public async connect():Promise<LocalDatabase> {
        this._open = true;
        return this;
    }

    public emit(event: IndexDBEvent, func:EventFunc) {
        if(!this.open && isEmpty(this.db)) return;
        this.setEvent(event, func)
    }

    public createTable<T>(name: string, schema:Fields):LocalTable<T> {
        if(this.tables.has(name)) {
            return this.tables.get(name);
        }
        const config = createSchema(schema);
        const table = new LocalTable<T>(this.name, name, config,localStorage);
        this.tables.set(name, table);
        return table;
    }
}