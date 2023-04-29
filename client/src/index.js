import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { reducers } from "./redux/reducers";
import App from "./App";

const store = createStore(reducers, compose(applyMiddleware(thunk)));
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

ReactDOM.render(
	<GoogleOAuthProvider clientId={googleClientId}>
		<Provider store={store}>
			<App />
		</Provider>
	</GoogleOAuthProvider>,
	document.getElementById("root"),
);
