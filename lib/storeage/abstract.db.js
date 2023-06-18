"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractDB = exports.AbstractTable = exports.getFingerprintCode = void 0;
const fingerprintjs_1 = require("@fingerprintjs/fingerprintjs");
function getFingerprintCode() {
    return (0, fingerprintjs_1.load)().then((code) => code.get()).then((code) => code.visitorId);
}
exports.getFingerprintCode = getFingerprintCode;
class AbstractTable {
    constructor(db, name) {
        this.db = db;
        this.name = name;
        this.tables = [];
    }
}
exports.AbstractTable = AbstractTable;
class AbstractDB {
    constructor(name) {
        this.name = name;
    }
    get version() {
        return this.version;
    }
    set version(v) {
        this.version = v;
    }
}
exports.AbstractDB = AbstractDB;
