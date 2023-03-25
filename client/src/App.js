import React, { useState, useEffect } from "react";
import { Container } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";

import Posts from "./components/Posts/";
import Form from "./components/form";
import { getPosts } from "./actions/posts";
import AuthBar from "./components/auth-bar";
import Register from "./components/register";
import Login from "./components/Login";

const App = () => {
	const dialogState = useSelector(state => state.modal);

	const [currentId, setCurrentId] = useState(0);
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(getPosts());
	}, [currentId, dispatch]);

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
				<Posts setCurrentId={setCurrentId} />
			</Container>

			<AuthBar />
		</>
	);
};

export default App;
