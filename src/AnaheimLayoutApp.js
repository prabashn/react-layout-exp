// https://jsbin.com/bakoniw/2/

import React from "react";
import { GridLayout } from "./GridLayout";
import { Feed } from "./Feed";
import {
  GlobalLayoutContext,
  DefaultGlobalLayoutContext
} from "./GlobalLayoutContext";

const childStyle = {
  border: "2px solid black",
  padding: "20px"
};

const logo = (
  <div
    style={{
      ...childStyle,
      background: "rgba(255,0,0,.2)",
      width: "200px"
    }}
  >
    Logo
  </div>
);

const search = (
  <div
    style={{
      backgroundColor: "white",
      width: "100vw",
      border: "1px dashed green",
      padding: "50px 0 50px 0"
    }}
  >
    <div
      style={{
        ...childStyle,
        background: "rgba(0,255,0,.2)",
        width: "50vw",
        margin: "auto"
      }}
    >
      Search
    </div>
  </div>
);

const topSites = (
  <div
    id="ts"
    style={{
      ...childStyle,
      background: "rgba(0,0,255,.2)",
      margin: "100px 0 50px 0"
    }}
  >
    Top Sites
  </div>
);

const river = <Feed />;

const riverLoaderButton = (
  <div
    style={{
      ...childStyle,
      width: "200px",
      padding: "5px",
      textAlign: "center",
      marginBottom: "20px"
    }}
  >
    Personalized news & more
  </div>
);

const settingsGear = (
  <div style={{ ...childStyle, width: "20px", height: "20px", padding: "5px" }}>
    ...
  </div>
);

const gridConfig = {
  layoutType: "grid",
  key: "main-grid",
  containerStyle: {
    //position: "relative",
    //display: "grid",
    //height: "calc(100vh - 100px)", // 16px to account for some random margin added by the sandbox.io
    //gridTemplateRows: "auto calc(100vh - 200px) auto",
    gridTemplateRows: "100vh auto"
    //gridTemplateColumns: "1fr"
    // "grid-template-rows": "auto 1fr auto",
    // "grid-template-columns": "1fr 1fr"
  },
  children: [
    {
      key: "settings-gear",
      component: settingsGear,
      childStyle: {
        justifySelf: "end",
        margin: "50px",
        zIndex: 2
      },
      behaviors: {
        stick: {
          selfOffset: -50
        }
      }
    },
    {
      key: "top-grid",
      layoutType: "grid",
      containerStyle: {
        gridTemplateRows: "auto auto auto 1fr"
      },
      childStyle: {
        alignSelf: "center"
      },
      row: 1,
      children: [
        {
          key: "logo",
          component: logo,
          row: 1,
          childStyle: {
            justifySelf: "center"
          },
          behaviors: {
            opacity: {
              transitionGap: 100,
              selfOffset: -200
            }
          }
        },
        {
          key: "search",
          aliasKeys: ["nav-container"],
          component: search,
          row: 2,
          childStyle: {
            justifySelf: "center"
          },
          behaviors: {
            stick: {
              selfOffset: 0
            }
          }
        },
        {
          key: "top-sites",
          component: topSites,
          row: 3,
          childStyle: {
            justifySelf: "center"
          },
          behaviors: {
            opacity: {
              targetRefName: "search",
              targetSide: "bottom",
              targetOffset: -50,
              transitionGap: 75
            }
          }
        }
      ]
    },
    {
      key: "river-loader",
      component: riverLoaderButton,
      row: 1,
      childStyle: {
        justifySelf: "center",
        alignSelf: "end"
      },
      behaviors: {
        opacity: {
          targetSide: "bottom",
          selfSide: "bottom",
          transitionGap: 100
        }
      }
    },
    {
      key: "river",
      component: river,
      row: 2,
      childStyle: {
        justifySelf: "center"
      },
      behaviors: {
        // stick: {
        //   targetRefName: "search",
        //   targetSide: "bottom",
        //   selfOffset: 50
        // }
      }
    }
  ]
};

export class AnaheimLayoutApp extends React.Component {
  layoutRef = React.createRef();

  constructor(props) {
    super(props);

    this.state = { gridConfig };

    props.button1.addEventListener("click", () =>
      this.setState({ gridConfig })
    );

    // props.button2.addEventListener("click", () =>
    //   this.setState({
    //     gridConfig: swapColsAndRowsConfig(this.state.gridConfig)
    //   })
    // );

    // props.button3.addEventListener(
    //   "click",
    //   () => this.setState({ gridConfig: swapOneChild(this.state.gridConfig) })
    //   //this.setState({ gridConfig: gridConfig2 })
    // );

    // props.button4.addEventListener("click", () =>
    //   // TODO: we can do intersection observer on these raw elements now to do any custom handling at the DOM level
    //   // TODO: try implement sticky behavior
    //   // TODO: try implement sub-grid
    //   alert([
    //     this.layoutRef.current.getChildWrapperRef("child1").current.tagName,
    //     this.layoutRef.current.getChildWrapperRef("child2").current.tagName,
    //     this.layoutRef.current.getChildWrapperRef("child3").current.tagName,
    //     this.layoutRef.current.getChildWrapperRef("child4").current.tagName
    //   ])
    // );

    // mediator.sub("updateState", (childKey, propName, value) => {
    //   const stateConfig = this.state.gridConfig;

    //   var config = { ...stateConfig, children: [...stateConfig.children] };

    //   config.children.forEach((child, index) => {
    //     if (child.key === childKey) {
    //       config.children[index] = {
    //         ...child,
    //         [propName]: value
    //       };
    //     }
    //   });

    //   this.setState({ gridConfig: config });
    // });
  }

  render() {
    return (
      <GlobalLayoutContext.Provider value={DefaultGlobalLayoutContext}>
        <GridLayout ref={this.layoutRef} gridConfig={this.state.gridConfig} />
      </GlobalLayoutContext.Provider>
    );
  }
}
