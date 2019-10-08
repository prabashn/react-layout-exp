import React from "react";
import { Animatable } from "./Animatable";
import { Stickable } from "./Stickable";
import { Opacity } from "./Opacity";
import { BehaviorCollection } from "./BehaviorCollection";
import { memoize, cloneDeep } from "lodash-es";
import { GlobalLayoutContext } from "./GlobalLayoutContext";
import { Transitions } from "./Transitions";

export class Layout extends React.Component {
  // map of all known transition configs. key = transition name, value = Map(child keys))
  //transitionNameToChildKeyMap = new Map();

  render() {
    return this.renderContainer(this.props.layoutConfig);
  }

  rerender = () => {
    this.setState({});
  };

  renderContainer(layoutConfig) {
    const { layoutType, children } = layoutConfig;
    return layoutType === "grid"
      ? this.renderContainerCore(
          layoutConfig,
          this.renderGridChildren(children),
          { display: "grid" }
        )
      : layoutType === "stack"
      ? this.renderContainerCore(
          layoutConfig,
          this.renderStackChildren(children)
        )
      : layoutType === "flex"
      ? this.renderContainerCore(
          layoutConfig,
          this.renderStackChildren(children),
          { display: "flex " }
        )
      : null;
  }

  renderGridChildren(children) {
    return children.map(childConfig => {
      childConfig = this.processTransitions(childConfig);

      const styleObj = {
        gridRow:
          (childConfig.row || 1) + " / span " + (childConfig.rowSpan || 1),
        gridColumn:
          (childConfig.col || 1) + " / span " + (childConfig.colSpan || 1),
        ...childConfig.childStyle
      };

      return this.renderChild(childConfig, styleObj);
    });
  }

  renderStackChildren(children) {
    return children.map(childConfig => {
      childConfig = this.processTransitions(childConfig);
      return this.renderChild(childConfig, childConfig.childStyle);
    });
  }

  renderChild(childConfig, styleObj) {
    if (childConfig.hidden) {
      return null;
    }

    const { key, aliasKeys, layoutType, behaviors } = childConfig;

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
        this.renderContainer({
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

  processTransitions(config) {
    const { transitions } = config;

    if (transitions) {
      for (let transitionName in transitions) {
        // TODO: make this optimized so only the children that need to transition
        // state/config needs to re-render. May need to create new 'wrapper child components'
        // that are stateful, and listen to specific transition changes, and update
        // internal state so only those components end up re-rendering instead of the
        // entire layout tree.
        Transitions.sub(transitionName, this.rerender);
      }

      // merge the base config with any transitions that are in-effect right now
      config = Transitions.getConfig(config, transitions);
    }

    return config;
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

  // mergeStyles(baseStyles, transitionStyles, overrideStyles) {
  //   const overrideInfo = this.overrideObjFast(
  //     this.overrideObjFast({ orig: true, obj: baseStyles }, transitionStyles),
  //     overrideStyles
  //   );
  //   return overrideInfo.obj;
  // }

  // overrideObjFast(baseInfo, overrideObj) {
  //   if (!overrideObj || overrideObj === baseInfo.obj) {
  //     return baseInfo;
  //   } else {
  //     if (baseInfo.orig) {
  //       return {
  //         orig: false,
  //         obj: Object.assign({}, baseInfo.obj, overrideObj)
  //       };
  //     } else {
  //       Object.assign(baseInfo.obj, overrideObj);
  //       return baseInfo;
  //     }
  //   }
  // }

  renderContainerCore(layoutConfig, childComponents, overrideStyles) {
    layoutConfig = this.processTransitions(layoutConfig);
    const { containerStyle, hidden } = layoutConfig;
    const styleObj = { ...containerStyle, ...overrideStyles };
    return !hidden ? <div style={styleObj}>{childComponents}</div> : null;
  }

  renderComponentCore(key, aliasKeys, behaviorConfig, styleObj, component) {
    let behaviors = this.getChildBehaviors(key, behaviorConfig);
    aliasKeys && GlobalLayoutContext.setAliasKeys(key, aliasKeys);

    // scenario 1: component has no behaviors
    if (!behaviors || !behaviors.length) {
      let childRef = GlobalLayoutContext.getChildRef(key);
      return (
        <div key={key} style={styleObj} ref={childRef} id={key}>
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
    return this.getCachedBehaviors([childKey, animate, stick, opacity], () => {
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
    });
  }

  createBehavior(behaviorClass, behaviorConfig) {
    let props = typeof behaviorConfig === "object" ? behaviorConfig : undefined;
    return { class: behaviorClass, props };
  }

  getCachedBehaviors = memoize(
    (_keys, getBehaviors) => getBehaviors(),
    (keys, _getBehaviors) => keys.join("|")
  );
}
