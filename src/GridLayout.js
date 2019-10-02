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
    const { layoutType } = layoutConfig;
    return layoutType === "grid"
      ? this.renderGrid(layoutConfig)
      : layoutType === "stack"
      ? this.renderStack(layoutConfig)
      : null;
  }

  renderGrid(layoutConfig) {
    return (
      <div style={layoutConfig.containerStyle} key={layoutConfig.key}>
        {layoutConfig.children.map(childConfig => {
          const { layoutType } = childConfig;
          if (layoutType) {
            return this.renderContainer(childConfig);
          }

          const styleObj = {
            gridRow: childConfig.row + " / span " + (childConfig.rowSpan || 1),
            gridColumn:
              childConfig.col + " / span " + (childConfig.colSpan || 1),
            ...childConfig.childStyle
          };

          return this.renderChild(childConfig, styleObj);
        })}
      </div>
    );
  }

  renderStack(layoutConfig) {
    return (
      <div style={layoutConfig.containerStyle} key={layoutConfig.key}>
        {layoutConfig.children.map(childConfig => {
          const { layoutType } = childConfig;
          if (layoutType) {
            return this.renderContainer(childConfig);
          }

          return this.renderChild(childConfig, childConfig.childStyle);
        })}
      </div>
    );
  }

  renderChild(childConfig, styleObj) {
    const { key } = childConfig;
    let behaviors = this.getChildBehaviors(key, childConfig);
    let childRef = this.getChildRef(key);

    if (!behaviors.length) {
      return (
        <div key={key} style={styleObj} ref={childRef}>
          {childConfig.component}
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
        {childConfig.component}
      </BehaviorCollection>
    );
  }

  getChildBehaviors(childKey, childConfig) {
    const { behaviors: { animate, stick } = {} } = childConfig;
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
