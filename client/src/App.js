import React, { useState, useEffect } from "react";
import { Container } from "@material-ui/core";
import { useDispatch } from "react-redux";

import Posts from "./components/Posts/";
import Form from "./components/Form";
import { getPosts } from "./actions/posts";
import AuthBar from "./components/AuthBar";
import Register from "./components/Register";

const App = () => {
	const [currentId, setCurrentId] = useState(0);
	const dispatch = useDispatch();
	const [showDialog, setShowDialog] = useState(false);

	useEffect(() => {
		dispatch(getPosts());
	}, [currentId, dispatch]);

	return (
		<>
			{showDialog && (<Register />)}

			<Container maxWidth="sm">
				<p onClick={() => { setShowDialog(true); }}><b>Home</b></p>
				<Form currentId={currentId} setCurrentId={setCurrentId} />
				<Posts setCurrentId={setCurrentId} />
			</Container>

			<AuthBar />
		</>
	);
};

export default App;
