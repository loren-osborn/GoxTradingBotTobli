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

	beforeEach(function () {
		this.addMatchers({
			toBeOneOf: toBeOneOfMatcher,
			toEqualOneOf: toEqualOneOfMatcher,
			toBeOfType: toBeOfTypeMatcher,
			toBeOfClass: toBeOfClassMatcher
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

