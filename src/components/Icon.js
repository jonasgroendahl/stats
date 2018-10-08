import React, { PureComponent } from "react";

export default class Icon extends PureComponent {
  ref = React.createRef();

  render() {
    let div = null;
    switch (this.props.name) {
      case "download":
        div = (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="18"
            viewBox="0 0 14 18"
          >
            <g fill="#50E3C2" fillRule="evenodd">
              <path d="M.515 15.699h12.971v1.853H.515zM13.563 7.36H9.5V.61h-5v6.75H.437L7 15.24z" />
            </g>
          </svg>
        );
        break;
      case "pipe":
        div = (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="2"
            height="22"
            viewBox="0 0 2 22"
            style={{ cursor: "default" }}
          >
            <path
              fill="none"
              fillRule="evenodd"
              stroke="#50E3C2"
              strokeLinecap="square"
              d="M1 1v20"
            />
          </svg>
        );
        break;
      default:
        div = null;
        break;
    }

    return (
      <div
        onClick={this.props.onClick}
        style={{
          ...this.props.style
        }}
        ref={this.ref}
        className={this.props.className}
      >
        {div}
      </div>
    );
  }
}
