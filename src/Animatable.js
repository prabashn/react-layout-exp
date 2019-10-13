//import { Behavior } from "./Behavior";
import { toPx, getRelativePosition } from "./positionHelper";
import React from "react";
import { Viewport } from "./Viewport";

const removeTransformStyle = {
  transition: null,
  transform: null
};

/**
 * The transition time for animations
 * TODO: make this configurable, or part of an official animation system
 * that can coordinate animations, etc.
 **/
const transitionTimeMs = 250;

/**
 * This is the component that does the main animation work by remembering the previous
 * position and apply animation style to the new position.
 */
export class Animatable extends React.Component {
  //} extends React.Component {
  prevPos = null;
  relativePos = null;
  resetTransitionTimeout = null;
  containerRef;
  behaviorContext = null;

  constructor(props) {
    super(props);
    this.behaviorContext = props.behaviorContext;
    this.containerRef = this.behaviorContext.containerRef;
  }

  render() {
    // in-case things have shifted/resized after the previous render/mount/update
    // re-calculate the container position before the new styles are applied by
    // BehaviorCollection
    this.calcCurrentPos(this.containerRef);
    return this.props.children;
  }

  componentWillUnmount() {
    clearTimeout(this.resetTransitionTimeout);
  }

  mounted() {
    this.calcCurrentPos();
  }

  updated() {
    // when updating, make sure we unset any currently animation related things
    // like clearing any pending transition-cleanup timers, and transition related styles.
    // so that we can calculate the current position with where it is actually supposed to
    // render without any in-progress translate animations.

    clearTimeout(this.resetTransitionTimeout);
    this.setStyle(this.containerRef, removeTransformStyle);

    // re-calculate the position after clearing out any transition related styles
    this.calcCurrentPos();

    this.animate(this.containerRef);
  }

  calcCurrentPos() {
    if (!this.containerRef.current) {
      return;
    }

    // save last known relative pos in prev position variable
    // so we can use for translation animation offset
    if (this.relativePos) {
      this.prevPos = this.relativePos;
    }

    const {
      current: self,
      current: { offsetParent: parent }
    } = this.containerRef;

    this.relativePos = getRelativePosition(self, parent);

    if (!this.prevPos) {
      console.log("start: " + [this.relativePos.left, this.relativePos.top]);
    }
  }

  animate(containerRef) {
    if (!this.prevPos || !this.relativePos) {
      return;
    }

    if (!this.behaviorContext.animationsEnabled) {
      console.log("animations disabled!");
      this.setStyle(containerRef, removeTransformStyle);
      return;
    }

    // prepare to animate from previous to current!
    // calculate fake relative position from new position to start the animation from
    const revLeft = this.prevPos.left - this.relativePos.left;
    const revTop = this.prevPos.top - this.relativePos.top;

    // if the reverse transform is 0, 0, then nothing to do
    if (!revLeft && !revTop) {
      console.log("nothing to animate!");
      return;
    }

    // TODO: make sure this is not triggering recursive update!
    if (this.behaviorContext) {
      // freeze the the current position in the ref before we do the translation animation
      // This would be it's new real position in the DOM, which other observers can use
      // to do any calculations while the animation is running.
      this.behaviorContext.eachRef(
        ref => ref.suspend(true),
        /* recurse so that we update all children under our behavior contex tree */
        true
      );

      //Viewport.suspend(true);

      // this.behaviorContext.updateBehaviorContext({
      //   animationsRunning: true,
      //   // store bounds at final resting point while animation is happening, so if
      //   // anyone needs our position while animating, they can use this temporary value.
      //   // TODO: we can potentially do this transparently by capturing all the refs under
      //   //   a given behavior context, and then 'freezing' all of their current positions
      //   //   before the animation starts, so that any other behavior trying to access the
      //   //   the bounds while animation is progressing has access to the "frozen" position.
      //   //   We could then 'unfreeze' all these refs under the behavior context being animated
      //   //   to resume regular boundary calculation. We can potentially get this list via the
      //   //   pushInnerRef API that we currently support (after making sure the container ref
      //   //   is also pushed in this manner)
      //   animationTargetBounds: containerRef.getCalcBounds()
      // });
    }

    const transform = "translate(" + toPx(revLeft) + ", " + toPx(revTop) + ")";

    // set the fake reset transform without any transition
    this.setStyle(containerRef, { transform });

    // now set the real transform with the transition (we need to do this in a setTimeout,
    // or animation doesn't seem to kick in most of the time - most likely because the browser
    // needs to apply the reverse transform first, and then get new frame to apply the animation transform to 0,0
    //setTimeout(() => {
    requestAnimationFrame(() => {
      this.setStyle(containerRef, {
        transition: "transform " + transitionTimeMs / 1000 + "s",
        // going to 0,0 is very important because any intermediate window resizing actions
        // will automatically be corrected on-the-fly by the native CSS animation system.
        transform: "translate(0, 0)"
      });

      // save the timer handle so we can cancel it if we get another request to reposition.
      // Otherwise this timer will kick in the middle of that animation and mess up the animation.
      this.resetTransitionTimeout = setTimeout(() => {
        this.setStyle(containerRef, removeTransformStyle);
        // TODO: make sure this is not triggering recursive update!
        // this.behaviorContext.updateBehaviorContext({
        //   animationsRunning: false
        // });

        // now that the animation is finished, 'unfreeze' so the new location
        // will be calculated as normal next time it's queried.
        this.behaviorContext.eachRef(ref => ref.resume(), true);
        //requestAnimationFrame(() => Viewport.resume());
      }, transitionTimeMs);
    }); //, 0);

    console.log(
      "previous: " +
        (this.prevPos ? [this.prevPos.left, this.prevPos.top] : null) +
        ", current: " +
        (this.relativePos
          ? [this.relativePos.left, this.relativePos.top]
          : null) +
        ", reverse transform: " +
        transform
    );
  }

  setStyle(containerRef, styleObj) {
    // handle the style explicitly so we don't end up triggerring state updates just to
    // re-render the style when we need to animate.
    Object.assign(containerRef.current.style, styleObj);
  }
}
