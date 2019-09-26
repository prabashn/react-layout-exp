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
export class BehaviorCollection extends React.Component {
  behaviors = [];
  mountableBehaviorRefs = [];
  containerRef = null;

  constructor(props) {
    super(props);
    this.containerRef = props.containerRef;
    this.behaviors.push(...(props.behaviors || []));
  }

  render() {
    const { behaviors, containerRef, children, ...otherProps } = this.props;
    let finalChildren = children;

    this.behaviors.forEach((behavior, index) => {
      if (behavior.prototype && behavior.prototype.render) {
        const Behavior = behavior;

        const behaviorRef =
          this.mountableBehaviorRefs[index] ||
          (this.mountableBehaviorRefs[index] = React.createRef());

        finalChildren = <Behavior ref={behaviorRef}>{finalChildren}</Behavior>;
      } else if (behavior.beforeRender) {
        behavior.beforeRender(this.containerRef);
      }
    });

    return (
      <div ref={this.containerRef} {...otherProps} children={finalChildren} />
    );
  }

  componentDidMount() {
    this.behaviors.forEach(
      behavior => behavior.mounted && behavior.mounted(this.containerRef)
    );
    this.mountableBehaviorRefs.forEach(
      ref =>
        ref.current &&
        ref.current.mounted &&
        ref.current.mounted(this.containerRef)
    );
  }

  componentDidUpdate() {
    this.behaviors.forEach(
      behavior => behavior.updated && behavior.updated(this.containerRef)
    );
    this.mountableBehaviorRefs.forEach(
      ref =>
        ref.current &&
        ref.current.updated &&
        ref.current.updated(this.containerRef)
    );
  }
}
