import { mediator } from "./Mediator";
import { throttle } from "lodash-es";

class ViewportObserver {
  bounds = null;
  suspended = false;

  constructor() {
    this.onScroll = throttle(this.onScroll, 50);
    this.onResize = throttle(this.onResize, 50);
    window.addEventListener("scroll", this.onScroll);
    window.addEventListener("resize", this.onResize);
  }

  getBounds() {
    return this.bounds || this.calcBounds();
  }

  calcBounds() {
    return (this.bounds = getViewportRect());
  }

  sub({ resize, scroll } = {}) {
    resize && mediator.sub("win-resize", resize);
    scroll && mediator.sub("win-scroll", scroll);
  }

  unsub({ resize, scroll } = {}) {
    resize && mediator.unsub("win-resize", resize);
    scroll && mediator.unsub("win-scroll", scroll);
  }

  onScroll = () => {
    this.calcBounds();
    mediator.pub("win-scroll");
  };

  onResize = () => {
    this.calcBounds();
    mediator.pub("win-resize");
  };

  suspend(calcBounds) {
    if (calcBounds) {
      this.calcBounds();
    }

    this.suspended = true;
  }

  resume() {
    this.suspended = false;
    this.bounds = null;
  }
}

function getViewportRect() {
  // use viewport
  const {
    scrollTop,
    scrollLeft,
    clientHeight,
    clientWidth
  } = document.documentElement;

  return {
    top: scrollTop,
    left: scrollLeft,
    bottom: scrollTop + clientHeight,
    right: scrollLeft + clientWidth
  };
}

export const Viewport = new ViewportObserver();
