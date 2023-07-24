import "src/styles/app.css";

import React, { useState } from "react";
import { useSelector } from "react-redux";

import Posts from "./components/posts";
import Form from "./components/form";
import AuthBar from "./components/auth-bar";
import Toaster from "./components/utilities/toaster";
import { isUserLoggedIn, modalConfig } from "./utilities/helpers";
import LeftSidebar from "./components/sidebar/left-sidebar";
import RightSidebar from "./components/sidebar/right-sidebar";

const App = () => {
	const dialogState = useSelector(state => state.modal);
	const toasterState = useSelector(state => state.toaster);

	const [currentId, setCurrentId] = useState(0);

	const getDialog = () => {
		const Dialog = modalConfig?.[dialogState.type] ?? <></>, props = dialogState.props ?? {};
		return dialogState.open ? <Dialog {...props} /> : <></>;
	}

	return (
		<>
			{getDialog()}

			<div>
				<p id="app-header">Home</p>

				<div id="app-container">
					<LeftSidebar />

					<div>
						{ isUserLoggedIn() && <Form currentId={currentId} setCurrentId={setCurrentId} /> }
						<Posts />
					</div>

					<RightSidebar />
				</div>
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
