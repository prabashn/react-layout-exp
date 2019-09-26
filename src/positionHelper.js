export function getRelativePosition(self, parent) {
  var parentPos = (parent || document.documentElement).getBoundingClientRect();
  var selfPos = self.getBoundingClientRect();

  const left = selfPos.left - parentPos.left;
  const top = selfPos.top - parentPos.top;
  const width = selfPos.right - selfPos.left;
  const height = selfPos.bottom - selfPos.top;

  return {
    left,
    top,
    bottom: top + height,
    right: left + width
  };
}

export function getOffsetPosition(self) {
  const { offsetLeft: left, offsetTop: top } = self;
  const { offsetLeft: parentLeft, offsetTop: parentTop } = self.offsetParent;
  return { left: left + parentLeft, top: top + parentTop };
}
