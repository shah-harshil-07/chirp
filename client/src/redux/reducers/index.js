import { combineReducers } from "redux";

import modal from "./modal";
import toaster from "./toaster";
import documents from "./documents";
import userDetails from "./user-details";

export const reducer = combineReducers({ modal, toaster, documents, userDetails });
