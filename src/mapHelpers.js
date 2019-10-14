import { tryAddItem, tryRemoveItem } from "./arrayHelpers";

export class ArrayMap {
  map = {};

  getItems(key, createIfNeeded) {
    var list = this.map[key];
    if (!list && createIfNeeded) {
      list = this.map[key] = [];
    }
    return list;
  }

  addItem(key, item) {
    var list = this.getItems(key, true);
    return tryAddItem(list, item);
  }

  removeItem(key, item) {
    var list = this.getItems(key, false);
    if (list) {
      tryRemoveItem(list, item);
    }
  }
}
