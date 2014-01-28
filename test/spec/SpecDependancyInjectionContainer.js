describe("DependancyInjectionContainer", function () {

	var greetingFunc = (function (getGreeter, getGuest , getLocation) { return ("Hello " + getGuest() + ". I am " + getGreeter() + ". Welcome to " + getLocation() + "."); });

	it("should be a well behaved constructor for objects implementing the get() and set() methods", function () {
		expect(DependancyInjectionContainer).toBeAWellBehavedConstructor({withName:"DependancyInjectionContainer", whenCalledWith: [{foo:"bar"}]});
		expect((new DependancyInjectionContainer({foo:"bar"})).get).isAFunction({withName:"get"});
		expect((new DependancyInjectionContainer({foo:"bar"})).set).isAFunction({withName:"set"});
	});

	it("should require constructor to take one non-empty simple Object argument", function () {
		expect(function () { new DependancyInjectionContainer(); }).toThrow("Missing required argument");
		expect(function () { new DependancyInjectionContainer(1, 2, 3); }).toThrow("Too many arguments");
		expect(function () { new DependancyInjectionContainer(1); }).toThrow("1 not a simple object");
		expect(function () { new DependancyInjectionContainer("Fred"); }).toThrow("Fred not a simple object");
		expect(function () { new DependancyInjectionContainer({}); }).toThrow("argument must be non-empty Object");
	});

	it("should create objects whose get() method requires defined keys", function () {
		expect((function () { (new DependancyInjectionContainer({foo:"bar"})).get("baz"); })).toThrow("Key \"baz\" undefined!");
		expect((function () { (new DependancyInjectionContainer({Fred:"bar"})).get("Wilma"); })).toThrow("Key \"Wilma\" undefined!");
		expect((new DependancyInjectionContainer({Fred:"bar"})).get("Fred")).toEqual("bar");
		expect((new DependancyInjectionContainer({Fred:7.5})).get("Fred")).toEqual(7.5);
		expect((new DependancyInjectionContainer({Fred:{Wilma:3}})).get("Fred").Wilma).toEqual(3);
	});

	it("should create objects whose get() method returns single instance of function results for keys defined as function", function () {
		var returnNewObject = (function () { return {customTestProperty:"all mine"}; });
		expect(returnNewObject() === returnNewObject()).toBeFalsy();
		var testContainer = new DependancyInjectionContainer({special:returnNewObject});
		expect(testContainer.get("special").customTestProperty).toEqual("all mine");
		expect(testContainer.get("special") === testContainer.get("special")).toBeTruthy();
	});

	it("should create objects whose get() method that fills in function parameters when requesting result for keys defined as function", function () {
		var testContainer = new DependancyInjectionContainer({
			Greeting: greetingFunc
		});
		expect((function () { testContainer.get("Greeting"); })).toThrow("Key \"Guest\" undefined!");
		testContainer = new DependancyInjectionContainer({
			Greeting: greetingFunc,
			Greeter: "Fred",
			Guest: "Wilma" ,
			Location: "my cave"
		});
		expect(testContainer.get("Greeting")).toEqual("Hello Wilma. I am Fred. Welcome to my cave.");
	});

	it("should create objects whose get() method that supports cyclic dependancies", function () {
		var testContainer = new DependancyInjectionContainer({
			Greeting: greetingFunc,
			Greeter: (function (getGreeting) {return {
				toString: function () { return "Fred"; },
				getGreeting: function () { return getGreeting(); }
			};}),
			Guest: "Wilma" ,
			Location: "my cave"
		});
		expect(testContainer.get("Greeter").getGreeting()).toEqual("Hello Wilma. I am Fred. Welcome to my cave.");
	});

	it("should create objects whose set() method replaces values set at creation time", function () {
		var testContainer = new DependancyInjectionContainer({
			Greeting: greetingFunc,
			Greeter: (function (getGreeting) {return {
				toString: function () { return "Fred"; },
				getGreeting: function () { return getGreeting(); }
			};}),
			Guest: "Wilma" ,
			Location: "my cave"
		});
		var greeterBefore = testContainer.get("Greeter");
		expect(greeterBefore.getGreeting()).toEqual("Hello Wilma. I am Fred. Welcome to my cave.");
		expect(testContainer.set("Guest", "Betty")).toBeUndefined();
		expect(testContainer.get("Guest")).toEqual("Betty");
		expect(greeterBefore === testContainer.get("Greeter")).toBeTruthy();
		expect(testContainer.get("Greeter").getGreeting()).toEqual("Hello Betty. I am Fred. Welcome to my cave.");
	});

	it("should have a class method wrap() that returns a function returning its single argument, if only one is given", function () {
		var testObj = {desc:"mine"};
		expect(DependancyInjectionContainer.wrap).isAFunction({withName:"wrap"});
		expect(DependancyInjectionContainer.wrap(testObj)).isAFunction();
		expect((DependancyInjectionContainer.wrap(testObj))()).toEqual(testObj);
	});

	it("should have a class method wrap() that returns a function returning a binding of its second argument (a function) to its first, if two arguments are given", function () {
		var testObj = {desc:"other mine"};
		var method = jasmine.createSpy("method to test");
		expect(DependancyInjectionContainer.wrap).isAFunction({withName:"wrap"});
		expect(DependancyInjectionContainer.wrap(testObj, method)).isAFunction();
		expect((DependancyInjectionContainer.wrap(testObj, method))()).isAFunction();
		expect((DependancyInjectionContainer.wrap(testObj, method))()).not.toBe(method);
		expect((DependancyInjectionContainer.wrap(testObj, method))()).not.toBe(testObj);
		((DependancyInjectionContainer.wrap(testObj, method))())(1, 2, 3, "a", "b", "c");
		expect(method.callCount).toEqual(1);
	    expect(method.calls[0].args).toEqual([1, 2, 3, "a", "b", "c"]);
	    expect(method.calls[0].object).toEqual(testObj);
	});

	it("should create objects with getName() and createNewName() methods for each Nameed value in spec", function () {
		var returnObject = (function () { return {customTestProperty:"all mine"}; });
		var testContainer = new DependancyInjectionContainer({Special:returnObject, NativeDate: DependancyInjectionContainer.wrap(Date)});
		expect(testContainer.getSpecial().customTestProperty).toEqual("all mine");
		expect(testContainer.getSpecial()).toBe(testContainer.get("Special"));
		expect(testContainer.createNewSpecial).toThrow("Special is not a function");
		expect(testContainer.getNativeDate()).toBe(Date);
		expect(testContainer.createNewNativeDate().constructor).toBe(Date);
		expect(testContainer.getGuest).toBeUndefined();
		expect(testContainer.createNewGuest).toBeUndefined();
		expect(testContainer.set("Guest", "Betty")).toBeUndefined();
		expect(testContainer.getGuest()).toBe(testContainer.get("Guest"));
		expect(testContainer.createNewGuest).toThrow("Guest is not a function");
		expect(testContainer.getFriday).toBeUndefined();
		expect(testContainer.createNewFriday).toBeUndefined();
		expect(testContainer.set("Friday", DependancyInjectionContainer.wrap(Array))).toBeUndefined();
		expect(testContainer.getFriday()).toBe(Array);
		expect(testContainer.createNewFriday().constructor).toBe(Array);
	});
});

