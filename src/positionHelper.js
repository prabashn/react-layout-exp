export function getRelativePosition(self, parent) {
  return getRelativeRect(self, parent);
}

export function getRelativeRect(self, parent) {
    
  var selfPos = self.getBoundingClientRect();
  const width = selfPos.right - selfPos.left;
  const height = selfPos.bottom - selfPos.top;

  let parentPos;
  if (parent) {
    parentPos = parent.getBoundingClientRect();
  } else {
    // since viewport rect always going to be positive (i.e., when scrolled)
    // we need to negate the top/left values so the calculation will work out
    // the same way if we had used the documentElement's bounding rect 
    // (which we're trying to avoid calculating)
    const viewport = getViewportRect();
    parentPos = { top: -viewport.top, left: -viewport.left };
  }

  const left = selfPos.left - parentPos.left;
  const top = selfPos.top - parentPos.top;

  return {
    left,
    top,
    bottom: top + height,
    right: left + width
  };
}

export function rectsEqual(r1, r2, side) {
  return (!r1 && !r2) || (r1 && r2 && r1[side] === r2[side]);
}

export function getOffsetPosition(self) {
  const { offsetLeft: left, offsetTop: top } = self;
  const { offsetLeft: parentLeft, offsetTop: parentTop } = self.offsetParent;
  return { left: left + parentLeft, top: top + parentTop };
}

export function getOffsetRect(self) {
  let rect = getOffsetPosition(self);
  rect.right = rect.left + self.offsetWidth;
  rect.bottom = rect.top + self.offsetHeight;
  return rect;
}

export function toPx(value) {
  return Math.round(value * 10) / 10 + "px";
}

export function getViewportRect() {
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