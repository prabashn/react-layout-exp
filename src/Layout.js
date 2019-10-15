import React from "react";
import { Animatable } from "./Animatable";
import { Stickable } from "./Stickable";
import { Opacity } from "./Opacity";
import { BehaviorCollection } from "./BehaviorCollection";
import { GlobalLayoutContext } from "./GlobalLayoutContext";
import { Transitions } from "./Transitions";
import { Ref } from "./Ref";

export class Layout extends React.Component {
  // map of all known transition configs. key = transition name, value = Map(child keys))
  //transitionNameToChildKeyMap = new Map();
  childKeyToTransitionGroups = {};
  //keyToTransitionSubs = {};

  render() {
    return this.renderContainer(this.props.layoutKey, this.props.layoutConfig);
  }

  rerender = () => {
    this.setState({});
  };

  renderContainer(key, layoutConfig) {
    const { layoutType, children } = layoutConfig;
    return layoutType === "grid"
      ? this.renderContainerCore(
          key,
          layoutConfig,
          this.renderGridChildren(children),
          { display: "grid" }
        )
      : layoutType === "stack"
      ? this.renderContainerCore(
          key,
          layoutConfig,
          this.renderStackChildren(children)
        )
      : layoutType === "flex"
      ? this.renderContainerCore(
          key,
          layoutConfig,
          this.renderStackChildren(children),
          { display: "flex " }
        )
      : null;
  }

  renderGridChildren(children) {
    return this.mapChildren(children, (childKey, childConfig) => {
      childConfig = this.processTransitions(childKey, childConfig);

      const styleObj = {
        gridRow:
          (childConfig.row || 1) + " / span " + (childConfig.rowSpan || 1),
        gridColumn:
          (childConfig.col || 1) + " / span " + (childConfig.colSpan || 1),
        ...childConfig.childStyle
      };

      return this.renderChild(childKey, childConfig, styleObj);
    });
  }

  renderStackChildren(children) {
    return this.mapChildren(children, (childKey, childConfig) => {
      childConfig = this.processTransitions(childKey, childConfig);
      return this.renderChild(childKey, childConfig, childConfig.childStyle);
    });
  }

  renderChild(key, childConfig, styleObj) {
    if (childConfig.hide) {
      return null;
    }

    const { aliasKeys, layoutType, behaviors } = childConfig;

    // check if we're trying to render a child that's also another container.
    // If so, we still need to render it as a normal component with the wrapper
    // div with styles and optional behaviors, and the actual rendering child
    // being our child inside that
    if (layoutType) {
      const { containerStyle, children } = childConfig;

      return this.renderComponentCore(
        key,
        aliasKeys,
        behaviors,
        styleObj,
        // render the actual container as the child of the component
        this.renderContainer(key, {
          layoutType,
          containerStyle,
          children
        })
      );
    }

    // single child
    const { component } = childConfig;
    return this.renderComponentCore(
      key,
      aliasKeys,
      behaviors,
      styleObj,
      component
    );
  }

  processTransitions(key, config) {
    const { transitions } = config;

    if (!transitions) {
      return config;
    }

    // TODO: make this optimized so only the children that need to transition
    // state/config needs to re-render. May need to create new 'wrapper child components'
    // that are stateful, and listen to specific transition changes, and update
    // internal state so only those components end up re-rendering instead of the
    // entire layout tree.

    // create transition groups only once (since they should be considered as invariant
    // during transitions)
    let transitionGroup = this.childKeyToTransitionGroups[key];
    if (!transitionGroup) {
      const transitionNames = Object.keys(transitions);
      transitionGroup = this.childKeyToTransitionGroups[
        key
      ] = Transitions.subMany(transitionNames, this.rerender);
    }

    // merge the base config with any transitions that are in-effect right now
    return Transitions.getConfig(config, transitions);
  }

  mergeStyles(baseStyles, transitionStyles, overrideStyles) {
    let clonedStyle = false;
    let styleObj = baseStyles;

    if (transitionStyles && baseStyles !== transitionStyles) {
      // Since we clone the base style when we create transition style, treat it as a clone
      styleObj = transitionStyles;
      clonedStyle = true;
    }

    if (overrideStyles) {
      if (clonedStyle) {
        return Object.assign(styleObj, overrideStyles);
      } else if (styleObj) {
        return Object.assign({}, styleObj, overrideStyles);
      } else {
        return overrideStyles;
      }
    }

    return styleObj;
  }

  renderContainerCore(key, layoutConfig, childComponents, overrideStyles) {
    layoutConfig = this.processTransitions(key, layoutConfig);
    const { containerStyle, hide } = layoutConfig;
    const styleObj = { ...containerStyle, ...overrideStyles };
    return !hide ? <div style={styleObj}>{childComponents}</div> : null;
  }

  renderComponentCore(key, aliasKeys, behaviorConfig, styleObj, component) {
    let behaviors = this.getChildBehaviors(key, behaviorConfig);
    aliasKeys && GlobalLayoutContext.setAliasKeys(key, aliasKeys);

    // scenario 1: component has no behaviors
    if (!behaviors || !behaviors.length) {
      let childRef = Ref.createRef();
      return (
        <div key={key} style={styleObj} ref={childRef.ref} id={key}>
          {component}
        </div>
      );
    }

    // scenario 2: component has behaviors
    let behaviorRef = GlobalLayoutContext.getBehaviorCollectionRef(key);
    return (
      <BehaviorCollection
        key={key}
        ref={behaviorRef}
        behaviors={behaviors}
        behaviorKey={key}
        style={styleObj}
      >
        {component}
      </BehaviorCollection>
    );
  }

  getChildBehaviors(childKey, behaviorConfig) {
    if (!behaviorConfig) {
      return;
    }

    const { animate, stick, opacity } = behaviorConfig;
    //return this.getCachedBehaviors([childKey, animate, stick, opacity], () => {
    const behaviors = [];

    if (animate) {
      behaviors.push(this.createBehavior(Animatable, animate));
    }
    if (stick) {
      behaviors.push(this.createBehavior(Stickable, stick));
    }
    if (opacity) {
      behaviors.push(this.createBehavior(Opacity, opacity));
    }
    return behaviors;
  }

  createBehavior(behaviorClass, behaviorConfig) {
    let props = typeof behaviorConfig === "object" ? behaviorConfig : undefined;
    return { class: behaviorClass, props };
  }

  componentWillUnmount() {
    for (let childKey in this.childKeyToTransitionGroups) {
      Transitions.unsub(this.childKeyToTransitionGroups[childKey]);
    }
  }

  mapChildren(children, mapFn) {
    const childKeys = Object.keys(children);
    childKeys.sort((a, b) => (a.order || 0) - (b.order || 0));
    return childKeys.map(childKey => mapFn(childKey, children[childKey]));
  }

  // getCachedBehaviors = memoize(
  //   (_keys, getBehaviors) => getBehaviors(),
  //   (keys, _getBehaviors) => keys.join("|")
  // );
}
