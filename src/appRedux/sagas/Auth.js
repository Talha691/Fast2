import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import { auth, firestore, facebookAuthProvider, githubAuthProvider, googleAuthProvider, twitterAuthProvider } from "../../firebase/firebase";
import {
	SIGNIN_FACEBOOK_USER,
	SIGNIN_GITHUB_USER,
	SIGNIN_GOOGLE_USER,
	SIGNIN_TWITTER_USER,
	SIGNIN_USER,
	SIGNOUT_USER,
	SIGNUP_USER,
} from "constants/ActionTypes";
import { setUserType, showAuthMessage, userSignInSuccess, userSignOutSuccess } from "../../appRedux/actions/Auth";
import { userFacebookSignInSuccess, userGithubSignInSuccess, userGoogleSignInSuccess, userTwitterSignInSuccess } from "../actions/Auth";
import { stopCarInsurances } from "../actions/CarInsurance";
import { stopCoverages } from "../actions/Coverages";
import { stopTruckInsurances } from "../actions/TruckInsurance";
import { stopClients } from "../actions/Clients";
import { stopEmployees } from "../actions/Employees";
import { stopUsers } from "../actions/Users";

const userDoc = async uid =>
	await firestore
		.doc("users/" + uid)
		.get()
		.then(user => user)
		.catch(error => error);

const agentDoc = async uid =>
	await firestore
		.doc("agents/" + uid)
		.get()
		.then(agent => agent)
		.catch(error => error);

const capturistDoc = async uid =>
	await firestore
		.doc("capturists/" + uid)
		.get()
		.then(capturist => capturist)
		.catch(error => error);
const employeeDoc = async uid =>
	await firestore
		.doc("employees/" + uid)
		.get()
		.then(employee => employee)
		.catch(error => error);

const createUserWithEmailPasswordRequest = async (email, password) =>
	await auth
		.createUserWithEmailAndPassword(email, password)
		.then(authUser => authUser)
		.catch(error => error);

const signInUserWithEmailPasswordRequest = async (email, password) =>
	await auth
		.signInWithEmailAndPassword(email, password)
		.then(authUser => authUser)
		.catch(error => error);

const signOutRequest = async () =>
	await auth
		.signOut()
		.then(authUser => authUser)
		.catch(error => error);

const signInUserWithGoogleRequest = async () =>
	await auth
		.signInWithPopup(googleAuthProvider)
		.then(authUser => authUser)
		.catch(error => error);

const signInUserWithFacebookRequest = async () =>
	await auth
		.signInWithPopup(facebookAuthProvider)
		.then(authUser => authUser)
		.catch(error => error);

const signInUserWithGithubRequest = async () =>
	await auth
		.signInWithPopup(githubAuthProvider)
		.then(authUser => authUser)
		.catch(error => error);

const signInUserWithTwitterRequest = async () =>
	await auth
		.signInWithPopup(twitterAuthProvider)
		.then(authUser => authUser)
		.catch(error => error);

function* createUserWithEmailPassword({ payload }) {
	const { email, password } = payload;
	try {
		const signUpUser = yield call(createUserWithEmailPasswordRequest, email, password);
		if (signUpUser.message) {
			yield put(showAuthMessage(signUpUser.message));
		} else {
			localStorage.setItem("uid", signUpUser.user.uid);
			localStorage.setItem("displayName", signUpUser.user.displayName);
			localStorage.setItem("photoURL", signUpUser.user.photoURL);
			yield put(
				userSignInSuccess({
					uid: signUpUser.user.uid,
					displayName: signUpUser.user.displayName,
					photoURL: signUpUser.user.photoURL,
				
				})
			);
		}
	} catch (error) {
		yield put(showAuthMessage(error));
	}
}

function* signInUserWithGoogle() {
	try {
		const signUpUser = yield call(signInUserWithGoogleRequest);
		if (signUpUser.message) {
			yield put(showAuthMessage(signUpUser.message));
		} else {
			localStorage.setItem("user_id", signUpUser.user.uid);
			yield put(userGoogleSignInSuccess(signUpUser.user.uid));
		}
	} catch (error) {
		yield put(showAuthMessage(error));
	}
}

function* signInUserWithFacebook() {
	try {
		const signUpUser = yield call(signInUserWithFacebookRequest);
		if (signUpUser.message) {
			yield put(showAuthMessage(signUpUser.message));
		} else {
			localStorage.setItem("user_id", signUpUser.user.uid);
			yield put(userFacebookSignInSuccess(signUpUser.user.uid));
		}
	} catch (error) {
		yield put(showAuthMessage(error));
	}
}

function* signInUserWithGithub() {
	try {
		const signUpUser = yield call(signInUserWithGithubRequest);
		if (signUpUser.message) {
			yield put(showAuthMessage(signUpUser.message));
		} else {
			localStorage.setItem("user_id", signUpUser.user.uid);
			yield put(userGithubSignInSuccess(signUpUser.user.uid));
		}
	} catch (error) {
		yield put(showAuthMessage(error));
	}
}

