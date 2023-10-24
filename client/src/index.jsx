import React from "react";
import thunk from "redux-thunk";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";
import { reducer } from "./redux/reducers";

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const store = configureStore({ reducer, middleware: [thunk] });

const configuredAppJSX = (
	<GoogleOAuthProvider clientId={googleClientId}>
		<Provider store={store}>
			<App />
		</Provider>
	</GoogleOAuthProvider>
);

ReactDOM.render(configuredAppJSX, document.getElementById("root"));
