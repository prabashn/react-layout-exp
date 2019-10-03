import React from "react";
import { Animatable } from "./Animatable";
import { Stickable } from "./Stickable";
import { BehaviorCollection } from "./BehaviorCollection";
import { memoize } from "lodash-es";

export class GridLayout extends React.Component {
  render() {
    return this.renderContainer(this.props.gridConfig);
  }

  renderContainer(layoutConfig) {
    const { layoutType, children } = layoutConfig;
    return layoutType === "grid"
      ? this.renderContainerCore(
          layoutConfig,
          this.renderGridChildren(children)
        )
      : layoutType === "stack"
      ? this.renderContainerCore(
          layoutConfig,
          this.renderStackChildren(children)
        )
      : null;
  }

  renderGridChildren(children) {
    return children.map(childConfig => {
      const styleObj = {
        gridRow: childConfig.row + " / span " + (childConfig.rowSpan || 1),
        gridColumn: childConfig.col + " / span " + (childConfig.colSpan || 1),
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
    const { layoutType, key, behaviors } = childConfig;

    // check if we're trying to render a child that's also another container.
    // If so, we still need to render it as a normal component with the wrapper
    // div with styles and optional behaviors, and the actual rendering child
    // being our child inside that
    if (layoutType) {
      const { containerStyle, children } = childConfig;

      return this.renderComponentCore(
        key,
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
    return this.renderComponentCore(key, behaviors, styleObj, component);
  }

  renderContainerCore(layoutConfig, childComponents) {
    const { containerStyle } = layoutConfig;
    return <div style={containerStyle}>{childComponents}</div>;
    // return this.renderComponentCore(
    //   key,
    //   behaviors,
    //   containerStyle,
    //   childComponents
    // );
  }

  renderComponentCore(key, behaviorInfo, styleObj, component) {
    let behaviors = this.getChildBehaviors(key, behaviorInfo);
    let childRef = this.getChildRef(key);

    if (!behaviors || !behaviors.length) {
      return (
        <div key={key} style={styleObj} ref={childRef} id={key}>
          {component}
        </div>
      );
    }

    let behaviorRef = this.getBehaviorCollectionRef(key);

    return (
      <BehaviorCollection
        ref={behaviorRef}
        getBehaviorCollectionRef={this.getBehaviorCollectionRef}
        getLayoutChildRef={this.getChildRef}
        behaviors={behaviors}
        key={key}
        behaviorKey={key}
        style={styleObj}
        containerRef={childRef}
      >
        {component}
      </BehaviorCollection>
    );
  }

  getChildBehaviors(childKey, behaviorInfo) {
    if (!behaviorInfo) {
      return;
    }

    const { animate, stick } = behaviorInfo;
    return this.getCachedBehaviors([childKey, animate, stick], () => {
      const behaviors = [];
      if (animate) {
        let props = typeof animate === "object" ? animate : undefined;
        behaviors.push({ class: Animatable, props });
      }
      if (stick) {
        let props = typeof stick === "object" ? stick : undefined;
        //behaviors.push(new Stickable());
        behaviors.push({ class: Stickable, props });
      }
      return behaviors;
    });
  }

  getChildRef = memoize(_childKey => React.createRef());
  getBehaviorCollectionRef = memoize(_childKey => React.createRef());

  getCachedBehaviors = memoize(
    (_keys, getBehaviors) => getBehaviors(),
    (keys, _getBehaviors) => keys.join("|")
  );

  getChildWrapperRef(key) {
    return this.getChildRef(key);
  }
}
