const subscribers = new Map();
export const mediator = {
  sub: (name, callback) => {
    let subs = subscribers.get(name);
    if (!subs) {
      subscribers.set(name, (subs = [callback]));
    } else if (subs.indexOf(callback) < 0) {
      subs.push(callback);
    }
  },
  unsub: (name, callback) => {
    const subs = subscribers.get(name);
    if (subs) {
      const index = subs.indexOf(callback);
      if (index >= 0) {
        subs.splice(index, 1);
      }
    }
  },
  pub: (name, ...args) => {
    const subs = subscribers.get(name);
    if (subs && subs.length) {
      subs.forEach(sub => sub(...args));
    }
  }
};
