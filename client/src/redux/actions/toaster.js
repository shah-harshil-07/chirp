export default {
    openToaster(state, { payload }) {
        state.open = true;
        state.messageObj = { ...payload.messageObj };
    },
    closeToaster(state) {
        state.open = false;
        state.messageObj = {};
    },
};