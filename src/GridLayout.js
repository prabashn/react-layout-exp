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
      : layoutType === "stack-horizontal"
      ? this.renderStack(layoutConfig)
      : null;
  }

  renderGrid(layoutConfig) {
    return (
      <div style={layoutConfig.containerStyle}>
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
      <div style={layoutConfig.containerStyle}>
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

  getChildBehaviors(childKey, childConfig) {
    const { animate, stick } = childConfig;
    return this.getCachedBehaviors([childKey, animate, stick], () => {
      const behaviors = [];
      if (animate) {
        behaviors.push({ class: Animatable });
      }
      if (stick) {
        const { stickCompanion } = childConfig;
        //behaviors.push(new Stickable());
        behaviors.push({ class: Stickable, props: { stickCompanion } });
      }
      return behaviors;
    });
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

    return (
      <BehaviorCollection
        getCompanionRef={this.getChildRef}
        behaviors={behaviors}
        key={key}
        style={styleObj}
        containerRef={childRef}
      >
        {childConfig.component}
      </BehaviorCollection>
    );
  }

  getChildRef = memoize(_childKey => React.createRef());

  getCachedBehaviors = memoize(
    (_keys, getBehaviors) => getBehaviors(),
    (keys, _getBehaviors) => keys.join("|")
  );

  getChildWrapperRef(key) {
    return this.getChildRef(key);
  }
}
