import { tryRemoveItem } from "./arrayHelpers";

export class WeakMapEx {
  keys = [];
  map = new WeakMap();

  has(key) {
    return this.map.has(key);
  }

  get(key, factoryOrValue) {
    let value = this.map.get(key);
    if (value !== undefined) {
      return value;
    }

    if (factoryOrValue !== undefined) {
      this.keys.push(key);

      // call the core api instead of the wrapper api to avoid
      // double existence lookup check (since we already know it
      // didn't exist)
      this.map.set(
        key,
        (value =
          typeof factoryOrValue === "function"
            ? factoryOrValue()
            : factoryOrValue)
      );
      return value;
    }
  }

  set(key, value) {
    if (!this.map.has(key)) {
      this.keys.push(key);
    }
    return this.map.set(key, value);
  }
}
