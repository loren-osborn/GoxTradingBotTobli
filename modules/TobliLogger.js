getTobliLogger = (function () {
	var validLogLevels = [
		"END_USER",
		"CRITICAL",
		"ERROR",
		"WARNING",
		"NOTICE",
		"INFO",
		"DEBUG",
		"TRACE"];
	return (function getTobliLogger(getTobliDate, getNativeLogFunc, getNativeError) {
		var currentLogLevel = "END_USER";
		var FIXME_parseBacktrace = (function FIXME_parseBacktrace(backtrace) {
			var file = "";
			var line = "";
			try {
				file = backtrace.split("\n")[2].split("/")[3].split(":")[0];
				line = backtrace.split("\n")[2].split("/")[3].split(":")[1];
			} catch (e) {}
			return ("[" + file + ":" + line + "]");
		});
		return {
			setLogLevel: (function setLogLevel(levelName) {
				if ((arguments.length != 1) || (validLogLevels.indexOf(levelName) < 0)) {
					throw "Invalid arguments";
				}
				currentLogLevel = levelName;
			}),
			logLevel: (function logLevel(levelName) {
				var retVal = this;
				if ((arguments.length != 1) || (validLogLevels.indexOf(levelName) < 0)) {
					throw "Invalid arguments";
				}
				if (validLogLevels.indexOf(levelName) > validLogLevels.indexOf(currentLogLevel)) {
					retVal = {
						logNative: (function () {}),
						log: (function () {})
					};
				}
				return retVal;
			}),
			logNative: getNativeLogFunc(),
			log: (function log() {
				var args = [].slice.call(arguments,0);
				var now = new (getTobliDate())();
				var backtrace;
				try {
					backtrace = (new (getNativeError())()).stack;
				} catch (e) {}
				args.unshift(FIXME_parseBacktrace(backtrace));
				args.unshift(now.FIXME_formatUtcDateWithLocalTimeWithSeconds());
				this.logNative.apply(this, args);
			})
		};
	});
})();
