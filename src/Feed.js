import React from "react";
import { Layout } from "./Layout";

const childStyle = {
  border: "2px solid black",
  padding: "20px"
};

export class Feed extends React.Component {
  render() {
    return (
      <Layout
        layoutConfig={{
          layoutType: "grid",
          containerStyle: {
            background: "black",
            width: "100vw"
          },
          children: [
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
                  targetSide: "bottom",
                  transition: "nav-sticky",
                  targetOffset: 50
                }
              }
              // This seems to cause some deep recursive cloning during transitioning
              // TODO: investigate why
              // transitions: {
              //   "layout-mode": {}
              // }
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
          background: "rgba(0,255,255)",
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
          background: "rgba(0,255,255)",
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
