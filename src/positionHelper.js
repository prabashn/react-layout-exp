import { Viewport } from "./Viewport";

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
    const viewport = Viewport.getBounds();
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
  if (!r1) {
    // if both invalid, return true
    // if r1 invalid, and r2 valid, return false
    return !r2;
  } else if (!r2) {
    // r1 valid, but r2 is invalid, return false
    return false;
  }

  if (side) {
    return r1[side] === r2[side];
  }

  return (
    r1.top === r2.top &&
    r1.left === r2.left &&
    r1.bottom === r2.bottom &&
    r1.right === r2.right
  );
}

export function getOffsetPosition(self) {
  if (self) {
    const { offsetLeft: left, offsetTop: top } = self;

    // recursively get the offset parent's position
    const { left: parentLeft, top: parentTop } = getOffsetPosition(
      self.offsetParent
    );

    return { left: left + parentLeft, top: top + parentTop };
  } else {
    return { left: 0, top: 0 };
  }
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
