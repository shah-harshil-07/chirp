import { createSlice } from "@reduxjs/toolkit";

import modelActions from "src/redux/actions/modal";

const name = "modals";
const reducers = { ...modelActions };
const initialState = { modal: false, open: false, type: '', props: {} };

const modalSlice = createSlice({ name, initialState, reducers });

const { actions, reducer } = modalSlice;
export const { openModal, closeModal, openModalWithProps } = actions;
export default reducer;
