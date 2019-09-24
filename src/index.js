import React from "react";
import ReactDOM from "react-dom";
import { LayoutApp } from "./LayoutApp";

let appProps = {
  button1: document.getElementById("btn1"),
  button2: document.getElementById("btn2"),
  button3: document.getElementById("btn3"),
  button4: document.getElementById("btn4")
};

ReactDOM.render(<LayoutApp {...appProps} />, document.getElementById("app"));
