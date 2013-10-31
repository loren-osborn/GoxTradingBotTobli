getTobliLogger = (function () {
	return (function getTobliLogger(getTobliDate, getNativeLogFunc, getNativeError) {
		var FIXME_parseBacktrace = (function FIXME_parseBacktrace(backtrace) {
			var file = '';
			var line = '';
			try {
				file = backtrace.split('\n')[2].split('/')[3].split(':')[0];
				line = backtrace.split('\n')[2].split('/')[3].split(':')[1];
			} catch (e) {}
			return ('[' + file + ':' + line + ']');
		});
		return {log: (function log() {
			var args = [].slice.call(arguments,0);
			var now = new (getTobliDate())();
			var file = '';
			var line = '';
			var backtrace;
			try {
				backtrace = (new (getNativeError())()).stack;
			} catch (e) {}
			args.unshift(FIXME_parseBacktrace(backtrace));
			args.unshift(now.FIXME_formatUtcDateWithLocalTimeWithSeconds());
			(getNativeLogFunc()).apply(window.console, args);
		})};
	});
})();
