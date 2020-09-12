const promiseInOrder = async (tasks, promiseFunction) => tasks.reduce(async (previous, next) => {
    await previous;

    return promiseFunction(previous, next);
}, Promise.resolve());

module.exports = promiseInOrder;
