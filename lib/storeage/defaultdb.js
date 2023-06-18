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
exports.DefaultDBStorage = void 0;
const samtools_1 = require("@frade-sam/samtools");
const abstract_db_1 = require("./abstract.db");
class DefaultDBTable extends abstract_db_1.AbstractTable {
    add(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tables = JSON.parse(this.db.getItem(this.name));
                const res = tables.find((item) => item.id === id);
                if (res) {
                    samtools_1.log.info(`[LOCAL_DB(add) ==> ${this.name}]:${id}`, '已经存在');
                    throw new Error('已经存在');
                }
                tables.push(Object.assign(Object.assign({}, data), { id }));
                this.db.setItem(this.name, JSON.stringify(tables !== null && tables !== void 0 ? tables : []));
                return Object.assign(Object.assign({}, data), { id });
            }
            catch (error) {
                samtools_1.log.error(`[LOCAL_DB(add) ==> ${this.name}]:${id}`, '访问异常');
                throw new Error('访问异常');
            }
        });
    }
    find(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tables = JSON.parse(this.db.getItem(this.name));
                if ((0, samtools_1.isArray)(tables)) {
                    const res = tables.find((item) => item.id === id);
                    if (res) {
                        samtools_1.log.info(`[LOCAL_DB(find) ==> ${this.name}]:${id}`, res);
                        return res;
                    }
                    samtools_1.log.error(`[LOCAL_DB(find) ==> ${this.name}]:${id}`, '不存在');
                    return undefined;
                }
                samtools_1.log.error(`[LOCAL_DB(find) ==> ${this.name}]:${id}`, '不存在');
                return undefined;
            }
            catch (error) {
                samtools_1.log.error(`[LOCAL_DB(find) ==> ${this.name}]:${id}`, error);
                return undefined;
            }
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let tables = JSON.parse(this.db.getItem(this.name));
                tables = tables.map((item) => {
                    if (item.id === id) {
                        return Object.assign(Object.assign({}, item), data);
                    }
                    return item;
                });
                this.db.setItem(this.name, JSON.stringify(tables !== null && tables !== void 0 ? tables : []));
                samtools_1.log.info(`[LOCAL_DB(update) ==> ${this.name}]:${id}`, tables);
                return Object.assign(Object.assign({}, data), { id });
            }
            catch (error) {
                samtools_1.log.error(`[LOCAL_DB(add) ==> ${this.name}]:${id}`, '访问异常');
                throw new Error('访问异常');
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let tables = JSON.parse(this.db.getItem(this.name));
                tables = tables.filter((item) => item.id !== id);
                this.db.setItem(this.name, JSON.stringify(tables !== null && tables !== void 0 ? tables : []));
                samtools_1.log.info(`[LOCAL_DB(delete) ==> ${this.name}]:${id}`, tables);
                return true;
            }
            catch (error) {
                samtools_1.log.error(`[LOCAL_DB(delete) ==> ${this.name}]:${id}`, '访问异常');
                return false;
            }
        });
    }
}
class DefaultDBStorage extends abstract_db_1.AbstractDB {
    create() {
        return __awaiter(this, void 0, void 0, function* () {
            this.version = yield (0, abstract_db_1.getFingerprintCode)();
            this.status = true;
            return this;
        });
    }
    close() {
        this.status = false;
    }
    table(name) {
        if (!this.status)
            return;
        const key = `${this.name}_${name}_${this.version}`;
        return new DefaultDBTable(localStorage, key);
    }
}
exports.DefaultDBStorage = DefaultDBStorage;
