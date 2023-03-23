import React, { useState, useEffect } from "react";
import { Container } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";

import Posts from "./components/Posts/";
import Form from "./components/Form";
import { getPosts } from "./actions/posts";
import AuthBar from "./components/AuthBar";
import Register from "./components/Register";
import Login from "./components/Login";

const App = () => {
	const showDialog = useSelector(state => state.modal);

	const [currentId, setCurrentId] = useState(0);
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(getPosts());
	}, [currentId, dispatch]);

	return (
		<>
			{showDialog && (<Register />)}
			{/* {showDialog && (<Login />)} */}

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
