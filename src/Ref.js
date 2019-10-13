import { uniqueId, throttle } from "lodash-es";
import { Viewport } from "./Viewport";
import { Transitions } from "./Transitions";
import { getOffsetRect, rectsEqual, getRelativeRect } from "./positionHelper";

const scrollSensitiveRefs = [];
const resizeSensitiveRefs = [];

Viewport.sub({
  scroll: () => recalcAndNotifyChangedRefs(scrollSensitiveRefs),
  resize: () => recalcAndNotifyChangedRefs(resizeSensitiveRefs)
});

Transitions.sub(null, () => {
  // make sure to re-compute the viewport as shifting between
  // transition state can easily change the viewport size etc, as content
  // shfits around. Do this under a timeout to let the final destinations
  // settle in.
  requestAnimationFrame(() => {
    Viewport.calcBounds();
    recalcAndNotifyChangedRefs(resizeSensitiveRefs);
  });
});

function recalcAndNotifyChangedRefs(refList) {
  const refCallbacks = new WeakMap();
  const uniqueCallbacks = [];

  refList.forEach(ref => {
    if (ref.calcBounds()) {
      // aggregate all bound changed ref callbacks
      // in a unique list, so that the same callback
      // listening to multiple refs will get a single
      // invocation even if multiple refs change.
      ref.callbacks.forEach(callback => {
        // if we haven't seen this callback before,
        // add it to the unique list.
        if (!refCallbacks.has(callback)) {
          refCallbacks.set(callback, true);
          uniqueCallbacks.push(callback);
        }
      });
    }
  });

  // call all notifying callbacks in bulk
  uniqueCallbacks.forEach(callback => callback());
}

export class Ref {
  key;
  // backwards compat with React.createRef().current
  current;
  bounds;
  callbacks = [];
  offsetBounds;
  suspended;

  // backwards compat with React.createRef().current
  static createRef({ key } = {}) {
    const ref = new Ref({ key });
    resizeSensitiveRefs.push(ref);
    return ref;
  }

  static updateRef(ref, { scrollSensitive } = {}) {
    const scrollRefIndex = scrollSensitiveRefs.indexOf(ref);
    if (scrollSensitive) {
      if (scrollRefIndex < 0) {
        scrollSensitiveRefs.push(ref);
      }
    } else if (scrollRefIndex >= 0) {
      scrollSensitiveRefs.splice(scrollRefIndex, 1);
    }
  }

  static observe(ref, callback) {
    // TODO: add support for specific side / size observations
    //  to optimize unnecessary callback invocation

    if (ref && ref.callbacks.indexOf(callback) < 0) {
      ref.callbacks.push(callback);
    }
  }

  static unobserve(ref, callback) {
    if (ref) {
      const refIndex = ref.callbacks.indexOf(callback) >= 0;
      if (refIndex >= 0) {
        ref.callbacks.splice(refIndex, 1);
      }
    }
  }

  constructor({ key } = {}) {
    this.key = key || uniqueId();
  }

  ref = element => {
    this.current = element;

    if (!element) {
      this.bounds = null;
    } else {
      // DEBUG
      this.current.setAttribute("data-ref-key", this.key);
    }
  };

  resume() {
    this.bounds = null;
    this.suspended = false;
    // DEBUG
    this.current.setAttribute("data-suspend", "false");
  }

  suspend(calcBounds) {
    if (calcBounds) {
      this.calcBounds();
    }

    //this.bounds = null;
    this.suspended = true;

    // DEBUG
    this.current.setAttribute("data-suspend", "true");
  }

  calcBounds() {
    if (this.suspended) {
      return false;
    }

    if (!this.current) {
      // even if we had previously caclualed bounds when the element
      // was valid, return false, since there's no point in notifying
      // since the element is not there anymore.
      this.bounds = null;
      return false;
    }

    const bounds = getRelativeRect(this.current);
    if (rectsEqual(bounds, this.bounds)) {
      return false;
    }

    this.bounds = bounds;
    this.offsetBounds = null; // invalidate - so we can calculate if we need it
    // DEBUG
    this.current.setAttribute("data-bounds", JSON.stringify(this.bounds));
    return true;
  }

  getCalcBounds() {
    this.calcBounds();
    return this.bounds;
  }

  getBounds() {
    // if (this.suspended) {
    //   console.warn(
    //     "Attempting to get bounds from ref " + this.key + " while suspended!"
    //   );
    // }

    return this.bounds || this.getCalcBounds();
  }

  getOffsetBounds() {
    return (
      this.offsetBounds || (this.offsetBounds = getOffsetRect(this.current))
    );
  }
}
