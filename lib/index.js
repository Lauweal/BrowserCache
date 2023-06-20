"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const samtools_1 = require("@frade-sam/samtools");
const IndexDatabase_1 = require("./IndexDatabase");
const LocalDatabase_1 = require("./LocalDatabase");
class Cache {
    static create(name, debug) {
        const type = (0, samtools_1.isEmpty)(window.indexedDB) ? 'local' : 'index';
        switch (type) {
            case 'index':
                return new IndexDatabase_1.default(name, debug);
                break;
            default:
                return new LocalDatabase_1.default(name, debug);
                break;
        }
    }
}
exports.default = Cache;