function* signInUserWithTwitter() {
	try {
		const signUpUser = yield call(signInUserWithTwitterRequest);
		if (signUpUser.message) {
			if (signUpUser.message.length > 100) {
				yield put(showAuthMessage("Your request has been canceled."));
			} else {
				yield put(showAuthMessage(signUpUser.message));
			}
		} else {
			localStorage.setItem("user_id", signUpUser.user.uid);
			yield put(userTwitterSignInSuccess(signUpUser.user.uid));
		}
	} catch (error) {
		yield put(showAuthMessage(error));
	}
}

function* signInUserWithEmailPassword({ payload }) {
	const { email, password } = payload;
	try {
		const signInUser = yield call(signInUserWithEmailPasswordRequest, email, password);
		if (signInUser.message) {
			yield put(showAuthMessage(signInUser.message));
		} else {
			// Get Docs
			const user = yield call(userDoc, signInUser.user.uid);
			const agent = yield call(agentDoc, signInUser.user.uid);
			const employee = yield call(employeeDoc, signInUser.user.uid);
			const capturist = yield call(capturistDoc, signInUser.user.uid);
			
			// Can the user use credit? 
			let credit = false;

			// Check if it's an admin, agent or employee
			const userType = user.exists ? user.data().type : null;
			const capturistType = capturist.exists ? capturist.data().type : null;
			let agentType = agent.exists ? (agent.data().special ? "Group" : "Agent") : null;
			let agentName = agent.exists ? agent.data().company : null;
			const employeeType = employee.exists ? employee.data().agent.id : null;

			// Check types
			const type = userType ? userType : agentType ? agentType : capturistType ? capturistType : "Employee";
			const agentID = agentType ? signInUser.user.uid : employeeType;

			// If Employee, Check Agent Type
			if (employeeType) {
				const agentData = yield call(agentDoc, employee.data().agentID);
				agentType = agentData.data().special ? "Group" : "Agent";
				agentName = agentData.data().company;
				credit = agentData.data().credit ? agentData.data().credit : false;
			} else if (agentType) {
				credit = agent.data().credit ? agent.data().credit : false;
			}
			// Set Local Storage
			localStorage.setItem("type", type);
			localStorage.setItem("credit", credit.toString());
			localStorage.setItem("agent", agentID);
			localStorage.setItem("agentType", agentType);
			localStorage.setItem("agentName", agentName);
			localStorage.setItem("uid", signInUser.user.uid);
			localStorage.setItem("displayName", signInUser.user.displayName);
			localStorage.setItem("photoURL", signInUser.user.photoURL);
			localStorage.setItem("stripeCustomerId", agent.data()?.stripe);
			yield put(setUserType(type));
			yield put(
				userSignInSuccess({
					uid: signInUser.user.uid,
					credit: credit,
					agent: agentID,
					agentType: agentType,
					agentName: agentName,
					displayName: signInUser.user.displayName,
					photoURL: signInUser.user.photoURL,
					stripeCustomerId:signInUser.user.stripeCustomerId
				})
			);
		}
	} catch (error) {
		yield put(showAuthMessage(error));
	}
}

function* signOut() {
	try {
		stopCarInsurances();
		stopTruckInsurances();
		stopCoverages();
		stopEmployees();
		stopClients();
		stopUsers();
		const signOutUser = yield call(signOutRequest);
		if (signOutUser === undefined) {
			localStorage.removeItem("uid");
			localStorage.removeItem("displayName");
			localStorage.removeItem("photoURL");
			yield put(userSignOutSuccess(signOutUser));
		} else {
			yield put(showAuthMessage(signOutUser.message));
		}
	} catch (error) {
		yield put(showAuthMessage(error));
	}
}

export function* createUserAccount() {
	yield takeEvery(SIGNUP_USER, createUserWithEmailPassword);
}

export function* signInWithGoogle() {
	yield takeEvery(SIGNIN_GOOGLE_USER, signInUserWithGoogle);
}

export function* signInWithFacebook() {
	yield takeEvery(SIGNIN_FACEBOOK_USER, signInUserWithFacebook);
}

export function* signInWithTwitter() {
	yield takeEvery(SIGNIN_TWITTER_USER, signInUserWithTwitter);
}

export function* signInWithGithub() {
	yield takeEvery(SIGNIN_GITHUB_USER, signInUserWithGithub);
}

export function* signInUser() {
	yield takeEvery(SIGNIN_USER, signInUserWithEmailPassword);
}

export function* signOutUser() {
	yield takeEvery(SIGNOUT_USER, signOut);
}

export default function* rootSaga() {
	yield all([
		fork(signInUser),
		fork(createUserAccount),
		fork(signInWithGoogle),
		fork(signInWithFacebook),
		fork(signInWithTwitter),
		fork(signInWithGithub),
		fork(signOutUser),
	]);
}

auth.onAuthStateChanged(user => {
	if (user) {
		localStorage.setItem("uid", user.uid);
		localStorage.setItem("displayName", user.displayName);
		localStorage.setItem("photoURL", user.photoURL);
		put(
			userSignInSuccess({
				uid: user.uid,
				displayName: user.displayName,
				photoURL: user.photoURL,
			})
		);
	} else {
		localStorage.removeItem("credit");
		localStorage.removeItem("agent");
		localStorage.removeItem("agentType");
		localStorage.removeItem("agentName");
		localStorage.removeItem("uid");
		localStorage.removeItem("displayName");
		localStorage.removeItem("photoURL");
		localStorage.removeItem("stripeCustomerId")
		put(userSignOutSuccess());
	}
});
