"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const samtools_1 = require("@frade-sam/samtools");
const defaultdb_1 = require("./storeage/defaultdb");
const indexdb_1 = require("./storeage/indexdb");
function createCache(name) {
    if ((0, samtools_1.isEmpty)(window.indexedDB))
        return new defaultdb_1.DefaultDBStorage(name);
    return new indexdb_1.IndexDbStorage(name);
}
exports.default = createCache;
