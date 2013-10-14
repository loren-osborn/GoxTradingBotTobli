(function (jasmine) {
    jasmine.getNameOfFunction = (function (func) {
        var isFunction = toBeOfTypeMatcher.apply({actual:func}, ['Function']);
        if (!isFunction) {
            throw ("Expected " + jasmine.pp(func) + " to be of type 'Function'.");
        }
        var funcSource = func.toString();
        var parsedNameMatches = funcSource.match(/^\s*function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
        return parsedNameMatches ? parsedNameMatches[1] : null;
    });

    var oneOfGenerator = function oneOfGenerator(name, comparison) {
        return (function(possibleValues) {
            var retVal = false;
            var i, setName, last, nonLast;
            if (toBeOfTypeMatcher.call({actual: possibleValues}, 'Array')) {
                nonLast = [];
                for (i = 0; i < possibleValues.length; i++) {
                    retVal = retVal || comparison(this.actual, possibleValues[i]);
                    nonLast[i] = jasmine.pp(possibleValues[i]);
                }
                switch (possibleValues.length) {
                    case 0:
                        setName = 'be in the empty set';
                        break;
                    case 1:
                        setName = name + ' ' + nonLast[0];
                        break;
                    default:
                        last = nonLast.pop();
                        setName = name + ' one of ' + [nonLast.join(', '), last].join(' or ');
                        break;
                }
                this.message = function () {
                    return [
                        ('Expected ' + jasmine.pp(this.actual) + ' to ' + setName + '.'),
                        ('Expected ' + jasmine.pp(this.actual) + ' not to ' + setName + '.')
                    ];
                }
            } else {
                throw ('Expected ' + jasmine.pp(possibleValues) + ' to be an Array.');
            }
            return retVal;
        });
    };

    var toBeOneOfMatcher = oneOfGenerator('be', (function (a,b) { return (a === b) }));
    var toEqualOneOfMatcher = oneOfGenerator('equal', (function (a,b) { return jasmine.getEnv().equals_(a,b); }));

    var toBeOfTypeMatcher = function(typeName) {
        return (this.actual) && (({}).toString.call(this.actual) === ('[object ' + typeName + ']'));
    };
    var toBeOfClassMatcher = function(className) {
        return (this.actual) && toBeOfTypeMatcher.apply({actual: this.actual.constructor}, ['Function']) && (jasmine.getNameOfFunction(this.actual.constructor) == className);
    };
    var isAFunctionMatcher = function(parameterObject) {
        // This is a hack I pulled from here: 
        // http://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
        var retVal = (this.actual) && toBeOfTypeMatcher.apply(this, ['Function']);
        var fnName;
        if (retVal && parameterObject && parameterObject.withName) {
            fnName = jasmine.getNameOfFunction(this.actual);
            retVal = (fnName == parameterObject.withName);
            if (!retVal) {
                this.message = function() {
                    return ["function '" + this.actual.toString() + "' isn't named " + parameterObject.withName];
                };
            }
        }
        return retVal;
    };
    var toBeAWellBehavedConstructorMatcher = function(parameterObject) {
        var getNameOfFunction = (function getNameOfFunction(func) {
            var result = jasmine.getNameOfFunction(func);
            return ((result == null) ? '(anonymous)' : result);
        });
        parameterObject = parameterObject || {};
        var cleanParamObj = {
            withParentClass:        (parameterObject.withParentClass        || Object     ), 
            whenCalledWith:         (parameterObject.whenCalledWith         || []         ),
            returningObjectOfClass: (parameterObject.returningObjectOfClass || this.actual),
            isFunctionParams:       (parameterObject.withName ? [{'withName': parameterObject.withName}] : [])
        };
        if (parameterObject.withArbitrary == 'parentClass') {
            cleanParamObj.withParentClass = null;
        }
        var messages = [];
        var retVal = isAFunctionMatcher.apply(this, cleanParamObj.isFunctionParams);
        var constructorWrapper = null;
        var testObj = null;
        if (!retVal) {
            if (this.message) {
                messages.push((this.message())[0]);
            } else {
                messages.push("Expected " + jasmine.pp(this.actual) + " to be a function.");
            }
        } else {
            retVal = (this.actual.prototype !== jasmine.undefined) && (this.actual.prototype !== null);
            if (!retVal) {
                messages.push("Expected " + jasmine.pp(this.actual) + " to have a non-null prototype.");
            } else {
                retVal = (this.actual.prototype.constructor === this.actual);
                if (!retVal) {
                    messages.push("Expected " + jasmine.pp(this.actual) + "'s prototype to point to itself.");
                } else {
                    retVal = (cleanParamObj.withParentClass === null) || (Object.getPrototypeOf(this.actual.prototype) === cleanParamObj.withParentClass.prototype);
                    if (!retVal) {
                        messages.push("Expected parent class " + getNameOfFunction(cleanParamObj.withParentClass) + " instead of " + getNameOfFunction(Object.getPrototypeOf(this.actual.prototype).constructor) + ".");
                    } else {
                        constructorWrapper = function (constructor) {
                            return constructor.apply(this, cleanParamObj.whenCalledWith);
                        };
                        constructorWrapper.prototype = this.actual.prototype;
                        testObj = new constructorWrapper(this.actual);
                        retVal =
                            testObj &&
                            (testObj instanceof cleanParamObj.returningObjectOfClass) &&
                            (testObj.constructor === cleanParamObj.returningObjectOfClass) &&
                            (Object.getPrototypeOf(testObj) === cleanParamObj.returningObjectOfClass.prototype);
                        if (!retVal) {
                            messages.push("Constructor doesn't return object of requested type.");
                        }
                    }
                }
            }
        }
        if (!retVal) {
            this.message = function() {
                return messages;
            };
        }
        return retVal;
    };
    beforeEach(function() {
        this.addMatchers({
            toBeOneOf: toBeOneOfMatcher,
            toEqualOneOf: toEqualOneOfMatcher,
            toBeOfType: toBeOfTypeMatcher,
            toBeOfClass: toBeOfClassMatcher,
            isAFunction: isAFunctionMatcher,
            toBeAWellBehavedConstructor: toBeAWellBehavedConstructorMatcher
        });
    });
    describe("jasmine extensions", function() {
        it("add jasmine.getNameOfFunction() method", function() {
            expect(jasmine.getNameOfFunction).not.toBeUndefined();
            expect(function() {jasmine.getNameOfFunction();}).toThrow('Expected undefined to be of type \'Function\'.');
            expect(function() {jasmine.getNameOfFunction({});}).toThrow('Expected {  } to be of type \'Function\'.');
            expect(jasmine.getNameOfFunction(function () {})).toBeNull();
            expect(jasmine.getNameOfFunction(function doSomethingCool() {})).toEqual('doSomethingCool');
            expect(jasmine.getNameOfFunction(function callMe() {})).toEqual('callMe');
        });

        jasmine.expectMessageFromExpecting = (function expectMessageFromExpecting(value, matcherName, matcherArgs) {
            var isNot = (arguments[1] == 'not');
            if (isNot) {
                matcherName = arguments[2];
                matcherArgs = (arguments.length == 4) ? arguments[3] : null;
            }
            expect(arguments.length - (isNot ? 1 : 0)).toEqualOneOf([2,3]);
            matcherArgs = matcherArgs || [];
            var expectation = expect(value);
            if (!isNot) {
                expectation = expectation.not;
            }
            expectation[matcherName].apply(expectation, matcherArgs);
            expectation = expect(value);
            if (isNot) {
                expectation = expectation.not;
            }
            var result;
            var realAddMatcherResults = expectation.spec.addMatcherResult;
            expectation.spec.addMatcherResult = (function intercept(r) { result = r; });
            expectation[matcherName].apply(expectation, matcherArgs);
            expectation.spec.addMatcherResult = realAddMatcherResults;
            return (expect(result.toString()));
        });

        it("add jasmine.expectMessageFromExpecting() method", function() {
            jasmine.expectMessageFromExpecting(0, 'toEqual', [1]).toEqual('Expected 0 to equal 1.');
        });

        it("adds toBeOneOf() matcher", function() {
            var a = {}, b = {}, c = {}, d = {}, e = {}, f = {};
            jasmine.expectMessageFromExpecting(3, 'not', 'toBeOneOf', [[1,3,5,7]]).toEqual('Expected 3 not to be one of 1, 3, 5 or 7.');
            jasmine.expectMessageFromExpecting(3, 'toBeOneOf', [[]]).toEqual('Expected 3 to be in the empty set.');
            jasmine.expectMessageFromExpecting(3, 'not', 'toBeOneOf', [[3]]).toEqual('Expected 3 not to be 3.');
            jasmine.expectMessageFromExpecting(3, 'not', 'toBeOneOf', [[3, 5]]).toEqual('Expected 3 not to be one of 3 or 5.');
            expect(function () { expect(3).toBeOneOf({name: 'Susie'}); }).toThrow('Expected { name : \'Susie\' } to be an Array.')
            expect(3).not.toBeOneOf([2,4,6,8]);
            expect(2+3).toBeOneOf([1,3,5,7]);
            expect(2+3).not.toBeOneOf([2,4,6,8]);
            expect(a).toBeOneOf([a,b,c,d]);
            expect(e).not.toBeOneOf([a,b,c,d]);
        });

        it("adds toEqualOneOf() matcher", function() {
            var a = {name:'Fred'}, b = {name:'Wilma'}, c = {name:'Barney'}, d = {name:'Betty'}, e = {name:'Fred'}, f = {name:'Bam Bam'};
            jasmine.expectMessageFromExpecting(3, 'not', 'toEqualOneOf', [[1,3,5,7]]).toEqual('Expected 3 not to equal one of 1, 3, 5 or 7.');
            jasmine.expectMessageFromExpecting(3, 'toEqualOneOf', [[]]).toEqual('Expected 3 to be in the empty set.');
            jasmine.expectMessageFromExpecting(3, 'not', 'toEqualOneOf', [[3]]).toEqual('Expected 3 not to equal 3.');
            jasmine.expectMessageFromExpecting(3, 'not', 'toEqualOneOf', [[3, 5]]).toEqual('Expected 3 not to equal one of 3 or 5.');
            expect(function () { expect(3).toBeOneOf({name: 'Susie'}); }).toThrow('Expected { name : \'Susie\' } to be an Array.')
            expect(3).not.toEqualOneOf([2,4,6,8]);
            expect(2+3).toEqualOneOf([1,3,5,7]);
            expect(2+3).not.toEqualOneOf([2,4,6,8]);
            expect(a).toEqualOneOf([a,b,c,d]);
            expect(e).toEqualOneOf([a,b,c,d]);
            expect(f).not.toEqualOneOf([a,b,c,d]);
        });

        it("adds toBeOfType() matcher", function() {
            jasmine.expectMessageFromExpecting(3, 'not', 'toBeOfType', ['Number']).toEqual('Expected 3 not to be of type \'Number\'.');
            jasmine.expectMessageFromExpecting('3', 'toBeOfType', ['Number']).toEqual('Expected \'3\' to be of type \'Number\'.');
            expect('3').toBeOfType('String');
            expect({}).not.toBeOfType('String');
            expect({}).toBeOfType('Object');
            var Television = (function Television() {});
            var tv = new Television();
            expect(tv).toBeOfType('Object');
            expect(jasmine.getNameOfFunction(tv.constructor)).toEqual('Television');
        });

        it("adds toBeOfClass() matcher", function() {
            jasmine.expectMessageFromExpecting(3, 'not', 'toBeOfClass', ['Number']).toEqual('Expected 3 not to be of class \'Number\'.');
            jasmine.expectMessageFromExpecting('3', 'toBeOfClass', ['Number']).toEqual('Expected \'3\' to be of class \'Number\'.');
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
            expect(null).not.isAFunction();
            expect({}).not.isAFunction();
            expect(anonymousFunc).isAFunction();
            expect(doSomethingCool).isAFunction();
            expect(callMe).isAFunction();
            expect(anonymousFunc).not.isAFunction({withName: 'foo'});
            expect(doSomethingCool).isAFunction({withName: 'doSomethingCool'});
            expect(callMe).isAFunction({withName: 'callMe'});
            expect(doSomethingCool).not.isAFunction({withName: 'callMe'});
            expect(callMe).not.isAFunction({withName: 'doSomethingCool'});
        });

        it("add toBeAWellBehavedConstructor() matcher", function() {
            var anonymousConstructor = (function () {});
            var Apple = (function Apple() {});
            var Banana = (function Banana() {});
            expect(null).not.toBeAWellBehavedConstructor();
            expect({}).not.toBeAWellBehavedConstructor();
            expect(anonymousConstructor).toBeAWellBehavedConstructor();
            expect(Apple).toBeAWellBehavedConstructor();
            expect(Banana).toBeAWellBehavedConstructor();
            expect(anonymousConstructor).not.toBeAWellBehavedConstructor({withName: 'Carrot'});
            expect(Apple).toBeAWellBehavedConstructor({withName: 'Apple'});
            expect(Banana).toBeAWellBehavedConstructor({withName: 'Banana'});
            expect(Apple).not.toBeAWellBehavedConstructor({withName: 'Banana'});
            expect(Banana).not.toBeAWellBehavedConstructor({withName: 'Apple'});
            var HasNullPrototype = (function () {});
            HasNullPrototype.prototype = null;
            var HasUndefPrototype = (function () {});
            HasUndefPrototype.prototype = undefined;
            expect(HasNullPrototype).not.toBeAWellBehavedConstructor();
            expect(HasUndefPrototype).not.toBeAWellBehavedConstructor();
            var HasNullConstructor = (function () {});
            HasNullConstructor.prototype.constructor = null;
            var HasUndefConstructor = (function () {});
            HasUndefConstructor.prototype.constructor = undefined;
            expect(HasNullConstructor).not.toBeAWellBehavedConstructor();
            expect(HasUndefConstructor).not.toBeAWellBehavedConstructor();
            var Vehicle = (function Vehicle() {});
            var Car = (function Car() {});
            Car.prototype = Object.create(Vehicle.prototype);
            Car.prototype.constructor = Car;
            expect(Car).not.toBeAWellBehavedConstructor();
            expect(Car).toBeAWellBehavedConstructor({withParentClass: Vehicle});
            expect(Car).toBeAWellBehavedConstructor({withArbitrary: 'parentClass'});
            var Boat = (function Boat() {});
            Boat.prototype = Object.create(Vehicle.prototype);
            Boat.prototype.constructor = Boat;
            var LostBoat = (function LostBoat() {});
            LostBoat.prototype = Object.create(Boat.prototype);
            expect(LostBoat).not.toBeAWellBehavedConstructor({withParentClass: Boat});
        });

    });
})(jasmine);