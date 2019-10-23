import { Ref } from "./Ref";
import React from "react";
import { Viewport } from "./Viewport";

const SideDirection = {
  top: 0,
  bottom: 0,
  left: 1,
  right: 1
};

export class Proximity extends React.Component {
  behaviorContext = null;
  containerRef = null;
  targetRef = null;
  //targetContext = null;
  status = null;

  constructor(props) {
    super(props);

    this.behaviorContext = props.behaviorContext;
    this.containerRef = this.behaviorContext.containerRef;
    this.updated = this.mounted = this.updateWatchElements;

    // observe the container ref in case it changes (because it can often
    // lead to resizing of children, which effect proximity calcs)
    this.updateObservedRef(null, this.containerRef, this.calculateCore);
  }

  render() {
    return this.renderCore();
  }

  renderCore() {
    return this.props.children;
  }

  componentDidMount() {
    // if we're observing the viewport, often tracking the viewport is important.
    // Note we call the special calculateOnScroll handler that passes in the scroll
    // flag as true to  calculateCore, which children can use
    Viewport.sub({ scroll: this.calculateOnScroll });
  }

  componentWillUnmount() {
    Viewport.unsub({ scroll: this.calculateOnScroll });

    Ref.unobserve(this.containerRef, this.calculateCore);

    if (this.targetRef) {
      Ref.unobserve(this.targetRef, this.calculateCore);
    }
  }

  updateWatchElements = () => {
    const targetRef = this.getTargetRef();

    // if target ref changes, we need to observe the new one
    this.targetRef = this.updateObservedRef(
      this.targetRef,
      targetRef,
      this.calculateCore
    );

    // force recalculate in cases like we're observing viewport as the target
    // or when some transition/update happened, which causes our internal state
    // to change. We don't want to miss those just because we're not observing
    // on something that changes physical dimensions etc.
    this.calculateCore();

    //this.targetContext = targetInfo.targetContext;
  };

  updateObservedRef(oldRef, newRef, callback) {
    if (oldRef === newRef) {
      // we should have already observed previously
      return oldRef;
    }

    if (oldRef) {
      Ref.unobserve(oldRef, callback);
    }

    if (newRef) {
      Ref.observe(newRef, callback);
      return newRef;
    }

    // important for strict equality
    return null;
  }

  getSelfRef() {
    const selfRef = this.behaviorContext.getInnerRef();
    return selfRef && selfRef.current ? selfRef : this.containerRef;
  }

  getTargetRef() {
    return this._getTargetRefInfo().targetRef;
  }

  _getTargetRefInfo() {
    // if we're on a lifecycle event that requires us to re-evaluate
    // our target reference element, then try to get/update it
    const { targetRefName } = this.props;

    // if we have a custom target name, then resolve the target
    if (targetRefName) {
      // update the cached name value so we don't try to re-evaluate
      // even if targetRef is null
      this.targetRefName = targetRefName;

      const targetContext = this.getBehaviorContext(targetRefName);

      if (targetContext) {
        return {
          targetContext,
          targetRef: targetContext.getInnerRef(targetRefName)
        };
      }
    }

    return {};
  }

  // getTargetRect() {
  //   // if an explicit target ref is not specified, callback to viewport bounds
  //   return this.targetRef ? this.targetRef.getBounds() : Viewport.getBounds();
  // }

  getBehaviorContext(refName) {
    if (refName && this.behaviorContext) {
      return this.behaviorContext.getBehaviorContext(refName);
    }
  }

  calculateOnScroll = () => {
    this.calculateCore(true);
  };

  calculateCore = fromScroll => {
    let { targetSide, selfSide = "top" } = this.props;

    // default target side to bottom if an explicit reference is present
    // or top if no target is present (i.e., assume viewport scenario)
    if (!targetSide) {
      targetSide = this.getTargetRef() ? "bottom" : "top";
    }

    const targetDir = SideDirection[targetSide];
    const selfDir = SideDirection[selfSide];

    if (targetDir !== selfDir) {
      // don't try to compare non-sensical sides - for example left edge and top edge
      // are not compatible to be compared
      console.error("Attempted to compare incompatible sides");
      return;
    }

    // get the rects we're trying to compare
    const selfRect = this.getSelfRef().getBounds();
    const targetRect = (this.getTargetRef() || Viewport).getBounds(); //this.getTargetRect();

    const { targetOffset = 0, selfOffset = 0 } = this.props;
    const selfEdge = selfRect[selfSide] + selfOffset;
    const targetEdge = targetRect[targetSide] + targetOffset;

    this.onStatusChanged(
      (this.status = {
        // general info
        direction: targetDir,
        fromScroll,
        // self info
        selfRect,
        selfSide,
        selfEdge,
        selfOffset,
        // target info
        targetRect,
        targetSide,
        targetEdge
      })
    );
  };

  // inheritors should override
  onStatusChanged(status) {}
}
