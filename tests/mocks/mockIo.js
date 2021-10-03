export default {
    emit: () => {},
    on: () => {},
    to: () => {
        return {
            emit: () => {},
            on: () => {},
        };
    },
    join: () => {},
}