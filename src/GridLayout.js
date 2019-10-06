import React from "react";
import { Animatable } from "./Animatable";
import { Stickable } from "./Stickable";
import { Opacity } from "./Opacity";
import { BehaviorCollection } from "./BehaviorCollection";
import { memoize } from "lodash-es";
import { GlobalLayoutContext } from "./GlobalLayoutContext";

export class GridLayout extends React.Component {
  render() {
    return this.renderContainer(this.props.gridConfig);
  }

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
      return this.renderChild(childConfig, childConfig.childStyle);
    });
  }

  renderChild(childConfig, styleObj) {
    const { layoutType, key, behaviors, aliasKeys } = childConfig;

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

  renderContainerCore(layoutConfig, childComponents, overrideStyles) {
    const { containerStyle } = layoutConfig;
    const styleObj = { ...containerStyle, ...overrideStyles };
    return <div style={styleObj}>{childComponents}</div>;
  }

  renderComponentCore(key, aliasKeys, behaviorInfo, styleObj, component) {
    return (
      <GlobalLayoutContext.Consumer key={key}>
        {globalLayoutContext => {
          let behaviors = this.getChildBehaviors(key, behaviorInfo);
          aliasKeys && globalLayoutContext.setAliasKeys(key, aliasKeys);

          if (!behaviors || !behaviors.length) {
            let childRef = globalLayoutContext.getChildRef(key);
            return (
              <div style={styleObj} ref={childRef} id={key}>
                {component}
              </div>
            );
          }

          let behaviorRef = globalLayoutContext.getBehaviorCollectionRef(key);
          return (
            <BehaviorCollection
              ref={behaviorRef}
              behaviors={behaviors}
              behaviorKey={key}
              style={styleObj}
            >
              {component}
            </BehaviorCollection>
          );
        }}
      </GlobalLayoutContext.Consumer>
    );
  }

  getChildBehaviors(childKey, behaviorInfo) {
    if (!behaviorInfo) {
      return;
    }

    const { animate, stick, opacity } = behaviorInfo;
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
