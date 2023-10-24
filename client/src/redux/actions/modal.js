export default {
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
};