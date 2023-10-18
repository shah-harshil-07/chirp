export default {
    setDocumentEventListeners(state, { payload }) {
        state.callbackMap = payload.callbackMap;
    },
};