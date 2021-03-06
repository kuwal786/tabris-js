import {expect, mockTabris, restore, spy, stub} from '../test';
import NativeObject from '../../src/tabris/NativeObject';
import ClientMock from './ClientMock';
import App, {create} from '../../src/tabris/App';

describe('App', function() {

  let app, client;

  beforeEach(function() {
    client = new ClientMock();
    mockTabris(client);
    app = create();
  });

  afterEach(restore);

  it('can not be created standalone', function() {
    expect(() => {
      new App({});
    }).to.throw(Error);
  });

  it('is instanceof NativeObject', function() {
    expect(app).to.be.an.instanceOf(NativeObject);
  });

  it('is instanceof App', function() {
    expect(app.constructor.name).to.equal('App');
    expect(app).to.be.an.instanceOf(App);
  });

  describe('create', function() {

    it('creates a native object', function() {
      expect(client.calls({op: 'create', type: 'tabris.App'})).to.not.be.empty;
    });

  });

  describe('properties', function() {

    describe('pinnedCertificates', function() {

      beforeEach(function() {
        tabris.device = {platform: 'Android'};
      });

      it('throws exception when set without "host" property', function() {
        expect(() => {
          app.pinnedCertificates = [{hash: 'sha256/abc'}];
        }).to.throw(Error, /Invalid host/);
      });

      it('throws exception when set without "hash" property', function() {
        expect(() => {
          app.pinnedCertificates = [{host: 'example.com'}];
        }).to.throw(Error, /Invalid hash/);
      });

      it('throws exception when set with invalid "hash" property', function() {
        expect(() => {
          app.pinnedCertificates = [{host: 'example.com', hash: 'foo/bar'}];
        }).to.throw(Error, /Invalid hash/);
      });

      it('throws exception when set without "algorithm" property on iOS', function() {
        tabris.device.platform = 'iOS';
        expect(() => {
          app.pinnedCertificates = [{host: 'example.com', hash: 'sha256/abc'}];
        }).to.throw(Error, /Missing algorithm/);
      });

      it('throws exception when set with invalid "algorithm" property on iOS', function() {
        tabris.device.platform = 'iOS';
        expect(() => {
          app.pinnedCertificates = [{host: 'example.com', hash: 'sha256/abc', algorithm: 'Foo'}];
        }).to.throw(Error, /Invalid algorithm/);
      });

      it('sets pinned certificates on native side', function() {
        app.pinnedCertificates = [{host: 'example.com', hash: 'sha256/abc'}];

        const setCall = client.calls({op: 'set', id: app.cid})[0];
        expect(setCall.properties).to.deep.equal({
          pinnedCertificates: [{host: 'example.com', hash: 'sha256/abc'}]
        });
      });

      it('sets pinned certificates, containing "algorithm" property, on iOS', function() {
        tabris.device.platform = 'iOS';
        app.pinnedCertificates = [{host: 'example.com', hash: 'sha256/abc', algorithm: 'RSA4096'}];

        const setCall = client.calls({op: 'set', id: app.cid})[0];
        expect(setCall.properties).to.deep.equal({
          pinnedCertificates: [{host: 'example.com', hash: 'sha256/abc', algorithm: 'RSA4096'}]
        });
      });

      it('returns pinnedCertificates', function() {
        app.pinnedCertificates = [{host: 'example.com', hash: 'sha256/abc', algorithm: 'RSA4096'}];

        expect(app.pinnedCertificates).to.deep.equal([{host: 'example.com', hash: 'sha256/abc', algorithm: 'RSA4096'}]);
      });

      it('adds native listener on certificatesReceived', function() {
        app.pinnedCertificates = [{host: 'example.com', hash: 'sha256/abc', algorithm: 'RSA4096'}];

        const listenCall = client.calls({op: 'listen', id: app.cid})[0];
        expect(listenCall.event).to.equal('certificatesReceived');
        expect(listenCall.listen).to.be.true;
      });

      it('cancels certificateReceived event with invalid certificate', function() {
        app.pinnedCertificates = [{host: 'example.com', hash: 'sha256/abc', algorithm: 'RSA4096'}];

        const cancelled = app._trigger('certificatesReceived', {
          host: 'example.com',
          hashes: ['sha256/uvw', 'sha256/xyz']
        });

        expect(cancelled).to.be.true;
      });

      it('does not cancel certificateReceived event with valid certificate', function() {
        app.pinnedCertificates = [{host: 'example.com', hash: 'sha256/abc', algorithm: 'RSA4096'}];

        const cancelled = app._trigger('certificatesReceived', {
          host: 'example.com',
          hashes: ['sha256/xyz', 'sha256/abc']
        });

        expect(cancelled).to.be.false;
      });

      it('does not cancel certificateReceived event with unpinned host', function() {
        app.pinnedCertificates = [{host: 'example.com', hash: 'sha256/abc', algorithm: 'RSA4096'}];

        const cancelled = app._trigger('certificatesReceived', {host: 'somewhere-else.com', hashes: ['sha256/xyz']});

        expect(cancelled).to.be.false;
      });

    });

    describe('trustedCertificates', () => {

      beforeEach(() => {
        tabris.flush();
      });

      it('throws exception when argument array contains illegal elements', () => {
        expect(() => {
          app.trustedCertificates = ['string'];
        }).to.throw(Error, /ArrayBuffer/);
      });

      it('sets trusted certificates on native side', () => {
        const trustedCertificates = [new ArrayBuffer(8)];

        app.trustedCertificates = trustedCertificates;

        const setCall = client.calls({op: 'set', id: app.cid})[0];
        expect(setCall.properties).to.deep.equal({trustedCertificates});
      });
    });

  });

  it('listens for pause event', function() {
    const listener = spy();

    app.onPause(listener);

    const calls = client.calls({id: app.cid, op: 'listen', event: 'pause'});
    expect(calls[0].listen).to.equal(true);
  });

  it('triggers pause event', function() {
    const listener = spy();
    app.onPause(listener);

    tabris._notify(app.cid, 'pause');

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: app});
  });

  it('listens for resume event', function() {
    const listener = spy();

    app.onResume(listener);

    const calls = client.calls({id: app.cid, op: 'listen', event: 'resume'});
    expect(calls[0].listen).to.equal(true);
  });

  it('triggers resume event', function() {
    const listener = spy();
    app.onResume(listener);

    tabris._notify(app.cid, 'resume');

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: app});
  });

  it('listens for foreground event', function() {
    const listener = spy();

    app.onForeground(listener);

    const calls = client.calls({id: app.cid, op: 'listen', event: 'foreground'});
    expect(calls[0].listen).to.equal(true);
  });

  it('triggers foreground event', function() {
    const listener = spy();
    app.onForeground(listener);

    tabris._notify(app.cid, 'foreground');

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: app});
  });

  it('listens for background event', function() {
    const listener = spy();

    app.onBackground(listener);

    const calls = client.calls({id: app.cid, op: 'listen', event: 'background'});
    expect(calls[0].listen).to.equal(true);
  });

  it('triggers background event', function() {
    const listener = spy();
    app.onBackground(listener);

    tabris._notify(app.cid, 'background');

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: app});
  });

  it('can not be disposed', function() {
    expect(() => {
      app.dispose();
    }).to.throw();
  });

  it('listens for backNavigation event', function() {
    app.onBackNavigation(spy());

    const calls = client.calls({id: app.cid, op: 'listen', event: 'backNavigation'});
    expect(calls[0].listen).to.equal(true);
  });

  it('triggers backNavigation event', function() {
    const listener = spy();
    app.onBackNavigation(listener);

    tabris._notify(app.cid, 'backNavigation');

    expect(listener).to.have.been.calledOnce;
    expect(listener).to.have.been.calledWithMatch({target: app});
  });

  it('backNavigation event returns false by default', function() {
    app.onBackNavigation(spy());

    const returnValue = tabris._notify(app.cid, 'backNavigation');

    expect(returnValue).to.equal(false);
  });

  it('backNavigation event returns true if preventDefault is called', function() {
    app.onBackNavigation(function(event) {
      event.preventDefault();
    });

    const returnValue = tabris._notify(app.cid, 'backNavigation');

    expect(returnValue).to.equal(true);
  });

  describe('launch', function() {

    it('rejects if parameter missing', function() {
      return app.launch().then(expectFail, error => {
        expect(error.message).to.equal('Not enough arguments to launch');
      });
    });

    it('rejects invalid url type`', function() {
      return app.launch(23).then(expectFail, error => {
        expect(error.message).to.equal('url is not a string');
      });
    });

    it('calls native `launch`', function() {
      spy(client, 'call');

      app.launch('tel:123-45-67');

      expect(client.call).to.have.been.calledWithMatch(app.cid, 'launch', {url: 'tel:123-45-67'});
    });

    it('resolves on success', function() {
      stub(client, 'call').callsFake((id, method, args) => args.onSuccess());
      return app.launch('tel:123-45-67').then(result => {
        expect(result).to.be.undefined;
      });
    });

    it('rejects in case of error', function() {
      stub(client, 'call').callsFake((id, method, args) => args.onError('Bang'));
      return app.launch('tel:123-45-67').then(expectFail, err => {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal('Bang');
      });
    });

  });

  describe('registerFont', () => {

    it('rejects if parameter missing', () => {
      expect(() => app.registerFont('Arial')).to.throw(Error, 'Not enough arguments to register a font');
    });

    it('rejects invalid alias type', () => {
      expect(() => app.registerFont(23, 'arial.ttf')).to.throw(Error, 'alias is not a string');
    });

    it('rejects invalid font type', () => {
      expect(() => app.registerFont('Arial', 23)).to.throw(Error, 'file is not a string');
    });

    it('calls native `registerFont`', () => {
      spy(client, 'call');

      app.registerFont('Arial', 'arial.ttf');

      expect(client.call).to.have.been.calledWithMatch(app.cid, 'registerFont', {alias: 'Arial', file: 'arial.ttf'});
    });

  });

  describe('reload', function() {

    it('CALLs `reload`', function() {
      spy(client, 'call');

      app.reload();

      expect(client.call).to.have.been.calledWith(app.cid, 'reload', {url: undefined});
    });

    it('CALLs `reload` with url', function() {
      spy(client, 'call');

      app.reload('http://url.com');

      expect(client.call).to.have.been.calledWith(app.cid, 'reload', {url: 'http://url.com'});
    });

  });

  describe('close', function() {

    it('calls `close`', function() {
      spy(client, 'call');

      app.close();

      expect(client.call).to.have.been.calledWith(app.cid, 'close');
    });

  });

  describe('getResourceLocation', function() {

    beforeEach(function() {
      const origGet = client.get;
      stub(client, 'get').callsFake(() => {
        origGet.apply(client, arguments);
        return '/root';
      });
    });

    it('GETs \'resourceBaseUrl\'', function() {
      app.getResourceLocation();

      expect(client.get).to.have.been.calledWith(app.cid, 'resourceBaseUrl');
    });

    it('GETs \'resourceBaseUrl\' only once', function() {
      app.getResourceLocation();
      app.getResourceLocation();

      expect(client.get).to.have.been.calledOnce;
    });

    it('appends normalized parameter', function() {
      const result = app.getResourceLocation('foo//bar');

      expect(result).to.equal('/root/foo/bar');
    });

    it('strips leading and trailing slash', function() {
      const result = app.getResourceLocation('/foo/bar/');

      expect(result).to.equal('/root/foo/bar');
    });

    it('ignores \'.\' segments', function() {
      const result = app.getResourceLocation('./foo/bar');

      expect(result).to.equal('/root/foo/bar');
    });

    it('throws on \'..\'', function() {
      expect(() => {
        app.getResourceLocation('../foo');
      }).to.throw('Path must not contain \'..\'');
    });

  });

  describe('properties', function() {

    describe('id', function() {

      it('should return `appId` from native', function() {
        stub(client, 'get').returns('foo');

        const result = app.id;

        expect(result).to.equal('foo');
        expect(client.get).to.have.been.calledWith(app.cid, 'appId');
      });

      it('should not SET native property', function() {
        app.id = 'newId';

        expect(client.calls({op: 'set', id: app.cid}).length).to.equal(0);
      });

    });

    describe('debugBuild', function() {

      it('should return `debugBuild` true from native', function() {
        stub(client, 'get').returns(true);

        const result = app.debugBuild;

        expect(result).to.be.true;
        expect(client.get).to.have.been.calledWith(app.cid, 'debugBuild');
      });

      it('should return `debugBuild` false from native', function() {
        stub(client, 'get').returns(false);

        const result = app.debugBuild;

        expect(result).to.be.false;
        expect(client.get).to.have.been.calledWith(app.cid, 'debugBuild');
      });

      it('should not SET native property', function() {
        app.debugBuild = true;

        expect(client.calls({op: 'set', id: app.cid}).length).to.equal(0);
      });

    });

    describe('version', function() {

      it('should return `version` from native', function() {
        stub(client, 'get').returns('foo');

        const result = app.version;

        expect(result).to.equal('foo');
        expect(client.get).to.have.been.calledWith(app.cid, 'version');
      });

      it('should not SET native property', function() {
        app.version = '1.2.3';

        expect(client.calls({op: 'set', id: app.cid}).length).to.equal(0);
      });

    });

    describe('versionCode', function() {

      it('should return `versionId` from native', function() {
        stub(client, 'get').returns('foo');

        const result = app.versionCode;

        expect(result).to.equal('foo');
        expect(client.get).to.have.been.calledWith(app.cid, 'versionId');
      });

      it('should not SET native property', function() {
        app.versionCode = 123;

        expect(client.calls({op: 'set', id: app.cid}).length).to.equal(0);
      });
    });

  });

});

function expectFail() {
  throw new Error('Expected to fail');
}
