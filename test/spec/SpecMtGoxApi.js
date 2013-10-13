describe("getMtGoxApi", function() {
    var embeddableTests = { v1: {}, v2: {}, generators: {}};
    var testTimeStamp = 946684800000;
    var FakeDateConstructor = (function FakeDateConstructor() {
        expect(arguments.length).toEqual(0);
        return {getTime: (function () { return testTimeStamp;}), getMicroTime: (function () { return testTimeStamp * 1000;}) };
    });
    var testHmacMessage = undefined;
    var testHmacSecret = undefined;
    var testHmacHash = undefined;
    var FakeJsSha = (function FakeJsSha(srcString, inputFormat, charSize) {
        expect(srcString).toEqual(testHmacMessage);
        expect(inputFormat).toEqual('TEXT');
        expect(charSize).toBeUndefined();
        return {getHMAC: (function getHMAC(secret, inputFormat, variant, outputFormat, outputFormatOpts) {
            expect(secret).toEqual(testHmacSecret);
            expect(inputFormat).toEqual('B64');
            expect(variant).toEqual('SHA-512');
            expect(outputFormat).toEqual('B64');
            expect(outputFormatOpts).toBeUndefined();
            return testHmacHash;
        })};
    });
    var testMtGoxPostFunc = {};
    testMtGoxPostFunc = (function testMtGoxPostFunc(a, b, c, d) {
        expect(arguments.length).toEqual(4);
        expect(testMtGoxPostFunc.expectedCallCount).toBeGreaterThan(0);
        testMtGoxPostFunc.expectedCallCount--;
        expect(a).toEqual(testMtGoxPostFunc.expectedPath);
        expect(b).toEqual(testMtGoxPostFunc.expectedData);
        expect(c).toEqual(testMtGoxPostFunc.testErrorCallback);
        expect(d).toEqual(testMtGoxPostFunc.testSuccessCallback);
        expect(testMtGoxPostFunc.testErrorCallback).not.toHaveBeenCalled();
        expect(testMtGoxPostFunc.testSuccessCallback).not.toHaveBeenCalled();
        c();
        expect(testMtGoxPostFunc.testErrorCallback).toHaveBeenCalled();
        expect(testMtGoxPostFunc.testSuccessCallback).not.toHaveBeenCalled();
        d();
        expect(testMtGoxPostFunc.testErrorCallback).toHaveBeenCalled();
        expect(testMtGoxPostFunc.testSuccessCallback).toHaveBeenCalled();
    });
    testMtGoxPostFunc.expectedCallCount = 0;
    var mgApiV1Container = new DependancyInjectionContainer({
        TobliDate: DependancyInjectionContainer.wrap(FakeDateConstructor),
        MtGoxApi: getMtGoxApi,
        MtGoxApiVersion: 1,
        MtGoxAPI2BaseURL: 'https://fake.mtgox.hostname/fake/api/path/',
        JsSha: DependancyInjectionContainer.wrap(FakeJsSha)
    });
    var mgApiV2Container = new DependancyInjectionContainer({
        TobliDate: DependancyInjectionContainer.wrap(FakeDateConstructor),
        MtGoxApi: getMtGoxApi,
        MtGoxApiVersion: 2,
        MtGoxAPI2BaseURL: 'https://fake.mtgox.hostname/fake/api/path/',
        JsSha: DependancyInjectionContainer.wrap(FakeJsSha)
    });

    it("should be a function", function() {
        expect(getMtGoxApi).isAFunction({withName:'getMtGoxApi'});
    });
    it("should return v1 API object", function() {
        expect(mgApiV1Container.get('MtGoxApi')).toBeDefined();
        expect(mgApiV1Container.get('MtGoxApi')).not.toBeNull();
        expect(mgApiV1Container.get('MtGoxApi').constructor).toBeAWellBehavedConstructor({withName:'MtGoxApiV1', returningObjectOfClass: mgApiV1Container.get('MtGoxApi').constructor, withArbitrary: 'parentClass'});
    });
    it("should return v2 API object", function() {
        expect(mgApiV2Container.get('MtGoxApi')).toBeDefined();
        expect(mgApiV2Container.get('MtGoxApi')).not.toBeNull();
        expect(mgApiV2Container.get('MtGoxApi').constructor).toBeAWellBehavedConstructor({withName:'MtGoxApiV2', returningObjectOfClass: mgApiV2Container.get('MtGoxApi').constructor, withArbitrary: 'parentClass'});
    });
    it("should require valid params", function() {
        expect(getMtGoxApi).toThrow("Unrecognized API version: [undefined]");
        expect((function () {getMtGoxApi(DependancyInjectionContainer.wrap(0.5));})).toThrow("Unrecognized API version: 0.5");
    });

    it("should return API object supporting getAccountBalancePath() method", function() {
        expect(mgApiV1Container.get('MtGoxApi').getAccountBalancePath).isAFunction({withName:'getAccountBalancePath'});
        expect(mgApiV1Container.get('MtGoxApi').getAccountBalancePath({currency:'USD'})).toEqual("info.php");
        expect(mgApiV1Container.get('MtGoxApi').getAccountBalancePath({currency:'Simolions'})).toEqual("info.php");
        expect(mgApiV2Container.get('MtGoxApi').getAccountBalancePath).isAFunction({withName:'getAccountBalancePath'});
        expect(mgApiV2Container.get('MtGoxApi').getAccountBalancePath({currency:'USD'})).toEqual("BTCUSD/money/info");
        expect(mgApiV2Container.get('MtGoxApi').getAccountBalancePath({currency:'Simolions'})).toEqual("BTCSimolions/money/info");
    });

    it("should return API object supporting getResponseData() method", function() {
        expect(mgApiV1Container.get('MtGoxApi').getResponseData).isAFunction({withName:'getResponseData'});
        expect(mgApiV1Container.get('MtGoxApi').getResponseData('"My Dog Has Fleas"')).toEqual("My Dog Has Fleas");
        expect(mgApiV2Container.get('MtGoxApi').getResponseData).isAFunction({withName:'getResponseData'});
        expect(mgApiV2Container.get('MtGoxApi').getResponseData('{"data":"My Dog Has Fleas"}')).toEqual("My Dog Has Fleas");
    });

    embeddableTests.generators.UncachablePostUrl = (function (container, getBasePath) {
        return (function testUncachablePostUrl(testCallback, testData) {
            testData = testData || {}
            var i,j,k;
            testData.paths = testData.paths || ['info.php', 'BTCSimolions/money/info'];
            testData.v2BaseUrls = testData.v2BaseUrls || ['https://data.mtgox.com/api/2/', 'https://fake.mtgox.hostname/fake/api/path/'];
            testData.dateStamps = testData.dateStamps || [946684800000, 946684800333];
            expect(testData.paths).toBeOfType('Array');
            expect(testData.paths.length).not.toBeLessThan(1);
            expect(testData.v2BaseUrls).toBeOfType('Array');
            expect(testData.v2BaseUrls.length).not.toBeLessThan(1);
            expect(testData.dateStamps).toBeOfType('Array');
            expect(testData.dateStamps.length).not.toBeLessThan(1);
            for (i = 0; i < testData.paths.length; i++ ) {
                for (j = 0; j < testData.v2BaseUrls.length; j++ ) {
                    for (k = 0; k < testData.dateStamps.length; k++ ) {
                        container.set('MtGoxAPI2BaseURL', testData.v2BaseUrls[j]);
                        testTimeStamp = testData.dateStamps[k];
                        testCallback(testData.paths[i], testData.v2BaseUrls[j], testData.dateStamps[k], (getBasePath(testData.v2BaseUrls[j])  + testData.paths[i] + '?t=' + testData.dateStamps[k].toString()));
                    }
                }
            }
        });
    });

    embeddableTests.v1.UncachablePostUrl = embeddableTests.generators.UncachablePostUrl(mgApiV1Container, function (v2BaseUrl) { return 'https://mtgox.com/api/0/'; });
    embeddableTests.v2.UncachablePostUrl = embeddableTests.generators.UncachablePostUrl(mgApiV2Container, function (v2BaseUrl) { return v2BaseUrl; });

    it("should return API object supporting getUncachablePostUrl() method", function() {
        var v1RunCount = 0;
        var v2RunCount = 0;
        embeddableTests.v1.UncachablePostUrl( function (path, baseUrl, dateStamp, expectedResult) {
            v1RunCount++;
            expect(mgApiV1Container.get('MtGoxApi').getUncachablePostUrl(path)).toEqual(expectedResult);
        });
        embeddableTests.v2.UncachablePostUrl( function (path, baseUrl, dateStamp, expectedResult) {
            v2RunCount++;
            expect(mgApiV2Container.get('MtGoxApi').getUncachablePostUrl(path)).toEqual(expectedResult);
        });
        expect(v1RunCount).toEqual(8);
        expect(v2RunCount).toEqual(8);
    });

    embeddableTests.generators.HmacComputation = (function (getComposedMessage) {
        return (function testHmacComputation(testCallback, testData) {
            testData = testData || {}
            var i,j,k,m;
            testData.paths = testData.paths || ['foo', 'bar'];
            testData.dataSets = testData.dataSets || ['BIG DATA', 'little data'];
            testData.secrets = testData.secrets || ['STRONG SECRET', 'weak secret'];
            expect(testData.paths).toBeOfType('Array');
            expect(testData.paths.length).not.toBeLessThan(1);
            expect(testData.dataSets).toBeOfType('Array');
            expect(testData.dataSets.length).not.toBeLessThan(1);
            expect(testData.secrets).toBeOfType('Array');
            expect(testData.secrets.length).not.toBeLessThan(1);
            var testHashes = ['hash1', 'hash2'];
            for (i = 0; i < testData.paths.length; i++ ) {
                for (j = 0; j < testData.dataSets.length; j++ ) {
                    for (k = 0; k < testData.secrets.length; k++ ) {
                        for (m = 0; m < testHashes.length; m++ ) {
                            testHmacMessage = getComposedMessage(testData.paths[i], testData.dataSets[j]);
                            testHmacSecret = testData.secrets[k];
                            testHmacHash = testHashes[m];
                            testCallback(testData.paths[i], testData.dataSets[j], testData.secrets[k], testHashes[m]);
                        }
                    }
                }
            }
        });
    });

    embeddableTests.v1.HmacComputation = embeddableTests.generators.HmacComputation(function (path, data) { return data; });
    embeddableTests.v2.HmacComputation = embeddableTests.generators.HmacComputation(function (path, data) { return path + '\0' + data; });

    it("should return API object supporting computeMessageHmac() method", function() {
        var i,j,k;
        expect(mgApiV1Container.get('MtGoxApi').computeMessageHmac).isAFunction({withName:'computeMessageHmac'});
        expect(mgApiV2Container.get('MtGoxApi').computeMessageHmac).isAFunction({withName:'computeMessageHmac'});
        embeddableTests.v1.HmacComputation(function (path, dataSet, secret, expectedResult) {
            expect(mgApiV1Container.get('MtGoxApi').computeMessageHmac(path, dataSet, secret)).toEqual(expectedResult);
        });
        embeddableTests.v2.HmacComputation(function (path, dataSet, secret, expectedResult) {
            expect(mgApiV2Container.get('MtGoxApi').computeMessageHmac(path, dataSet, secret)).toEqual(expectedResult);
        });
    });

    it("should return API object supporting addBuyOrder() method", function() {
        var testCurrencies = ['USD', 'Simoleons'];
        var testAmounts = [314, 42, 3.14159];
        var i,j;
        expect(mgApiV1Container.get('MtGoxApi').addBuyOrder).isAFunction({withName:'addOrder'});
        expect(mgApiV2Container.get('MtGoxApi').addBuyOrder).isAFunction({withName:'addOrder'});
        for (i = 0; i < testCurrencies.length; i++ ) {
            for (j = 0; j < testAmounts.length; j++ ) {
            	testMtGoxPostFunc.testErrorCallback = jasmine.createSpy('testErrorCallback');
                testMtGoxPostFunc.testSuccessCallback = jasmine.createSpy('testSuccessCallback');
                testMtGoxPostFunc.expectedPath = 'buyBTC.php';
                testMtGoxPostFunc.expectedData = ['Currency='+testCurrencies[i],'amount='+testAmounts[j]];
                testMtGoxPostFunc.expectedCallCount = 1;
                mgApiV1Container.get('MtGoxApi').addBuyOrder(testMtGoxPostFunc, testCurrencies[i], testAmounts[j], testMtGoxPostFunc.testErrorCallback, testMtGoxPostFunc.testSuccessCallback);
                expect(testMtGoxPostFunc.expectedCallCount).toEqual(0);
                testMtGoxPostFunc.testErrorCallback = jasmine.createSpy('testErrorCallback');
                testMtGoxPostFunc.testSuccessCallback = jasmine.createSpy('testSuccessCallback');
                testMtGoxPostFunc.expectedPath = 'BTC'+testCurrencies[i]+'/money/order/add';
                testMtGoxPostFunc.expectedData = ['type=bid','amount_int='+(testAmounts[j]*100000000).toString()];
                testMtGoxPostFunc.expectedCallCount = 1;
                mgApiV2Container.get('MtGoxApi').addBuyOrder(testMtGoxPostFunc, testCurrencies[i], testAmounts[j], testMtGoxPostFunc.testErrorCallback, testMtGoxPostFunc.testSuccessCallback);
                expect(testMtGoxPostFunc.expectedCallCount).toEqual(0);
            }
        }
    });

    it("should return API object supporting addSellOrder() method", function() {
        var testCurrencies = ['USD', 'Simoleons'];
        var testAmounts = [314, 42, 3.14159];
        var i,j;
        expect(mgApiV1Container.get('MtGoxApi').addSellOrder).isAFunction({withName:'addOrder'});
        expect(mgApiV2Container.get('MtGoxApi').addSellOrder).isAFunction({withName:'addOrder'});
        for (i = 0; i < testCurrencies.length; i++ ) {
            for (j = 0; j < testAmounts.length; j++ ) {
            	testMtGoxPostFunc.testErrorCallback = jasmine.createSpy('testErrorCallback');
                testMtGoxPostFunc.testSuccessCallback = jasmine.createSpy('testSuccessCallback');
                testMtGoxPostFunc.expectedPath = 'sellBTC.php';
                testMtGoxPostFunc.expectedData = ['Currency='+testCurrencies[i],'amount='+testAmounts[j]];
                testMtGoxPostFunc.expectedCallCount = 1;
                mgApiV1Container.get('MtGoxApi').addSellOrder(testMtGoxPostFunc, testCurrencies[i], testAmounts[j], testMtGoxPostFunc.testErrorCallback, testMtGoxPostFunc.testSuccessCallback);
                expect(testMtGoxPostFunc.expectedCallCount).toEqual(0);
                testMtGoxPostFunc.testErrorCallback = jasmine.createSpy('testErrorCallback');
                testMtGoxPostFunc.testSuccessCallback = jasmine.createSpy('testSuccessCallback');
                testMtGoxPostFunc.expectedPath = 'BTC'+testCurrencies[i]+'/money/order/add';
                testMtGoxPostFunc.expectedData = ['type=ask','amount_int='+(testAmounts[j]*100000000).toString()];
                testMtGoxPostFunc.expectedCallCount = 1;
                mgApiV2Container.get('MtGoxApi').addSellOrder(testMtGoxPostFunc, testCurrencies[i], testAmounts[j], testMtGoxPostFunc.testErrorCallback, testMtGoxPostFunc.testSuccessCallback);
                expect(testMtGoxPostFunc.expectedCallCount).toEqual(0);
            }
        }
    });

    it("should return API object supporting getRequestSamplesUrl() method", function() {
        var testBaseUrls = ['https://data.mtgox.com/api/2/', 'https://fake.mtgox.hostname/fake/api/path/'];
        var testCurrencies = ['USD', 'Simoleons'];
        var testSinceStamps = [946674800000000, 946674800333000];
        var testNowStamps = [946684800000, 946684800333];
        var i,j,k,m,n;
        var fakeSinceDate = {getMicroTime: (function () { return testSinceStamps[k];})};
        expect(mgApiV1Container.get('MtGoxApi').getRequestSamplesUrl).isAFunction({withName:'getRequestSamplesUrl'});
        expect(mgApiV2Container.get('MtGoxApi').getRequestSamplesUrl).isAFunction({withName:'getRequestSamplesUrl'});
        for (i = 0; i < testBaseUrls.length; i++ ) {
            for (j = 0; j < testCurrencies.length; j++ ) {
                for (k = 0; k < testSinceStamps.length; k++ ) {
                    for (m = 0; m < testNowStamps.length; m++ ) {
                        testTimeStamp = testNowStamps[m];
                        mgApiV1Container.set('MtGoxAPI2BaseURL', testBaseUrls[i]);
                        mgApiV2Container.set('MtGoxAPI2BaseURL', testBaseUrls[i]);
                        expect(mgApiV1Container.get('MtGoxApi').getRequestSamplesUrl(testCurrencies[j], fakeSinceDate))
                            .toEqual("https://data.mtgox.com/api/0/data/getTrades.php?Currency=" + testCurrencies[j] + "&since=" + testSinceStamps[k] + "&nonce=" + (testNowStamps[m] * 1000));
                        expect(mgApiV2Container.get('MtGoxApi').getRequestSamplesUrl(testCurrencies[j], fakeSinceDate))
                            .toEqual(testBaseUrls[i] + "BTC" + testCurrencies[j] + "/money/trades/fetch?since=" + testSinceStamps[k] + "&nonce=" + (testNowStamps[m] * 1000));
                    }
                }
            }
        }
    });

    it("should return API object supporting toString() method", function() {
        expect(mgApiV1Container.get('MtGoxApi').toString).isAFunction({withName:'toString'});
        expect(mgApiV1Container.get('MtGoxApi').toString()).toEqual('MtGox API v0');
        expect(mgApiV2Container.get('MtGoxApi').toString).isAFunction({withName:'toString'});
        expect(mgApiV2Container.get('MtGoxApi').toString()).toEqual('MtGox API v2');
    });

    it("should return API object supporting post() method", function() {
        expect(mgApiV1Container.get('MtGoxApi').post).toBe(mgApiV2Container.get('MtGoxApi').post);
        var paramSets = [
            {  data: [],
               string: ''},
            {  data: ['car=fast'],
               string: '&car=fast'},
            {  data: ['man=Fred', 'woman=Wilma'],
               string: '&man=Fred&woman=Wilma'}];
        var testApiKeys = ['USER KEY 1', 'user key 2'];
        var protocolVers = [
            {   container: mgApiV1Container,
                hmacTester: embeddableTests.v1.HmacComputation},
            {   container: mgApiV2Container,
                hmacTester: embeddableTests.v2.HmacComputation} ];
        var i, j, k;
        for (i = 0; i < protocolVers.length; i++) {
            expect(protocolVers[i].container.get('MtGoxApi').post).isAFunction({withName:'post'});
            for (j = 0; j < paramSets.length; j++) {
                    for (k = 0; k < testApiKeys.length; k++) {
                        protocolVers[i].hmacTester(function (path, dataSet, secret, expectedHmac) {
                        var errorCallback, sucessCallback;
                        var fakeAjaxRequestConstructor;
                        var fakeRequestHeaders = {};
                        var fakeAjaxRequest = {
                            open: jasmine.createSpy("open request event"),
                            setRequestHeader: (function (key, val) {
                                expect(arguments.length).toEqual(2);
                                this.setRequestHeader.callCount++;
                                expect(this.open.callCount).toEqual(1);
                                expect(fakeRequestHeaders[key]).not.toBeDefined();
                                fakeRequestHeaders[key] = val;
                            }),
                            send: (function (data) {
                                expect(arguments.length).toEqual(1);
                                expect(data).toBe(paramSets[j].string);
                                this.send.callCount++;
                                expect(this.open).toHaveBeenCalledWith('POST', path, true);
                                expect(this.open.callCount).toEqual(1);
                                expect(fakeRequestHeaders['Content-Type']).toBe('application/x-www-form-urlencoded');
                                expect(fakeRequestHeaders['Rest-Key']).toBe(testApiKeys[k].toString());
                                expect(fakeRequestHeaders['Rest-Sign']).toBe(expectedHmac.toString());
                                expect(this.onerror).toBe(errorCallback);
                                expect(this.onload).toBe(sucessCallback);
                            })
                        };
                        expect(paramSets[j].string).toBe(dataSet);
                        fakeAjaxRequest.send.callCount = 0;
                        fakeAjaxRequest.setRequestHeader.callCount = 0;
                        fakeAjaxRequestConstructor = (function () { return fakeAjaxRequest;});
                        errorCallback = jasmine.createSpy("error callback");
                        sucessCallback = jasmine.createSpy("success callback");
                        expect(errorCallback).toBe(errorCallback);
                        expect(sucessCallback).toBe(sucessCallback);
                        expect(errorCallback).not.toBe(sucessCallback);
                        protocolVers[i].container.set('AjaxRequest', DependancyInjectionContainer.wrap(fakeAjaxRequestConstructor));
                        expect(protocolVers[i].container.get('MtGoxApi').post(path, paramSets[j].data, testApiKeys[k], secret, errorCallback, sucessCallback)).not.toBeDefined();
                        expect(fakeAjaxRequest.send.callCount).toEqual(1);
                        expect(fakeAjaxRequest.setRequestHeader.callCount).toEqual(3);
                        expect(errorCallback).not.toHaveBeenCalled();
                        expect(sucessCallback).not.toHaveBeenCalled();
                    }, {dataSets: [paramSets[j].string]});
                }
            }
        }
    });
});

/*



function mtgoxpost(path, params, apiKey, secret, errorFunc, dataFunc) {
	var request = new XMLHttpRequest();
	var now = new (tobliGoxBot.get('TobliDate'))();
	request.open("POST", tobliGoxBot.get('MtGoxApi').getUncachablePostUrl(path), true);
	request.onerror = errorFunc;
	request.onload = dataFunc;
	var data = "nonce="+(now.getMicroTime());
	for (var i in params) {
		data+="&"+params[i];
	}
	data = encodeURI(data);
	request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	request.setRequestHeader("Rest-Key", apiKey);
	request.setRequestHeader("Rest-Sign", tobliGoxBot.get('MtGoxApi').computeMessageHmac(path, data, secret));
	request.send(data);
}

*/
