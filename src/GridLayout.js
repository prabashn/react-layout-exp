import React from "react";
import { GridAnimatable } from "./GridAnimatable";
import { ChildWrapper } from "./ChildWrapper";
import { WrapperRefContext } from "./WrapperRefContext";

export class GridLayout extends React.Component {
  childContainerElementRef = new Map();

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

          let Wrapper = childConfig.animate ? GridAnimatable : ChildWrapper;
          const key = childConfig.key || index;

          // if needed, create & stash our child refs map under the child's key
          let childRef = this.childContainerElementRef.get(key);
          if (!childRef) {
            this.childContainerElementRef.set(
              key,
              (childRef = React.createRef())
            );
          }

          return (
            <WrapperRefContext.Provider value={childRef} key={key}>
              <div style={styleObj} ref={childRef}>
                <Wrapper>{childConfig.component}</Wrapper>
              </div>
            </WrapperRefContext.Provider>
          );
        })}
      </div>
    );
  }

  getChildWrapperRef(key) {
    return this.childContainerElementRef.get(key);
  }
}
