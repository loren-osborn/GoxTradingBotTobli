describe("jasmine extensions", function () {
	it("add jasmine.getNameOfFunction() method", function () {
		expect(jasmine.getNameOfFunction).not.toBeUndefined();
		expect(function () { jasmine.getNameOfFunction(null); }).toThrow("Expected null to be a function.");
		expect(function () { jasmine.getNameOfFunction({}); }).toThrow("Expected {  } to be a function.");
		expect(jasmine.getNameOfFunction(function () {})).toBeNull();
		expect(jasmine.getNameOfFunction(function doSomethingCool() {})).toEqual("doSomethingCool");
		expect(jasmine.getNameOfFunction(function callMe() {})).toEqual("callMe");
	});

	it("add expect.messageWhenExpecting() method", function () {
		var dummyExpectation = expect("dummy");
		var originalAddMatcherResult = dummyExpectation.spec.addMatcherResult;
		expect.messageWhenExpecting(0).toEqual(1).toEqual("Expected 0 to equal 1.");
		var newAddMatcherResult = dummyExpectation.spec.addMatcherResult;
		dummyExpectation.spec.addMatcherResult = originalAddMatcherResult;
		expect(newAddMatcherResult).toBe(originalAddMatcherResult);
		expect.messageWhenExpecting(0).not.toEqual(0).toEqual("Expected 0 not to equal 0.");
		newAddMatcherResult = dummyExpectation.spec.addMatcherResult;
		dummyExpectation.spec.addMatcherResult = originalAddMatcherResult;
		expect(newAddMatcherResult).toBe(originalAddMatcherResult);
		var counter = 0;
		this.addMatchers({
			toThrowInsteadOfMatch: function () {
				if (counter < 1) {
					counter++;
					return false;
				}
				throw "Match failed";
			}
		});
		try {
			expect.messageWhenExpecting(0).toThrowInsteadOfMatch();
			expect(0).toEqual("This line should be unreachable");
		}
		catch (e) {
			expect(e).toEqual("Match failed");
		}
		newAddMatcherResult = dummyExpectation.spec.addMatcherResult;
		dummyExpectation.spec.addMatcherResult = originalAddMatcherResult;
		expect(newAddMatcherResult).toBe(originalAddMatcherResult);
	});

	it("adds toBeOneOf() matcher", function () {
		var a = {}, b = {}, c = {}, d = {}, e = {}, f = {};
		expect.messageWhenExpecting(3).not.toBeOneOf([1, 3, 5, 7]).toEqual("Expected 3 not to be one of 1, 3, 5 or 7.");
		expect.messageWhenExpecting(3).toBeOneOf([]).toEqual("Expected 3 to be in the empty set.");
		expect.messageWhenExpecting(3).not.toBeOneOf([3]).toEqual("Expected 3 not to be 3.");
		expect.messageWhenExpecting(3).not.toBeOneOf([3, 5]).toEqual("Expected 3 not to be one of 3 or 5.");
		expect(function () { expect(3).toBeOneOf({name: "Susie"}); }).toThrow("Expected { name : 'Susie' } to be an Array.")
		expect(3).not.toBeOneOf([2, 4, 6, 8]);
		expect(2 + 3).toBeOneOf([1, 3, 5, 7]);
		expect(2 + 3).not.toBeOneOf([2, 4, 6, 8]);
		expect(a).toBeOneOf([a, b, c, d]);
		expect(e).not.toBeOneOf([a, b, c, d]);
	});

	it("adds toEqualOneOf() matcher", function () {
		var a = {name:"Fred"}, b = {name:"Wilma"}, c = {name:"Barney"}, d = {name:"Betty"}, e = {name:"Fred"}, f = {name:"Bam Bam"};
		expect.messageWhenExpecting(3).not.toEqualOneOf([1, 3, 5, 7]).toEqual("Expected 3 not to equal one of 1, 3, 5 or 7.");
		expect.messageWhenExpecting(3).toEqualOneOf([]).toEqual("Expected 3 to be in the empty set.");
		expect.messageWhenExpecting(3).not.toEqualOneOf([3]).toEqual("Expected 3 not to equal 3.");
		expect.messageWhenExpecting(3).not.toEqualOneOf([3, 5]).toEqual("Expected 3 not to equal one of 3 or 5.");
		expect(function () { expect(3).toBeOneOf({name: "Susie"}); }).toThrow("Expected { name : 'Susie' } to be an Array.")
		expect(3).not.toEqualOneOf([2, 4, 6, 8]);
		expect(2 + 3).toEqualOneOf([1, 3, 5, 7]);
		expect(2 + 3).not.toEqualOneOf([2, 4, 6, 8]);
		expect(a).toEqualOneOf([a, b, c, d]);
		expect(e).toEqualOneOf([a, b, c, d]);
		expect(f).not.toEqualOneOf([a, b, c, d]);
	});

	it("adds toBeOfType() matcher", function () {
		expect.messageWhenExpecting(3).not.toBeOfType("Number").toEqual("Expected 3 not to be of type 'Number'.");
		expect.messageWhenExpecting("3").toBeOfType("Number").toEqual("Expected '3' to be of type 'Number'.");
		expect("3").toBeOfType("String");
		expect({}).not.toBeOfType("String");
		expect({}).toBeOfType("Object");
		var Television = (function Television() {});
		var tv = new Television();
		expect(tv).toBeOfType("Object");
		expect(jasmine.getNameOfFunction(tv.constructor)).toEqual("Television");
	});

	it("adds toBeOfClass() matcher", function () {
		expect.messageWhenExpecting(3).not.toBeOfClass("Number").toEqual("Expected 3 not to be of class 'Number'.");
		expect.messageWhenExpecting("3").toBeOfClass("Number").toEqual("Expected '3' to be of class 'Number'.");
		expect(3).toBeOfClass("Number");
		expect("3").not.toBeOfClass("Number");
		expect("3").toBeOfClass("String");
		expect({}).not.toBeOfClass("String");
		expect({}).toBeOfClass("Object");
		var Television = (function Television() {});
		var tv = new Television();
		expect(tv).toBeOfClass("Television");
	});
});

