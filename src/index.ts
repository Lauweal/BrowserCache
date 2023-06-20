import { isEmpty } from "@frade-sam/samtools";
import IndexDatabase from "./IndexDatabase";
import LocalDatabase from "./LocalDatabase";

type DataType = 'index' | 'local';
export default class Cache {
  static create(name: string, debug?: boolean) {
    const type:DataType = isEmpty(window.indexedDB) ? 'local' : 'index';
    switch (type) {
      case 'index':
        return new IndexDatabase(name, debug);
        break;
      default:
        return new LocalDatabase(name, debug);
        break;
    } 
  }
}
