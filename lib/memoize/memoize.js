const memoize = (func) => {
    const memoized = () => {
        if (memoized.cache) {
            return memoized.cache;
        }

        memoized.cache = func();

        return memoized.cache;
    };

    return memoized;
};

module.exports = memoize;
