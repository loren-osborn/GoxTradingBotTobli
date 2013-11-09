var DependancyInjectionContainer = (function () {
	var addConvenienceFunctions = (function addConvenienceFunctions(dicInstance, name) {
		dicInstance['get' + name] = (function getByName() {
			return dicInstance.get(name);
		});
		dicInstance['createNew' + name] = (function createNewByName() {
			var constructor = dicInstance.get(name);
			if ({}.toString.call(constructor) != '[object Function]') {
				throw name + ' is not a function';
			}
			return new constructor();
		});
	});
	var dic = (function DependancyInjectionContainer(specObject) {
		var key;
		var keyCount;
		var valueCache = {};
		var resolvingList = [];
		var expirationMap = {};
		if (arguments.length < 1) {
			throw 'Missing required argument';
		} else if (arguments.length > 1) {
			throw 'Too many arguments';
		} else if (Object.prototype.toString.apply(specObject) != '[object Object]') {
			throw ((specObject.toString()) + ' not a simple object');
		}
		keyCount = 0;
		for (key in specObject) {
			keyCount++;
			addConvenienceFunctions(this, key);
		}
		if (keyCount == 0) {
			throw 'argument must be non-empty Object';
		}
		this.get = (function get(key) {
			var funcArgsPattern = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
			var funcSource;
			var funcArgKeyList;
			var funcArgValueList;
			var i;
			var j;
			if (specObject[key] === undefined) {
				throw ('Key "' + key + '" undefined!');
			}
			if (valueCache[key] === undefined) {
				if (Object.prototype.toString.apply(specObject[key]) == '[object Function]') {
					funcSource = specObject[key].toString();
					funcArgKeyList = funcSource.match(funcArgsPattern)[1].split(/\s*,\s*/m);
					funcArgValueList = [];
					for (i = 0; i < funcArgKeyList.length; i++) {
						if (funcArgKeyList[i] != '') {
							if (!(/^get([A-Z])/.test(funcArgKeyList[i]))) {
								throw ('function argument ' + funcArgKeyList[i] + ' name must start with "get"!');
							}
							funcArgKeyList[i] = funcArgKeyList[i].replace(/^get/,'');
							if (resolvingList.indexOf(funcArgKeyList[i]) >= 0) {
								throw ('cyclical dependancy detected resolving key: ' + funcArgKeyList[i]);
							}
							resolvingList.push(funcArgKeyList[i]);
							for (j = 0; j < resolvingList.length; j++) {
								if (expirationMap[resolvingList[j]] === undefined) {
									expirationMap[resolvingList[j]] = [];
								}
								if (expirationMap[resolvingList[j]].indexOf(key) === -1) {
									expirationMap[resolvingList[j]].push(key);
								}
							}
							funcArgValueList.push((function (c, k) { return (function () { return c.get(k); }); })(this, funcArgKeyList[i]));
							resolvingList.pop();
						}
					}
					valueCache[key] = specObject[key].apply(this, funcArgValueList);
				} else {
					valueCache[key] = specObject[key];
				}
			}
			return valueCache[key];
		});
		this.set = (function set(key, value) {
			var i;
			specObject[key] = value;
			valueCache[key] = undefined;
			if (expirationMap[key] !== undefined) {
				for (i = 0; i < expirationMap[key].length; i++) {
					valueCache[expirationMap[key][i]] = undefined;
				}
			}
			addConvenienceFunctions(this, key);
		});
	});
	dic.wrap = (function wrap(input) {
		var valToReturn = input;
		var methodToCall, objectToCallFrom;
		if (arguments.length == 2) {
			methodToCall = arguments[1];
			objectToCallFrom = arguments[0];
			valToReturn = (function () {
				var args = [].slice.call(arguments, 0);
				return methodToCall.apply(objectToCallFrom, args);
			});
		}
		return (function () { return valToReturn; });
	});
	return dic;
})();

