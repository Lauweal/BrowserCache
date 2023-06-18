import { isEmpty } from "@frade-sam/samtools";
import { DefaultDBStorage } from "./storeage/defaultdb";
import { IndexDbStorage } from "./storeage/indexdb";
import { AbstractDB } from "./storeage/abstract.db";


export default function createCache(name: string): AbstractDB {
  if (isEmpty(window.indexedDB)) return new DefaultDBStorage(name);
  return new IndexDbStorage(name);
}