getMtGoxApi = (function () {
	var localGetMtGoxAPI2BaseURL = undefined;
	var localGetTobliDate = undefined;
	var localJsSha = undefined;
	var localAjaxRequest = undefined;
	var computeHmac512 = (function computeHmac512(message, secret) {
	    var shaObj = new (localJsSha())(message, "TEXT");
	    var hmac = shaObj.getHMAC(secret, "B64", "SHA-512", "B64");
	    return hmac;
	});
	var MtGoxApiCommon = (function MtGoxApiCommon() {});
	MtGoxApiCommon.prototype.post = (function post(path, params, apiKey, secret, errorFunc, dataFunc) {
		var request = new (localAjaxRequest())();
		request.open("POST", path, true);
		request.onerror = errorFunc;
		request.onload = dataFunc;
		var data = ''; // "nonce="+(now.getMicroTime());
		var i;
		for (i in params) {
			data += ("&" + params[i]);
		}
		data = encodeURI(data);
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		request.setRequestHeader('Rest-Key', apiKey);
		request.setRequestHeader('Rest-Sign', this.computeMessageHmac(path, data, secret));
		request.send(data);
	});
	var MtGoxApiV1 = (function MtGoxApiV1() {});
	MtGoxApiV1.prototype =  Object.create(MtGoxApiCommon.prototype);
	MtGoxApiV1.prototype.constructor =  MtGoxApiV1;
	MtGoxApiV1.prototype.getAccountBalancePath = function getAccountBalancePath() { return 'info.php'; };
	MtGoxApiV1.prototype.getResponseData = function getResponseData(input) { return JSON.parse(input); };
	MtGoxApiV1.prototype.getUncachablePostUrl = function getUncachablePostUrl(path) {
		var curTime = new (localGetTobliDate())();
		return ('https://mtgox.com/api/0/' + path + '?t=' + curTime.getTime()); // Extra cache-busting...
	};
	MtGoxApiV1.prototype.computeMessageHmac = (function computeMessageHmac(path, data, key) { return computeHmac512(data, key); });
	var getV1AddOrderMethod = (function (orderType) { return (function addOrder(fn, currency, amount, errorCallback, successCallback) {
		fn(orderType + 'BTC.php', ['Currency='+currency,'amount='+amount], errorCallback, successCallback);
	}); });
	MtGoxApiV1.prototype.addBuyOrder = getV1AddOrderMethod('buy');
	MtGoxApiV1.prototype.addSellOrder = getV1AddOrderMethod('sell');
	MtGoxApiV1.prototype.getRequestSamplesUrl = function getRequestSamplesUrl(currency, since) {
		var curTime = new (localGetTobliDate())();
		return 'https://data.mtgox.com/api/0/data/getTrades.php?Currency=' + currency + '&since=' + (since.getMicroTime()) + '&nonce=' + (curTime.getMicroTime());
	};
	MtGoxApiV1.prototype.toString = (function toString() { return 'MtGox API v0'; });
	var MtGoxApiV2 = (function MtGoxApiV2() {});
	MtGoxApiV2.prototype =  Object.create(MtGoxApiCommon.prototype);
	MtGoxApiV2.prototype.constructor =  MtGoxApiV2;
	MtGoxApiV2.prototype.getAccountBalancePath = function getAccountBalancePath(params) { return ('BTC' + (params.currency) + '/money/info'); };
	MtGoxApiV2.prototype.getResponseData = function getResponseData(input) { return JSON.parse(input).data; };
	MtGoxApiV2.prototype.getUncachablePostUrl = function getUncachablePostUrl(path) {
		var curTime = new (localGetTobliDate())();
		return (localGetMtGoxAPI2BaseURL() + path + '?t=' + curTime.getTime()); // Extra cache-busting...
	};
	MtGoxApiV2.prototype.computeMessageHmac = (function computeMessageHmac(path, data, key) { return computeHmac512(path + '\0' + data, key); });
	var getV2AddOrderMethod = (function (orderType) { return (function addOrder(fn, currency, amount, errorCallback, successCallback) {
		fn('BTC'+currency+'/money/order/add', [ 'type=' + orderType, 'amount_int=' + Math.round(amount*100000000).toString() ], errorCallback, successCallback);
	}); });
	MtGoxApiV2.prototype.addBuyOrder = getV2AddOrderMethod('bid');
	MtGoxApiV2.prototype.addSellOrder = getV2AddOrderMethod('ask');
	MtGoxApiV2.prototype.getRequestSamplesUrl = function getRequestSamplesUrl(currency, since) {
		var curTime = new (localGetTobliDate())();
		return localGetMtGoxAPI2BaseURL() + 'BTC' + currency + '/money/trades/fetch?since=' + (since.getMicroTime()) + '&nonce=' + (curTime.getMicroTime());
	};
	MtGoxApiV2.prototype.toString = (function toString() { return 'MtGox API v2'; });
	return (function getMtGoxApi(getMtGoxApiVersion, getMtGoxAPI2BaseURL, getTobliDate, getJsSha, getAjaxRequest) {
		localGetMtGoxAPI2BaseURL = getMtGoxAPI2BaseURL;
		localGetTobliDate = getTobliDate;
		localJsSha = getJsSha;
		localAjaxRequest = getAjaxRequest;
		getMtGoxApiVersion = getMtGoxApiVersion || DependancyInjectionContainer.wrap('[undefined]');
		switch (getMtGoxApiVersion()) {
			case 1:
				return new MtGoxApiV1();
				break;
			case 2:
				return new MtGoxApiV2();
				break;
			default:
				throw ("Unrecognized API version: " + getMtGoxApiVersion());
				break;
		}
	});
})();
