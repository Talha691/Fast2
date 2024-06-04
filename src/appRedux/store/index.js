import {applyMiddleware, compose, createStore} from "redux";
import reducers from "../reducers/index";
import {routerMiddleware} from "react-router-redux";
import createSagaMiddleware from "redux-saga";
import rootSaga from "../sagas/index";
import { thunk } from "redux-thunk";
import ability from "../../roles/ability";
import {composeWithDevTools} from "redux-devtools-extension/logOnlyInProduction";

const createHistory = require("history").createBrowserHistory;
const history = createHistory();
const routeMiddleware = routerMiddleware(history);
const sagaMiddleware = createSagaMiddleware();

const middlewares = [thunk, sagaMiddleware, routeMiddleware];
const composeEnhancers = composeWithDevTools || compose;

export default function configureStore(initialState) {
	const store = createStore(reducers, initialState,
		composeEnhancers(applyMiddleware(...middlewares)));

	sagaMiddleware.run(rootSaga);

	if (module.hot) {
		// Enable Webpack hot module replacement for reducers
		module.hot.accept("../reducers/index", () => {
			const nextRootReducer = require("../reducers/index");
			store.replaceReducer(nextRootReducer);
		});
	}

	store.subscribe(() => {
		if (store.getState().auth.type) {
			ability.refresh(store.getState().auth);
		}
	});

	return store;
}
export {history};
