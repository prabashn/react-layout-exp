// https://jsbin.com/bakoniw/2/

import React from "react";
import { isEqual } from "lodash-es";
import { Child1, Child2, Child3 } from "./Children";

class App extends React.Component {
  renderCount = 0;

  appProps = { child1: { child2: { child3: { text: "hello" } } } };

  constructor() {
    super();
    setInterval(this.setMyState, 1000);
  }

  render() {
    // unsafe - causes re-render of child1
    //let child1Props = { uhoh: {} };

    // safe - even though child1 props is a new object, it does not re-render
    // as the direct object properties are exactly same
    let child1Props = { ...this.appProps.child1 };

    // safe
    //let child1Props = this.appProps.child1;

    // unsafe - causes re-render of child1 because the direct object property
    // child2 is a new object
    //let child1Props = { child2: { ...this.appProps.child1.child2 } };

    return (
      <h1>
        App {++this.renderCount}
        <Child1 {...child1Props} />
      </h1>
    );
  }

  setMyState = () => {
    this.setState({});
  };
}

export { App };
