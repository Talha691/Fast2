import React from "react";
import {ConnectedRouter} from "react-router-redux";
import {Provider} from "react-redux";
import {Route, Routes} from "react-router-dom";

import "assets/vendors/style";
import "styles/wieldy.less";
import configureStore, {history} from "./appRedux/store";
import "./firebase/firebase";
import App from "./containers/App/index";


export const store = configureStore();

const NextApp = () =>
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Routes>
        <Route path="/" component={App}/>
      </Routes>
    </ConnectedRouter>
  </Provider>;


export default NextApp;
