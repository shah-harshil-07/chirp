import React, { useState } from "react";
import { Container } from "@material-ui/core";
import { useSelector } from "react-redux";

import Posts from "./components/posts";
import Form from "./components/form";
import AuthBar from "./components/auth-bar";
import Register from "./components/register";
import Login from "./components/login";
import Toaster from "./components/toaster";

const App = () => {
	const dialogState = useSelector(state => state.modal);
	const toasterState = useSelector(state => state.toaster);

	const [currentId, setCurrentId] = useState(0);

	const getDialog = () => {
		if (dialogState.open) {
			switch (dialogState.type) {
				case "register":
					return (<Register />);
				case "login":
					return (<Login />);
				default:
					return <></>;
			}
		} else {
			return <></>;
		}
	}

	return (
		<>
			{ getDialog() }

			<Container maxWidth="sm">
				<p><b>Home</b></p>

				<Form currentId={currentId} setCurrentId={setCurrentId} />
				<Posts />
			</Container>

			<AuthBar />

			{
				toasterState.open && (
					<Toaster type={toasterState?.messageObj?.type} message={toasterState?.messageObj?.message} />
				)
			}
		</>
	);
};

export default App;
