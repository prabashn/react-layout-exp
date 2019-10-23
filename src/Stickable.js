import { throttle } from "lodash-es";
import { toPx } from "./positionHelper";
import React from "react";
import { Ref } from "./Ref";
import { Proximity } from "./Proximity";
import { Transitions } from "./Transitions";
import { Viewport } from "./Viewport";
import { globalStickList } from "./GlobalStickList";

//export class Stickable extends Behavior {
export class Stickable extends Proximity {
  stickyContainerRef = null;
  sizeHelperRef = null;
  isSticky = false;
  dynamicTarget = null;

  constructor(props) {
    super(props);

    const { behaviorContext, targetRefName } = props;

    this.stickyContainerRef = Ref.createRef({
      key: behaviorContext.behaviorKey + "-sticky"
    });

    this.sizeHelperRef = Ref.createRef({
      key: behaviorContext.behaviorKey + "-size"
    });

    this.calculateStick = throttle(this.calculateStick, 20);

    Ref.observe(this.stickyContainerRef, this.updateSizeHelper);

    // if we don't have an explicit target reference name, then assume
    // it's going to be the viewport - in which case we want to stick
    // under the global list of stickies that are currently on the page.
    if (!targetRefName) {
      globalStickList.sub(this.onGlobalStickyListChanged);
    }
  }

  renderCore() {
    this.behaviorContext.pushInnerRef(this.stickyContainerRef);

    return (
      <React.Fragment>
        <div ref={this.stickyContainerRef.ref}>{this.props.children}</div>
        <div
          ref={this.sizeHelperRef.ref}
          //style={{ display: "none" }}
          style={{ display: "none", outline: "3px solid red" }}
        />
      </React.Fragment>
    );
  }

  componentWillUnmount() {
    this.pubStateTransition(false);
    this.behaviorContext.popInnerRef(this.stickyContainerRef);
    Ref.dispose(this.stickyContainerRef);
    Ref.dispose(this.sizeHelperRef);

    globalStickList.unsub(this.onGlobalStickyListChanged);
    globalStickList.removeRef(this.stickyContainerRef);

    super.componentWillUnmount();
  }

  onGlobalStickyListChanged = () => {
    if (!this.isSticky) {
      // if not sticky, update the target ref to the latest known one
      this.dynamicTarget = globalStickList.getLast();
      this.updateWatchElements();
    }
    // otherwise if we're already sticky nothing to do -- we should
    // stay with the original sticky target we knew about.
  };

  onStatusChanged(status) {
    this.calculateStick(status);
  }

  getSelfRef() {
    // when we're sticking, return the size helper as the self reference
    return this.isSticky && this.sizeHelperRef.current
      ? this.sizeHelperRef
      : super.getSelfRef();
  }

  // TODO: when a new stick element is added, we want to make sure to:
  //  1) elements that are already sticking should not be update to reference a new stick element again
  //  2) when a new stick element is added, elements that are not yet sticking must change their observtion
  //    to that new element instead of last known

  getTargetRef() {
    return this.dynamicTarget || super.getTargetRef();
  }

  updateSizeHelper = forceUpdate => {
    // no need to calculate unless we're being forced, or
    // we're currently in sticky mode

    if (!forceUpdate && !this.isSticky) {
      return;
    }

    console.log(
      "updateSizeHelper, key = " +
        this.sizeHelperRef.key +
        ", " +
        JSON.stringify({ forceUpdate, isSticky: this.isSticky })
    );

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

    // sometimes some timeout comes after we dispose the behavior
    // and attempts to update the stick status -- detect and bail out
    if (!this.stickyContainerRef.current) {
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
        selfSide: status.selfSide,
        targetSide: status.targetSide,
        selfEdge: status.selfEdge,
        targetEdge: status.targetEdge,
        isSticky: this.isSticky,
        targetRef: (this.targetRef && this.targetRef.key) || undefined
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

    // undo global sticky related state
    this.dynamicTarget = null;

    requestAnimationFrame(() => this.transit(false));
  }

  transit(stick) {
    this.isSticky = stick;

    stick ? this.sizeHelperRef.resume() : this.sizeHelperRef.suspend();
    stick
      ? globalStickList.addRef(this.stickyContainerRef)
      : globalStickList.removeRef(this.stickyContainerRef);

    // (stick ? tryAddItem : tryRemoveItem)(
    //   Stickable.stickyRefs,
    //   this.stickyContainerRef
    // );

    Ref.updateRef(this.stickyContainerRef, { scrollSensitive: stick });
    this.behaviorContext.updateBehaviorContext({ animationsEnabled: !stick });
    this.pubStateTransition(stick);
  }

  pubStateTransition(stick) {
    const { transition } = this.props;
    if (transition) {
      // set the transition state's value boolean (true/false)
      //  to the current stick state
      Transitions.pub(transition, stick);
    }
  }
}
