import { createSlice } from "@reduxjs/toolkit";

const modalSlice = createSlice({
    name: "modals",
    initialState: {
        modal: false,
        open: false,
        type: '',
        props: {},
    },
    reducers: {
        openModal(state, { payload }) {
            state.open = true;
            state.type = payload.type;
        },
        closeModal(state) {
            state.open = false;
            state.type = '';
        },
        openModalWithProps(state, { payload }) {
            state.open = true;
            const { props, type } = payload;
            state.type = type;
            state.props = props;
        },
    },
});

const { actions, reducer } = modalSlice;
export const { openModal, closeModal, openModalWithProps } = actions;
export default reducer;