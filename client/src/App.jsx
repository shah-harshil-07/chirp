import "src/styles/app.css";

import React from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";

import AuthBar from "./components/auth-bar";
import Toaster from "./components/utilities/toaster";
import UserCard from "./components/utilities/user-card";
import LightHouse from "./components/utilities/lighthouse";
import LeftSidebar from "./components/sidebar/left-sidebar";
import RightSidebar from "./components/sidebar/right-sidebar";
import Confirmation from "./components/utilities/confirmation";
import { isUserLoggedIn, modalConfig } from "./utilities/helpers";

const App = () => {
	const dialogState = useSelector(state => state.modal);
	const toasterState = useSelector(state => state.toaster);
	const lighthouseState = useSelector(state => state.lighthouse);
	const userDetailState = useSelector(state => state.userDetails);
	const confirmationState = useSelector(state => state.confirmation);

	const { open: isLighthouseOpen, ...lighthouseProps } = lighthouseState ?? {};
	const { open: isToasterOpen, messageObj: toasterProps } = toasterState ?? {};
	const { open: isUserCardOpen, data: userDetailProps } = userDetailState ?? {};
	const { open: isConfirmationOpen, ...confirmationProps } = confirmationState ?? {};

	const getDialog = () => {
		const Dialog = modalConfig?.[dialogState.type] ?? <></>, props = dialogState.props ?? {};
		return dialogState.open ? <Dialog {...props} /> : <></>;
	}

	return (
		<>
			{getDialog()}

			<div id="app-container"><LeftSidebar /><Outlet /><RightSidebar /></div>

			{!isUserLoggedIn() && <AuthBar />}

			{isToasterOpen && <Toaster {...toasterProps} />}

			{isUserCardOpen && <UserCard {...userDetailProps} />}

			{isLighthouseOpen && <LightHouse {...lighthouseProps} />}

			{isConfirmationOpen && <Confirmation {...confirmationProps} />}
		</>
	);
};

export default App;
