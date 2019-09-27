// https://jsbin.com/bakoniw/2/

import React from "react";
import { GridLayout } from "./GridLayout";

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

const gridConfig = {
  gridStyle: {
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
    {
      key: "child1",
      component: (
        <div
          id="child1"
          style={{
            ...childStyle,
            background: "rgba(0,255,0,.2)"
            //transform: "translate(50px, 50px)"
          }}
        >
          Child 1{commonFunctions("child1")}
        </div>
      ),
      animate: true,
      //stick: true,
      row: 1,
      col: 1
    },
    {
      key: "child2",
      component: (
        <div
          id="child2"
          style={{ ...childStyle, background: "rgba(255,255,0,.2)" }}
        >
          Child 2{commonFunctions("child2")}
        </div>
      ),
      animate: true,
      //stick: true,
      row: 1,
      col: 2
    },
    {
      key: "child3",
      component: (
        <div
          id="child3"
          style={{
            ...childStyle,
            height: "200px",
            background: "rgba(0,0,255,.2)",
            //margin: "10px 30px"
            width: "400px"
          }}
        >
          Child 3{commonFunctions("child3")}
        </div>
      ),
      animate: true,
      stick: true,
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
          id="child4"
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
      animate: true,
      stick: true,
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
          id="child5"
          style={{
            ...childStyle,
            height: "100vh",
            background: "rgba(255,255,0,.2)"
          }}
        >
          Child 5{commonFunctions("child5")}
        </div>
      ),
      row: 4,
      col: 1,
      colSpan: 2,
      childStyle: {
        //alignSelf: "end"
        //"align-self": "end"
      }
    }
  ]
};

// const gridConfig2 = {
//   ...gridConfig,
//   gridStyle: {
//     ...gridConfig.gridStyle,
//     gridTemplateRows: "auto auto auto",
//     gridTemplateColumns: "1fr 1fr"
//   }
// };

function swapColsAndRowsConfig(gridConfig) {
  return {
    ...gridConfig,
    children: [
      // swap child 1 & 2
      {
        ...gridConfig.children[0],
        col: gridConfig.children[1].col
      },
      {
        ...gridConfig.children[1],
        col: gridConfig.children[0].col
      },
      // swap child 3 & 4
      {
        ...gridConfig.children[2],
        row: gridConfig.children[3].row
      },
      {
        ...gridConfig.children[3],
        row: gridConfig.children[2].row
      },
      gridConfig.children[4]
    ]
  };
}

function swapOneChild(gridConfig) {
  return {
    ...gridConfig,
    children: [
      gridConfig.children[0],
      gridConfig.children[1],
      // swap child 3 & 4
      {
        ...gridConfig.children[2],
        row: gridConfig.children[3].row
      },
      {
        ...gridConfig.children[3],
        row: gridConfig.children[2].row
      },
      gridConfig.children[4]
    ]
  };
}

export class LayoutApp extends React.Component {
  layoutRef = React.createRef();

  constructor(props) {
    super(props);

    this.state = { gridConfig };

    props.button1.addEventListener("click", () =>
      this.setState({ gridConfig })
    );
    props.button2.addEventListener("click", () =>
      this.setState({
        gridConfig: swapColsAndRowsConfig(this.state.gridConfig)
      })
    );
    props.button3.addEventListener(
      "click",
      () => this.setState({ gridConfig: swapOneChild(this.state.gridConfig) })
      //this.setState({ gridConfig: gridConfig2 })
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
      const stateConfig = this.state.gridConfig;
      var config = { ...stateConfig, children: [...stateConfig.children] };
      config.children.forEach((child, index) => {
        if (child.key === childKey) {
          config.children[index] = {
            ...child,
            [propName]: value
          };
        }
      });
      this.setState({ gridConfig: config });
    });
  }

  render() {
    return (
      <GridLayout ref={this.layoutRef} gridConfig={this.state.gridConfig} />
    );
  }
}
