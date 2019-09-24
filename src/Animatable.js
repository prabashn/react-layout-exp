import { Behavior } from "./Behavior";

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
export class Animatable extends Behavior {
  //} extends React.Component {
  prevPos = null;
  relativePos = null;
  resetTransitionTimeout = null;

  mounted(containerRef) {
    this.calcCurrentPos(containerRef);
  }

  updated(containerRef) {
    // when updating, make sure we unset any currently animation related things
    // like clearing any pending transition-cleanup timers, and transition related styles.
    // so that we can calculate the current position with where it is actually supposed to
    // render without any in-progress translate animations.
    clearTimeout(this.resetTransitionTimeout);
    this.setStyle(containerRef, removeTransformStyle);

    // re-calculate the position after clearing out any transition related styles
    this.calcCurrentPos(containerRef);

    this.animate(containerRef);
  }

  calcCurrentPos(containerRef) {
    // save last known relative pos in prev position variable
    // so we can use for translation animation offset
    if (this.relativePos) {
      this.prevPos = this.relativePos;
    }

    const parent = containerRef.current.offsetParent;

    var parentPos = parent
      ? parent.getBoundingClientRect()
      : { left: 0, top: 0 };

    var selfPos = containerRef.current.getBoundingClientRect();

    this.relativePos = {
      left: selfPos.left - parentPos.left,
      top: selfPos.top - parentPos.top
    };

    if (!this.prevPos) {
      console.log("start: " + [this.relativePos.left, this.relativePos.top]);
    }
  }

  animate(containerRef) {
    if (!this.prevPos || !this.relativePos) {
      return;
    }

    // prepare to animate from previous to current!
    const revLeft = Math.round(this.prevPos.left - this.relativePos.left);
    const revTop = Math.round(this.prevPos.top - this.relativePos.top);

    // if the reverse transform is 0, 0, then nothing to do
    if (!revLeft && !revTop) {
      console.log("nothing to animate!");
      return;
    }

    const transform = "translate(" + revLeft + "px, " + revTop + "px)";

    // set the fake reset transform without any transition
    this.setStyle(containerRef, { transform });

    // now set the real transform with the transition (we need to do this in a setTimeout,
    // or animation doesn't seem to kick in most of the time - most likely because the browser
    // needs to apply the reverse transform first, and then get new frame to apply the animation transform to 0,0
    setTimeout(() => {
      this.setStyle(containerRef, {
        transition: "transform " + transitionTimeMs / 1000 + "s",
        // going to 0,0 is very important because any intermediate window resizing actions
        // will automatically be corrected on-the-fly by the native CSS animation system.
        transform: "translate(0, 0)"
      });

      // save the timer handle so we can cancel it if we get another request to reposition.
      // Otherwise this timer will kick in the middle of that animation and mess up the animation.
      this.resetTransitionTimeout = setTimeout(
        () => this.setStyle(containerRef, removeTransformStyle),
        transitionTimeMs
      );
    }, 0);

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
    //this.ref.current.style = styleObj;

    // this does not seem to work even if we completely do not use react styles (which could conflict) - why??
    //var style = this.getStyle(styleObj);
    //this.ref.current.style.cssText = style;

    // handle the style explicitly so we don't end up triggerring state updates just to
    // re-render the style when we need to animate.
    Object.assign(containerRef.current.style, styleObj);
  }

  // getStyle(styleObj) {
  //   var style = [];
  //   for (let key in styleObj) {
  //     style.push(key);
  //     style.push(":");
  //     style.push(styleObj[key]);
  //     style.push(";");
  //   }
  //   return style.join("");
  // }
}