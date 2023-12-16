import { initialState } from "src/redux/reducers/user-details";

export default {
    openDetailsCard(state, { payload }) {
        state.open = true;
        state.data = { ...payload };
    },
    closeDetailsCard(state) {
        state.open = false;
        state.data = { ...initialState };
    },
};