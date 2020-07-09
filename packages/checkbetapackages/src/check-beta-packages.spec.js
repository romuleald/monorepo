describe('check beta packages', () => {
    const realProcess = process;
    const exitMock = jest.fn();
    let checkBeta;
    beforeEach(() => {
        exitMock.mockReset();
        global.process = {...realProcess, exit: exitMock};
    });
    afterEach(() => {
        jest.restoreAllMocks();
        global.process = realProcess;
    });
    it('Instanciate module (do nothing)', () => {
        checkBeta = require('./check-beta-packages');
    });
    it('No beta package', () => {
        checkBeta({});
        require('./check-beta-packages');
        expect(exitMock).toHaveBeenCalledWith(0);
    });
    it('Beta package is rejected', () => {
        checkBeta({
            dependencies: {
                testpackages: '^1.2.1-test'
            }
        });
        require('./check-beta-packages');
        expect(exitMock).toHaveBeenCalledWith(1);
    });
    it('Beta package but accepted', () => {
        checkBeta({
            dependencies: {
                testpackages: '^1.2.1-test'
            },
            checkbetapackages: ['testpackages']
        });
        require('./check-beta-packages');
        expect(exitMock).toHaveBeenCalledWith(0);
    });
});
