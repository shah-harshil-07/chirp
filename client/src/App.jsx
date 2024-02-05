import "src/styles/app.css";

import React from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";

import AuthBar from "./components/auth-bar";
import Toaster from "./components/utilities/toaster";
import LightHouse from "./components/utilities/lighthouse";
import LeftSidebar from "./components/sidebar/left-sidebar";
import RightSidebar from "./components/sidebar/right-sidebar";
import Confirmation from "./components/utilities/confirmation";
import { isUserLoggedIn, modalConfig } from "./utilities/helpers";

const App = () => {
	const dialogState = useSelector(state => state.modal);
	const toasterState = useSelector(state => state.toaster);
	const lighthouseState = useSelector(state => state.lighthouse);
	const confirmationState = useSelector(state => state.confirmation);

	const { open: isLighthouseOpen, ...lighthouseProps } = lighthouseState;
	const { open: isConfirmationOpen, ...confirmationProps } = confirmationState;
	const { open: isToasterOpen, messageObj: toasterProps } = toasterState ?? {};

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

			{isLighthouseOpen && <LightHouse {...lighthouseProps} />}

			{isConfirmationOpen && <Confirmation {...confirmationProps} />}
		</>
	);
};

export default App;
