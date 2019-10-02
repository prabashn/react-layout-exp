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
  innerRefs = [];

  constructor(props) {
    super(props);
    this.containerRef = props.containerRef;

    const subscribers = [];
    this.setBehaviorContext({
      behaviorKey: props.behaviorKey,
      setBehaviorContext: this.setBehaviorContext,
      animationsEnabled: true,
      animationsRunning: false,
      subscribers,
      getLayoutChildRef: props.getLayoutChildRef || (layoutChildName => {}),
      getContainerRef: () => this.containerRef,
      getInnerRef: () =>
        this.innerRefs[this.innerRefs.length - 1] || this.containerRef,
      pushInnerRef: ref => {
        const refIndex = this.innerRefs.indexOf(ref);
        if (refIndex >= 0) {
          this.innerRefs[refIndex] = ref;
        } else {
          this.innerRefs.push(ref);
        }
      },
      popInnerRef: ref => {
        const refIndex = this.innerRefs.indexOf(ref);
        if (refIndex >= 0) {
          this.innerRefs.splice(refIndex, 1);
        }
      },
      getBehaviorContext: behaviorCollectionKey => {
        if (props.getBehaviorCollectionRef) {
          const ref = props.getBehaviorCollectionRef(behaviorCollectionKey);
          return ref && ref.current && ref.current.behaviorContext;
        }
      },
      subscribe: callback => {
        // TODO: debug why this is getting called multiple times
        if (!subscribers.indexOf(callback)) {
          subscribers.push(callback);
        }
      },
      unsubscribe: callback => {
        // TODO: debug -- same as above
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
    const {
      behaviors,
      containerRef,
      children,
      getLayoutChildRef, // used in constructor
      getBehaviorCollectionRef, // used in ctor
      behaviorKey, // used in ctor
      ...otherProps
    } = this.props;

    // reset the inner ref, so when we re-render, the new one will be set again
    // by the innermost child behavior first
    this.innerRef = null;

    var WrappedComponent = children;

    behaviors.forEach((behavior, i) => {
      const behaviorRef =
        this.behaviorRefs[i] || (this.behaviorRefs[i] = React.createRef());

      const { class: Behavior, props } = behavior;

      WrappedComponent = (
        <Behavior ref={behaviorRef} {...props}>
          {WrappedComponent}
        </Behavior>
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
