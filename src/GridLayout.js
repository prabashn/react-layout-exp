import React from "react";
import { Animatable } from "./Animatable";
import { Stickable } from "./Stickable";
import { BehaviorCollection } from "./BehaviorCollection";
import { memoize } from "lodash-es";

export class GridLayout extends React.Component {
  render() {
    const gridConfig = this.props.gridConfig;

    return (
      <div style={gridConfig.gridStyle} ref={this.rootRef}>
        {gridConfig.children.map((childConfig, index) => {
          const styleObj = {
            gridRow: childConfig.row + " / span " + (childConfig.rowSpan || 1),
            gridColumn:
              childConfig.col + " / span " + (childConfig.colSpan || 1),
            ...childConfig.childStyle
          };

          const { key = index } = childConfig;
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
        })}
      </div>
    );
  }

  getChildRef = memoize(_childKey => React.createRef());

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

  getCachedBehaviors = memoize(
    (_keys, getBehaviors) => getBehaviors(),
    (keys, _getBehaviors) => keys.join("|")
  );

  getChildWrapperRef(key) {
    return this.getChildRef(key);
  }
}
