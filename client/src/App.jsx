import "src/styles/app.css";

import React from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";

import AuthBar from "./components/auth-bar";
import Toaster from "./components/utilities/toaster";
import LeftSidebar from "./components/sidebar/left-sidebar";
import RightSidebar from "./components/sidebar/right-sidebar";
import { isUserLoggedIn, modalConfig } from "./utilities/helpers";

const App = () => {
	const dialogState = useSelector(state => state.modal);
	const toasterState = useSelector(state => state.toaster);

	const getDialog = () => {
		const Dialog = modalConfig?.[dialogState.type] ?? <></>, props = dialogState.props ?? {};
		return dialogState.open ? <Dialog {...props} /> : <></>;
	}

	return (
		<>
			{getDialog()}

			<div>
				<p id="app-header">Home</p>
				<div id="app-container"><LeftSidebar /><Outlet /><RightSidebar /></div>
			</div>

			{!isUserLoggedIn() && <AuthBar />}

			{
				toasterState.open && (
					<Toaster type={toasterState?.messageObj?.type} message={toasterState?.messageObj?.message} />
				)
			}
		</>
	);
};

export default App;
