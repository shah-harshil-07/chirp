import { combineReducers } from "redux";

import posts from "./posts";
import modal from "./modal";

export const reducers = combineReducers({ posts, modal });
