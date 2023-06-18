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
exports.AbstractDB = exports.AbstractTable = void 0;
const fingerprintjs_1 = require("@fingerprintjs/fingerprintjs");
function getFingerprintCode() {
    return (0, fingerprintjs_1.load)().then((code) => code.get()).then((code) => code.visitorId);
}
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
    createVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            this.version = yield getFingerprintCode();
            return this.version;
        });
    }
    get version() {
        return this.version;
    }
    set version(v) {
        this.version = v;
    }
}
exports.AbstractDB = AbstractDB;
