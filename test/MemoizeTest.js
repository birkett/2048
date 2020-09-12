const {
    suite,
    describe,
    it,
    expect,
} = require('../lib/test/testSystem');
const memoize = require('../lib/memoize/memoize');

suite('Memoize', () => {
    describe('Basic functionality', () => {
        it('Should cache the result of a function across multiple calls', () => {
            let numberOfRawFuncCalls = 0;

            const rawFunc = () => {
                numberOfRawFuncCalls += 1;

                return 1337;
            };

            const cachedCall = memoize(() => rawFunc());

            const result1 = cachedCall();
            const result2 = cachedCall();
            const result3 = cachedCall();

            expect(result1).equal(result2);
            expect(result1).equal(result3);
            expect(numberOfRawFuncCalls).equal(1);
        });
    });
});
