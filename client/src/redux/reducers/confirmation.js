import { createSlice } from "@reduxjs/toolkit";

import confirmationActions from "src/redux/actions/confirmation";

const name = "confirmation";
const reducers = { ...confirmationActions };
const initialState = { message: '', headingText: '', handleConfirmAction: null, open: false };

const confirmationSlice = createSlice({ name, reducers, initialState });

const { actions, reducer } = confirmationSlice;
export const { openConfirmation, closeConfirmation } = actions;
export default reducer;
