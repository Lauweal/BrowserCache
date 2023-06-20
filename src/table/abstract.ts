import { isString, log } from "@frade-sam/samtools";
import get from 'lodash.get';
import * as Joi from 'joi';

export type Data<T> = T & { id: string | number }

export type Key = string | number;

export type FieldConfig = {
    type: 'string' | 'number' | 'boolean';
    required?: boolean;
}

export type Fields = Record<string, FieldConfig>;

export abstract class AbstractTable<T = any, D = any> {
    constructor(
        protected readonly db: string,
        protected readonly name: string,
        private readonly schema: Joi.ObjectSchema<any>,
        protected readonly table: D
    ) {}

    protected serialize(value) {
        if (typeof value === 'function') {
            return value.toString();
        }
        if (typeof value === 'object') {
            var serializeObject = {};
            for (const [objectKey, objectValue] of Object.entries(value)) {
                serializeObject[objectKey] = this.serialize(objectValue);
            }
            return serializeObject;
        }

        return value;
    }

    protected deserialize(valueNew) {
        if (isString(valueNew) && valueNew.toLowerCase().startsWith('function(')) {
            return Function('"use strict";return ' + valueNew);
        }
        if (typeof valueNew === 'object') {
            var deserializeObject = {};
            for (const [objectKey, objectValue] of Object.entries(valueNew)) {
                deserializeObject[objectKey] = this.deserialize(objectValue);
            }
            return deserializeObject;
        }

        return valueNew;
    }

    protected log(action: string, message: any) {
        log.info(`[DB_TABLE:${this.name}(${action})]`, message)
    }

    protected error(action: string, message: string) {
        log.error(`[DB_TABLE:${this.name}(${action})]`, message)
    }

    protected check(value: any) {
        const { error } = this.schema.validate(value, { abortEarly: false });
        return !get(error, 'details.0.message', '');
    }

    public abstract insert(id: Key, data: T): Promise<Data<T>>

    public abstract find(id: Key): Promise<Data<T>>

    public abstract update(id: Key, data: T): Promise<Data<T>>

    public abstract delete(id: Key): Promise<boolean>

    public abstract finds(ids: Key[]): Promise<Data<T>[]>

    public abstract updates(data: Data<T>[]): Promise<boolean>

    public abstract deletes(ids: Key[]): Promise<boolean>
}