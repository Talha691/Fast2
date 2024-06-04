import {
	HIDE_MESSAGE,
	INIT_URL,
	ON_HIDE_LOADER,
	ON_SHOW_LOADER,
	SHOW_MESSAGE,
	SET_USER_TYPE,
	SIGNIN_FACEBOOK_USER_SUCCESS,
	SIGNIN_GITHUB_USER_SUCCESS,
	SIGNIN_GOOGLE_USER_SUCCESS,
	SIGNIN_TWITTER_USER_SUCCESS,
	SIGNIN_USER_SUCCESS,
	SIGNOUT_USER_SUCCESS,
	SIGNUP_USER_SUCCESS,
} from "constants/ActionTypes";

const INIT_STATE = {
	loader: false,
	alertMessage: "",
	showMessage: false,
	initURL: "",
	credit: localStorage.getItem("credit") === "true",
	agent: localStorage.getItem("agent") === "null" ? null : localStorage.getItem("agent"),
	agentType: localStorage.getItem("agentType") === "null" ? null : localStorage.getItem("agentType"),
	agentName: localStorage.getItem("agentName") === "null" ? null : localStorage.getItem("agentName"),
	type: localStorage.getItem("type"),
	authUser: localStorage.getItem("uid"),
	uid: localStorage.getItem("uid"),
	displayName: localStorage.getItem("displayName"),
	photoURL: localStorage.getItem("photoURL"),
	stripeCustomerId:localStorage.getItem("stripeCustomerId")
};

export default (state = INIT_STATE, action) => {
	switch (action.type) {
		case SIGNUP_USER_SUCCESS: {
			return {
				...state,
				loader: false,
				authUser: action.payload.uid,
				uid: action.payload.uid,
				displayName: action.payload.displayName,
				photoURL: action.payload.photoURL,
				stripeCustomerId:action.payload.stripeCustomerId
			};
		}
		case SIGNIN_USER_SUCCESS: {
			return {
				...state,
				loader: false,
				credit: action.payload.credit,
				agent: action.payload.agent,
				agentType: action.payload.agentType,
				authUser: action.payload.uid,
				uid: action.payload.uid,
				displayName: action.payload.displayName,
				photoURL: action.payload.photoURL,
				stripeCustomerId:action.payload.stripeCustomerId
			};
		}
		case SET_USER_TYPE: {
			return {
				...state,
				type: action.payload,
			};
		}
		case INIT_URL: {
			return {
				...state,
				initURL: action.payload,
			};
		}
		case SIGNOUT_USER_SUCCESS: {
			return {
				...state,
				credit: false,
				agent: null,
				agentType: null,
				authUser: null,
				uid: null,
				displayName: null,
				photoURL: null,
				type: null,
				initURL: "/",
				loader: false,
				stripeCustomerId:null
			};
		}

		case SHOW_MESSAGE: {
			return {
				...state,
				alertMessage: action.payload,
				showMessage: true,
				loader: false,
			};
		}
		case HIDE_MESSAGE: {
			return {
				...state,
				alertMessage: "",
				showMessage: false,
				loader: false,
			};
		}

		case SIGNIN_GOOGLE_USER_SUCCESS: {
			return {
				...state,
				loader: false,
				authUser: action.payload,
			};
		}
		case SIGNIN_FACEBOOK_USER_SUCCESS: {
			return {
				...state,
				loader: false,
				authUser: action.payload,
			};
		}
		case SIGNIN_TWITTER_USER_SUCCESS: {
			return {
				...state,
				loader: false,
				authUser: action.payload,
			};
		}
		case SIGNIN_GITHUB_USER_SUCCESS: {
			return {
				...state,
				loader: false,
				authUser: action.payload,
			};
		}
		case ON_SHOW_LOADER: {
			return {
				...state,
				loader: true,
			};
		}
		case ON_HIDE_LOADER: {
			return {
				...state,
				loader: false,
			};
		}
		default:
			return state;
	}
};
