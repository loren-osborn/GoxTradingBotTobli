(function (jasmine) {
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
            this.message = function() {
                return [
                    this.actual.toString().replace(/^f/, 'F') + " isn't named " + parameterObject.withName + '.',
                    this.actual.toString().replace(/^f/, 'F') + " is named " + parameterObject.withName + '.'
                ];
            };
        } else {
            this.message = function() {
                return [
                    "Expected " + jasmine.pp(this.actual) + ' to be a function.',
                    "Expected " + (this.actual ? this.actual.toString() : 'false') + ' not to be a function.'
                ];
            };
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
        var messageEnding = '';
        var actualStr = jasmine.pp(this.actual);
        var actualSuffix = '';
        var affirmation = ' ';
        var affirmationSuffix = '.';
        var negation = ' not ';
        var negationSuffix = '.';
        var printableArgsList = [];
        var retVal = isAFunctionMatcher.apply(this, cleanParamObj.isFunctionParams);
        var constructorWrapper = null;
        var testObj = null;
        var callableName;
        var specParts = []
        var i;
        if (isAFunctionMatcher.call(this)) {
            actualStr = jasmine.getNameOfFunction(this.actual);
            if (actualStr == null) {
                actualStr = 'anonymous function';
            }
        }
        if (!retVal) {
            messageEnding = 'to be a function';
            if (cleanParamObj.isFunctionParams.length == 1) {
                messageEnding += ' with name ' + cleanParamObj.isFunctionParams[0].withName;
            }
        } else {
            retVal = (this.actual.prototype !== jasmine.undefined) && (this.actual.prototype !== null);
            if (!retVal) {
                messageEnding = 'to have a non-null prototype';
            } else {
                retVal = (this.actual.prototype.constructor === this.actual);
                if (!retVal) {
                    actualSuffix = "'s prototype";
                    messageEnding = 'to point to itself';
                } else {
                    retVal = (cleanParamObj.withParentClass === null) || (Object.getPrototypeOf(this.actual.prototype) === cleanParamObj.withParentClass.prototype);
                    if (!retVal) {
                        actualSuffix = "'s parent class";
                        messageEnding = 'to be ' + getNameOfFunction(cleanParamObj.withParentClass);
                        affirmationSuffix = " instead of " + getNameOfFunction(Object.getPrototypeOf(this.actual.prototype).constructor) + ".";
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
                            messageEnding = 'to create objects of class ' + getNameOfFunction(cleanParamObj.returningObjectOfClass);
                            affirmationSuffix = " instead of objects of class " + getNameOfFunction(testObj.constructor) + ".";
                        } else {
                            messageEnding = 'to be a well behaved constructor';
                            if (cleanParamObj.isFunctionParams.length == 1) {
                                specParts.push('name ' + cleanParamObj.isFunctionParams[0].withName);
                            }
                            if (cleanParamObj.withParentClass) {
                                specParts.push('parent class ' + getNameOfFunction(cleanParamObj.withParentClass));
                            }
                            if (specParts.length > 0) {
                                messageEnding += ' with ' + specParts.join(' and ');
                            }
                            for (i in cleanParamObj.whenCalledWith) {
                                printableArgsList[i] = jasmine.pp(cleanParamObj.whenCalledWith[i]);
                            }
                            callableName = jasmine.getNameOfFunction(this.actual) || ('(' + this.actual.toString() + ')');
                            messageEnding += (
                                ', creating objects of class ' + getNameOfFunction(cleanParamObj.returningObjectOfClass) +
                                ' when called "new ' + callableName + '(' + printableArgsList.join(', ') + ')"'
                            );
                        }
                    }
                }
            }
        }
        this.message = (function() {
            return [
                ('Expected ' + actualStr + actualSuffix + affirmation + messageEnding + affirmationSuffix),
                ('Expected ' + actualStr + actualSuffix + negation + messageEnding + negationSuffix)
            ];
        });
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

        jasmine.getNameOfFunction = (function (func) {
            var isFunction = toBeOfTypeMatcher.apply({actual:func}, ['Function']);
            if (!isFunction) {
                throw ("Expected " + jasmine.pp(func) + " to be a function.");
            }
            var funcSource = func.toString();
            var parsedNameMatches = funcSource.match(/^\s*function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
            return parsedNameMatches ? parsedNameMatches[1] : null;
        });

        jasmine.iterateOverTestDataSets = (function iterateOverTestDataSets(dataSets, paramOverrides, testCallback) {
            var assert = (function assert(condition, message) {
                if (!condition) {
                    throw message;
                }
            });
            assert(arguments.length <= 3, 'Too many parameters.');
            assert(arguments.length == 3, 'Missing required parameters.');
            assert(dataSets.constructor === Array, 'First parameter must be an array.');
            throw 'Second parameter must be null or simple Object.';
        });

        expect.messageWhenExpecting = (function messageWhenExpecting(actual) {
            expect(arguments.length).toEqual(1);
            var expectation = expect(actual);
            var wrapUserFacingMatcher = (function (isNot, matcherName) {
                var wrappedMatcher = (function () {
                    var matcherArgs = Array.prototype.slice.call(arguments, 0);
                    if (!isNot) {
                        expectation = expectation.not;
                    }
                    expectation[matcherName].apply(expectation, matcherArgs);
                    expectation = expect(actual);
                    if (isNot) {
                        expectation = expectation.not;
                    }
                    var result;
                    var realAddMatcherResults = expectation.spec.addMatcherResult;
                    try {
                        expectation.spec.addMatcherResult = (function intercept(r) {
                            result = r;
                        });
                        expectation[matcherName].apply(expectation, matcherArgs);
                        expectation.spec.addMatcherResult = realAddMatcherResults;
                    }
                    catch (e) {
                        expectation.spec.addMatcherResult = realAddMatcherResults;
                        throw e;
                    }
                    return (expect(result.toString()));
                });
                return wrappedMatcher;
            });
            var retVal = {not:{}};
            var name;
            for (name in expectation) {
                if ((name != 'not') && ({}.toString.apply(expectation[name]) === '[object Function]')) {
                    retVal[name] = wrapUserFacingMatcher(false, name);
                    retVal.not[name] = wrapUserFacingMatcher(true, name);
                }
            }
            return retVal;
        });

        expect.expectationFailuresWhenCalling = (function expectationFailuresWhenCalling(testFunc) {
            var dummyExpectation = expect('dummy');
            var resultList = [];
            var realAddMatcherResults = dummyExpectation.spec.addMatcherResult;
            var retVal;
            try {
                dummyExpectation.spec.addMatcherResult = (function intercept(r) {
                    resultList.push( r.passed() ? null : r.toString() );
                });
                testFunc();
                dummyExpectation.spec.addMatcherResult = realAddMatcherResults;
                retVal = (expect(resultList));
                retVal.whichThrows = (function (expectedException) {
                    expect(function () {}).toThrow(expectedException);
                    return (expect(resultList));
                })
            }
            catch (e) {
                dummyExpectation.spec.addMatcherResult = realAddMatcherResults;
                retVal = {
                    toEqual: (function () { throw e; }),
                    whichThrows: (function (expectedException) {
                        expect(e).toEqual(expectedException);
                        return (expect(resultList));
                    })
                };
            }
            return retVal;
        });
    });

    describe("jasmine extensions", function() {
        it("add jasmine.getNameOfFunction() method", function() {
            expect(jasmine.getNameOfFunction).not.toBeUndefined();
            expect(function() {jasmine.getNameOfFunction(null);}).toThrow('Expected null to be a function.');
            expect(function() {jasmine.getNameOfFunction({});}).toThrow('Expected {  } to be a function.');
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
            expect(jasmine.iterateOverTestDataSets).isAFunction({withName: 'iterateOverTestDataSets'});
            expect(jasmine.iterateOverTestDataSets).toThrow('Missing required parameters.');
            expect(function () { jasmine.iterateOverTestDataSets(1); }).toThrow('Missing required parameters.');
            expect(function () { jasmine.iterateOverTestDataSets(1, 2); }).toThrow('Missing required parameters.');
            expect(function () { jasmine.iterateOverTestDataSets(1, 2, 3, 4); }).toThrow('Too many parameters.');
            expect(function () { jasmine.iterateOverTestDataSets(1, 2, 3, 4, 5); }).toThrow('Too many parameters.');
            expect(function () { jasmine.iterateOverTestDataSets(1, 2, 3); }).toThrow('First parameter must be an array.');
            expect(function () { jasmine.iterateOverTestDataSets([], 2, 3); }).toThrow('Second parameter must be null or simple Object.');
        });

        it("adds toBeOneOf() matcher", function() {
            var a = {}, b = {}, c = {}, d = {}, e = {}, f = {};
            expect.messageWhenExpecting(3).not.toBeOneOf([1,3,5,7]).toEqual('Expected 3 not to be one of 1, 3, 5 or 7.');
            expect.messageWhenExpecting(3).toBeOneOf([]).toEqual('Expected 3 to be in the empty set.');
            expect.messageWhenExpecting(3).not.toBeOneOf([3]).toEqual('Expected 3 not to be 3.');
            expect.messageWhenExpecting(3).not.toBeOneOf([3, 5]).toEqual('Expected 3 not to be one of 3 or 5.');
            expect(function () { expect(3).toBeOneOf({name: 'Susie'}); }).toThrow('Expected { name : \'Susie\' } to be an Array.')
            expect(3).not.toBeOneOf([2,4,6,8]);
            expect(2+3).toBeOneOf([1,3,5,7]);
            expect(2+3).not.toBeOneOf([2,4,6,8]);
            expect(a).toBeOneOf([a,b,c,d]);
            expect(e).not.toBeOneOf([a,b,c,d]);
        });

        it("adds toEqualOneOf() matcher", function() {
            var a = {name:'Fred'}, b = {name:'Wilma'}, c = {name:'Barney'}, d = {name:'Betty'}, e = {name:'Fred'}, f = {name:'Bam Bam'};
            expect.messageWhenExpecting(3).not.toEqualOneOf([1,3,5,7]).toEqual('Expected 3 not to equal one of 1, 3, 5 or 7.');
            expect.messageWhenExpecting(3).toEqualOneOf([]).toEqual('Expected 3 to be in the empty set.');
            expect.messageWhenExpecting(3).not.toEqualOneOf([3]).toEqual('Expected 3 not to equal 3.');
            expect.messageWhenExpecting(3).not.toEqualOneOf([3, 5]).toEqual('Expected 3 not to equal one of 3 or 5.');
            expect(function () { expect(3).toBeOneOf({name: 'Susie'}); }).toThrow('Expected { name : \'Susie\' } to be an Array.')
            expect(3).not.toEqualOneOf([2,4,6,8]);
            expect(2+3).toEqualOneOf([1,3,5,7]);
            expect(2+3).not.toEqualOneOf([2,4,6,8]);
            expect(a).toEqualOneOf([a,b,c,d]);
            expect(e).toEqualOneOf([a,b,c,d]);
            expect(f).not.toEqualOneOf([a,b,c,d]);
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
})(jasmine);