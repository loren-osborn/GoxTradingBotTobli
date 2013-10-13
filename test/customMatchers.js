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

    var toBeOneOfMatcher = function(possibleValues) {
        var retVal = false;
        var i
        for (i = 0; !retVal && (i < possibleValues.length); i++) {
            retVal = (this.actual === possibleValues[i]);
        }
        return retVal;
    };
    var toEqualOneOfMatcher = function(possibleValues) {
        var retVal = false;
        var i
        for (i = 0; !retVal && (i < possibleValues.length); i++) {
            retVal = this.env.equals_(this.actual, possibleValues[i]);
        }
        return retVal;
    };
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
            } else if (this.actual.identity) {
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

        it("adds toBeOneOf() matcher", function() {
            var a = {}, b = {}, c = {}, d = {}, e = {}, f = {};
            expect(3).toBeOneOf([1,3,5,7]);
            expect(3).not.toBeOneOf([2,4,6,8]);
            expect(2+3).toBeOneOf([1,3,5,7]);
            expect(2+3).not.toBeOneOf([2,4,6,8]);
            expect(a).toBeOneOf([a,b,c,d]);
            expect(e).not.toBeOneOf([a,b,c,d]);
        });

        it("adds toEqualOneOf() matcher", function() {
            var a = {name:'Fred'}, b = {name:'Wilma'}, c = {name:'Barney'}, d = {name:'Betty'}, e = {name:'Fred'}, f = {name:'Bam Bam'};
            expect(3).toEqualOneOf([1,3,5,7]);
            expect(3).not.toEqualOneOf([2,4,6,8]);
            expect(2+3).toEqualOneOf([1,3,5,7]);
            expect(2+3).not.toEqualOneOf([2,4,6,8]);
            expect(a).toEqualOneOf([a,b,c,d]);
            expect(e).toEqualOneOf([a,b,c,d]);
            expect(f).not.toEqualOneOf([a,b,c,d]);
        });

        it("adds toBeOfType() matcher", function() {
            expect(3).toBeOfType('Number');
            expect('3').not.toBeOfType('Number');
            expect('3').toBeOfType('String');
            expect({}).not.toBeOfType('String');
            expect({}).toBeOfType('Object');
            var Television = (function Television() {});
            var tv = new Television();
            expect(tv).toBeOfType('Object');
            expect(jasmine.getNameOfFunction(tv.constructor)).toEqual('Television');
        });

        it("adds toBeOfClass() matcher", function() {
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
            expect(null).not.isAFunction();
            expect({}).not.isAFunction();
            expect(function () {}).isAFunction();
            expect(function doSomethingCool() {}).isAFunction();
            expect(function callMe() {}).isAFunction();
            expect(function () {}).not.isAFunction({withName: 'foo'});
            expect(function doSomethingCool() {}).isAFunction({withName: 'doSomethingCool'});
            expect(function callMe() {}).isAFunction({withName: 'callMe'});
            expect(function doSomethingCool() {}).not.isAFunction({withName: 'callMe'});
            expect(function callMe() {}).not.isAFunction({withName: 'doSomethingCool'});
        });

    });
})(jasmine);