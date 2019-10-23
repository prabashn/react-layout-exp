import React from "react";
import { Ref } from "./Ref";
import { GlobalLayoutContext } from "./GlobalLayoutContext";
import { BehaviorContext } from "./BehaviorContext";
import { tryRemoveItem, tryAddItem } from "./arrayHelpers";
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
  containerRef;
  behaviorRefs = [];
  behaviorContext = {};

  constructor(props) {
    super(props);

    this.containerRef = Ref.createRef({ key: "bc-" + props.behaviorKey });

    this.updateBehaviorContext({
      behaviorKey: props.behaviorKey,
      getBehaviorContext: GlobalLayoutContext.getBehaviorContext,
      containerRef: this.containerRef,
      updateBehaviorContext: this.updateBehaviorContext,
      animationsEnabled: true,
      innerRefs: [],
      //animationsRunning: false,
      //animationTargetBounds: null,
      childBehaviorContexts: [],
      currentParentBehaviorContext: null,
      eachRef: (callback, recurseChildren) =>
        eachRef(this.behaviorContext, callback, recurseChildren),
      getInnerRef: () =>
        this.behaviorContext.innerRefs[
          this.behaviorContext.innerRefs.length - 1
        ] || this.containerRef,
      pushInnerRef: ref => tryAddItem(this.behaviorContext.innerRefs, ref),
      popInnerRef: ref => tryRemoveItem(this.behaviorContext.innerRefs, ref),
      setParentContext: this.setParentContext
    });
  }

  updateBehaviorContext = newContext => {
    Object.assign(this.behaviorContext, newContext);
  };

  setParentContext = parentBehaviorContext => {
    const { currentParentBehaviorContext } = this.behaviorContext;

    // if same context, nothing to do
    if (currentParentBehaviorContext === parentBehaviorContext) {
      return;
    }

    // remove from old context
    if (currentParentBehaviorContext) {
      tryRemoveItem(
        currentParentBehaviorContext.childBehaviorContexts,
        this.behaviorContext
      );
    }

    // add to new context
    if (parentBehaviorContext) {
      tryAddItem(
        parentBehaviorContext.childBehaviorContexts,
        this.behaviorContext
      );
    }

    // update current state, so we have it for next time it changes again
    this.behaviorContext.currentParentBehaviorContext = parentBehaviorContext;
  };

  render() {
    const {
      behaviors,
      children,
      behaviorKey, // also used in ctor
      ...otherProps
    } = this.props;

    this.behaviorContext.pushInnerRef(this.containerRef);

    var WrappedComponent = children;

    behaviors.forEach((behavior, i) => {
      const behaviorRef =
        this.behaviorRefs[i] ||
        (this.behaviorRefs[i] = React.createRef({
          key: "bc-" + behaviorKey + "-b-" + i
        }));

      const { class: Behavior, props } = behavior;

      WrappedComponent = (
        <Behavior
          ref={behaviorRef}
          {...props}
          behaviorContext={this.behaviorContext}
        >
          {WrappedComponent}
        </Behavior>
      );
    });

    // child ref for this behavior's outer-most container
    return (
      // parent context (if any)
      <BehaviorContext.Consumer>
        {parentBehaviorContext => {
          this.behaviorContext.setParentContext(parentBehaviorContext);
          return (
            <div ref={this.containerRef.ref} {...otherProps} id={behaviorKey}>
              {/* inner context */}
              <BehaviorContext.Provider value={this.behaviorContext}>
                {WrappedComponent}
              </BehaviorContext.Provider>
            </div>
          );
        }}
      </BehaviorContext.Consumer>
    );
  }

  componentDidMount() {
    this.behaviorRefs.forEach(behaviorRef => {
      const { current } = behaviorRef;
      current && current.mounted && current.mounted();
    });
    console.log("componentDidMount " + this.props.behaviorKey);
  }

  componentDidUpdate() {
    this.behaviorRefs.forEach(behaviorRef => {
      const { current } = behaviorRef;
      current && current.updated && current.updated();
    });
    console.log("componentDidUpdate " + this.props.behaviorKey);
  }

  componentWillUnmount() {
    Ref.dispose(this.containerRef);
    this.behaviorRefs.length = 0;
    this.behaviorContext.setParentContext(null);
  }
}

function eachRef(behaviorContext, callback, recurseChildren) {
  behaviorContext.innerRefs.forEach(callback);
  if (recurseChildren) {
    behaviorContext.childBehaviorContexts.forEach(childContext => {
      eachRef(childContext, callback, recurseChildren);
    });
  }
}
