import { createSlice } from "@reduxjs/toolkit";

import documentActions from "src/redux/actions/documents";

const name = "documents";
const initialState = { callbackMap: new Map() };
const reducers = { ...documentActions };

const documentSlice = createSlice({ name, initialState, reducers });

const { actions, reducer } = documentSlice;
export const { setDocumentEventListeners } = actions;
export default reducer;
