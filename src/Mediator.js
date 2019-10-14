import { ArrayMap } from "./mapHelpers";

const subscribers = new ArrayMap();

export const mediator = {
  sub: (name, callback) => {
    subscribers.addItem(name, callback);
  },
  unsub: (name, callback) => {
    subscribers.removeItem(name, callback);
  },
  pub: (name, ...args) => {
    const subs = subscribers.getItems(name);
    if (subs && subs.length) {
      subs.forEach(sub => sub(...args));
    }
  }
};
