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

const feed = <Feed />;

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
  containerStyle: {
    gridTemplateRows: "100vh auto"
  },
  transitions: {
    // "layout-mode": {
    //   informational: {
    //     containerStyle: {
    //       gridTemplateRows: "auto auto"
    //     }
    //   }
    // },
    "river-mode": {
      on: {
        containerStyle: {
          gridTemplateRows: "auto auto"
        }
      },
      headings: {
        containerStyle: {
          gridTemplateRows: "calc(100vh - 60px) auto"
        }
      }
    }
  },
  children: {
    background: {
      order: 0,
      childStyle: {
        // we can't really specify positions here like this?
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
        },
        "background-mode": {
          off: {
            hide: true
          }
        }
      }
    },
    "settings-gear": {
      order: 1,
      component: settingsGear,
      childStyle: {
        justifySelf: "end",
        margin: "50px",
        zIndex: 3,
        position: "fixed",
        top: 0,
        right: 0
      }
      // behaviors: {
      //   stick: {
      //     selfOffset: -50
      //   }
      // }
    },
    "top-grid": {
      order: 2,
      layoutType: "grid",
      containerStyle: {
        gridTemplateRows: "auto 50px auto 50px auto"
      },
      childStyle: {
        alignSelf: "center",
        zIndex: 2
      },
      transitions: {
        "layout-mode": {
          inspirational: {
            containerStyle: {
              gridTemplateRows: "0 0 auto 40vh auto"
            }
          }
        },
        "river-mode": {
          on: {
            containerStyle: {
              gridTemplateRows: "auto 50px auto 50px auto"
            }
          }
        }
      },
      row: 1,
      children: {
        logo: {
          order: 0,
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
        "search-background": {
          order: 1,
          component: (
            <div
              style={{
                background: "white",
                width: "100vw",
                height: "162px"
              }}
            />
          ),
          hide: true,
          childStyle: {
            position: "fixed",
            top: "0",
            zIndex: -1
          },
          transitions: {
            "nav-sticky": {
              hide: false
            },
            "layout-mode": {
              inspirational: {
                hide: true
              },
              informational: {
                hide: true
              }
            },
            "background-mode": {
              off: {
                hide: false
              }
            }
          }
        },
        search: {
          order: 2,
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
        "top-sites": {
          order: 3,
          component: topSites,
          row: 5,
          childStyle: {
            justifySelf: "center",
            alignSelf: "start",
            marginBottom: "50px"
          },
          behaviors: {
            animate: true,
            opacity: {
              maxOpacity: 1,
              targetRefName: "search",
              targetSide: "bottom",
              // do not make larger than 50  or else the opacity will start immediately
              // because the search's margin-bottom is only 50
              transitionGap: 50,
              targetOffset: 50
            }
          },
          transitions: {
            "topsite-mode": {
              off: {
                row: 1,
                rowSpan: 5,
                childStyle: {
                  alignSelf: "end"
                },
                behaviors: {
                  opacity: {
                    maxOpacity: 0
                  }
                }
              }
            }
          }
        }
      }
    },
    "river-loader": {
      order: 2,
      component: riverLoaderButton,
      row: 1,
      childStyle: {
        justifySelf: "center",
        alignSelf: "end",
        zIndex: 2
      },
      behaviors: {
        animate: true,
        opacity: {
          targetSide: "bottom",
          selfSide: "bottom",
          transitionGap: 100
        }
      },
      transitions: {
        "layout-mode": {
          informational: {
            opacity: {
              maxOpacity: 0
            }
          }
        },
        "river-mode": {
          headings: {
            hide: true
          },
          off: {
            hide: true
          }
        }
      }
    },
    river: {
      order: 3,
      component: feed,
      row: 2,
      childStyle: {
        justifySelf: "stretch",
        zIndex: 1
      },
      behaviors: {
        animate: true
      },
      transitions: {
        "river-mode": {
          off: {
            hide: true
          }
        }
      }
    }
  }
};

export class AnaheimLayoutApp extends React.Component {
  layoutRef = React.createRef();

  topSiteModes = ["on", "off"];
  backgroundModes = ["on", "off"];
  riverModes = ["off", "headings", "on", "scroll"];

  constructor(props) {
    super(props);

    this.state = { layoutConfig: layoutConfigFull };

    this.renderBooleanButton(
      props.button1,
      "Focused",
      "layout-mode",
      "focus",
      () => {
        Transitions.pubMany(
          {
            "layout-mode": "focus",
            "topsite-mode": "on",
            "background-mode": "off",
            "river-mode": "scroll"
          },
          true
        );
      }
    );

    this.renderBooleanButton(
      props.button2,
      "Inspirational",
      "layout-mode",
      "inspirational",
      () => {
        Transitions.pubMany(
          {
            "layout-mode": "inspirational",
            "topsite-mode": "on",
            "background-mode": "on",
            "river-mode": "scroll"
          },
          true
        );
      }
    );

    this.renderBooleanButton(
      props.button3,
      "Informational",
      "layout-mode",
      "informational",
      () => {
        Transitions.pubMany(
          {
            "layout-mode": "informational",
            "topsite-mode": "on",
            "background-mode": "on",
            "river-mode": "on"
          },
          true
        );
      }
    );

    this.renderStateButton(props.button4, "Top Sites", "topsite-mode", () => {
      this.cycleMode("topsite-mode", this.topSiteModes);
    });

    this.renderStateButton(props.button5, "River", "river-mode", () => {
      this.cycleMode("river-mode", this.riverModes);
    });

    // background image
    this.renderStateButton(
      props.button6,
      "Background",
      "background-mode",
      () => {
        const bgMode = "background-mode";
        const bgModeState = Transitions.getState(bgMode);
        const layoutModeState = Transitions.getState("layout-mode");
        if (layoutModeState === "focus" && bgModeState === "off") {
          // about to turn on background - go to inspirational
          props.button2.click();
        } else if (
          layoutModeState === "inspirational" &&
          bgModeState === "on"
        ) {
          // about to turn off background - go to focus
          props.button1.click();
        } else {
          this.cycleMode(bgMode, this.backgroundModes);
        }
      }
    );

    // simulate loading focus mode as a starting point
    props.button1.click();
  }

  cycleMode(transitionName, transitionStates) {
    let stateIndex =
      (transitionStates.indexOf(Transitions.getState(transitionName)) + 1) %
      transitionStates.length;

    Transitions.pub(transitionName, transitionStates[stateIndex], true);
  }

  render() {
    return (
      <Layout
        ref={this.layoutRef}
        layoutKey="page"
        layoutConfig={this.state.layoutConfig}
      />
    );
  }

  renderBooleanButton(
    button,
    description,
    transitionName,
    transitionState,
    callback
  ) {
    button.innerText = description;
    Transitions.sub(
      transitionName,
      status =>
        (button.innerText =
          description + " (" + (status === transitionState) + ")")
    );
    button.addEventListener("click", callback);
  }

  renderStateButton(button, description, transitionName, callback) {
    button.innerText = description;
    Transitions.sub(
      transitionName,
      status => (button.innerText = description + " (" + status + ")")
    );
    button.addEventListener("click", callback);
  }
}
