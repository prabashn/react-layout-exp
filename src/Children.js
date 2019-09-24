import React from "react";

export class Child1 extends React.PureComponent {
  renderCount = 0;

  // shouldComponentUpdate(nextProps, nextState) {
  //   //return !isEqual(nextProps, this.props);
  //   return nextProps.child2 !== this.props.child2;
  // }

  render() {
    return (
      <h2>
        Child1 - {++this.renderCount}
        <span>{JSON.stringify(this.props)}</span>
        <Child2 {...this.props.child2} />
      </h2>
    );
  }
}

export class Child2 extends React.PureComponent {
  renderCount = 0;

  // shouldComponentUpdate(nextProps, nextState) {
  //   //return !isEqual(nextProps, this.props);
  //   return nextProps.child3 !== this.props.child3;
  // }

  render() {
    return (
      <h3>
        Child2 - {++this.renderCount}
        <span>{JSON.stringify(this.props)}</span>
        <Child3 {...this.props.child3} />
      </h3>
    );
  }
}

export class Child3 extends React.PureComponent {
  renderCount = 0;

  render() {
    return (
      <h4>
        Child3 - {++this.renderCount}
        <span>{JSON.stringify(this.props)}</span>
      </h4>
    );
  }
}

//const App = () => <h1>Hello stateless</h1>
