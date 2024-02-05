import { combineReducers } from "redux";

import modal from "./modal";
import toaster from "./toaster";
import documents from "./documents";
import lighthouse from "./lighthouse";
import userDetails from "./user-details";
import confirmation from "./confirmation";

export const reducer = combineReducers({ modal, toaster, documents, userDetails, lighthouse, confirmation });
