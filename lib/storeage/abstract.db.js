"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractDB = exports.AbstractTable = exports.getFingerprintCode = void 0;
const fingerprintjs_1 = require("@fingerprintjs/fingerprintjs");
const samtools_1 = require("@frade-sam/samtools");
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
    log(level, id, action, ...message) {
        if (level === 'error') {
            samtools_1.log.error(`[TABLE_${this.name}]:${action}${id}`, ...message);
        }
        if (level === 'info') {
            samtools_1.log.info(`[TABLE_${this.name}]:${action}${id}`, ...message);
        }
        if (level === 'waring') {
            samtools_1.log.warn(`[TABLE_${this.name}]:${action}${id}`, ...message);
        }
    }
}
exports.AbstractTable = AbstractTable;
class AbstractDB {
    constructor(name) {
        this.name = name;
    }
    log(level, action, ...message) {
        if (level === 'error') {
            samtools_1.log.error(`[DATA_${this.name}]:${action}${this.version}`, ...message);
        }
        if (level === 'info') {
            samtools_1.log.info(`[DATA_${this.name}]:${action}${this.version}`, ...message);
        }
        if (level === 'waring') {
            samtools_1.log.warn(`[DATA_${this.name}]:${action}${this.version}`, ...message);
        }
    }
    get version() {
        return this._version;
    }
    set version(v) {
        this._version = v;
    }
}
exports.AbstractDB = AbstractDB;
