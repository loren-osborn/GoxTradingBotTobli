describe("getMtGoxApi", function () {
	var embeddableTests = { v1: {}, v2: {}, common: {}, generators: {}};
	var testTimeStamp = 946684800000;
	var FakeDateConstructor = (function FakeDateConstructor() {
		expect(arguments.length).toEqual(0);
		return {getTime: (function () { return testTimeStamp; }), getMicroTime: (function () { return testTimeStamp * 1000; }) };
	});
	var testHmacMessage = undefined;
	var testHmacSecret = undefined;
	var testHmacHash = undefined;
	var FakeJsSha = (function FakeJsSha(srcString, inputFormat, charSize) {
		expect(srcString).toEqual(testHmacMessage);
		expect(inputFormat).toEqual("TEXT");
		expect(charSize).toBeUndefined();
		return {getHMAC: (function getHMAC(secret, inputFormat, variant, outputFormat, outputFormatOpts) {
			expect(secret).toEqual(testHmacSecret);
			expect(inputFormat).toEqual("B64");
			expect(variant).toEqual("SHA-512");
			expect(outputFormat).toEqual("B64");
			expect(outputFormatOpts).toBeUndefined();
			return testHmacHash;
		})};
	});
	var mgApiV1Container = new DependancyInjectionContainer({
		TobliDate: DependancyInjectionContainer.wrap(FakeDateConstructor),
		TobliLogger: {},
		MtGoxApi: getMtGoxApi,
		MtGoxApiVersion: 1,
		MtGoxAPI2BaseURL: "https://fake.mtgox.hostname/fake/api/path/",
		JsSha: DependancyInjectionContainer.wrap(FakeJsSha)
	});
	var mgApiV2Container = new DependancyInjectionContainer({
		TobliDate: DependancyInjectionContainer.wrap(FakeDateConstructor),
		TobliLogger: {},
		MtGoxApi: getMtGoxApi,
		MtGoxApiVersion: 2,
		MtGoxAPI2BaseURL: "https://fake.mtgox.hostname/fake/api/path/",
		JsSha: DependancyInjectionContainer.wrap(FakeJsSha)
	});

	it("should be a function", function () {
		expect(getMtGoxApi).isAFunction({withName:"getMtGoxApi"});
	});
	it("should return v1 API object", function () {
		expect(mgApiV1Container.get("MtGoxApi")).toBeDefined();
		expect(mgApiV1Container.get("MtGoxApi")).not.toBeNull();
		expect(mgApiV1Container.get("MtGoxApi").constructor).toBeAWellBehavedConstructor({withName:"MtGoxApiV1", returningObjectOfClass: mgApiV1Container.get("MtGoxApi").constructor, withArbitrary: "parentClass"});
	});
	it("should return v2 API object", function () {
		expect(mgApiV2Container.get("MtGoxApi")).toBeDefined();
		expect(mgApiV2Container.get("MtGoxApi")).not.toBeNull();
		expect(mgApiV2Container.get("MtGoxApi").constructor).toBeAWellBehavedConstructor({withName:"MtGoxApiV2", returningObjectOfClass: mgApiV2Container.get("MtGoxApi").constructor, withArbitrary: "parentClass"});
	});
	it("should require valid params", function () {
		expect(getMtGoxApi).toThrow("Unrecognized API version: [undefined]");
		expect((function () { getMtGoxApi(DependancyInjectionContainer.wrap(0.5)); })).toThrow("Unrecognized API version: 0.5");
	});

	it("should return API object supporting getAccountBalancePath() method", function () {
		expect(mgApiV1Container.get("MtGoxApi").getAccountBalancePath).isAFunction({withName:"getAccountBalancePath"});
		expect(mgApiV1Container.get("MtGoxApi").getAccountBalancePath({currency:"USD"})).toEqual("info.php");
		expect(mgApiV1Container.get("MtGoxApi").getAccountBalancePath({currency:"Simolions"})).toEqual("info.php");
		expect(mgApiV2Container.get("MtGoxApi").getAccountBalancePath).isAFunction({withName:"getAccountBalancePath"});
		expect(mgApiV2Container.get("MtGoxApi").getAccountBalancePath({currency:"USD"})).toEqual("BTCUSD/money/info");
		expect(mgApiV2Container.get("MtGoxApi").getAccountBalancePath({currency:"Simolions"})).toEqual("BTCSimolions/money/info");
	});

	it("should return API object supporting getResponseData() method", function () {
		expect(mgApiV1Container.get("MtGoxApi").getResponseData).isAFunction({withName:"getResponseData"});
		expect(mgApiV1Container.get("MtGoxApi").getResponseData("\"My Dog Has Fleas\"")).toEqual("My Dog Has Fleas");
		expect(mgApiV2Container.get("MtGoxApi").getResponseData).isAFunction({withName:"getResponseData"});
		expect(mgApiV2Container.get("MtGoxApi").getResponseData("{\"data\":\"My Dog Has Fleas\"}")).toEqual("My Dog Has Fleas");
	});

	embeddableTests.generators.UncachablePostUrl = (function (container, getBasePath) {
		return (function testUncachablePostUrl(testCallback, testData) {
			jasmine.iterateOverTestDataSets([
					{name: "paths", data: ["info.php", "BTCSimolions/money/info"]},
					{name: "v2BaseUrls", data: ["https://data.mtgox.com/api/2/", "https://fake.mtgox.hostname/fake/api/path/"]},
					{name: "dateStamps", data: [946684800000, 946684800333]}],
				testData,
				(function (path, v2BaseUrl, dateStamp) {
					container.set("MtGoxAPI2BaseURL", v2BaseUrl);
					testTimeStamp = dateStamp;
					testCallback(path, v2BaseUrl, dateStamp, (getBasePath(v2BaseUrl) + path + "?t=" + dateStamp.toString()));
				})
			);
		});
	});

	embeddableTests.v1.UncachablePostUrl = embeddableTests.generators.UncachablePostUrl(mgApiV1Container, function (v2BaseUrl) { return "https://mtgox.com/api/0/"; });
	embeddableTests.v2.UncachablePostUrl = embeddableTests.generators.UncachablePostUrl(mgApiV2Container, function (v2BaseUrl) { return v2BaseUrl; });

	it("should return API object with no public getUncachablePostUrl() method", function () {
		expect(mgApiV1Container.get("MtGoxApi").getUncachablePostUrl).toBeUndefined();
		expect(mgApiV2Container.get("MtGoxApi").getUncachablePostUrl).toBeUndefined();
	});

	embeddableTests.generators.HmacComputation = (function (getComposedMessage) {
		return (function testHmacComputation(testCallback, testData) {
			jasmine.iterateOverTestDataSets([
					{name: "paths", data: ["foo", "bar"]},
					{name: "dataSets", data: ["BIG DATA", "little data"]},
					{name: "secrets", data: ["STRONG SECRET", "weak secret"]},
					{name: "testHashes", data: ["hash1", "hash2"]}],
				testData,
				(function (path, dataSet, secret, testHash) {
					testHmacMessage = getComposedMessage(path, dataSet);
					testHmacSecret = secret;
					testHmacHash = testHash;
					testCallback(path, dataSet, secret, testHash);
				})
			);
		});
	});

	embeddableTests.v1.HmacComputation = embeddableTests.generators.HmacComputation(function (path, data) { return data; });
	embeddableTests.v2.HmacComputation = embeddableTests.generators.HmacComputation(function (path, data) { return path + "\0" + data; });

	it("should return API object with no public computeMessageHmac() method", function () {
		expect(mgApiV1Container.get("MtGoxApi").computeMessageHmac).toBeUndefined();
		expect(mgApiV2Container.get("MtGoxApi").computeMessageHmac).toBeUndefined();
	});

	embeddableTests.generators.getRequestSamplesUrl = (function (container, getExpectedUrl) {
		return (function getRequestSamplesUrl(testCallback, testData) {
			jasmine.iterateOverTestDataSets([
					{name: "baseUrls", data: ["https://data.mtgox.com/api/2/", "https://fake.mtgox.hostname/fake/api/path/"]},
					{name: "currencies", data: ["USD", "Simoleons"]},
					{name: "sinceStamps", data: [946674800000000, 946674800333000]},
					{name: "nowStamps", data: [946684800000, 946684800333]}],
				testData,
				(function (baseUrl, currency, sinceStamp, nowStamp) {
					var fakeSinceDate = {getMicroTime: (function () { return sinceStamp; })};
					testTimeStamp = nowStamp;
					container.set("MtGoxAPI2BaseURL", baseUrl);
					var expected = getExpectedUrl(baseUrl, currency, sinceStamp, nowStamp * 1000);
					testCallback(baseUrl, currency, sinceStamp, nowStamp, fakeSinceDate, expected);
				})
			);
		});
	});

	embeddableTests.v1.getRequestSamplesUrl = embeddableTests.generators.getRequestSamplesUrl(mgApiV1Container, function (baseUrl, currency, sinceStamp, nowMicroTime) {
		return ("https://data.mtgox.com/api/0/data/getTrades.php?Currency=" + currency + "&since=" + sinceStamp + "&nonce=" + nowMicroTime);
	});
	embeddableTests.v2.getRequestSamplesUrl = embeddableTests.generators.getRequestSamplesUrl(mgApiV2Container,  function (baseUrl, currency, sinceStamp, nowMicroTime) {
		return (baseUrl + "BTC" + currency + "/money/trades/fetch?since=" + sinceStamp + "&nonce=" + nowMicroTime);
	});


	it("should return API object with no public getRequestSamplesUrl() method", function () {
		expect(mgApiV1Container.get("MtGoxApi").getRequestSamplesUrl).toBeUndefined();
		expect(mgApiV2Container.get("MtGoxApi").getRequestSamplesUrl).toBeUndefined();
	});

	it("should return API object supporting toString() method", function () {
		expect(mgApiV1Container.get("MtGoxApi").toString).isAFunction({withName:"toString"});
		expect(mgApiV1Container.get("MtGoxApi").toString()).toEqual("MtGox API v0");
		expect(mgApiV2Container.get("MtGoxApi").toString).isAFunction({withName:"toString"});
		expect(mgApiV2Container.get("MtGoxApi").toString()).toEqual("MtGox API v2");
	});

	embeddableTests.generators.post = (function (container, hmacTester, urlTester) {
		var defaultParamSets = [
			{
				data: [],
				string: ""
			},
			{
				data: ["car=fast"],
				string: "&car=fast"
			},
			{
				data: ["man=Fred", "woman=Wilma"],
				string: "&man=Fred&woman=Wilma"
			},
			{
				data: ["special=_();[]{}", "chars=\\'-!"],
				string: "&special=_();%5B%5D%7B%7D&chars=%5C'-!"
			}];
		return (function testPost(testCallback, testData) {
			var defaultErrorCallback = jasmine.createSpy("error callback");
			var defaultSucessCallback = jasmine.createSpy("success callback");
			jasmine.iterateOverTestDataSets([
					{name: "paramSets", data: defaultParamSets},
					{name: "apiKeys", data: ["USER KEY 1", "user key 2"]},
					{name: "paths", data: ["info.php", "BTCSimolions/money/info"]},
					{name: "v2BaseUrls", data: ["https://data.mtgox.com/api/2/", "https://fake.mtgox.hostname/fake/api/path/"]},
					{name: "dateStamps", data: [946684800000, 946684800333]},
					{name: "secrets", data: ["STRONG SECRET", "weak secret"]},
					{name: "testHashes", data: ["hash1", "hash2"]},
					{name: "testErrorCallbacks", data: [defaultErrorCallback]},
					{name: "testSucessCallbacks", data: [defaultSucessCallback]}],
				testData,
				(function (paramSet, apiKey, inputPath, v2BaseUrl, dateStamp, apiSecret, testHash, errorCallback, sucessCallback) {
					var usingDefaultErrorCallback = (errorCallback === defaultErrorCallback);
					var usingDefaultSucessCallback = (sucessCallback === defaultSucessCallback);
					urlTester(function (innerPath, innerV2BaseUrl, innerDateStamp, expectedUrlResult) {
						hmacTester(function (hmacUrl, hmacDataSet, hmacSecret, expectedHmacResult) {
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
									expect(data).toBe(hmacDataSet);
									this.send.callCount++;
									expect(this.open).toHaveBeenCalledWith("POST", expectedUrlResult, true);
									expect(this.open.callCount).toEqual(1);
									expect(fakeRequestHeaders["Content-Type"]).toBe("application/x-www-form-urlencoded");
									expect(fakeRequestHeaders["Rest-Key"]).toBe(apiKey.toString());
									expect(fakeRequestHeaders["Rest-Sign"]).toBe(expectedHmacResult.toString());
									expect(this.onerror).toBe(errorCallback);
									expect(this.onload).toBe(sucessCallback);
								})
							};
							fakeAjaxRequest.send.callCount = 0;
							fakeAjaxRequest.setRequestHeader.callCount = 0;
							fakeAjaxRequestConstructor = (function () { return fakeAjaxRequest; });
							container.set("NativeAjaxRequest", DependancyInjectionContainer.wrap(fakeAjaxRequestConstructor));
							container.get("MtGoxApi").setKey(apiKey);
							container.get("MtGoxApi").setSecret(hmacSecret);
							testCallback({
								container: container,
								paramSet: paramSet,
								apiKey: apiKey,
								inputPath: inputPath,
								v2BaseUrl: v2BaseUrl,
								dateStamp: dateStamp,
								apiSecret: apiSecret,
								testHash: testHash,
								expectedUrlResult: expectedUrlResult,
								errorCallback: errorCallback,
								sucessCallback: sucessCallback
							});
							expect(fakeAjaxRequest.send.callCount).toEqual(1);
							expect(fakeAjaxRequest.setRequestHeader.callCount).toEqual(3);
							usingDefaultErrorCallback || expect(errorCallback).not.toHaveBeenCalled();
							usingDefaultSucessCallback || expect(sucessCallback).not.toHaveBeenCalled();
						}, {
							paths: [inputPath],
							dataSets: ["nonce=" + (innerDateStamp * 1000).toString() + paramSet.string],
							secrets: [apiSecret],
							testHashes: [testHash]
						});
					}, {
						paths: [inputPath],
						v2BaseUrls: [v2BaseUrl],
						dateStamps: [dateStamp]
					});
				})
			);
		});
	});

	embeddableTests.v1.post = embeddableTests.generators.post(mgApiV1Container, embeddableTests.v1.HmacComputation, embeddableTests.v1.UncachablePostUrl);
	embeddableTests.v2.post = embeddableTests.generators.post(mgApiV2Container, embeddableTests.v2.HmacComputation, embeddableTests.v2.UncachablePostUrl);

	it("should return API object supporting post() method", function () {
		var protocolTesters = [ embeddableTests.v1.post, embeddableTests.v2.post ];
		var i;
		for (i = 0; i < protocolTesters.length; i++) {
			var errorCallback, sucessCallback;
			protocolTesters[i](
				(function (dataHash) {
					expect(dataHash.container.get("MtGoxApi").post(dataHash.inputPath, dataHash.paramSet.data, dataHash.errorCallback, dataHash.sucessCallback)).not.toBeDefined();
				})
			);
		}
	});

	embeddableTests.generators.addOrder = (function (container, embeddablePostTest, convertCurrencyAndAmountToDataAndPath) {
		return (function testPost(testCallback, testData) {
			var defaultErrorCallback = jasmine.createSpy("error callback");
			var defaultSucessCallback = jasmine.createSpy("success callback");
			jasmine.iterateOverTestDataSets([
					{name: "currencies", data: [{raw: "USD", encoded: "USD"}, {raw: "Simoleons", encoded: "Simoleons"}, {raw:"[Smakers]", encoded:"%5BSmakers%5D"}]},
					{name: "amounts", data: [314, 42, 3.14159]},
					{name: "apiKeys", data: ["USER KEY 1", "user key 2"]},
					{name: "v2BaseUrls", data: ["https://data.mtgox.com/api/2/", "https://fake.mtgox.hostname/fake/api/path/"]},
					{name: "dateStamps", data: [946684800000, 946684800333]},
					{name: "secrets", data: ["STRONG SECRET", "weak secret"]},
					{name: "testHashes", data: ["hash1", "hash2"]},
					{name: "testErrorCallbacks", data: ["DEFAULT"]},
					{name: "testSucessCallbacks", data: ["DEFAULT"]}],
				testData,
				(function (currency, amount, apiKey, v2BaseUrl, dateStamp, apiSecret, testHash, errorCallback, sucessCallback) {
					var dataAndPath = convertCurrencyAndAmountToDataAndPath(currency, amount);
					var iterationParams = {
						paramSets: [dataAndPath.data],
						paths: [dataAndPath.path],
						apiKeys: [apiKey],
						v2BaseUrls: [v2BaseUrl],
						dateStamps: [dateStamp],
						secrets: [apiSecret],
						testHashes: [testHash]
					};
					if (errorCallback !== "DEFAULT") {
						iterationParams.errorCallback = [errorCallback];
					}
					if (sucessCallback !== "DEFAULT") {
						iterationParams.sucessCallback = [sucessCallback];
					}
					embeddablePostTest(
						(function (dataHash) {
							var innerDataHash = {
								container: dataHash.container,
								currency: currency,
								amount: amount,
								apiKey: dataHash.apiKey,
								v2BaseUrl: dataHash.v2BaseUrl,
								dateStamp: dataHash.dateStamp,
								apiSecret: dataHash.apiSecret,
								testHash: dataHash.testHash,
								errorCallback: dataHash.errorCallback,
								sucessCallback: dataHash.sucessCallback
							};
							testCallback(innerDataHash);
						}), iterationParams
					);
				})
			);
		});
	});

	embeddableTests.v1.addBuyOrder = embeddableTests.generators.addOrder(mgApiV1Container, embeddableTests.v1.post, (function (currency, amount) {
		return {data: {data: ["NOT_USED"], string: "&Currency=" + currency.encoded + "&amount=" + amount}, path: "buyBTC.php"};
	}));
	embeddableTests.v1.addSellOrder = embeddableTests.generators.addOrder(mgApiV1Container, embeddableTests.v1.post, (function (currency, amount) {
		return {data: {data: ["NOT_USED"], string: "&Currency=" + currency.encoded + "&amount=" + amount}, path: "sellBTC.php"};
	}));
	embeddableTests.v2.addBuyOrder = embeddableTests.generators.addOrder(mgApiV2Container, embeddableTests.v2.post, (function (currency, amount) {
		return {data: {data: ["NOT_USED"], string: "&type=bid&amount_int=" + (amount * 100000000).toString()}, path: "BTC" + currency.raw + "/money/order/add"};
	}));
	embeddableTests.v2.addSellOrder = embeddableTests.generators.addOrder(mgApiV2Container, embeddableTests.v2.post, (function (currency, amount) {
		return {data: {data: ["NOT_USED"], string: "&type=ask&amount_int=" + (amount * 100000000).toString()}, path: "BTC" + currency.raw + "/money/order/add"};
	}));

	it("should return API object supporting addBuyOrder() method", function () {
		expect(mgApiV1Container.get("MtGoxApi").addBuyOrder).isAFunction({withName:"addOrder"});
		embeddableTests.v1.addBuyOrder((function (dataHash) {
			expect(dataHash.container.get("MtGoxApi").addBuyOrder(dataHash.currency.raw, dataHash.amount, dataHash.errorCallback, dataHash.sucessCallback)).not.toBeDefined();
		}));
		expect(mgApiV2Container.get("MtGoxApi").addBuyOrder).isAFunction({withName:"addOrder"});
		embeddableTests.v2.addBuyOrder((function (dataHash) {
			expect(dataHash.container.get("MtGoxApi").addBuyOrder(dataHash.currency.raw, dataHash.amount, dataHash.errorCallback, dataHash.sucessCallback)).not.toBeDefined();
		}));
	});

	it("should return API object supporting addSellOrder() method", function () {
		expect(mgApiV1Container.get("MtGoxApi").addSellOrder).isAFunction({withName:"addOrder"});
		embeddableTests.v1.addSellOrder((function (dataHash) {
			expect(dataHash.container.get("MtGoxApi").addSellOrder(dataHash.currency.raw, dataHash.amount, dataHash.errorCallback, dataHash.sucessCallback)).not.toBeDefined();
		}));
		expect(mgApiV2Container.get("MtGoxApi").addSellOrder).isAFunction({withName:"addOrder"});
		embeddableTests.v2.addSellOrder((function (dataHash) {
			expect(dataHash.container.get("MtGoxApi").addSellOrder(dataHash.currency.raw, dataHash.amount, dataHash.errorCallback, dataHash.sucessCallback)).not.toBeDefined();
		}));
	});

	embeddableTests.common.accessors = (function accessors(testCallback, testData) {
		jasmine.iterateOverTestDataSets([
				{name: "keys", data: [{set: false, value: ""}, {set: true, value: "USER KEY 1"}, {set: true, value: "user key 2"}]},
				{name: "secrets", data: ["STRONG SECRET", "weak secret"]}],
			testData,
			(function (keyData, secret) {
				testCallback(keyData.value, secret, keyData.set);
			})
		);
	});

	it("should return API object supporting key and secret accessor methods", function () {
		embeddableTests.common.accessors(function (key, secret, isKeySet) {
			mgApiV1Container.get("MtGoxApi").setKey(key);
			mgApiV1Container.get("MtGoxApi").setSecret(secret);
			expect(mgApiV1Container.get("MtGoxApi").getKey()).toBe(key);
			expect(mgApiV1Container.get("MtGoxApi").getSecret()).toBe(secret);
			expect(mgApiV1Container.get("MtGoxApi").isKeySet()).toBe(isKeySet);
			mgApiV2Container.get("MtGoxApi").setKey(key);
			mgApiV2Container.get("MtGoxApi").setSecret(secret);
			expect(mgApiV2Container.get("MtGoxApi").getKey()).toBe(key);
			expect(mgApiV2Container.get("MtGoxApi").getSecret()).toBe(secret);
			expect(mgApiV2Container.get("MtGoxApi").isKeySet()).toBe(isKeySet);
		});
		expect(mgApiV1Container.get("MtGoxApi").toString).isAFunction({withName:"toString"});
		expect(mgApiV1Container.get("MtGoxApi").toString()).toEqual("MtGox API v0");
		expect(mgApiV2Container.get("MtGoxApi").toString).isAFunction({withName:"toString"});
		expect(mgApiV2Container.get("MtGoxApi").toString()).toEqual("MtGox API v2");
	});

	embeddableTests.generators.getByUrl = (function (container) {
		var getRequestTestingGetByUrl = (function getRequestTestingGetByUrl(url, request) {
			var retVal = request || {};
			var embeddedOpenMethod = retVal.open || (function () {});
			var embeddedSendMethod  = retVal.send || (function () {});
			var fakeSendMethod = (function () {
				expect(this).toBe(retVal);
				expect(this.open.calls.length).toEqual(1);
				expect(this.open.calls[0].object).toBe(this);
				expect(this.open.calls[0].args).toEqual(["GET", url]);
				return embeddedSendMethod.apply(this, [].slice.call(arguments, 0));
			});
			retVal.open = jasmine.createSpy("open request event").andCallFake(embeddedOpenMethod);
			retVal.send = jasmine.createSpy("send request event").andCallFake(fakeSendMethod);
			retVal.ensureRequestSentProperly = (function () {
				expect(retVal.send.calls.length).toEqual(1);
				expect(retVal.send.calls[0].object).toBe(retVal);
				expect(retVal.send.calls[0].args).toEqual([]);
			});
			return retVal;
		});

		return (function testGetByUrl(testCallback, testData) {
			jasmine.iterateOverTestDataSets([
					{name: "urls", data: ["https://data.mtgox.com/api/2/info.php", "https://fake.mtgox.hostname/fake/api/path/BTCSimolions/money/info"]},
					{name: "requests", data: [null]}],
				testData,
				(function (url, request) {
					var requestToTest = getRequestTestingGetByUrl(url, request);
					var testLogger = container.get("TobliLogger");
					var originalLogLevelMethod = testLogger.logLevel;
					testLogger.logLevel = jasmine.createSpy("log level").andCallFake(function (requestedLevel) {
						expect(this).toBe(testLogger);
						expect(arguments.length).toEqual(1);
						expect(requestedLevel).toBe("DEBUG");
						var retVal = {};
						retVal.logNative = jasmine.createSpy("log level").andCallFake(function (message) {
							expect(this).toBe(retVal);
							expect(arguments.length).toEqual(1);
							// *FIXME*: function name changed to getByUrl()
							expect(message).toEqual("get_url(): " + url);
						});
						return retVal;
					});
					testCallback(requestToTest, url, container);
					expect(testLogger.logLevel.callCount).toEqual(1);
					requestToTest.ensureRequestSentProperly();
					testLogger.logLevel = originalLogLevelMethod;
				})
			);
		});
	});

	embeddableTests.v1.getByUrl = embeddableTests.generators.getByUrl(mgApiV1Container);
	embeddableTests.v2.getByUrl = embeddableTests.generators.getByUrl(mgApiV2Container);

	it("should return API object supporting getByUrl() method", function () {
		var simpleTest = (function (requestToTest, url, container) {
			expect(container.get("MtGoxApi").getByUrl(requestToTest, url)).toBeUndefined();
		});
		embeddableTests.v1.getByUrl(simpleTest);
		embeddableTests.v2.getByUrl(simpleTest);
	});

	embeddableTests.generators.getSample = (function (container, getRequestSamplesUrlTester, getByUrlTester) {
		return (function testGetSample(testCallback, testData) {
			jasmine.iterateOverTestDataSets([
					{name: "baseUrls", data: ["https://data.mtgox.com/api/2/", "https://fake.mtgox.hostname/fake/api/path/"]},
					{name: "currencies", data: ["USD", "Simoleons"]},
					{name: "nowStamps", data: [946684800000, 946684800333]},
					{name: "minuteIds", data: [15777913, 15777918]},
					{name: "requests", data: [null]}],
				testData,
				(function (baseUrl, currency, nowStamp, minuteId, request) {
					expect(FakeDateConstructor.createFromMinuteId).toBeUndefined();
					FakeDateConstructor.createFromMinuteId = (function (val) {
						return getTobliDateConstructor(function () { return Date; }).createFromMinuteId(val);
					});
					getRequestSamplesUrlTester(
						(function (baseUrl, currency, sinceStamp, nowStamp, fakeSinceDate, expectedUrl) {
							getByUrlTester(
								(function (requestToTest, url, container) {
									testCallback({
										container: container,
										baseUrl: baseUrl,
										currency: currency,
										sinceStamp: sinceStamp,
										nowStamp: nowStamp,
										sinceMinuteId: minuteId,
										sinceDate: fakeSinceDate,
										expectedUrl: expectedUrl,
										innerUrl: url,
										request: requestToTest
									});
								}),
								{
									urls: [expectedUrl],
									requests: [request]
								}
							);
						}),
						{
							baseUrls: [baseUrl],
							currencies: [currency],
							sinceStamps: [minuteId * 60 * 1000 * 1000],
							nowStamps: [nowStamp]
						}
					);
					FakeDateConstructor.createFromMinuteId = undefined;
				})
			);
		});
	});

	embeddableTests.v1.getSample = embeddableTests.generators.getSample(mgApiV1Container, embeddableTests.v1.getRequestSamplesUrl, embeddableTests.v1.getByUrl);
	embeddableTests.v2.getSample = embeddableTests.generators.getSample(mgApiV2Container, embeddableTests.v2.getRequestSamplesUrl, embeddableTests.v2.getByUrl);

	it("should return API object supporting getSample() method", function () {
		var simpleTest = (function (params) {
			expect(params.expectedUrl).toEqual(params.innerUrl);
			expect(params.container.get("MtGoxApi").getSample(params.request, params.sinceMinuteId, params.currency)).toBeUndefined();
		});
		embeddableTests.v1.getSample(simpleTest);
		embeddableTests.v2.getSample(simpleTest);
	});
});
