"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexDbStorage = void 0;
const samtools_1 = require("@frade-sam/samtools");
const abstract_db_1 = require("./abstract.db");
class IndexDBTable extends abstract_db_1.AbstractTable {
    serialize(value) {
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
    deserialize(valueNew) {
        if (valueNew.toLowerCase().startsWith('function(')) {
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
    delete(id) {
        try {
            const res = this.db.delete(id);
            return new Promise((reslove) => {
                res.onsuccess = (event) => {
                    this.log('info', id, '删除', id);
                    reslove(true);
                };
                res.onerror = (event) => {
                    this.log('error', id, '删除', event.target.error);
                    reslove(false);
                };
            });
        }
        catch (error) {
            this.log('error', id, '删除', error);
            return Promise.resolve(false);
        }
    }
    update(id, data) {
        const payload = this.serialize(Object.assign(Object.assign({}, data), { id }));
        try {
            const res = this.db.put(payload);
            return new Promise((reslove) => {
                res.onsuccess = (event) => {
                    this.log('info', id, '更新', payload);
                    reslove(Object.assign(Object.assign({}, data), { id }));
                };
                res.onerror = (event) => {
                    this.log('error', id, '更新', event.target.error);
                    reslove(Object.assign(Object.assign({}, data), { id }));
                };
            });
        }
        catch (error) {
            this.log('error', id, '更新', error);
            return Promise.resolve(undefined);
        }
    }
    find(id) {
        try {
            const res = this.db.get(id);
            return new Promise((reslove) => {
                res.onsuccess = (event) => {
                    this.log('info', id, '查找', res.result);
                    reslove(this.deserialize(res.result));
                };
                res.onerror = (event) => {
                    this.log('error', id, '查找', event.target.error);
                    reslove(undefined);
                };
            });
        }
        catch (error) {
            this.log('error', id, '查找', error);
            return Promise.resolve(undefined);
        }
    }
    add(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = this.serialize(Object.assign(Object.assign({}, data), { id }));
            try {
                const res = this.db.add(payload);
                return new Promise((reslove) => {
                    res.onsuccess = (event) => {
                        this.log('info', id, '新增', payload);
                        reslove(Object.assign(Object.assign({}, data), { id }));
                    };
                    res.onerror = (event) => {
                        this.log('error', id, '新增', event.target.error);
                        reslove(undefined);
                    };
                });
            }
            catch (error) {
                this.log('error', id, '新增', error);
                return Promise.resolve(undefined);
            }
        });
    }
}
class IndexDbStorage extends abstract_db_1.AbstractDB {
    key() {
        const keys = this.name.split('');
        return keys.reduce((a, b) => a | b.charCodeAt(0), 0);
    }
    init() {
        const database = window.indexedDB.open(this.name, this.key());
        return new Promise((resolve, reject) => {
            database.onupgradeneeded = (event) => {
                this.log('info', '初始化', '成功');
                if (database.result)
                    resolve(database.result);
            };
            database.onsuccess = (event) => {
                if (database.result)
                    resolve(database.result);
            };
            database.onerror = (event) => {
                this.log('error', '初始化', '失败');
                reject(event);
            };
        });
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            this.version = yield (0, abstract_db_1.getFingerprintCode)();
            try {
                this.db = yield this.init();
                this.status = true;
                return this;
            }
            catch (error) {
                this.log('error', '创建', error);
                this.status = false;
                return this;
            }
        });
    }
    close() {
        if (this.db && (0, samtools_1.isFunc)(this.db.close))
            this.db.close();
        this.status = false;
    }
    table(name) {
        if (!this.status)
            return;
        const key = `${name}_${this.version}`;
        if (!this.db.objectStoreNames.contains(key)) {
            this.db.createObjectStore(key, { keyPath: 'id', });
        }
        return new IndexDBTable(this.db.transaction([key], "readwrite").objectStore(key), name);
    }
}
exports.IndexDbStorage = IndexDbStorage;
