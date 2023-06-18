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
const lodash_1 = require("lodash");
const samtools_1 = require("@frade-sam/samtools");
const abstract_db_1 = require("./abstract.db");
class IndexDBTable extends abstract_db_1.AbstractTable {
    delete(id) {
        const res = this.db.delete(id);
        return new Promise((reslove, reject) => {
            res.onsuccess = (event) => {
                samtools_1.log.info(`[INDEX_DB(update) ==> ${this.name}]:${id}`, res.result);
                reslove(true);
            };
            res.onerror = (event) => {
                samtools_1.log.error(`[INDEX_DB(update) ==> ${this.name}]:${id}`, event);
                reject(false);
            };
        });
    }
    update(id, data) {
        const res = this.db.put(Object.assign(Object.assign({}, data), { id }));
        return new Promise((reslove, reject) => {
            res.onsuccess = (event) => {
                samtools_1.log.info(`[INDEX_DB(update) ==> ${this.name}]:${id}`, Object.assign(Object.assign({}, data), { id }), res.result);
                reslove(Object.assign(Object.assign({}, data), { id }));
            };
            res.onerror = (event) => {
                samtools_1.log.error(`[INDEX_DB(update) ==> ${this.name}]:${id}`, event);
                reject(event);
            };
        });
    }
    find(id) {
        const res = this.db.get(id);
        return new Promise((reslove, reject) => {
            res.onsuccess = (event) => {
                samtools_1.log.info(`[INDEX_DB(find) ==> ${this.name}]:${id}`, res.result);
                reslove(res.result);
            };
            res.onerror = (event) => {
                samtools_1.log.error(`[INDEX_DB(find) ==> ${this.name}]:${id}`, event);
                reject(event);
            };
        });
    }
    add(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = this.db.add(Object.assign(Object.assign({}, data), { id }));
            return new Promise((reslove, reject) => {
                res.onsuccess = (event) => {
                    samtools_1.log.info(`[INDEX_DB(add) ==> ${this.name}]:${id}`, Object.assign(Object.assign({}, data), { id }), res.result);
                    reslove(Object.assign(Object.assign({}, data), { id }));
                };
                res.onerror = (event) => {
                    samtools_1.log.error(`[INDEX_DB(add) ==> ${this.name}]:${id}`, event);
                    reject(event);
                };
            });
        });
    }
}
class IndexDbStorage extends abstract_db_1.AbstractDB {
    init() {
        const database = window.indexedDB.open(this.name, 0);
        const name = this.name;
        return new Promise((resolve, reject) => {
            database.onupgradeneeded = function (event) {
                const data = (0, lodash_1.get)(event, 'target.result');
                samtools_1.log.log(`[INDEX_DB(init) ==> ${name}]`, '创建成功');
                if (data)
                    resolve(data);
            };
            database.onsuccess = (event) => {
                const data = (0, lodash_1.get)(event, 'target.result');
                if (data)
                    resolve(data);
            };
            database.onerror = (event) => {
                samtools_1.log.error(`[INDEX_DB(init) ==> ${name}]`, event);
                reject(event);
            };
        });
    }
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createVersion();
            try {
                this.db = yield this.init();
                this.status = true;
                return this;
            }
            catch (error) {
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
            return new IndexDBTable(this.db.createObjectStore(key, { keyPath: 'id' }), key);
        }
        return new IndexDBTable(this.db.transaction([key], "readwrite").objectStore(key), key);
    }
}
exports.IndexDbStorage = IndexDbStorage;
