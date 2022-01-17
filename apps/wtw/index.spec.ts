import { expect } from 'chai';
import { describe } from 'mocha';
import { of } from 'rxjs';
import Sinon from 'sinon';
import WTW, { ServiceProvider } from './index';

describe('WTW::', () => {
  describe('getProviders::', () => {
    const stubs: any = {};
    let sandbox: Sinon.SinonSandbox;
    const responseMock = [] as ServiceProvider[];
    describe('Get::', () => {
      beforeEach(() => {
        sandbox = Sinon.createSandbox();
        stubs.requestStub = sandbox.stub(WTW.prototype, <any>'request').returns(of(responseMock));
      });
      afterEach(() => {
        sandbox.reset();
        sandbox.restore();
      });
      it('should return empty array if no providers are found', async () => {
        const api = new WTW();
        const results = await api.getProviders();
        expect(results).to.be.an('array').and.length(0);
        expect(stubs.requestStub.callCount).to.equal(1);
      });

      it('should return service provider if found', async () => {
        const api = new WTW();
        stubs.requestStub.returns(
          of([
            {
              id: 1
            } as ServiceProvider
          ])
        );
        const results = await api.getProviders();
        console.log(results);
        const [first] = results;
        expect(results).to.be.an('array').and.length(1);
        expect(first.id).to.be.an('number').and.equal(1);
        expect(stubs.requestStub.callCount).to.equal(1);
      });
    });
  });
});
