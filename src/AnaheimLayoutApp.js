// https://jsbin.com/bakoniw/2/

import React from "react";
import { Layout } from "./Layout";
import { Feed } from "./Feed";
import {
  GlobalLayoutContext,
  DefaultGlobalLayoutContext
} from "./GlobalLayoutContext";

const childStyle = {
  border: "2px solid black",
  padding: "20px"
};

const background = (
  <div
    style={{
      ...childStyle,
      background: "gray",
      //  background: "linear-gradient(180deg, rgba(100,100,100,0.8) 0%, rgba(100,100,100,0.2) 100%)",
      width: "100vw",
      height: "100vh"
    }}
  >
    Background
  </div>
);

const logo = (
  <div
    style={{
      ...childStyle,
      background: "rgba(255,0,0)",
      width: "300px",
      height: "50px"
    }}
  >
    Logo
  </div>
);

const search = (
  // <div
  //   style={{
  //     backgroundColor: "white",
  //     width: "100vw",
  //     //border: "1px dashed green",
  //     padding: "50px 0 50px 0"
  //   }}
  // >
  <div
    style={{
      ...childStyle,
      background: "rgba(0,255,0)",
      width: "50vw",
      margin: "50px 0"
    }}
  >
    Search
  </div>
  // </div>
);

const topSites = (
  <div
    id="ts"
    style={{
      ...childStyle,
      background: "rgba(0,0,255)",
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
      background: "white",
      marginBottom: "20px"
    }}
  >
    Personalized news & more
  </div>
);

const settingsGear = (
  <div
    style={{
      ...childStyle,
      width: "20px",
      height: "20px",
      padding: "5px",
      background: "white"
    }}
  >
    ...
  </div>
);

const layoutConfigFull = {
  layoutType: "grid",
  key: "main-grid",
  containerStyle: {
    gridTemplateRows: "100vh auto"
  },
  children: [
    {
      key: "background",
      childStyle: {
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: "1"
      },
      row: 1,
      component: background,
      transitions: {
        "nav-sticky": {
          childStyle: {
            height: "162px",
            zIndex: "2",
            overflow: "hidden"
          }
        }
      }
    },
    {
      key: "settings-gear",
      component: settingsGear,
      childStyle: {
        justifySelf: "end",
        margin: "50px",
        zIndex: 3
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
        alignSelf: "center",
        zIndex: 2
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
        alignSelf: "end",
        zIndex: 2
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
        justifySelf: "center",
        zIndex: 1
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

    this.state = { layoutConfig: layoutConfigFull };

    props.button1.addEventListener("click", () =>
      this.setState({ layoutConfig: layoutConfigFull })
    );

    // props.button2.addEventListener("click", () =>
    //   this.setState({
    //     layoutConfig: swapColsAndRowsConfig(this.state.layoutConfig)
    //   })
    // );

    // props.button3.addEventListener(
    //   "click",
    //   () => this.setState({ layoutConfig: swapOneChild(this.state.layoutConfig) })
    //   //this.setState({ layoutConfig: layoutConfig2 })
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
    //   const stateConfig = this.state.layoutConfig;

    //   var config = { ...stateConfig, children: [...stateConfig.children] };

    //   config.children.forEach((child, index) => {
    //     if (child.key === childKey) {
    //       config.children[index] = {
    //         ...child,
    //         [propName]: value
    //       };
    //     }
    //   });

    //   this.setState({ layoutConfig: config });
    // });
  }

  render() {
    return (
      <Layout ref={this.layoutRef} layoutConfig={this.state.layoutConfig} />
    );
  }
}
