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
    serialize(value) {
        try {
            this.db.setItem(this.name, JSON.stringify(value !== null && value !== void 0 ? value : []));
            return value;
        }
        catch (error) {
            this.db.setItem(this.name, JSON.stringify([]));
            return [];
        }
    }
    deserialize(valueNew) {
        try {
            const val = this.db.getItem(valueNew);
            return JSON.parse(val);
        }
        catch (error) {
            return [];
        }
    }
    add(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const tables = this.deserialize(this.name);
            try {
                const res = tables.find((item) => item.id === id);
                if (res) {
                    this.log('error', id, '新增', '已经存在');
                    return;
                }
                tables.push(Object.assign(Object.assign({}, data), { id }));
                this.serialize(tables);
                this.log('info', id, '新增', tables);
                return Object.assign(Object.assign({}, data), { id });
            }
            catch (error) {
                this.log('error', id, '新增', error);
                return undefined;
            }
        });
    }
    find(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tables = this.deserialize(this.name);
                if ((0, samtools_1.isArray)(tables)) {
                    const res = tables.find((item) => item.id === id);
                    if (res) {
                        this.log('info', id, '查找', res);
                        return res;
                    }
                    this.log('error', id, '查找', id);
                    return undefined;
                }
                this.log('error', id, '查找', id);
                return undefined;
            }
            catch (error) {
                this.log('error', id, '查找', error);
                return undefined;
            }
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let tables = this.deserialize(this.name);
            try {
                tables = tables.map((item) => {
                    if (item.id === id) {
                        return Object.assign(Object.assign({}, item), data);
                    }
                    return item;
                });
                this.serialize(tables);
                this.log('info', id, '更新', tables);
                return Object.assign(Object.assign({}, data), { id });
            }
            catch (error) {
                this.log('error', id, '更新', error);
                return undefined;
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let tables = this.deserialize(this.name);
            try {
                tables = tables.filter((item) => item.id !== id);
                this.serialize(tables);
                this.log('info', id, '删除', id);
                return true;
            }
            catch (error) {
                this.log('error', id, '删除', error);
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
