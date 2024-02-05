export default {
    openConfirmation(state, { payload }) {
        state.open = true;
        state.message = payload?.message ?? '';
        state.headingText = payload?.headingText ?? '';
        state.handleConfirmAction = payload?.handleConfirmAction ?? function () { };
    },
    closeConfirmation(state) {
        state.open = false;
        state.message = '';
        state.headingText = '';
        state.handleConfirmAction = null;
    },
};
