import React, { Component } from "react";
import { connect } from "react-redux";
import { Menu } from "antd";
import { Link } from "react-router-dom";

import CustomScrollbars from "util/CustomScrollbars";
import SidebarLogo from "./SidebarLogo";

import Auxiliary from "util/Auxiliary";
//import UserProfile from "./UserProfile";
// import AppsNavigation from "./AppsNavigation";
import { NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR, NAV_STYLE_NO_HEADER_MINI_SIDEBAR, THEME_TYPE_LITE } from "../../constants/ThemeSetting";
import Can from "../../roles/Can";

// import IntlMessages from "../../util/IntlMessages";

const MenuGroup = props => (
	<Can I="view" a={props.title.toLowerCase()} className="gx-menu-group">
		<Menu.ItemGroup {...props} key={props.title} className="gx-menu-group" title={props.title}>
			{props.children}
		</Menu.ItemGroup>
	</Can>
);

const MenuItem = props => (
	<Can I="view" a={props.page}>
		<Menu.Item {...props} key={props.page}>
			<Link to={"/" + props.page}>
				<i className={"far fa-" + props.icon} />
				<span>{props.title}</span>
			</Link>
		</Menu.Item>
	</Can>
);

class SidebarContent extends Component {
	getNoHeaderClass = navStyle => {
		if (navStyle === NAV_STYLE_NO_HEADER_MINI_SIDEBAR || navStyle === NAV_STYLE_NO_HEADER_EXPANDED_SIDEBAR) {
			return "gx-no-header-notifications";
		}
		return "";
	};

	render() {
		const { themeType, navStyle, pathname } = this.props;
		const selectedKeys = pathname.substr(1);
		const defaultOpenKeys = selectedKeys.split("/")[1];
		return (
			<Auxiliary>
				<SidebarLogo />
				<div className="gx-sidebar-content">
					{/*<div className={`gx-sidebar-notifications ${this.getNoHeaderClass(navStyle)}`}>
						<UserProfile />
						<AppsNavigation/>
					</div>*/}
					<CustomScrollbars className="gx-layout-sider-scrollbar">
						<Menu
							defaultOpenKeys={[defaultOpenKeys]}
							selectedKeys={[selectedKeys]}
							theme={themeType === THEME_TYPE_LITE ? "lite" : "dark"}
							mode="inline">
							<Menu.ItemGroup key="reports" className="gx-menu-group" title={"Reports"}>
								<Menu.Item key="dashboard" className={"ant-menu-item"}>
									<Link to="/dashboard">
										<i className="far fa-tachometer-alt-fast" />
										<span>Dashboard</span>
									</Link>
								</Menu.Item>

								<MenuItem key={"reports"} page={"reports"} title={"Reports"} icon={"table"} />
								<MenuItem key={"summary"} page={"summary"} title={"Summary"} icon={"analytics"} />
							</Menu.ItemGroup>
							<Menu.ItemGroup key="data" className="gx-menu-group" title={"Data"}>
								<MenuItem key={"cards"} page={"cards"} title={"Cards"} icon={"credit-card-front"} />
								<MenuItem key={"clients"} page={"clients"} title={"Clients"} icon={"user-tie"} />
								<MenuItem key={"agents"} page={"agents"} title={"Agents"} icon={"briefcase"} />
								<MenuItem key={"capturists"} page={"capturists"} title={"Capturists"} icon={"briefcase"} />
								<Menu.Item key="drafts" className={"ant-menu-item"}>
									<Link to="/drafts">
										<i className="far fa-file-alt" />
										<span>Drafts</span>
									</Link>
								</Menu.Item>

								<Menu.Item key="car-insurance" className={"ant-menu-item"}>
									<Link to="/car-insurance">
										<i className="far fa-car-side" />
										<span>Car Insurance</span>
									</Link>
								</Menu.Item>
								<Menu.Item key="truck-insurance" className={"ant-menu-item"}>
									<Link to="/truck-insurance">
										<i className="far fa-truck-moving" />
										<span>Truck Insurance</span>
									</Link>
								</Menu.Item>
								<Menu.Item key="search" className={"ant-menu-item"}>
									<Link to="/search">
										<i className="far fa-search" />
										<span>Search</span>
									</Link>
								</Menu.Item>
							</Menu.ItemGroup>

							<MenuGroup title={"Admin"}>
								<MenuItem key={"users"} page={"users"} title={"Users"} icon={"users"} />
								<MenuItem key={"employees"} page={"employees"} title={"Employees"} icon={"users"} />
								<MenuItem key={"coverages"} page={"coverages"} title={"Coverages"} icon={"shield-check"} />
								<MenuItem key={"payments"} page={"payments"} title={"Payments"} icon={"money-check-edit-alt"} />
								<MenuItem key={"claims"} page={"claims"} title={"Claims"} icon={"car-crash"} />
								<MenuItem key={"invoices"} page={"invoices"} title={"Invoices"} icon={"file-invoice"} />
								<MenuItem key={"expenses"} page={"expenses"} title={"Expenses"} icon={"usd-circle"} />
								<MenuItem key={"notifications"} page={"notifications"} title={"Notifications"} icon={"bell"} />
								<MenuItem key={"configuration"} page={"configuration"} title={"Configuration"} icon={"cog"} />
							</MenuGroup>
						</Menu>
					</CustomScrollbars>
				</div>
			</Auxiliary>
		);
	}
}

SidebarContent.propTypes = {};
const mapStateToProps = ({ auth, settings }) => {
	const { type } = auth;
	const { navStyle, themeType, locale, pathname } = settings;
	return { type, navStyle, themeType, locale, pathname };
};
export default connect(mapStateToProps)(SidebarContent);
