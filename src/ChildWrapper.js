import React from "react";

/**
 * This component just serves as a wrapper for non-animated components
 * so that we have an intermediary to apply the grid positioning styling
 * specified by the config. We can also apply performance optimizations here
 * so that shouldComponentUpdate will return true only if the animation worthy
 * props change (i.e., grid position, etc.)
 *
 * TODO: use this as a base class for GridAnimatable to apply the same perf optimizations.
 */
export class ChildWrapper extends React.Component {
  render() {
    const { styleObj, containerRef, ...otherProps } = this.props;
    return <div ref={containerRef} style={styleObj} {...otherProps} />;
  }
}
