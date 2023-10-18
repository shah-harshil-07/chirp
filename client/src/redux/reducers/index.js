import { combineReducers } from "redux";

import modal from "./modal";
import toaster from "./toaster";
import documents from "./documents";

export const reducer = combineReducers({ modal, toaster, documents });
