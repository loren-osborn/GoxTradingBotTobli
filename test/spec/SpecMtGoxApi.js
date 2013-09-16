describe("getMtGoxApi", function() {
    
    it("should be a function", function() {
        expect(getMtGoxApi).isAFunction({withName:'getMtGoxApi'});
    });
    var mgApiV1 = getMtGoxApi(DependancyInjectionContainer.wrap(1));
    var mgApiV2 = getMtGoxApi(DependancyInjectionContainer.wrap(2));
    it("should return v1 API object", function() {
        expect(mgApiV1).toBeDefined();
        expect(mgApiV1).not.toBeNull();
        expect(mgApiV1.constructor).toBeAWellBehavedConstructor({withName:'MtGoxApiV1', returningObjectOfClass: mgApiV1.constructor});
    });
    it("should return v2 API object", function() {
        expect(mgApiV2).toBeDefined();
        expect(mgApiV2).not.toBeNull();
        expect(mgApiV2.constructor).toBeAWellBehavedConstructor({withName:'MtGoxApiV2', returningObjectOfClass: mgApiV2.constructor});
    });
    it("should require valid params", function() {
        expect(getMtGoxApi).toThrow("Unrecognized API version: [undefined]");
        expect((function () {getMtGoxApi(DependancyInjectionContainer.wrap(0.5));})).toThrow("Unrecognized API version: 0.5");
    });
    it("should return API object supporting getAccountBalancePath() method", function() {
        expect(mgApiV1.getAccountBalancePath).isAFunction({withName:'getAccountBalancePath'});
        expect(mgApiV1.getAccountBalancePath({currency:'USD'})).toEqual("info.php");
        expect(mgApiV1.getAccountBalancePath({currency:'Simolions'})).toEqual("info.php");
        expect(mgApiV2.getAccountBalancePath).isAFunction({withName:'getAccountBalancePath'});
        expect(mgApiV2.getAccountBalancePath({currency:'USD'})).toEqual("BTCUSD/money/info");
        expect(mgApiV2.getAccountBalancePath({currency:'Simolions'})).toEqual("BTCSimolions/money/info");
    });
    it("should return API object supporting getAccountBalanceResponseData() method", function() {
        expect(mgApiV1.getAccountBalanceResponseData).isAFunction({withName:'getAccountBalanceResponseData'});
        expect(mgApiV1.getAccountBalanceResponseData('"My Dog Has Fleas"')).toEqual("My Dog Has Fleas");
        expect(mgApiV2.getAccountBalanceResponseData).isAFunction({withName:'getAccountBalanceResponseData'});
        expect(mgApiV2.getAccountBalanceResponseData('{"data":"My Dog Has Fleas"}')).toEqual("My Dog Has Fleas");
    });
});