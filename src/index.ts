import { isEmpty } from "@frade-sam/samtools";
import { DefaultDBStorage } from "./storeage/defaultdb";
import { IndexDbStorage } from "./storeage/indexdb";
import { AbstractDB, DbConfig } from "./storeage/abstract.db";


export default function createCache(config: DbConfig): AbstractDB {
  if (isEmpty(window.indexedDB)) return new DefaultDBStorage(config);
  return new IndexDbStorage(config);
}