describe("getMtGoxApi", function() {
    var testTimeStamp = 946684800000;
    var FakeDateConstructor = (function FakeDateConstructor() {
        expect(arguments.length).toEqual(0);
        return {getTime: (function () { return testTimeStamp;})};
    });
    var testHmacMessage = undefined;
    var testHmacKey = undefined;
    var testHmacHash = undefined;
    var FakeJsSha = (function FakeJsSha(srcString, inputFormat, charSize) {
        expect(srcString).toEqual(testHmacMessage);
        expect(inputFormat).toEqual('TEXT');
        expect(charSize).toBeUndefined();
        return {getHMAC: (function getHMAC(key, inputFormat, variant, outputFormat, outputFormatOpts) {
            expect(key).toEqual(testHmacKey);
            expect(inputFormat).toEqual('B64');
            expect(variant).toEqual('SHA-512');
            expect(outputFormat).toEqual('B64');
            expect(outputFormatOpts).toBeUndefined();
            return testHmacHash;
        })};
    });
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
        expect(mgApiV1Container.get('MtGoxApi').constructor).toBeAWellBehavedConstructor({withName:'MtGoxApiV1', returningObjectOfClass: mgApiV1Container.get('MtGoxApi').constructor});
    });
    it("should return v2 API object", function() {
        expect(mgApiV2Container.get('MtGoxApi')).toBeDefined();
        expect(mgApiV2Container.get('MtGoxApi')).not.toBeNull();
        expect(mgApiV2Container.get('MtGoxApi').constructor).toBeAWellBehavedConstructor({withName:'MtGoxApiV2', returningObjectOfClass: mgApiV2Container.get('MtGoxApi').constructor});
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
    it("should return API object supporting getUncachablePostUrl() method", function() {
        var testPaths = ['info.php', 'BTCSimolions/money/info'];
        var testBaseUrls = ['https://data.mtgox.com/api/2/', 'https://fake.mtgox.hostname/fake/api/path/'];
        var testDateStamps = [946684800000, 946684800333];
        var i,j,k;
        expect(mgApiV1Container.get('MtGoxApi').getUncachablePostUrl).isAFunction({withName:'getUncachablePostUrl'});
        expect(mgApiV2Container.get('MtGoxApi').getUncachablePostUrl).isAFunction({withName:'getUncachablePostUrl'});
        for (i = 0; i < testPaths.length; i++ ) {
            for (j = 0; j < testBaseUrls.length; j++ ) {
                for (k = 0; k < testDateStamps.length; k++ ) {
                    mgApiV1Container.set('MtGoxAPI2BaseURL', testBaseUrls[j]);
                    mgApiV2Container.set('MtGoxAPI2BaseURL', testBaseUrls[j]);
                    testTimeStamp = testDateStamps[k];
                    expect(mgApiV1Container.get('MtGoxApi').getUncachablePostUrl(testPaths[i])).toEqual('https://mtgox.com/api/0/' + testPaths[i] + '?t=' + testDateStamps[k].toString());
                    expect(mgApiV2Container.get('MtGoxApi').getUncachablePostUrl(testPaths[i])).toEqual(testBaseUrls[j] + testPaths[i] + '?t=' + testDateStamps[k].toString());
                }
            }
        }
    });
    it("should return API object supporting computeMessageHmac() method", function() {
        var testPaths = ['foo', 'bar'];
        var testData = ['BIG DATA', 'little data'];
        var testSecrets = ['STRONG KEY', 'weak key'];
        var testHashes = ['hash1', 'hash2'];
        var i,j,k,m;
        expect(mgApiV1Container.get('MtGoxApi').computeMessageHmac).isAFunction({withName:'computeMessageHmac'});
        expect(mgApiV2Container.get('MtGoxApi').computeMessageHmac).isAFunction({withName:'computeMessageHmac'});
        for (i = 0; i < testPaths.length; i++ ) {
            for (j = 0; j < testData.length; j++ ) {
                for (k = 0; k < testSecrets.length; k++ ) {
                    for (m = 0; m < testHashes.length; m++ ) {
                        testHmacMessage = testData[j];
                        testHmacKey = testSecrets[k];
                        testHmacHash = testHashes[m];
                        expect(mgApiV1Container.get('MtGoxApi').computeMessageHmac(testPaths[i], testData[j], testSecrets[k])).toEqual(testHashes[m]);
                        testHmacMessage = testPaths[i] + '\0' + testData[j];
                        expect(mgApiV2Container.get('MtGoxApi').computeMessageHmac(testPaths[i], testData[j], testSecrets[k])).toEqual(testHashes[m]);
                    }
                }
            }
        }
    });
    it("should return API object supporting addBuyOrder() method", function() {
        var testCurrencies = ['USD', 'Simoleons'];
        var testAmounts = [314, 42];
        var testErrorCallback = undefined;
        var testSuccessCallback = undefined;
        var expectedPath = undefined;
        var expectedData = undefined;
        var expectedCallCount = 0;
        var testMtGoxPostFunc = (function (a, b, c, d) {
            expect(arguments.length).toEqual(4);
            expect(expectedCallCount).toBeGreaterThan(0);
            expectedCallCount--;
            expect(a).toEqual(expectedPath);
            expect(b).toEqual(expectedData);
            expect(c).toEqual(testErrorCallback);
            expect(d).toEqual(testSuccessCallback);
            expect(testErrorCallback).not.toHaveBeenCalled();
            expect(testSuccessCallback).not.toHaveBeenCalled();
            c();
            expect(testErrorCallback).toHaveBeenCalled();
            expect(testSuccessCallback).not.toHaveBeenCalled();
            d();
            expect(testErrorCallback).toHaveBeenCalled();
            expect(testSuccessCallback).toHaveBeenCalled();
        });
        var i,j;
        expect(mgApiV1Container.get('MtGoxApi').addBuyOrder).isAFunction({withName:'addBuyOrder'});
        expect(mgApiV2Container.get('MtGoxApi').addBuyOrder).isAFunction({withName:'addBuyOrder'});
        for (i = 0; i < testCurrencies.length; i++ ) {
            for (j = 0; j < testAmounts.length; j++ ) {
                testErrorCallback = jasmine.createSpy('testErrorCallback');
                testSuccessCallback = jasmine.createSpy('testSuccessCallback');
                expectedPath = 'buyBTC.php';
                expectedData = ['Currency='+testCurrencies[i],'amount='+testAmounts[j]];
                expectedCallCount = 1;
                mgApiV1Container.get('MtGoxApi').addBuyOrder(testMtGoxPostFunc, testCurrencies[i], testAmounts[j], testErrorCallback, testSuccessCallback);
                expect(expectedCallCount).toEqual(0);
                testErrorCallback = jasmine.createSpy('testErrorCallback');
                testSuccessCallback = jasmine.createSpy('testSuccessCallback');
                expectedPath = 'BTC'+testCurrencies[i]+'/money/order/add';
                expectedData = ['type=bid','amount_int='+(testAmounts[j]*100000000).toString()];
                expectedCallCount = 1;
                mgApiV2Container.get('MtGoxApi').addBuyOrder(testMtGoxPostFunc, testCurrencies[i], testAmounts[j], testErrorCallback, testSuccessCallback);
                expect(expectedCallCount).toEqual(0);
            }
        }
    });
    it("should return API object supporting toString() method", function() {
        expect(mgApiV1Container.get('MtGoxApi').toString).isAFunction({withName:'toString'});
        expect(mgApiV1Container.get('MtGoxApi').toString()).toEqual('MtGox API v0');
        expect(mgApiV2Container.get('MtGoxApi').toString).isAFunction({withName:'toString'});
        expect(mgApiV2Container.get('MtGoxApi').toString()).toEqual('MtGox API v2');
    });
});