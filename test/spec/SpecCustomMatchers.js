describe("jasmine extensions", function() {
	it("add jasmine.getNameOfFunction() method", function() {
		expect(jasmine.getNameOfFunction).not.toBeUndefined();
		expect(function() { jasmine.getNameOfFunction(null); }).toThrow('Expected null to be a function.');
		expect(function() { jasmine.getNameOfFunction({}); }).toThrow('Expected {  } to be a function.');
		expect(jasmine.getNameOfFunction(function () {})).toBeNull();
		expect(jasmine.getNameOfFunction(function doSomethingCool() {})).toEqual('doSomethingCool');
		expect(jasmine.getNameOfFunction(function callMe() {})).toEqual('callMe');
	});

	it("add expect.messageWhenExpecting() method", function() {
		var dummyExpectation = expect('dummy');
		var originalAddMatcherResult = dummyExpectation.spec.addMatcherResult;
		expect.messageWhenExpecting(0).toEqual(1).toEqual('Expected 0 to equal 1.');
		var newAddMatcherResult = dummyExpectation.spec.addMatcherResult;
		dummyExpectation.spec.addMatcherResult = originalAddMatcherResult;
		expect(newAddMatcherResult).toBe(originalAddMatcherResult);
		expect.messageWhenExpecting(0).not.toEqual(0).toEqual('Expected 0 not to equal 0.');
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
				throw 'Match failed';
			}
		});
		try {
			expect.messageWhenExpecting(0).toThrowInsteadOfMatch();
			expect(0).toEqual('This line should be unreachable');
		}
		catch (e) {
			expect(e).toEqual('Match failed');
		}
		newAddMatcherResult = dummyExpectation.spec.addMatcherResult;
		dummyExpectation.spec.addMatcherResult = originalAddMatcherResult;
		expect(newAddMatcherResult).toBe(originalAddMatcherResult);
	});

	it("add expect.expectationFailuresWhenCalling() method", function() {
		var dummyExpectation = expect('dummy');
		var originalAddMatcherResult = dummyExpectation.spec.addMatcherResult;
		expect.expectationFailuresWhenCalling( function() {
			expect(0).toEqual(1);
			expect(0).not.toEqual(0);
		}).toEqual([
			'Expected 0 to equal 1.',
			'Expected 0 not to equal 0.'
		]);
		var newAddMatcherResult = dummyExpectation.spec.addMatcherResult;
		dummyExpectation.spec.addMatcherResult = originalAddMatcherResult;
		expect(newAddMatcherResult).toBe(originalAddMatcherResult);
		expect.expectationFailuresWhenCalling( function() {
			expect(0).not.toEqual(0);
			expect(0).toEqual(0);
			expect(0).toEqual(1);
		}).toEqual([
			'Expected 0 not to equal 0.',
			null,
			'Expected 0 to equal 1.'
		]);
		var newAddMatcherResult = dummyExpectation.spec.addMatcherResult;
		dummyExpectation.spec.addMatcherResult = originalAddMatcherResult;
		expect(newAddMatcherResult).toBe(originalAddMatcherResult);
		expect.expectationFailuresWhenCalling( function() {
			expect(0).toEqual(0);
			expect(0).toEqual(1);
			expect(0).not.toEqual(0);
			throw('To be or not to be');
		}).whichThrows('To be or not to be').toEqual([
			null,
			'Expected 0 to equal 1.',
			'Expected 0 not to equal 0.'
		]);
		var newAddMatcherResult = dummyExpectation.spec.addMatcherResult;
		dummyExpectation.spec.addMatcherResult = originalAddMatcherResult;
		expect(newAddMatcherResult).toBe(originalAddMatcherResult);
		expect.expectationFailuresWhenCalling( function() {
			expect.expectationFailuresWhenCalling( function() {
				expect(0).toEqual(0);
				expect(0).not.toEqual(2);
				expect(0).not.toEqual(0);
			}).whichThrows('To be or not to be').toEqual([
				null,
				'Expected 0 not to equal 0.'
			]);
		}).toEqual([
			'Expected function to throw an exception.',
			"Expected [ null, null, 'Expected 0 not to equal 0.' ] to equal [ null, 'Expected 0 not to equal 0.' ]."
		]);
		var newAddMatcherResult = dummyExpectation.spec.addMatcherResult;
		dummyExpectation.spec.addMatcherResult = originalAddMatcherResult;
		expect(newAddMatcherResult).toBe(originalAddMatcherResult);
	});

	it("add jasmine.iterateOverTestDataSets() method", function() {
		var ensureArgsAreNotModified = (function ensureArgsAreNotModified(dataSetSpec, specOverride, func) {
			var dataSetSpecJson = JSON.stringify(dataSetSpec);
			var specOverrideJson = JSON.stringify(specOverride);
			var retVal;
			try {
				retVal = jasmine.iterateOverTestDataSets.apply(jasmine, [].slice.call(arguments, 0));
			}
			catch (e) {
				expect(JSON.stringify(dataSetSpec)).toEqual(dataSetSpecJson);
				expect(JSON.stringify(specOverride)).toEqual(specOverrideJson);
				throw e;
			}
			expect(JSON.stringify(dataSetSpec)).toEqual(dataSetSpecJson);
			expect(JSON.stringify(specOverride)).toEqual(specOverrideJson);
			return retVal;
		});
		var uncalledFunction = (function () { throw 'This function should never be called'; });
		var callback;
		expect(jasmine.iterateOverTestDataSets).isAFunction({withName: 'iterateOverTestDataSets'});
		expect(jasmine.iterateOverTestDataSets).toThrow('Missing required parameters.');
		expect(function () { jasmine.iterateOverTestDataSets(1); }).toThrow('Missing required parameters.');
		expect(function () { ensureArgsAreNotModified(1, 2); }).toThrow('Missing required parameters.');
		expect(function () { ensureArgsAreNotModified(1, 2, 3, 4); }).toThrow('Too many parameters.');
		expect(function () { ensureArgsAreNotModified(1, 2, 3, 4, 5); }).toThrow('Too many parameters.');
		expect(function () { ensureArgsAreNotModified(1, 2, 3); }).toThrow('First parameter must be an array.');
		expect(function () { ensureArgsAreNotModified([], 2, 3); }).toThrow('Second parameter must be null or simple Object.');
		expect(function () { ensureArgsAreNotModified([], [], 3); }).toThrow('Second parameter must be null or simple Object.');
		expect(function () { ensureArgsAreNotModified([], null, 3); }).toThrow('Third parameter must be a function.');
		expect(function () { ensureArgsAreNotModified([], undefined, 3); }).toThrow('Third parameter must be a function.');
		expect(function () { ensureArgsAreNotModified([], {}, 3); }).toThrow('Third parameter must be a function.');
		expect(function () { ensureArgsAreNotModified([], {}, uncalledFunction); }).toThrow('Must have at least 1 data set.');
		expect(function () {
			ensureArgsAreNotModified([{name: 'Albert', data: 5}], {}, uncalledFunction);
		}).toThrow('Dataset[0].data must be an Array.');
		expect(function () {
			ensureArgsAreNotModified([{name:'Fred', data: [1, 2, 3]}, {name: 'Albert'}], {}, uncalledFunction);
		}).toThrow('Dataset[1].data must be an Array.');
		expect(function () {
			ensureArgsAreNotModified([{name:'Fred', data: [1, 2, 3]}, {name:'George', data: [2, 4, 6]}, {data: [9]}], {}, uncalledFunction);
		}).toThrow('Dataset[2].name must be a non-empty string.');
		expect(function () {
			ensureArgsAreNotModified([{name:'Fred', data: [1, 2, 3]}, {name:'George', data: [2, 4, 6]}, {name:'Fred', data: [9]}], {}, uncalledFunction);
		}).toThrow('Dataset[2].name must not match Dataset[0].name.');
		expect(function () {
			ensureArgsAreNotModified([{name:'Fred', data: [1, 2, 3]}, {name:'George', data: []}], {}, uncalledFunction);
		}).toThrow('Dataset[1].data must be non-empty.');
		expect(function () {
			ensureArgsAreNotModified([{name:'Larry', data: [1, 2, 3]}, {name:'Moe', data: ['a', 'c']}, {name:'Curly', data: ['b', 'd']}], {William: [3, 4, 5]}, uncalledFunction);
		}).toThrow('paramOverrides dataset "William" is not defined.');
		expect(function () {
			ensureArgsAreNotModified([{name:'Larry', data: [1, 2, 3]}, {name:'Moe', data: ['a', 'c']}, {name:'Curly', data: ['b', 'd']}], {Moe: 6}, uncalledFunction);
		}).toThrow('paramOverrides.Moe must be an Array.');
		expect(function () {
			ensureArgsAreNotModified([{name:'Larry', data: [1, 2, 3]}, {name:'Moe', data: ['a', 'c']}, {name:'Curly', data: ['b', 'd']}], {Moe: []}, uncalledFunction);
		}).toThrow('paramOverrides.Moe must be non-empty.');
		var testEmptyOverride = (function testEmptyOverride(override) {
			callback = jasmine.createSpy('test callback');
			ensureArgsAreNotModified([{name:'Larry', data: [1, 2, 3]}, {name:'Moe', data: ['a', 'c']}, {name:'Curly', data: ['b', 'd']}], override, callback);
			expect(callback.calls.length).toEqual(12);
			expect(callback.calls[0].args).toEqual([1, 'a', 'b']);
			expect(callback.calls[1].args).toEqual([1, 'a', 'd']);
			expect(callback.calls[2].args).toEqual([1, 'c', 'b']);
			expect(callback.calls[3].args).toEqual([1, 'c', 'd']);
			expect(callback.calls[4].args).toEqual([2, 'a', 'b']);
			expect(callback.calls[5].args).toEqual([2, 'a', 'd']);
			expect(callback.calls[6].args).toEqual([2, 'c', 'b']);
			expect(callback.calls[7].args).toEqual([2, 'c', 'd']);
			expect(callback.calls[8].args).toEqual([3, 'a', 'b']);
			expect(callback.calls[9].args).toEqual([3, 'a', 'd']);
			expect(callback.calls[10].args).toEqual([3, 'c', 'b']);
			expect(callback.calls[11].args).toEqual([3, 'c', 'd']);
		});
		testEmptyOverride();
		testEmptyOverride(null);
		testEmptyOverride({});
		callback = jasmine.createSpy('test callback');
		ensureArgsAreNotModified([{name:'Larry', data: [1, 2, 3]}, {name:'Moe', data: ['a', 'c']}, {name:'Curly', data: ['b', 'd']}], {Moe: ['q', 'r', 's']}, callback);
		expect(callback.calls.length).toEqual(18);
		expect(callback.calls[0].args).toEqual([1, 'q', 'b']);
		expect(callback.calls[1].args).toEqual([1, 'q', 'd']);
		expect(callback.calls[2].args).toEqual([1, 'r', 'b']);
		expect(callback.calls[3].args).toEqual([1, 'r', 'd']);
		expect(callback.calls[4].args).toEqual([1, 's', 'b']);
		expect(callback.calls[5].args).toEqual([1, 's', 'd']);
		expect(callback.calls[6].args).toEqual([2, 'q', 'b']);
		expect(callback.calls[7].args).toEqual([2, 'q', 'd']);
		expect(callback.calls[8].args).toEqual([2, 'r', 'b']);
		expect(callback.calls[9].args).toEqual([2, 'r', 'd']);
		expect(callback.calls[10].args).toEqual([2, 's', 'b']);
		expect(callback.calls[11].args).toEqual([2, 's', 'd']);
		expect(callback.calls[12].args).toEqual([3, 'q', 'b']);
		expect(callback.calls[13].args).toEqual([3, 'q', 'd']);
		expect(callback.calls[14].args).toEqual([3, 'r', 'b']);
		expect(callback.calls[15].args).toEqual([3, 'r', 'd']);
		expect(callback.calls[16].args).toEqual([3, 's', 'b']);
		expect(callback.calls[17].args).toEqual([3, 's', 'd']);
	});

	it("adds toBeOneOf() matcher", function() {
		var a = {}, b = {}, c = {}, d = {}, e = {}, f = {};
		expect.messageWhenExpecting(3).not.toBeOneOf([1, 3, 5, 7]).toEqual('Expected 3 not to be one of 1, 3, 5 or 7.');
		expect.messageWhenExpecting(3).toBeOneOf([]).toEqual('Expected 3 to be in the empty set.');
		expect.messageWhenExpecting(3).not.toBeOneOf([3]).toEqual('Expected 3 not to be 3.');
		expect.messageWhenExpecting(3).not.toBeOneOf([3, 5]).toEqual('Expected 3 not to be one of 3 or 5.');
		expect(function () { expect(3).toBeOneOf({name: 'Susie'}); }).toThrow('Expected { name : \'Susie\' } to be an Array.')
		expect(3).not.toBeOneOf([2, 4, 6, 8]);
		expect(2 + 3).toBeOneOf([1, 3, 5, 7]);
		expect(2 + 3).not.toBeOneOf([2, 4, 6, 8]);
		expect(a).toBeOneOf([a, b, c, d]);
		expect(e).not.toBeOneOf([a, b, c, d]);
	});

	it("adds toEqualOneOf() matcher", function() {
		var a = {name:'Fred'}, b = {name:'Wilma'}, c = {name:'Barney'}, d = {name:'Betty'}, e = {name:'Fred'}, f = {name:'Bam Bam'};
		expect.messageWhenExpecting(3).not.toEqualOneOf([1, 3, 5, 7]).toEqual('Expected 3 not to equal one of 1, 3, 5 or 7.');
		expect.messageWhenExpecting(3).toEqualOneOf([]).toEqual('Expected 3 to be in the empty set.');
		expect.messageWhenExpecting(3).not.toEqualOneOf([3]).toEqual('Expected 3 not to equal 3.');
		expect.messageWhenExpecting(3).not.toEqualOneOf([3, 5]).toEqual('Expected 3 not to equal one of 3 or 5.');
		expect(function () { expect(3).toBeOneOf({name: 'Susie'}); }).toThrow('Expected { name : \'Susie\' } to be an Array.')
		expect(3).not.toEqualOneOf([2, 4, 6, 8]);
		expect(2 + 3).toEqualOneOf([1, 3, 5, 7]);
		expect(2 + 3).not.toEqualOneOf([2, 4, 6, 8]);
		expect(a).toEqualOneOf([a, b, c, d]);
		expect(e).toEqualOneOf([a, b, c, d]);
		expect(f).not.toEqualOneOf([a, b, c, d]);
	});

	it("adds toBeOfType() matcher", function() {
		expect.messageWhenExpecting(3).not.toBeOfType('Number').toEqual('Expected 3 not to be of type \'Number\'.');
		expect.messageWhenExpecting('3').toBeOfType('Number').toEqual('Expected \'3\' to be of type \'Number\'.');
		expect('3').toBeOfType('String');
		expect({}).not.toBeOfType('String');
		expect({}).toBeOfType('Object');
		var Television = (function Television() {});
		var tv = new Television();
		expect(tv).toBeOfType('Object');
		expect(jasmine.getNameOfFunction(tv.constructor)).toEqual('Television');
	});

	it("adds toBeOfClass() matcher", function() {
		expect.messageWhenExpecting(3).not.toBeOfClass('Number').toEqual('Expected 3 not to be of class \'Number\'.');
		expect.messageWhenExpecting('3').toBeOfClass('Number').toEqual('Expected \'3\' to be of class \'Number\'.');
		expect(3).toBeOfClass('Number');
		expect('3').not.toBeOfClass('Number');
		expect('3').toBeOfClass('String');
		expect({}).not.toBeOfClass('String');
		expect({}).toBeOfClass('Object');
		var Television = (function Television() {});
		var tv = new Television();
		expect(tv).toBeOfClass('Television');
	});

	it("add isAFunction() matcher", function() {
		var anonymousFunc = (function () {});
		var doSomethingCool = (function doSomethingCool() {});
		var callMe = (function callMe() {});
		expect.messageWhenExpecting(null).isAFunction().toEqual('Expected null to be a function.');
		expect({}).not.isAFunction();
		expect.messageWhenExpecting(anonymousFunc).not.isAFunction().toEqual('Expected function () {} not to be a function.');
		expect(doSomethingCool).isAFunction();
		expect(callMe).isAFunction();
		expect.messageWhenExpecting({}).isAFunction({withName: 'foo'}).toEqual('Expected {  } to be a function.');
		expect.messageWhenExpecting(anonymousFunc).isAFunction({withName: 'foo'}).toEqual('Function () {} isn\'t named foo.');
		expect.messageWhenExpecting(doSomethingCool).not.isAFunction({withName: 'doSomethingCool'}).toEqual('Function doSomethingCool() {} is named doSomethingCool.');
		expect(callMe).isAFunction({withName: 'callMe'});
		expect(doSomethingCool).not.isAFunction({withName: 'callMe'});
		expect(callMe).not.isAFunction({withName: 'doSomethingCool'});
	});

	it("add toBeAWellBehavedConstructor() matcher", function() {
		var anonymousConstructor = (function () {});
		var Apple = (function Apple() {});
		var Banana = (function Banana() {});
		expect.messageWhenExpecting(null).toBeAWellBehavedConstructor().toEqual('Expected null to be a function.');
		expect({}).not.toBeAWellBehavedConstructor();
		expect.messageWhenExpecting(anonymousConstructor).not.toBeAWellBehavedConstructor().toEqual(
			'Expected anonymous function not to be a well behaved constructor with parent class Object, creating objects of class (anonymous) when called "new (function () {})()".');
		expect.messageWhenExpecting(Apple).not.toBeAWellBehavedConstructor().toEqual(
			'Expected Apple not to be a well behaved constructor with parent class Object, creating objects of class Apple when called "new Apple()".');
		expect.messageWhenExpecting(Apple).not.toBeAWellBehavedConstructor({withArbitrary: 'parentClass'}).toEqual(
			'Expected Apple not to be a well behaved constructor, creating objects of class Apple when called "new Apple()".');
		expect.messageWhenExpecting(Apple).not.toBeAWellBehavedConstructor({withName: 'Apple'}).toEqual(
			'Expected Apple not to be a well behaved constructor with name Apple and parent class Object, creating objects of class Apple when called "new Apple()".');
		expect(Apple).toBeAWellBehavedConstructor();
		expect(Banana).toBeAWellBehavedConstructor();
		expect.messageWhenExpecting(anonymousConstructor).toBeAWellBehavedConstructor({withName: 'Carrot'}).toEqual(
			'Expected anonymous function to be a function with name Carrot.');
		expect(Apple).toBeAWellBehavedConstructor({withName: 'Apple'});
		expect(Banana).toBeAWellBehavedConstructor({withName: 'Banana'});
		expect(Apple).not.toBeAWellBehavedConstructor({withName: 'Banana'});
		expect.messageWhenExpecting(Apple).toBeAWellBehavedConstructor({withName: 'Banana'}).toEqual(
			'Expected Apple to be a function with name Banana.');
		expect(Banana).not.toBeAWellBehavedConstructor({withName: 'Apple'});
		var HasNullPrototype = (function () {});
		HasNullPrototype.prototype = null;
		var HasUndefPrototype = (function () {});
		HasUndefPrototype.prototype = undefined;
		expect.messageWhenExpecting(HasNullPrototype).toBeAWellBehavedConstructor().toEqual('Expected anonymous function to have a non-null prototype.');
		expect(HasUndefPrototype).not.toBeAWellBehavedConstructor();
		var HasNullConstructor = (function () {});
		HasNullConstructor.prototype.constructor = null;
		var HasUndefConstructor = (function () {});
		HasUndefConstructor.prototype.constructor = undefined;
		expect(HasNullConstructor).not.toBeAWellBehavedConstructor();
		expect.messageWhenExpecting(HasUndefConstructor).toBeAWellBehavedConstructor().toEqual('Expected anonymous function\'s prototype to point to itself.');
		var Vehicle = (function Vehicle() {});
		var Car = (function Car() {});
		Car.prototype = Object.create(Vehicle.prototype);
		Car.prototype.constructor = Car;
		expect.messageWhenExpecting(Car).toBeAWellBehavedConstructor().toEqual('Expected Car\'s parent class to be Object instead of Vehicle.');
		expect.messageWhenExpecting(Car).not.toBeAWellBehavedConstructor({withParentClass: Vehicle}).toEqual(
			'Expected Car not to be a well behaved constructor with parent class Vehicle, creating objects of class Car when called "new Car()".');
		expect.messageWhenExpecting(Car).not.toBeAWellBehavedConstructor({withArbitrary: 'parentClass'}).toEqual(
			'Expected Car not to be a well behaved constructor, creating objects of class Car when called "new Car()".');
		var Boat = (function Boat() {});
		Boat.prototype = Object.create(Vehicle.prototype);
		Boat.prototype.constructor = Boat;
		var LostBoat = (function LostBoat() {});
		LostBoat.prototype = Object.create(Boat.prototype);
		expect.messageWhenExpecting(LostBoat).toBeAWellBehavedConstructor({withParentClass: Boat}).toEqual(
			'Expected LostBoat\'s prototype to point to itself.');
	});

});

