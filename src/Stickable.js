import { throttle } from "lodash-es";
import { toPx } from "./positionHelper";
import React from "react";
import { Ref } from "./Ref";
import { Proximity } from "./Proximity";
import { Transitions } from "./Transitions";
import { Viewport } from "./Viewport";

//export class Stickable extends Behavior {
export class Stickable extends Proximity {
  stickyContainerRef = null;
  sizeHelperRef = null;
  isSticky = false;

  constructor(props) {
    super(props);
    this.stickyContainerRef = Ref.createRef();
    this.sizeHelperRef = Ref.createRef();
    this.calculateStick = throttle(this.calculateStick, 20);

    Ref.observe(this.stickyContainerRef, this.updateSizeHelper);
  }

  renderCore() {
    this.behaviorContext.pushInnerRef(this.stickyContainerRef);

    return (
      <React.Fragment>
        <div ref={this.stickyContainerRef.ref}>{this.props.children}</div>
        <div
          ref={this.sizeHelperRef.ref}
          style={{ display: "none", outline: "3px solid red" }}
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

  getSelfRef() {
    // when we're sticking, return the size helper as the self reference
    return this.isSticky && this.sizeHelperRef.current
      ? this.sizeHelperRef
      : super.getSelfRef();
  }

  updateSizeHelper = forceUpdate => {
    // no need to calculate unless we're being forced, or
    // we're currently in sticky mode

    console.log(
      "updateSizeHelper, key = " +
        this.sizeHelperRef.key +
        ", " +
        JSON.stringify({ forceUpdate, isSticky: this.isSticky })
    );

    if (!forceUpdate && !this.isSticky) {
      return;
    }

    const sizeRect = this.stickyContainerRef.getBounds();
    if (this.sizeHelperRef.current) {
      // const stickyContainerRect = getOffsetRect(
      //   this.stickyContainerRef.current
      // );
      Object.assign(this.sizeHelperRef.current.style, {
        width: toPx(sizeRect.right - sizeRect.left),
        height: toPx(sizeRect.bottom - sizeRect.top)
      });
    }
  };

  calculateStick(status) {
    // direction: top/bottom = 0, left/right = 1
    // We only handle vertical sticky, hence the check
    if (status.direction !== 0) {
      return;
    }

    // console.log(
    //   "calculateStick " +
    //     JSON.stringify({
    //       selfEdge: status.selfEdge,
    //       targetEdge: status.targetEdge,
    //       isSticky: this.isSticky
    //     })
    // );

    // DEBUG
    this.stickyContainerRef.current.setAttribute(
      "data-sticky",
      JSON.stringify({
        selfEdge: status.selfEdge,
        targetEdge: status.targetEdge,
        isSticky: this.isSticky
      })
    );

    const stick = status.selfEdge < status.targetEdge;
    if (stick) {
      // only go through re-calculating the sticky container if our
      // rectangles have changed -- otherwise, there's no need.
      if (
        !this.isSticky // ||
        //status.targetRectUpdated ||
        // status.selfRectUpdated ||
        // status.viewportUpdated
      ) {
        //console.log("sticking");
        this.updateSizeHelper(true);
        this.stick(status);
      }
    } else if (this.isSticky) {
      //console.log("unsticking");
      this.unstick();
    }
  }

  stick(status) {
    // show the helper so the container doesn't collapse after we make the
    // sticky container 'sticky' and move out of the flow
    Object.assign(this.sizeHelperRef.current.style, {
      display: "block"
    });

    const viewportRect = Viewport.getBounds();

    // take the sticky container out of the flow using 'fixed' css and
    // re-position to counteract the container's static position
    //const leftPx = this.toPx(-left);
    const topPx = toPx(
      status.targetEdge - viewportRect.top - status.selfOffset
    );

    Object.assign(this.stickyContainerRef.current.style, {
      position: "fixed",
      // we're only doing Y, because we're only implementing
      // vertical scroll sticky behavior
      top: topPx
      //transform: "translateY(" + topPx + ")"
    });

    requestAnimationFrame(() => this.transit(true));
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

    requestAnimationFrame(() => this.transit(false));
  }

  transit(stick) {
    this.isSticky = stick;
    stick ? this.sizeHelperRef.resume() : this.sizeHelperRef.suspend();
    Ref.updateRef(this.stickyContainerRef, { scrollSensitive: stick });
    this.behaviorContext.updateBehaviorContext({ animationsEnabled: !stick });

    const { transition } = this.props;
    if (transition) {
      Transitions.pub(transition, stick);
    }
  }
}
