import helper = require('../test_helper');

import Runner from '../../src/runner';

describe('Runner', () => {
  var sandbox = sinon.sandbox.create();
  var instance: Runner;

  beforeEach(() => {
    instance = helper.createRunner();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#run', () => {
    beforeEach(() => {
      sandbox.stub(instance.config.plugin, 'generate');
    });

    it('should call Plugin#generate', (done) => {
      instance.run().then(() => {
        assert((<Sinon.SinonStub>instance.config.plugin.generate).calledOnce);
        done();
      });
    });
  });
});
