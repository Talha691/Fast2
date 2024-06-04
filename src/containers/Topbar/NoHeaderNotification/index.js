import React, {Component} from "react";
import {connect} from "react-redux";

import {toggleCollapsedSideNav} from "../../../appRedux/actions/Setting";
// import IntlMessages from "util/IntlMessages";

class NoHeaderNotification extends Component {

  render() {
    return (
      <div />
    )
  }
}

const mapStateToProps = ({settings}) => {
  const {navCollapsed} = settings;
  return {navCollapsed}
};
export default connect(mapStateToProps, {toggleCollapsedSideNav})(NoHeaderNotification);
