import { throttle } from "lodash-es";
import { toPx } from "./positionHelper";
import React from "react";
import { Proximity } from "./Proximity";
import { Transitions } from "./Transitions";

//export class Stickable extends Behavior {
export class Stickable extends Proximity {
  stickyContainerRef = React.createRef();
  sizeHelperRef = React.createRef();
  isSticky = false;

  constructor(props) {
    super(props);
    this.calculateStick = throttle(this.calculateStick, 20);
  }

  renderCore() {
    this.behaviorContext.pushInnerRef(this.stickyContainerRef);

    return (
      <React.Fragment>
        <div ref={this.stickyContainerRef}>{this.props.children}</div>
        <div
          ref={this.sizeHelperRef}
          //style={{ display: "none", outline: "1px solid red" }}
        />
      </React.Fragment>
    );
  }

  componentWillUnmount() {
    this.behaviorContext.popInnerRef(this.stickyContainerRef);
    super.componentDidUpdate();
  }

  onStatusChanged(status) {
    this.calculateStick(status);
  }

  getSelfElement() {
    return (
      (this.isSticky && this.sizeHelperRef.current) || super.getSelfElement()
    );
  }

  updateSizeHelper(sizeRect) {
    if (this.sizeHelperRef.current) {
      // const stickyContainerRect = getOffsetRect(
      //   this.stickyContainerRef.current
      // );

      Object.assign(this.sizeHelperRef.current.style, {
        width: toPx(sizeRect.right - sizeRect.left),
        height: toPx(sizeRect.bottom - sizeRect.top)
      });
    }
  }

  calculateStick(status) {
    // direction: top/bottom = 0, left/right = 1
    // We only handle vertical sticky, hence the check
    if (status.direction !== 0) {
      return;
    }

    const stick = status.selfEdge < status.targetEdge;
    if (stick) {
      // only go through re-calculating the sticky container if our
      // rectangles have changed -- otherwise, there's no need.
      if (
        !this.isSticky ||
        //status.targetRectUpdated ||
        status.selfRectUpdated ||
        status.viewportUpdated
      ) {
        this.updateSizeHelper(status.selfRect);
        this.stick(status);
      }
    } else if (this.isSticky) {
      this.unstick();
    }
  }

  stick(status) {
    // show the helper so the container doesn't collapse after we make the
    // sticky container 'sticky' and move out of the flow
    Object.assign(this.sizeHelperRef.current.style, {
      display: "block"
    });

    // take the sticky container out of the flow using 'fixed' css and
    // re-position to counteract the container's static position
    //const leftPx = this.toPx(-left);
    const topPx = toPx(
      status.targetEdge - status.viewportEdge - status.selfOffset
    );

    Object.assign(this.stickyContainerRef.current.style, {
      position: "fixed",
      // we're only doing Y, because we're only implementing
      // vertical scroll sticky behavior
      top: topPx
      //transform: "translateY(" + topPx + ")"
    });

    this.transit(true);
  }

  unstick() {
    Object.assign(this.sizeHelperRef.current.style, {
      display: "none"
    });

    // bring back to where it was under the static container
    Object.assign(this.stickyContainerRef.current.style, {
      position: null,
      transform: null,
      top: null
    });

    this.transit(false);
  }

  transit(stick) {
    this.isSticky = stick;
    this.behaviorContext.setBehaviorContext({ animationsEnabled: !stick });

    const { transition } = this.props;
    if (transition) {
      Transitions.pub(transition, stick);
    }
  }
}
