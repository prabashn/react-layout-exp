import { uniqueId, throttle } from "lodash-es";
import { Viewport } from "./Viewport";
import { Transitions } from "./Transitions";
import { getOffsetRect, rectsEqual, getRelativeRect } from "./positionHelper";
import { WeakMapEx } from "./WeakMapEx";

const scrollSensitiveRefs = [];
const resizeSensitiveRefs = [];

Viewport.sub({
  scroll: () => recalcAndNotifyChangedRefs(scrollSensitiveRefs),
  resize: () => recalcAndNotifyChangedRefs(resizeSensitiveRefs)
});

Transitions.subAny(() => {
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
  const refCallbacks = new WeakMapEx();

  refList.forEach(ref => {
    if (ref.calcBounds()) {
      // aggregate all bound changed ref callbacks
      // so that the same callback listening to multiple
      // refs will only get a single invocation even if
      // multiple observed refs change.
      ref.callbacks.forEach(callback => {
        refCallbacks.set(callback, true);
      });
    }
  });

  // call all notifying callbacks in bulk
  refCallbacks.keys.forEach(callback => callback());
}

export class Ref {
  key;
  // backwards compat with React.createRef().current
  current;
  bounds;
  callbacks = [];
  offsetBounds;
  suspended;
  cssTransitions = {};

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

  setTransition(cssProperty, value, duration) {
    this.cssTransitions[cssProperty] = { duration, value };
    this.updateTransitions();
  }

  removeTransition(cssProperty, value) {
    if (this.cssTransitions[cssProperty]) {
      this.setTransition(cssProperty, value || null, null);
      delete this.cssTransitions[cssProperty];
    }
  }

  updateTransitions() {
    const cssProps = Object.keys(this.cssTransitions);
    if (!cssProps.length) {
      return;
    }

    const styleObj = {};
    const transitions = [];

    cssProps.forEach(cssProp => {
      let { duration: propDuration, value: propValue } = this.cssTransitions[
        cssProp
      ];
      if (propDuration) {
        transitions.push(cssProp + " " + propDuration + "ms");
      }
      styleObj[cssProp] = propValue;
    });

    styleObj.transition = transitions.length ? transitions.join(", ") : null;
    Object.assign(this.current.style, styleObj);
  }
}
