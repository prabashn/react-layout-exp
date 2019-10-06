import { throttle } from "lodash-es";
import { Proximity } from "./Proximity";

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
    const {
      transitionGap = 0,
      invertOpacity,
      minOpacity = 0,
      maxOpacity = 1
    } = this.props;
    const { selfEdge, targetEdge } = status;

    // sort to the leading and trailing edge so that leadiongEdge < trallingEdge
    const leadingEdge = transitionGap < 0 ? selfEdge + transitionGap : selfEdge;
    const trailingEdge =
      transitionGap < 0 ? selfEdge : selfEdge + transitionGap;

    if (trailingEdge < targetEdge) {
      // both leading & trailing above target
      this.updateOpacity(minOpacity, invertOpacity);
    } else if (leadingEdge < targetEdge) {
      // leading edge above target, but trailing below target - transitioning

      // closer you are to trailing edge, the lower your opacity is going to be
      const fraction = (trailingEdge - targetEdge) / Math.abs(transitionGap);
      const opacity = minOpacity + fraction * (maxOpacity - minOpacity);

      this.updateOpacity(opacity, invertOpacity);
    } else {
      // both leading & trailing are below target
      this.updateOpacity(maxOpacity, invertOpacity);
    }
  }

  updateOpacity(opacity, invert) {
    const element = this.getSelfElement();
    if (!element) {
      return;
    }

    //console.log(["opacity", opacity, "invert", invert]);

    if (invert) {
      opacity = 1 - opacity;
    }

    // prevent doing the same style over and over (esp. when element is
    // completely above or below, and the user is scrolling)
    if (opacity === this.opacity) {
      return;
    }

    this.opacity = opacity;

    if (opacity <= 0) {
      Object.assign(element.style, {
        opacity: null,
        visibility: "hidden"
      });
    } else if (opacity >= 1) {
      Object.assign(element.style, {
        opacity: null,
        visibility: null
      });
    } else {
      Object.assign(element.style, {
        opacity,
        visibility: "visible"
      });
    }
  }
}
