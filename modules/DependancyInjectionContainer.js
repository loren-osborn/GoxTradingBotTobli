var DependancyInjectionContainer = (function () {
	return (function DependancyInjectionContainer(specObject) {
		var key;
		var keyCount;
		var valueCache = {};
		var resolvingList = [];
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
							if (resolvingList.indexOf(funcArgKeyList[i]) >= 0) {
								throw ('cyclical dependancy detected resolving key: ' + funcArgKeyList[i]);
							}
							resolvingList.push(funcArgKeyList[i]);
							funcArgValueList.push((function (c, k) { return (function () { return c.get(k); });})(this, funcArgKeyList[i]));
							resolvingList.pop();
						}
					}
					valueCache[key] = specObject[key].apply(specObject[key], funcArgValueList);
				} else {
					valueCache[key] = specObject[key];
				}
			}
			return valueCache[key];
		});
	});
})();