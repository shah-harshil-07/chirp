import { createSlice } from "@reduxjs/toolkit";

import lighthouseActions from "src/redux/actions/lighthouse";

const name = "lighthouse";
const reducers = { ...lighthouseActions };
const initialState = { open: false, images: [], initialIndex: 0 };

const lighthouseSlice = createSlice({ name, initialState, reducers });

const { actions, reducer } = lighthouseSlice;
export const { openLighthouse, closeLighthouse } = actions;
export default reducer;