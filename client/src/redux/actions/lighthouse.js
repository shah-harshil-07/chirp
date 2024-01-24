export default {
    openLighthouse(state, { payload }) {
        state.open = true;
        state.images = payload?.images ?? [];
        state.initialIndex = payload.initialIndex ?? 0;
    },
    closeLighthouse(state) {
        state.open = false;
        state.images = [];
        state.initialIndex = -1;
    },
};