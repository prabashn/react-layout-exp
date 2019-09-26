import { Behavior } from "./Behavior";
import { throttle } from "lodash-es";
import { numericLiteral } from "babel-types";
import { getRelativePosition, getOffsetPosition } from "./positionHelper";
import React from "react";

//export class Stickable extends Behavior {
export class Stickable extends React.Component {
  containerPos = null;
  stickyContainerRect = null;

  containerRef = null;
  stickyContainerRef = React.createRef();
  sizeHelperRef = React.createRef();

  isSticky = false;

  // render(containerRef, children) {
  //   this.containerRef = containerRef;
  //   return <div ref={this.stickyContainerRef}>{children}</div>;
  // }

  constructor(props) {
    super(props);
    //this.tryCalculateStickyRect = throttle(this.tryCalculateStickyRect, 100);
    this.calculateStick = throttle(this.calculateStick, 20);
  }

  render() {
    return (
      <React.Fragment>
        <div ref={this.stickyContainerRef}>{this.props.children}</div>
        <div
          ref={this.sizeHelperRef}
          style={{ display: "none", outline: "5px solid red" }}
        />
      </React.Fragment>
    );
  }

  mounted(containerRef) {
    this.containerRef = containerRef;
    this.tryCalculateContainerRect();
    this.calculateStick();
    window.addEventListener("scroll", () => this.calculateStick());
    window.addEventListener("resize", () =>
      this.tryCalculateStickyRect(this.isSticky)
    );
  }

  updated(containerRef) {
    this.containerRef = containerRef;
    this.tryCalculateContainerRect();
    this.calculateStick(true);
  }

  componentDidMount() {
    this.tryCalculateContainerRect();
    this.tryCalculateStickyRect();
  }

  componentDidUpdate() {
    this.tryCalculateContainerRect();
    this.tryCalculateStickyRect();
    this.calculateStick(true);
  }

  tryCalculateContainerRect() {
    if (!this.containerRef) {
      return;
    }
    //this.containerRect = getRelativePosition(this.containerRef.current);
    this.containerPos = getOffsetPosition(this.containerRef.current);
  }

  tryCalculateStickyRect(updateSizeHelper) {
    if (!this.stickyContainerRef) {
      return;
    }
    this.stickyContainerRect = getRelativePosition(
      this.stickyContainerRef.current
    );
    if (updateSizeHelper) {
      this.updateSizeHelper();
    }
  }

  updateSizeHelper() {
    if (this.sizeHelperRef.current) {
      const stickyContainerRect = this.stickyContainerRect;

      Object.assign(this.sizeHelperRef.current.style, {
        width: this.toPx(stickyContainerRect.right - stickyContainerRect.left),
        height: this.toPx(stickyContainerRect.bottom - stickyContainerRect.top)
      });
    }
  }

  calculateStick(forceUpdate) {
    if (!this.containerPos) {
      return;
    }

    const scrollTop = document.documentElement.scrollTop;
    const { top: containerTop } = this.containerPos;

    // if (scrollTop >= staticTop) {
    //   this.stick();
    // } else if (scrollTop < staticTop) {
    //   this.unstick();
    // }

    if (scrollTop > containerTop) {
      if (!this.isSticky || forceUpdate) {
        this.tryCalculateStickyRect(
          true /* since we're about to stick, update the size helper */
        );
        this.stick();
      }
    } else {
      if (this.isSticky || forceUpdate) {
        this.unstick();
      }
    }
  }

  stick() {
    // const { scrollLeft, scrollTop } = document.documentElement;
    const { top: containerTop } = this.containerPos;

    // const leftPx = scrollLeft > left ? this.toPx(scrollLeft - left) : "0";
    // const topPx = scrollTop > top ? this.toPx(scrollTop - top) : "0";

    // Object.assign(this.containerRef.current.style, {
    //   transform: "translate(" + leftTx + ", " + topTx + ")"
    // });

    // Object.assign(this.containerRef.current.style, {
    //   position: "width",
    //   transform: "translate(" + leftPx + ", " + topPx + ")"
    // });

    // show the helper so the container doesn't collapse after we make the
    // sticky container 'sticky' and move out of the flow
    Object.assign(this.sizeHelperRef.current.style, {
      display: "block"
    });

    // take the sticky container out of the flow using 'fixed' css and
    // re-position to counteract the container's static position
    //const leftPx = this.toPx(-left);
    const topPx = this.toPx(-containerTop);

    Object.assign(this.stickyContainerRef.current.style, {
      position: "fixed",
      //transform: "translate(" + leftPx + ", " + topPx + ")"
      // we're only doing Y, because we're only implementing
      // vertical scroll sticky behavior
      transform: "translateY(" + topPx + ")"
    });

    this.isSticky = true;
  }

  toPx(value) {
    return Math.floor(value * 10) / 10 + "px";
  }

  unstick() {
    // Object.assign(this.containerRef.current.style, {
    //   transform: null
    // });

    Object.assign(this.sizeHelperRef.current.style, {
      display: "none"
    });

    // bring back to where it was under the static container
    Object.assign(this.stickyContainerRef.current.style, {
      position: null,
      transform: null
    });

    this.isSticky = false;
  }
}
