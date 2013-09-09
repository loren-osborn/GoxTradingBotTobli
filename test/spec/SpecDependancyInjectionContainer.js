describe("DependancyInjectionContainer", function() {

    var greetingFunc = (function (Greeter, Guest ,Location) { return ('Hello ' + Guest() + '. I am ' + Greeter() + '. Welcome to ' + Location() + '.'); });
    
    it("should be a well behaved constructor for objects implementing the get() method", function() {
        expect(DependancyInjectionContainer).toBeAWellBehavedConstructor({withName:'DependancyInjectionContainer', whenCalledWith: [{foo:'bar'}]});
        expect((new DependancyInjectionContainer({foo:'bar'})).get).isAFunction({withName:'get'});
    });
    
    it("should require constructor to take one non-empty simple Object argument", function() {
        expect(function () {new DependancyInjectionContainer();}).toThrow('Missing required argument');
        expect(function () {new DependancyInjectionContainer(1,2,3);}).toThrow('Too many arguments');
        expect(function () {new DependancyInjectionContainer(1);}).toThrow('1 not a simple object');
        expect(function () {new DependancyInjectionContainer('Fred');}).toThrow('Fred not a simple object');
        expect(function () {new DependancyInjectionContainer({});}).toThrow('argument must be non-empty Object');
    });
    
    it("should create objects whose get() method requires defined keys", function() {
        expect((function () {(new DependancyInjectionContainer({foo:'bar'})).get('baz');})).toThrow('Key "baz" undefined!');
        expect((function () {(new DependancyInjectionContainer({Fred:'bar'})).get('Wilma');})).toThrow('Key "Wilma" undefined!');
        expect((new DependancyInjectionContainer({Fred:'bar'})).get('Fred')).toEqual('bar');
        expect((new DependancyInjectionContainer({Fred:7.5})).get('Fred')).toEqual(7.5);
        expect((new DependancyInjectionContainer({Fred:{Wilma:3}})).get('Fred').Wilma).toEqual(3);
    });
    
    it("should create objects whose get() method returns single instance of function results for keys defined as function", function() {
        var returnNewObject = (function () {return {customTestProperty:'all mine'};});
        expect(returnNewObject() === returnNewObject()).toBeFalsy();
        var testContainer = new DependancyInjectionContainer({special:returnNewObject});
        expect(testContainer.get('special').customTestProperty).toEqual('all mine');
        expect(testContainer.get('special') === testContainer.get('special')).toBeTruthy();
    });
    
    it("should create objects whose get() method that fills in function parameters when requesting result for keys defined as function", function() {
        var testContainer = new DependancyInjectionContainer({
            Greeting: greetingFunc
        });
        expect((function () {testContainer.get('Greeting');})).toThrow('Key "Guest" undefined!');
        testContainer = new DependancyInjectionContainer({
            Greeting: greetingFunc,
            Greeter: 'Fred',
            Guest: 'Wilma' ,
            Location: 'my cave'
        });
        expect(testContainer.get('Greeting')).toEqual('Hello Wilma. I am Fred. Welcome to my cave.');
    });
    
    it("should create objects whose get() method that supports cyclic dependancies", function() {
        var testContainer = new DependancyInjectionContainer({
            Greeting: greetingFunc,
            Greeter: (function (Greeting) {return {
                toString: function () {return 'Fred';},
                getGreeting: function () {return Greeting();}
            };}),
            Guest: 'Wilma' ,
            Location: 'my cave'
        }); 
        expect(testContainer.get('Greeter').getGreeting()).toEqual('Hello Wilma. I am Fred. Welcome to my cave.');
    });
});