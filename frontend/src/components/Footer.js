import { Footer as AntdFooter } from "antd/lib/layout/layout";
import React from "react";

import "./Footer.css";

export default class Footer extends React.Component {
  render() {
    return (
      <AntdFooter className="footer">
        <img src="icon-white.png" alt="QKart"></img>
      </AntdFooter>
    );
  }
}
