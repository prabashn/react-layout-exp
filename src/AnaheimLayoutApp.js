// https://jsbin.com/bakoniw/2/

import React from "react";
import { Layout } from "./Layout";
import { Feed } from "./Feed";
import { Transitions } from "./Transitions";

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
      width: "50vw"
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
      background: "rgba(0,0,255)"
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
  transitions: {
    "layout-mode": {
      informational: {
        containerStyle: {
          gridTemplateRows: "auto auto"
        }
      }
    }
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
        },
        "layout-mode": {
          focus: {
            hide: true
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
        gridTemplateRows: "3fr 50px auto 50px 6fr"
      },
      childStyle: {
        alignSelf: "center",
        zIndex: 2
      },
      transitions: {
        "layout-mode": {
          inspirational: {
            containerStyle: {
              gridTemplateRows: "0 0 7fr 0 2fr"
            }
          }
        }
      },
      row: 1,
      children: [
        {
          key: "logo",
          component: logo,
          //hide: true,
          row: 1,
          childStyle: {
            justifySelf: "center",
            alignSelf: "end"
          },
          behaviors: {
            animate: true,
            //stick: true
            opacity: {
              maxOpacity: 0,
              transitionGap: 50,
              targetOffset: 50
            }
          },
          transitions: {
            "layout-mode": {
              focus: {
                //hide: false,
                behaviors: {
                  opacity: {
                    maxOpacity: 1
                  }
                }
              }
            }
          }
        },
        {
          key: "search-background",
          component: (
            <div
              style={{ background: "white", width: "100vw", height: "162px" }}
            />
          ),
          hide: true,
          childStyle: {
            position: "fixed",
            top: "0"
          },
          transitions: {
            "nav-sticky": {
              hide: false
            },
            "layout-mode": {
              inspirational: {
                hide: true
              }
            }
          }
        },
        {
          key: "search",
          aliasKeys: ["nav-container"],
          component: search,
          row: 3,
          childStyle: {
            justifySelf: "center"
          },
          behaviors: {
            animate: true,
            stick: {
              selfOffset: -50
            }
          },
          transitions: {
            inspirational: {
              childStyle: {
                alignSelf: "start"
              }
            }
          }
        },
        {
          key: "top-sites",
          component: topSites,
          row: 5,
          childStyle: {
            justifySelf: "center",
            alignSelf: "start"
          },
          behaviors: {
            animate: true,
            opacity: {
              targetRefName: "search",
              targetSide: "bottom",
              transitionGap: 50,
              targetOffset: 50
            }
          },
          transitions: {
            "layout-mode": {
              informational: {
                childStyle: {
                  marginBottom: "50px"
                }
              }
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
        justifySelf: "stretch",
        zIndex: 1
      },
      behaviors: {
        animate: true
      }
    }
  ]
};

export class AnaheimLayoutApp extends React.Component {
  layoutRef = React.createRef();

  constructor(props) {
    super(props);

    this.state = { layoutConfig: layoutConfigFull };

    props.button1.addEventListener("click", () => {
      Transitions.pub("layout-mode", "focus", true);
    });

    props.button2.addEventListener("click", () => {
      Transitions.pub("layout-mode", "inspirational", true);
    });

    props.button3.addEventListener("click", () => {
      Transitions.pub("layout-mode", "informational", true);
    });

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
