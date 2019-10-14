import React from "react";
import ReactDOM from "react-dom";
//import { LayoutApp } from "./LayoutApp";
import { AnaheimLayoutApp } from "./AnaheimLayoutApp";

let appProps = {
  button1: document.getElementById("btn1"),
  button2: document.getElementById("btn2"),
  button3: document.getElementById("btn3"),
  button4: document.getElementById("btn4"),
  button5: document.getElementById("btn5")
};

//ReactDOM.render(<LayoutApp {...appProps} />, document.getElementById("app"));
ReactDOM.render(
  <AnaheimLayoutApp {...appProps} />,
  document.getElementById("app")
);
