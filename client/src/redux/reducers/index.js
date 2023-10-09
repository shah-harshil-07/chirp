import { combineReducers } from "redux";

import posts from "./posts";
import modal from "./modal";
import toaster from "./toaster";
import documents from "./documents";

export const reducer = combineReducers({ posts, modal, toaster, documents });
