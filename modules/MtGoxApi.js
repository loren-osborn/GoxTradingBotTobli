getMtGoxApi = (function () {
	var MtGoxApiV1 = (function MtGoxApiV1() {});
	MtGoxApiV1.prototype.getAccountBalancePath = function getAccountBalancePath() { return 'info.php'; };
	MtGoxApiV1.prototype.getAccountBalanceResponseData = function getAccountBalanceResponseData(input) { return JSON.parse(input); };
	var MtGoxApiV2 = (function MtGoxApiV2() {});
	MtGoxApiV2.prototype.getAccountBalancePath = function getAccountBalancePath(params) { return ('BTC' + (params.currency) + '/money/info'); };
	MtGoxApiV2.prototype.getAccountBalanceResponseData = function getAccountBalanceResponseData(input) { return JSON.parse(input).data; };
	return (function getMtGoxApi(getMtGoxApiVersion) {
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