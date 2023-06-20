import IndexDatabase from "./IndexDatabase";
import LocalDatabase from "./LocalDatabase";
export default class Cache {
    static create(name: string, debug?: boolean): IndexDatabase | LocalDatabase;
}
