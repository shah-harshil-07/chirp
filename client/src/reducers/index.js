import { combineReducers } from "redux";

import posts from "./posts";
import modal from "./modal";
import toaster from "./toaster";

export const reducers = combineReducers({ posts, modal, toaster });
