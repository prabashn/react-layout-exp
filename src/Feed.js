import React from "react";
import { BehaviorContext } from "./BehaviorContext";
import { GridLayout } from "./GridLayout";

const childStyle = {
  border: "2px solid black",
  padding: "20px"
};

export class Feed extends React.Component {
  render() {
    return (
      <GridLayout
        gridConfig={{
          layoutType: "grid",
          containerStyle: {
            gridTemplateRows: "auto 100vh"
          },
          children: [
            {
              key: "nav-bg",
              component: (
                <div
                  style={{
                    backgroundColor: "white"
                  }}
                />
              ),
              row: 1
            },
            {
              key: "nav",
              component: this.nav(),
              row: 1,
              childStyle: {
                justifySelf: "center"
              },
              behaviors: {
                stick: {
                  targetRefName: "nav-container",
                  targetSide: "bottom"
                }
              }
            },
            {
              key: "river",
              component: this.river(),
              row: 2,
              childStyle: {
                justifySelf: "center"
              }
            }
          ]
        }}
      />
    );
  }

  nav() {
    return (
      <div
        style={{
          ...childStyle,
          background: "rgba(0,255,255,.2)",
          margin: "-10px -10px 10px -10px",
          width: "80vw"
        }}
      >
        Nav Bar
      </div>
    );
  }

  river() {
    return (
      <div
        style={{
          ...childStyle,
          background: "rgba(0,255,255,.2)",
          height: "150vh",
          width: "80vw"
          //transform: "translate(50px, 50px)"
        }}
      >
        <div>River Item 1</div>
        <div style={{ marginTop: "150px" }}>River Item 2</div>
        <div style={{ marginTop: "150px" }}>River Item 3</div>
        <div style={{ marginTop: "150px" }}>River Item 4</div>
        <div style={{ marginTop: "150px" }}>River Item 5</div>
        <div style={{ marginTop: "150px" }}>River Item 6</div>
        <div style={{ marginTop: "150px" }}>River Item 7</div>
        <div style={{ marginTop: "150px" }}>River Item 8</div>
      </div>
    );
  }
}
