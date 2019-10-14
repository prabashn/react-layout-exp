import { throttle } from "lodash-es";
import { Proximity } from "./Proximity";

const animationDurationMs = 250;

//export class Stickable extends Behavior {
export class Opacity extends Proximity {
  opacity = null;

  constructor(props) {
    super(props);
    this.calculateStick = throttle(this.calculateOpacity, 20);
  }

  onStatusChanged(status) {
    this.calculateOpacity(status);
  }

  calculateOpacity(status) {
    const { transitionGap = 0, invertOpacity, maxOpacity = 1 } = this.props;
    let { minOpacity = 0 } = this.props;

    const { selfEdge, targetEdge, fromScroll } = status;

    // sort to the leading and trailing edge so that leadiongEdge < trallingEdge
    const leadingEdge = transitionGap < 0 ? selfEdge + transitionGap : selfEdge;
    const trailingEdge =
      transitionGap < 0 ? selfEdge : selfEdge + transitionGap;

    // if someone overrides max opacity to be 0, for example,
    // we want to make sure the min opacity does not exceed the max...
    // so automatically noramlize the min value
    if (minOpacity > maxOpacity) {
      minOpacity = maxOpacity;
    }

    if (trailingEdge < targetEdge) {
      // both leading & trailing above target
      this.updateOpacity(minOpacity, invertOpacity, fromScroll);
    } else if (leadingEdge < targetEdge) {
      // leading edge above target, but trailing below target - transitioning

      // closer you are to trailing edge, the lower your opacity is going to be
      const fraction = (trailingEdge - targetEdge) / Math.abs(transitionGap);
      const opacity = minOpacity + fraction * (maxOpacity - minOpacity);

      this.updateOpacity(opacity, invertOpacity, fromScroll);
    } else {
      // both leading & trailing are below target
      this.updateOpacity(maxOpacity, invertOpacity, fromScroll);
    }
  }

  updateOpacity(opacity, invert, fromScroll) {
    const selfRef = this.getSelfRef();
    const element = selfRef.current;
    if (!element) {
      return;
    }

    //console.log(["opacity", opacity, "invert", invert]);
    opacity = Math.max(0, Math.min(1, opacity));

    if (invert) {
      opacity = 1 - opacity;
    }

    // prevent doing the same style over and over (esp. when element is
    // completely above or below, and the user is scrolling)
    if (opacity === this.opacity) {
      return;
    }

    if (fromScroll) {
      if (opacity <= 0) {
        Object.assign(element.style, {
          opacity: null,
          visibility: "hidden"
        });
      } else if (opacity < 1) {
        Object.assign(element.style, {
          opacity,
          visibility: "visible"
        });
      } else {
        Object.assign(element.style, {
          opacity: null,
          visibility: null
        });
      }
    } else {
      if (this.opacity <= 0 && opacity > 0) {
        this.transitionToVisible(selfRef, opacity);
      } else if (this.opacity >= 1 && opacity <= 0) {
        this.transitionToHidden(selfRef);
      } else if (opacity > 0) {
        this.opacity = opacity;
        selfRef.removeTransition("opacity");
        Object.assign(element.style, {
          opacity,
          visibility: "visible"
        });
      }
    }
  }

  logOpacity(ref, status) {
    // guard against disposed ref
    if (!ref.current) {
      return;
    }

    const { transition, opacity } = ref.current.style;
    console.log(
      "opacity->" +
        status +
        ": key: " +
        ref.key +
        ", opacity: " +
        this.opacity +
        ", style: " +
        JSON.stringify({ transition, opacity })
    );
  }

  transitionToVisible(ref, opacity) {
    Object.assign(ref.current.style, {
      opacity: 0,
      visibility: "visible"
    });
    this.logOpacity(ref, "visible init");

    requestAnimationFrame(() => {
      ref.setTransition("opacity", opacity, animationDurationMs);
      this.logOpacity(ref, "visible starting");

      setTimeout(() => {
        ref.removeTransition("opacity", opacity);
        this.opacity = opacity;
        this.logOpacity(ref, "visible finished");
      }, animationDurationMs);
    });
  }

  transitionToHidden(ref) {
    // Object.assign(ref.current.style, {
    //   opacity: this.opacity
    // });
    Object.assign(ref.current.style, {
      opacity: this.opacity
    });

    requestAnimationFrame(() => {
      ref.setTransition("opacity", 0, animationDurationMs);
      this.logOpacity(ref, "hiding init");

      setTimeout(() => {
        ref.removeTransition("opacity");
        Object.assign(ref.current.style, {
          visibility: "hidden"
        });
        this.opacity = 0;
        this.logOpacity(ref, "hiding finished");
      }, animationDurationMs);
    });
  }
}
