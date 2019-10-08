import { throttle } from "lodash-es";
import {
  getViewportRect,
  rectsEqual,
  getRelativeRect,
  getOffsetRect
} from "./positionHelper";
import React from "react";

const SideDirection = {
  top: 0,
  bottom: 0,
  left: 1,
  right: 1
};

export class Proximity extends React.Component {
  behaviorContext = null;
  behaviorContainerRef = null;

  targetRef = null;
  targetRect = null;
  targetRefName = null;

  selfRect = null;

  viewportRect = null;

  status = null;

  constructor(props) {
    super(props);

    this.behaviorContext = props.behaviorContext;
    this.onScroll = throttle(this.onScroll, 50);
    this.onResize = throttle(this.onResize, 50);
  }

  render() {
    return this.renderCore();
  }

  renderCore() {
    return this.props.children;
  }

  componentDidMount() {
    window.addEventListener("scroll", this.onScroll);
    window.addEventListener("resize", this.onResize);
    // should we just wait for the parent update/mounted events to calculate both?
    this.calculateCore(false, true, true, false);
  }

  componentDidUpdate() {
    // should we just wait for the parent update/mounted events to calculate both?
    this.calculateCore(true, true, false, true);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("resize", this.onResize);
  }

  mounted(behaviorContainerRef) {
    this.behaviorContainerRef = behaviorContainerRef;
    this.calculateCore(
      true,
      true /* in case self is the container, it would not have been calculated in componentDidMount */,
      false,
      false
    );
  }

  updated(behaviorContainerRef) {
    this.behaviorContainerRef = behaviorContainerRef;
    this.calculateCore(
      true,
      true /* in case self is the container, it would not have been calculated in componentDidMount */,
      false,
      true
    );
  }

  onScroll = () => {
    this.calculateCore(false, false, true, false);
  };

  onResize = () => {
    this.calculateCore(true, true, true, true);
  };

  tryUpdateTargetRect() {
    // if we're on a lifecycle event that requires us to re-evaluate
    // our target reference element, then try to get/update it
    const { targetRefName } = this.props;

    if (targetRefName !== this.targetRefName) {
      // if we have a custom target name, then resolve the target
      if (targetRefName) {
        // update the cached name value so we don't try to re-evaluate
        // even if targetRef is null
        this.targetRefName = targetRefName;
        this.targetRef = this.getInnerRef(targetRefName);
      }
    }

    if (this.targetRef) {
      // see if the target context is currently animating
      const targetContext = this.getBehaviorContext(this.targetRefName);
      if (!targetContext || !targetContext.animationsRunning) {
        // if animations are not running, then get bounds based on viewport (preferred)
        this.targetRect = getRelativeRect(this.targetRef.current);
      } else {
        // else if animations are running, then use the offset based rect (not ideal)
        this.targetRect = getOffsetRect(this.targetRef.current);
      }
    } else {
      this.targetRect = this.viewportRect;
    }
  }

  getInnerRef(targetRefName) {
    let targetContext = this.behaviorContext.getBehaviorContext(targetRefName);
    if (targetContext) {
      return targetContext.getInnerRef();
    }
  }

  getBehaviorContext(refName) {
    if (this.behaviorContext) {
      return this.behaviorContext.getBehaviorContext(refName);
    }
  }

  getSelfElement() {
    const selfRef = this.behaviorContext.getInnerRef();
    return (
      (selfRef && selfRef.current) ||
      (this.behaviorContainerRef && this.behaviorContainerRef.current)
    );
  }

  tryUpdateSelfRect(updateSizeHelper) {
    // if the self ref was not updated with an element, attempt to get it from
    // the top most known behavior container
    const selfElement = this.getSelfElement();

    if (selfElement) {
      this.selfRect = getRelativeRect(selfElement);
    }
  }

  calculateCore(calcTarget, calcSelf, calcViewport, forceUpdate) {
    const { targetSide = "top", selfSide = "top" } = this.props;
    const targetDir = SideDirection[targetSide];
    const selfDir = SideDirection[selfSide];

    if (targetDir !== selfDir) {
      // don't try to compare non-sensical sides - for example left edge and top edge
      // are not compatible to be compared
      return;
    }

    // Note: this must be done first, as it's needed by target rect calc if targetRef is not specified
    let viewportUpdated;
    if (calcViewport || !this.viewportRect) {
      const prevRect = this.viewportRect;
      this.viewportRect = getViewportRect();
      viewportUpdated = !rectsEqual(
        prevRect,
        this.viewportUpdated,
        targetSide /* doesn't matter much... just need to figure out if the viewport changed -  top/bottom doesn't matter*/
      );
    }

    let targetRectUpdated;
    if (calcTarget || calcViewport) {
      const prevRect = this.targetRect;
      this.tryUpdateTargetRect();
      targetRectUpdated = !rectsEqual(prevRect, this.targetRect, targetSide);
      // if (targetRectUpdated) {
      //   this.onTargetRectChanged();
      // }
    }

    let selfRectUpdated;
    if (calcSelf) {
      const prevRect = this.selfRect;
      this.tryUpdateSelfRect();
      selfRectUpdated = !rectsEqual(prevRect, this.selfRect, selfSide);
      // if (selfRectUpdated) {
      //   this.onSelfRectChanged();
      // }
    }

    // rectangles are not available, or have not changed.
    if (
      !this.targetRect ||
      !this.selfRect ||
      !(forceUpdate || targetRectUpdated || selfRectUpdated || viewportUpdated)
    ) {
      return;
    }

    // // if we don't have set a previous status, then need to force udpate
    // let thisStatus = this.status;
    // if (!thisStatus) {
    //   forceUpdate = true;
    // }

    const {
      targetOffset = 0,
      selfOffset = 0
      // transitionGap = 0,
      // reverseTransition = false
    } = this.props;

    const selfEdge = this.selfRect[selfSide] + selfOffset;
    const targetEdge = this.targetRect[targetSide] + targetOffset;

    this.onStatusChanged(
      (this.status = {
        direction: targetDir,
        // self info
        selfRectUpdated,
        selfRect: this.selfRect,
        selfEdge,
        selfOffset,
        // target info
        targetRectUpdated,
        targetRect: this.targetRect,
        targetEdge,
        // viewport info
        viewportUpdated,
        viewportRect: this.viewportRect,
        viewportEdge: this.viewportRect[targetDir === 0 ? "top" : "left"]
      })
    );
  }

  // inheritors should override
  onStatusChanged(status) {}
}
