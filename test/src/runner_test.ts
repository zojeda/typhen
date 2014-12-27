import helper = require('../test_helper');

import Runner = require('../../src/runner');

describe('Runner', () => {
  var sandbox = sinon.sandbox.create();
  var instance: Runner.Runner;

  beforeEach(() => {
    instance = helper.createRunner();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#run', () => {
    beforeEach(() => {
      sandbox.stub(instance.plugin, 'generate');
    });

    it('should call Plugin#generate', () => {
      instance.run();
      assert.strictEqual((<SinonStub>instance.plugin.generate).calledOnce, true);
    });
  });
});
