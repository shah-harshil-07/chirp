function openModal(state, { payload }) {
    state.open = true;
    state.type = payload.type;
};

function closeModal(state) {
    state.open = false;
    state.type = '';
};

function openModalWithProps(state, { payload }) {
    state.open = true;
    const { props, type } = payload;
    state.type = type;
    state.props = props;
};

const actions = { openModal, closeModal, openModalWithProps };
export default actions;