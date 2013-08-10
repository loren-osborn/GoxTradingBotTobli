(function (jasmine) {
	var isAFunctionMatcher = function(parameterObject) {
		// This is a hack I pulled from here: 
		// http://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
		var retVal = (this.actual) && (({}).toString.call(this.actual) === '[object Function]');
		var pattern;
		if (retVal && parameterObject && parameterObject.withName) {
			pattern = new RegExp("^function\\s+" + parameterObject.withName + "\\s*\\(");
			retVal = (this.actual.toString().match(pattern) != null);
			if (!retVal) {
				this.message = function() {
					return ["function '" + this.actual.toString() + "' isn't named " + parameterObject.withName];
				};
			}
		}
		return retVal;
	};
	var toBeAWellBehavedConstructorMatcher = function(parameterObject) {
		parameterObject = parameterObject || {};
		var cleanParamObj = {
			withParentClass:        (parameterObject.withParentClass        || Object     ), 
			whenCalledWith:         (parameterObject.whenCalledWith         || []         ),
			returningObjectOfClass: (parameterObject.returningObjectOfClass || this.actual),
			isFunctionParams:       (parameterObject.withName ? [{'withName': parameterObject.withName}] : [])
		};
		var messages = [];
		var retVal = isAFunctionMatcher.apply(this, cleanParamObj.isFunctionParams);
		var constructorWrapper = null;
		var testObj = null;
		var testSubjectAsString = 
			this.actual.identity || 
			((this.actual === jasmine.undefined) && 'undefined') ||
			((this.actual === null) && 'null') ||
			this.actual.toString();
		if (!retVal) {
			if (this.message) {
				messages.push((this.message())[0]);
			} else if (this.actual.identity) {
				messages.push("Expected " + testSubjectAsString + " to be a function.");
			}
		} else {
			retVal = (this.actual.prototype !== jasmine.undefined) && (this.actual.prototype !== null);
			if (!retVal) {
				messages.push("Expected " + testSubjectAsString + " to have a non-null prototype.");
			} else {
				retVal = (this.actual.prototype.constructor === this.actual);
				if (!retVal) {
					messages.push("Expected " + testSubjectAsString + "'s prototype to point to itself.");
				} else {
					retVal = (Object.getPrototypeOf(this.actual.prototype) === cleanParamObj.withParentClass.prototype);
					if (!retVal) {
						messages.push("Expected different parent class.");
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
			isAFunction: isAFunctionMatcher,
			toBeAWellBehavedConstructor: toBeAWellBehavedConstructorMatcher
		});
	});
})(jasmine);