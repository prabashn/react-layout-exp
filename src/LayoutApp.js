// https://jsbin.com/bakoniw/2/

import React from "react";
import { GridLayout } from "./Layout";

const childStyle = {
  border: "5px solid black",
  padding: "20px"
};

const subscribers = new Map();
const mediator = {
  sub: (name, callback) => {
    let subs = subscribers.get(name);
    if (!subs) {
      subscribers.set(name, (subs = []));
    }
    subs.push(callback);
  },
  pub: (name, ...args) => {
    const subs = subscribers.get(name);
    if (subs) {
      subs.forEach(sub => sub(...args));
    }
  }
};

function changeOption(e) {
  const json = JSON.parse(e.target.getAttribute("data-json"));
  mediator.pub("updateState", json.key, json.prop, json.value);
}

function commonButton(text, key, prop, value) {
  return (
    <button
      data-json={JSON.stringify({ key, prop, value })}
      onClick={changeOption}
    >
      {text}
    </button>
  );
}

function commonFunctions(childKey) {
  return (
    <React.Fragment>
      <div>
        {commonButton("Stick", childKey, "stick", true)}
        {commonButton("Animate", childKey, "animate", true)}
        {commonButton("No-Stick", childKey, "stick", false)}
        {commonButton("No-Animate", childKey, "animate", false)}
      </div>
    </React.Fragment>
  );
}

const layoutConfig = {
  layoutType: "grid",
  key: "main-grid",
  containerStyle: {
    position: "relative",
    display: "grid",
    //height: "calc(100vh - 100px)", // 16px to account for some random margin added by the sandbox.io
    //gridTemplateRows: "auto calc(100vh - 200px) auto",
    gridTemplateRows: "auto auto auto auto",
    gridTemplateColumns: "1fr 1fr"
    // "grid-template-rows": "auto 1fr auto",
    // "grid-template-columns": "1fr 1fr"
  },
  children: [
    // {
    //   key: "top-sticky",
    //   component: <div id="top-sticky" style={{ visibility: "hidden" }} />,
    //   row: 1,
    //   col: 1
    // },
    // {
    //   key: "mid-sticky",
    //   component: <div id="mid-sticky" style={{ visibility: "hidden" }} />,
    //   row: 2,
    //   col: 1
    // },
    {
      key: "child1",
      component: (
        <div
          style={{
            ...childStyle,
            background: "rgba(0,255,0,.2)"
            //transform: "translate(50px, 50px)"
          }}
        >
          Child 1{commonFunctions("child1")}
        </div>
      ),
      //animate: true,
      //stick: true,
      row: 1,
      col: 1
    },
    // {
    //   key: "child2",
    //   component: (
    //     <div
    //       style={{ ...childStyle, background: "rgba(255,255,0,.2)" }}
    //     >
    //       Child 2{commonFunctions("child2")}
    //     </div>
    //   ),
    //   animate: true,
    //   //stick: true,
    //   row: 1,
    //   col: 2
    // },
    {
      key: "child3",
      component: (
        <div
          style={{
            ...childStyle,
            height: "200px",
            background: "rgba(0,0,255,.2)",
            //margin: "10px 30px"
            width: "400px"
            // position: "fixed",
            // top: "0px"
          }}
        >
          Child 3{commonFunctions("child3")}
        </div>
      ),
      //animate: true,
      //stickCompanion: "top-sticky",
      behaviors: {
        stick: {
          // TODO: this does not work, as child6 appears later in the tree
          //  there seems to be problems when a referenced child apepars later
          // targetRefName: "child6",
          // targetSide: "bottom"
        },
        opacity: {
          transitionGap: 50,
          minOpacity: 0.5
          //selfOffset: 0
        }
      },
      row: 2,
      col: 1,
      colSpan: 2,
      childStyle: {
        alignSelf: "start",
        justifySelf: "center"
        //"align-self": "start"
      }
    },
    {
      key: "child4",
      component: (
        <div
          style={{
            ...childStyle,
            height: "10vh",
            width: "50vw",
            background: "rgba(255,0,0,.2)"
          }}
        >
          Child 4{commonFunctions("child4")}
        </div>
      ),
      behaviors: {
        // animate: true,
        stick: {
          targetRefName: "child3",
          targetSide: "top",
          targetOffset: 30
        },
        opacity: {
          transitionGap: -300
        }
      },
      // stickCompanion: "top-sticky",
      // stickCompanion: "mid-sticky",
      row: 3,
      col: 1,
      colSpan: 2,
      childStyle: {
        justifySelf: "center"
        //alignSelf: "end"
        //"align-self": "end"
      }
    },
    {
      key: "child5",
      component: (
        <div
          style={{
            ...childStyle,
            height: "100vh",
            width: "95vw",
            marginTop: "10px", // better to use this than offsets
            background: "rgba(255,255,0,.2)"
          }}
        >
          Child 5{commonFunctions("child5")}
        </div>
      ),
      behaviors: {
        // animate: true,
        stick: {
          targetRefName: "child3",
          targetSide: "bottom"
          //selfOffset: -50 //TODO: figure out why this doesn't work
          //selfOffset: 50 // this works
          //targetOffset: 50
        },
        opacity: {
          transitionGap: -150,
          targetRefName: "child3",
          targetSide: "bottom",
          invertOpacity: true
        }
      },
      row: 4,
      col: 1,
      colSpan: 2,
      childStyle: {
        justifySelf: "center"
        //alignSelf: "end"
        //"align-self": "end"
      }
    },
    //*
    {
      // child info of nested-container
      key: "child6",
      row: 1,
      col: 2,
      // behaviors: {
      //   // animate: true,
      //   stick: true
      // },

      // container info
      layoutType: "stack",
      containerStyle: {
        display: "flex",
        width: "50vw"
      },
      children: [
        {
          key: "child61",
          component: (
            <div
              style={{
                ...childStyle,
                height: "20px",
                background: "rgba(0,255,255,.2)"
              }}
            >
              Child 61
            </div>
          ),
          childStyle: {
            flexGrow: 1
          },
          behaviors: {
            opacity: {
              transitionGap: -40,
              selfOffset: 40,
              minOpacity: 0.2,
              maxOpacity: 0.8
            }
          }
        },
        {
          key: "child62",
          component: (
            <div
              style={{
                ...childStyle,
                height: "20px",
                background: "rgba(0,255,255,.2)"
              }}
            >
              Child 62
            </div>
          ),
          childStyle: {
            flexGrow: 1
          }
          // behaviors: {
          //   stick: true
          // }
        },
        {
          key: "child63",
          component: (
            <div
              style={{
                ...childStyle,
                height: "20px",
                background: "rgba(0,255,255,.2)"
              }}
            >
              Child 63
            </div>
          ),
          childStyle: {
            flexGrow: 1
          }
        },
        {
          key: "child7",
          layoutType: "stack",
          row: 1,
          col: 2,
          containerStyle: {
            flexGrow: 1
          },
          behaviors: {
            // animate: true,
            stick: true
          },
          children: [
            {
              key: "child71",
              component: (
                <div
                  style={{
                    border: "2px solid black",
                    height: "20px",
                    background: "rgba(0,255,255,.2)"
                  }}
                >
                  Child 71
                </div>
              )
            },
            {
              key: "child72",
              component: (
                <div
                  style={{
                    border: "2px solid black",
                    height: "20px",
                    background: "rgba(0,255,255,.2)"
                  }}
                >
                  Child 72
                </div>
              )
            },
            {
              key: "child73",
              component: (
                <div
                  style={{
                    border: "2px solid black",
                    height: "20px",
                    background: "rgba(0,255,255,.2)"
                  }}
                >
                  Child 73
                </div>
              )
            }
          ]
        }
      ]
    }
    //*/
  ]
};

