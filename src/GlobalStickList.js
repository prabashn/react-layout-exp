import { tryAddItem, tryRemoveItem } from "./arrayHelpers";
import { mediator } from "./Mediator";

class GlobalStickList {
  list = [];
  callbacks = [];

  addRef(ref) {
    console.log("Adding ref " + ref.key + " to GlobalStickList");
    tryAddItem(this.list, ref);
    mediator.pub("GlobalStickList");
  }

  removeRef(ref) {
    console.log("Removing ref " + ref.key + " to GlobalStickList");
    tryRemoveItem(this.list, ref);
    mediator.pub("GlobalStickList");
  }

  sub(callback) {
    mediator.sub("GlobalStickList", callback);
  }

  unsub(callback) {
    mediator.unsub("GlobalStickList", callback);
  }

  getLast() {
    return this.list[this.list.length - 1];
  }
}

export const globalStickList = new GlobalStickList();
