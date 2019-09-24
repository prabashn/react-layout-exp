// https://jsbin.com/bakoniw/2/

import React from "react";
import { GridLayout } from "./GridLayout";

const childStyle = {
  border: "5px solid black",
  padding: "20px"
};

const gridConfig = {
  gridStyle: {
    position: "relative",
    display: "grid",
    //height: "calc(100vh - 100px)", // 16px to account for some random margin added by the sandbox.io
    gridTemplateRows: "auto calc(100vh - 200px) auto",
    gridTemplateColumns: "1fr 1fr"
    // "grid-template-rows": "auto 1fr auto",
    // "grid-template-columns": "1fr 1fr"
  },
  children: [
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
          Child 1
        </div>
      ),
      animate: true,
      row: 1,
      col: 1
    },
    {
      key: "child2",
      component: (
        <div style={{ ...childStyle, background: "rgba(255,255,0,.2)" }}>
          Child 2
        </div>
      ),
      animate: true,
      row: 1,
      col: 2
    },
    {
      key: "child3",
      component: (
        <div
          style={{
            ...childStyle,
            height: "200px",
            background: "rgba(0,0,255,.2)"
          }}
        >
          Child 3
        </div>
      ),
      animate: true,
      row: 2,
      col: 1,
      colSpan: 2,
      childStyle: {
        alignSelf: "start",
        margin: "10px 30px"
        //"align-self": "start"
      }
    },
    {
      key: "child4",
      component: (
        <div
          style={{
            ...childStyle,
            height: "100px",
            background: "rgba(255,0,0,.2)"
          }}
        >
          Child 4
        </div>
      ),
      animate: true,
      row: 3,
      col: 1,
      colSpan: 2,
      childStyle: {
        alignSelf: "end"
        //"align-self": "end"
      }
    }
  ]
};

const gridConfig2 = {
  ...gridConfig,
  gridStyle: {
    ...gridConfig.gridStyle,
    gridTemplateRows: "auto auto auto",
    gridTemplateColumns: "1fr 1fr"
  }
};

const swapColsAndRowsConfig = {
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
    }
  ]
};

const swapOneChild = {
  ...gridConfig,
  children: [
    gridConfig.children[0],
    gridConfig.children[1],
    // swap child 3 & 4
    {
      ...gridConfig.children[2],
      row: gridConfig.children[3].row
    },
    gridConfig.children[3]
  ]
};

export class LayoutApp extends React.Component {
  layoutRef = React.createRef();

  constructor(props) {
    super(props);

    this.state = { gridConfig };

    props.button1.addEventListener("click", () =>
      this.setState({ gridConfig })
    );
    props.button2.addEventListener("click", () =>
      this.setState({ gridConfig: swapColsAndRowsConfig })
    );
    props.button3.addEventListener("click", () =>
      //this.setState({ gridConfig: swapOneChild })
      this.setState({ gridConfig: gridConfig2 })
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
  }

  render() {
    return (
      <GridLayout ref={this.layoutRef} gridConfig={this.state.gridConfig} />
    );
  }
}
