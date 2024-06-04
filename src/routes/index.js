import React from "react";
import { Route, Routes  } from "react-router-dom";

import asyncComponent from "util/asyncComponent";
import Can from "../roles/Can";

// Pages
import Clients from "./data/clients";
import Search from "./data/search";
import Cards from "./data/cards";
import Agents from "./data/agents";
import Capturists from "./data/capturists";
import Users from "./admin/users";
import Employees from "./admin/employees";
import Coverages from "./admin/coverages";
import Invoices from "./admin/invoices";
import Expenses from "./admin/expenses";
import Notifications from "./admin/notifications";
import Claims from "./admin/claims";
import NewClaim from "./admin/claims/claim";
import Configuration from "./admin/configuration";
import Payments from "./admin/payments";
import AgentPaymentsReport from "./admin/payments/agent";
import Insurances from "./data/insurances";

const App = ({ match }) => (
	<div className="gx-main-content-wrapper">
		<Routes >
			<Route path={`${match.url}dashboard`} component={asyncComponent(() => import("./main/dashboard"))} />
			<Route path={`${match.url}reports`} component={asyncComponent(() => import("./main/summary"))} />
			<Route path={`${match.url}summary`} component={asyncComponent(() => import("./main/reports"))} />
			<Route path={`${match.url}drafts`} component={asyncComponent(() => import("./data/drafts"))} />
			<Route
				path={`${match.url}clients`}
				render={props => (
					<Can I={"view"} a={"clients"}>
						<Clients {...props} />
					</Can>
				)}
			/>

			<Route
				path={`${match.url}car-insurance`}
				render={routeProps => (
					<Can I="view" a="insurances">
						<Insurances {...routeProps} type={"car"} />
					</Can>
				)}
			/>
			<Route
				path={`${match.url}truck-insurance`}
				render={routeProps => (
					<Can I="view" a="insurances">
						<Insurances {...routeProps} type={"truck"} />
					</Can>
				)}
			/>
			<Route
				path={`${match.url}search`}
				render={routeProps => (
					<Can I="view" a="search">
						<Search {...routeProps} />
					</Can>
				)}
			/>

			<Route
				path={`${match.url}cards`}
				render={props => (
					<Can I={"view"} a={"cards"}>
						<Cards {...props} />
					</Can>
				)}
			/>

			<Route
				path={`${match.url}agents`}
				exact
				render={props => (
					<Can I={"view"} a={"agents"}>
						<Agents {...props} />
					</Can>
				)}
			/>
			<Route
				path={`${match.url}capturists`}
				exact
				render={props => (
					<Can I={"view"} a={"capturists"}>
						<Capturists {...props} />
					</Can>
				)}
			/>

			<Route
				path={`${match.url}agents/:client`}
				render={props => (
					<Can I={"view"} a={"agentsClients"}>
						<Clients {...props} />
					</Can>
				)}
			/>

			<Route
				path={`${match.url}users`}
				render={props => (
					<Can I={"view"} a={"users"}>
						<Users {...props} />
					</Can>
				)}
			/>

			<Route
				path={`${match.url}employees`}
				render={props => (
					<Can I={"view"} a={"employees"}>
						<Employees {...props} />
					</Can>
				)}
			/>

			<Route
				path={`${match.url}coverages`}
				render={props => (
					<Can I={"view"} a={"coverages"}>
						<Coverages {...props} />
					</Can>
				)}
			/>

			<Route
				path={`${match.url}invoices`}
				render={props => (
					<Can I={"view"} a={"invoices"}>
						<Invoices {...props} />
					</Can>
				)}
			/>

			<Route
				path={`${match.url}expenses`}
				render={props => (
					<Can I={"view"} a={"expenses"}>
						<Expenses {...props} />
					</Can>
				)}
			/>

			<Route
				path={`${match.url}notifications`}
				render={props => (
					<Can I={"view"} a={"notifications"}>
						<Notifications {...props} />
					</Can>
				)}
			/>

			<Route
				path={`${match.url}claims/:id`}
				render={props => (
					<Can I={"add"} a={"claims"}>
						<NewClaim {...props} />
					</Can>
				)}
			/>

			<Route
				path={`${match.url}claims`}
				render={props => (
					<Can I={"view"} a={"claims"}>
						<Claims {...props} />
					</Can>
				)}
			/>

			<Route
				path={`${match.url}configuration`}
				render={props => (
					<Can I={"view"} a={"configuration"}>
						<Configuration {...props} />
					</Can>
				)}
			/>

			<Route
				path={`${match.url}payments/:agent`}
				render={props => (
					<Can I={"view"} a={"payments"}>
						<AgentPaymentsReport {...props} />
					</Can>
				)}
			/>
			<Route
				path={`${match.url}payments`}
				render={props => (
					<Can I={"view"} a={"payments"}>
						<Payments {...props} />
					</Can>
				)}
			/>
		</Routes >
	</div>
);

export default App;
