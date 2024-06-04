import {combineReducers} from "redux";
import {routerReducer} from "react-router-redux";
import Settings from "./Settings";
import Common from "./Common";
import Auth from "./Auth";
import Clients from "./Clients";
import Users from "./Users";
import Employees from "./Employees";
import Agents from "./Agents";
import Coverage from "./Coverages";


const reducers = combineReducers({
	routing: routerReducer,
	common: Common,
	users: Users,
	employees: Employees,
	agents: Agents,
	auth: Auth,
	clients: Clients,
	settings: Settings,
	coverage: Coverage,
});

export default reducers;