// const layoutConfig2 = {
//   ...layoutConfig,
//   gridStyle: {
//     ...layoutConfig.gridStyle,
//     gridTemplateRows: "auto auto auto",
//     gridTemplateColumns: "1fr 1fr"
//   }
// };

function swapColsAndRowsConfig(layoutConfig) {
  return {
    ...layoutConfig,
    children: [
      // swap child 1 & 2
      {
        ...layoutConfig.children[0],
        col: layoutConfig.children[1].col
      },
      {
        ...layoutConfig.children[1],
        col: layoutConfig.children[0].col
      },
      // swap child 3 & 4
      {
        ...layoutConfig.children[2],
        row: layoutConfig.children[3].row
      },
      {
        ...layoutConfig.children[3],
        row: layoutConfig.children[2].row
      },
      layoutConfig.children[4]
    ]
  };
}

function swapOneChild(layoutConfig) {
  return {
    ...layoutConfig,
    children: [
      layoutConfig.children[0],
      layoutConfig.children[1],
      // swap child 3 & 4
      {
        ...layoutConfig.children[2],
        row: layoutConfig.children[3].row
      },
      {
        ...layoutConfig.children[3],
        row: layoutConfig.children[2].row
      },
      layoutConfig.children[4]
    ]
  };
}

export class LayoutApp extends React.Component {
  layoutRef = React.createRef();

  constructor(props) {
    super(props);

    this.state = { layoutConfig: layoutConfig };

    props.button1.addEventListener("click", () =>
      this.setState({ layoutConfig: layoutConfig })
    );
    props.button2.addEventListener("click", () =>
      this.setState({
        layoutConfig: swapColsAndRowsConfig(this.state.layoutConfig)
      })
    );
    props.button3.addEventListener(
      "click",
      () =>
        this.setState({ layoutConfig: swapOneChild(this.state.layoutConfig) })
      //this.setState({ layoutConfig: layoutConfig2 })
    );
    props.button4.addEventListener("click", () =>
      // TODO: we can do intersection observer on these raw elements now to do any custom handling at the DOM level
      // TODO: try implement sticky behavior
      // TODO: try implement sub-grid
      alert([
        this.layoutRef.current.getChildWrapperRef("child1").current.tagName,
        this.layoutRef.current.getChildWrapperRef("child2").current.tagName,
        this.layoutRef.current.getChildWrapperRef("child3").current.tagName,
        this.layoutRef.current.getChildWrapperRef("child4").current.tagName
      ])
    );

    mediator.sub("updateState", (childKey, propName, value) => {
      const { layoutConfig } = this.state;
      var config = { ...layoutConfig, children: [...layoutConfig.children] };
      config.children.forEach((child, index) => {
        if (child.key === childKey) {
          config.children[index] = {
            ...child,
            [propName]: value
          };
        }
      });
      this.setState({ layoutConfig: config });
    });
  }

  render() {
    return (
      <GridLayout ref={this.layoutRef} layoutConfig={this.state.layoutConfig} />
    );
  }
}
