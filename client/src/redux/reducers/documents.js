export default (callbacks = (new Map()), action) => {
    switch (action.type) {
        case "DOCUMENT":
            return action.payload;
        default:
            return callbacks;
    }
}