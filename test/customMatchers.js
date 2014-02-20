(function (jasmine) {
	var oneOfGenerator = function oneOfGenerator(name, comparison) {
		return (function (possibleValues) {
			var retVal = false;
			var i, setName, last, nonLast;
			if (toBeOfTypeMatcher.call({actual: possibleValues}, "Array")) {
				nonLast = [];
				for (i = 0; i < possibleValues.length; i++) {
					retVal = retVal || comparison(this.actual, possibleValues[i]);
					nonLast[i] = jasmine.pp(possibleValues[i]);
				}
				switch (possibleValues.length) {
					case 0:
						setName = "be in the empty set";
						break;
					case 1:
						setName = name + " " + nonLast[0];
						break;
					default:
						last = nonLast.pop();
						setName = name + " one of " + [nonLast.join(", "), last].join(" or ");
						break;
				}
				this.message = function () {
					return [
						("Expected " + jasmine.pp(this.actual) + " to " + setName + "."),
						("Expected " + jasmine.pp(this.actual) + " not to " + setName + ".")
					];
				}
			} else {
				throw ("Expected " + jasmine.pp(possibleValues) + " to be an Array.");
			}
			return retVal;
		});
	};

	var toBeOneOfMatcher = oneOfGenerator("be", (function (a, b) { return (a === b); }));
	var toEqualOneOfMatcher = oneOfGenerator("equal", (function (a, b) { return jasmine.getEnv().equals_(a, b); }));

	var toBeOfTypeMatcher = function (typeName) {
		return (this.actual) && (({}).toString.call(this.actual) === ("[object " + typeName + "]"));
	};
	var toBeOfClassMatcher = function (className) {
		return (this.actual) && toBeOfTypeMatcher.apply({actual: this.actual.constructor}, ["Function"]) && (jasmine.getNameOfFunction(this.actual.constructor) == className);
	};
	var isAFunctionMatcher = function (parameterObject) {
		// This is a hack I pulled from here:
		// http://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
		var retVal = (this.actual) && toBeOfTypeMatcher.apply(this, ["Function"]);
		var fnName;
		if (retVal && parameterObject && parameterObject.withName) {
			fnName = jasmine.getNameOfFunction(this.actual);
			retVal = (fnName == parameterObject.withName);
			this.message = function () {
				return [
					this.actual.toString().replace(/^f/, "F") + " isn't named " + parameterObject.withName + ".",
					this.actual.toString().replace(/^f/, "F") + " is named " + parameterObject.withName + "."
				];
			};
		} else {
			this.message = function () {
				return [
					"Expected " + jasmine.pp(this.actual) + " to be a function.",
					"Expected " + (this.actual ? this.actual.toString() : "false") + " not to be a function."
				];
			};
		}
		return retVal;
	};
	var toBeAWellBehavedConstructorMatcher = function (parameterObject) {
		var getNameOfFunction = (function getNameOfFunction(func) {
			var result = jasmine.getNameOfFunction(func);
			return ((result == null) ? "(anonymous)" : result);
		});
		parameterObject = parameterObject || {};
		var cleanParamObj = {
			withParentClass: (parameterObject.withParentClass || Object),
			whenCalledWith: (parameterObject.whenCalledWith || []),
			returningObjectOfClass: (parameterObject.returningObjectOfClass || this.actual),
			isFunctionParams: (parameterObject.withName ? [{"withName": parameterObject.withName}] : [])
		};
		if (parameterObject.withArbitrary == "parentClass") {
			cleanParamObj.withParentClass = null;
		}
		var messageEnding = "";
		var actualStr = jasmine.pp(this.actual);
		var actualSuffix = "";
		var affirmation = " ";
		var affirmationSuffix = ".";
		var negation = " not ";
		var negationSuffix = ".";
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
				actualStr = "anonymous function";
			}
		}
		if (!retVal) {
			messageEnding = "to be a function";
			if (cleanParamObj.isFunctionParams.length == 1) {
				messageEnding += " with name " + cleanParamObj.isFunctionParams[0].withName;
			}
		} else {
			retVal = (this.actual.prototype !== jasmine.undefined) && (this.actual.prototype !== null);
			if (!retVal) {
				messageEnding = "to have a non-null prototype";
			} else {
				retVal = (this.actual.prototype.constructor === this.actual);
				if (!retVal) {
					actualSuffix = "'s prototype";
					messageEnding = "to point to itself";
				} else {
					retVal = (cleanParamObj.withParentClass === null) || (Object.getPrototypeOf(this.actual.prototype) === cleanParamObj.withParentClass.prototype);
					if (!retVal) {
						actualSuffix = "'s parent class";
						messageEnding = "to be " + getNameOfFunction(cleanParamObj.withParentClass);
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
							messageEnding = "to create objects of class " + getNameOfFunction(cleanParamObj.returningObjectOfClass);
							affirmationSuffix = " instead of objects of class " + getNameOfFunction(testObj.constructor) + ".";
						} else {
							messageEnding = "to be a well behaved constructor";
							if (cleanParamObj.isFunctionParams.length == 1) {
								specParts.push("name " + cleanParamObj.isFunctionParams[0].withName);
							}
							if (cleanParamObj.withParentClass) {
								specParts.push("parent class " + getNameOfFunction(cleanParamObj.withParentClass));
							}
							if (specParts.length > 0) {
								messageEnding += " with " + specParts.join(" and ");
							}
							for (i in cleanParamObj.whenCalledWith) {
								printableArgsList[i] = jasmine.pp(cleanParamObj.whenCalledWith[i]);
							}
							callableName = jasmine.getNameOfFunction(this.actual) || ("(" + this.actual.toString() + ")");
							messageEnding += (
								", creating objects of class " + getNameOfFunction(cleanParamObj.returningObjectOfClass) +
								" when called \"new " + callableName + "(" + printableArgsList.join(", ") + ")\""
							);
						}
					}
				}
			}
		}
		this.message = (function () {
			return [
				("Expected " + actualStr + actualSuffix + affirmation + messageEnding + affirmationSuffix),
				("Expected " + actualStr + actualSuffix + negation + messageEnding + negationSuffix)
			];
		});
		return retVal;
	};
	beforeEach(function () {
		this.addMatchers({
			toBeOneOf: toBeOneOfMatcher,
			toEqualOneOf: toEqualOneOfMatcher,
			toBeOfType: toBeOfTypeMatcher,
			toBeOfClass: toBeOfClassMatcher,
			isAFunction: isAFunctionMatcher,
			toBeAWellBehavedConstructor: toBeAWellBehavedConstructorMatcher
		});

		jasmine.getNameOfFunction = (function (func) {
			var isFunction = toBeOfTypeMatcher.apply({actual:func}, ["Function"]);
			if (!isFunction) {
				throw ("Expected " + jasmine.pp(func) + " to be a function.");
			}
			var funcSource = func.toString();
			var parsedNameMatches = funcSource.match(/^\s*function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
			return parsedNameMatches ? parsedNameMatches[1] : null;
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
				if ((name != "not") && ({}.toString.apply(expectation[name]) === "[object Function]")) {
					retVal[name] = wrapUserFacingMatcher(false, name);
					retVal.not[name] = wrapUserFacingMatcher(true, name);
				}
			}
			return retVal;
		});
	});
})(jasmine);

