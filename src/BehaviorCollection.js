import React from "react";
import { BehaviorContext } from "./BehaviorContext";

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
  containerRef = null;
  behaviorRefs = [];
  behaviorContext = {};

  constructor(props) {
    super(props);
    this.containerRef = props.containerRef;

    const subscribers = [];
    this.setBehaviorContext({
      setBehaviorContext: this.setBehaviorContext,
      animationsEnabled: true,
      subscribers,
      subscribe: callback => {
        if (!subscribers.indexOf(callback)) {
          subscribers.push(callback);
        }
      },
      unsubscribe: callback =>{
        const index = subscribers.indexOf(callback);
        if (index >= 0) {
          subscribers.splice(index, 1);
        }
      }
    });
  }

  setBehaviorContext = newContext => {
    Object.assign(this.behaviorContext, newContext);
    this.behaviorContext.subscribers.forEach(subscriber => {
      subscriber(this.behaviorContext);
    });
  };

  render() {
    const { behaviors, containerRef, children, ...otherProps } = this.props;

    var WrappedComponent = children;

    behaviors.forEach((Behavior, i) => {
      const behaviorRef =
        this.behaviorRefs[i] || (this.behaviorRefs[i] = React.createRef());

      WrappedComponent = (
        <Behavior ref={behaviorRef}>{WrappedComponent}</Behavior>
      );
    });

    return (
      <div ref={this.containerRef} {...otherProps}>
        <BehaviorContext.Provider value={this.behaviorContext}>
          {WrappedComponent}
        </BehaviorContext.Provider>
      </div>
    );
  }

  componentDidMount() {
    this.behaviorRefs.forEach(behaviorRef => {
      const { current } = behaviorRef;
      current && current.mounted && current.mounted(this.containerRef);
    });
  }

  componentDidUpdate() {
    this.behaviorRefs.forEach(behaviorRef => {
      const { current } = behaviorRef;
      current && current.updated && current.updated(this.containerRef);
    });
  }
}
