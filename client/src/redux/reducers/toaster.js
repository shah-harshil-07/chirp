import { createSlice } from "@reduxjs/toolkit";

import toasterActions from "src/redux/actions/toaster";

const name = "toaster";
const initialState = { open: false, messageObj: {} };
const reducers = { ...toasterActions };

const toasterSlice = createSlice({ name, initialState, reducers });

const { actions, reducer } = toasterSlice;
export const { openToaster, closeToaster } = actions;
export default reducer;
