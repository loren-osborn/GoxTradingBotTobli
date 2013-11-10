describe('getTobliLogger', function () {
	// Sample backtrace from Google Chrome 30.0.1599.101
	// *FIXME* backtrace parser is broken
	// Test against real Error constructor to ensure forward compatibility
	var sampleBackTrace =
		"Error\n" +
		" at Object.log (file:///Users/linux_dr/src/bitcoin/GoxTradingBotTobli/modules/TobliLogger.js:10:17)\n" +
		" at null.<anonymous> (file:///Users/my_name/src/GoxTradingBotTobli/test/spec/SpecTobliLogger.js:49:42)\n" +
		" at jasmine.Block.execute (file:///Users/my_name/src/GoxTradingBotTobli/test/lib/jasmine-1.3.1/jasmine.js:1064:17)\n" +
		" at jasmine.Queue.next_ (file:///Users/my_name/src/GoxTradingBotTobli/test/lib/jasmine-1.3.1/jasmine.js:2096:31)\n" +
		" at jasmine.Queue.start (file:///Users/my_name/src/GoxTradingBotTobli/test/lib/jasmine-1.3.1/jasmine.js:2049:8)\n" +
		" at jasmine.Spec.execute (file:///Users/my_name/src/GoxTradingBotTobli/test/lib/jasmine-1.3.1/jasmine.js:2376:14)\n" +
		" at jasmine.Queue.next_ (file:///Users/my_name/src/GoxTradingBotTobli/test/lib/jasmine-1.3.1/jasmine.js:2096:31)\n" +
		" at jasmine.Queue.start (file:///Users/my_name/src/GoxTradingBotTobli/test/lib/jasmine-1.3.1/jasmine.js:2049:8)\n" +
		" at jasmine.Suite.execute (file:///Users/my_name/src/GoxTradingBotTobli/test/lib/jasmine-1.3.1/jasmine.js:2521:14)\n" +
		" at jasmine.Queue.next_ (file:///Users/my_name/src/GoxTradingBotTobli/test/lib/jasmine-1.3.1/jasmine.js:2096:31)";

	var expectedLogLevels = [
		'END_USER',
		'CRITICAL',
		'ERROR',
		'WARNING',
		'NOTICE',
		'INFO',
		'DEBUG',
		'TRACE'];

	it('should be a function', function () {
		expect(getTobliLogger).isAFunction({withName:'getTobliLogger'});
	});

	var verifyCustomLogRan = (function verifyCustomLogRan(fakeLogFunc, formattedDate, traceData, callerArgs) {
		expect(fakeLogFunc.calls.length).toEqual(1);
		expect(fakeLogFunc.calls[0].args[0]).toEqual(formattedDate);
		expect(fakeLogFunc.calls[0].args[1]).toEqual('[' + traceData.file + ':' + traceData.line + ']');
		expect(fakeLogFunc.calls[0].args.slice(2)).toEqual(callerArgs);
	});

	var verifyNativeLogRan = (function verifyCustomLogRan(fakeLogFunc, callerArgs) {
		expect(fakeLogFunc.calls.length).toEqual(1);
		expect(fakeLogFunc.calls[0].args).toEqual(callerArgs);
	});

	var verifyLogDidNotRun = (function verifyCustomLogRan(fakeLogFunc) {
		expect(fakeLogFunc.wasCalled).toEqual(false);
	});

	it('should return an object with a log() method that calls the expected methods on container objects', function () {
		jasmine.iterateOverTestDataSets([
				{name: 'formattedDates', data: ['yesterday', 'a long time ago', '2000-01-01 11:12:13']},
				{name: 'traceData', data: [
					{trace: sampleBackTrace, file: 'Users', line: undefined},
					{trace: "line 1\nline 2\nline 3/after 1st slash/after 2nd slash/after 3rd slash before colon:after 1st colon:after 2nd colon/after 4th slash\nline 4", file: 'after 3rd slash before colon', line: 'after 1st colon'},
					{trace: "line 1//:/:\nline 2//:/:\nline 3/after 1st ::slash/after ::2nd slash/after 3rd slash before colon:after 1st colon:after 2nd colon/after 4th slash::://::\nline 4//:/:", file: 'after 3rd slash before colon', line: 'after 1st colon'}]},
				{name: 'callerArgs', data: [[], [1, 2, 3], ['a'], ['b', 'c', 'de', 'f']]}],
			null,
			(function (formattedDate, traceData, callerArgs) {
				var fakeDate = {FIXME_formatUtcDateWithLocalTimeWithSeconds: (function () { return formattedDate; })};
				var fakeDateConstructor = (function () {
					expect(arguments.length).toEqual(0);
					return fakeDate;
				});
				var fakeErrorConstructor = (function () {
					expect(arguments.length).toEqual(0);
					return {stack: traceData.trace};
				});
				var fakeLogFunc = jasmine.createSpy("fake log function");
				var i;
				var fakeLoggerContainer = new DependancyInjectionContainer({
					TobliDate: DependancyInjectionContainer.wrap(fakeDateConstructor),
					TobliLogger: getTobliLogger,
					NativeError: DependancyInjectionContainer.wrap(fakeErrorConstructor),
					NativeLogFunc: DependancyInjectionContainer.wrap(fakeLogFunc)
				});
				var logger = fakeLoggerContainer.get('TobliLogger');
				expect(logger.log).isAFunction({withName:'log'});
				logger.log.apply(logger, callerArgs);
				verifyCustomLogRan(fakeLogFunc, formattedDate, traceData, callerArgs);
				for (i = 0; i < expectedLogLevels.length; i++) {
					fakeLogFunc = jasmine.createSpy("fake log function");
					fakeLoggerContainer = new DependancyInjectionContainer({
						TobliDate: DependancyInjectionContainer.wrap(fakeDateConstructor),
						TobliLogger: getTobliLogger,
						NativeError: DependancyInjectionContainer.wrap(fakeErrorConstructor),
						NativeLogFunc: DependancyInjectionContainer.wrap(fakeLogFunc)
					});
					logger = fakeLoggerContainer.get('TobliLogger');
					logger.setLogLevel(expectedLogLevels[i]);
					logger.log.apply(logger, callerArgs);
					verifyCustomLogRan(fakeLogFunc, formattedDate, traceData, callerArgs);
				}
			})
		);
	});

	it('should return an object with a logNative() method that calls the expected methods on container objects', function () {
		jasmine.iterateOverTestDataSets([
				{name: 'callerArgs', data: [[], [1, 2, 3], ['a'], ['b', 'c', 'de', 'f']]}],
			null,
			(function (callerArgs) {
				var fakeLogFunc = jasmine.createSpy("fake log function");
				var fakeLoggerContainer = new DependancyInjectionContainer({
					TobliLogger: getTobliLogger,
					NativeLogFunc: DependancyInjectionContainer.wrap(fakeLogFunc)
				});
				var logger = fakeLoggerContainer.get('TobliLogger');
				var i;
				expect(logger.logNative).isAFunction();
				logger.logNative.apply(logger, callerArgs);
				verifyNativeLogRan(fakeLogFunc, callerArgs);
				for (i = 0; i < expectedLogLevels.length; i++) {
					fakeLogFunc = jasmine.createSpy("fake log function");
					fakeLoggerContainer = new DependancyInjectionContainer({
						TobliLogger: getTobliLogger,
						NativeLogFunc: DependancyInjectionContainer.wrap(fakeLogFunc)
					});
					logger = fakeLoggerContainer.get('TobliLogger');
					logger.setLogLevel(expectedLogLevels[i]);
					logger.logNative.apply(logger, callerArgs);
					verifyNativeLogRan(fakeLogFunc, callerArgs);
				}
			})
		);
	});

	it('should return an object with a logLevel() method that responds to correct values', function () {
		jasmine.iterateOverTestDataSets([
				{name: 'invalidArgs', data: [[], [1, 2, 3], ['a'], [[]], ['DEBUG','foo'], [{}], ['foo'], ['bar'], ['baz']]}],
			null,
			(function (invalidArgs) {
				var fakeLoggerContainer = new DependancyInjectionContainer({
					TobliLogger: getTobliLogger,
					NativeLogFunc: {}
				});
				var i;
				var logger = fakeLoggerContainer.get('TobliLogger');
				expect(function () {logger.logLevel.apply(logger, invalidArgs)}).toThrow('Invalid arguments');
				fakeLoggerContainer = new DependancyInjectionContainer({
					TobliLogger: getTobliLogger,
					NativeLogFunc: {}
				});
				logger = fakeLoggerContainer.get('TobliLogger');
				expect(function () {logger.setLogLevel.apply(logger, invalidArgs)}).toThrow('Invalid arguments');
				for (i = 0; i < expectedLogLevels.length; i++) {
					fakeLoggerContainer = new DependancyInjectionContainer({
						TobliLogger: getTobliLogger,
						NativeLogFunc: {}
					});
					logger = fakeLoggerContainer.get('TobliLogger');
					logger.setLogLevel(expectedLogLevels[i]);
					expect(function () {logger.logLevel.apply(logger, invalidArgs)}).toThrow('Invalid arguments');
				}
			})
		);
	});

	it('should return an object with a logLevel() method that properly augments log() method', function () {
		jasmine.iterateOverTestDataSets([
				{name: 'formattedDates', data: ['yesterday', 'a long time ago', '2000-01-01 11:12:13']},
				{name: 'traceData', data: [
					{trace: sampleBackTrace, file: 'Users', line: undefined},
					{trace: "line 1\nline 2\nline 3/after 1st slash/after 2nd slash/after 3rd slash before colon:after 1st colon:after 2nd colon/after 4th slash\nline 4", file: 'after 3rd slash before colon', line: 'after 1st colon'},
					{trace: "line 1//:/:\nline 2//:/:\nline 3/after 1st ::slash/after ::2nd slash/after 3rd slash before colon:after 1st colon:after 2nd colon/after 4th slash::://::\nline 4//:/:", file: 'after 3rd slash before colon', line: 'after 1st colon'}]},
				{name: 'callerArgs', data: [[], [1, 2, 3], ['a'], ['b', 'c', 'de', 'f']]}],
			null,
			(function (formattedDate, traceData, callerArgs) {
				var fakeDate = {FIXME_formatUtcDateWithLocalTimeWithSeconds: (function () { return formattedDate; })};
				var fakeDateConstructor = (function () {
					expect(arguments.length).toEqual(0);
					return fakeDate;
				});
				var fakeErrorConstructor = (function () {
					expect(arguments.length).toEqual(0);
					return {stack: traceData.trace};
				});
				var fakeLogFunc = jasmine.createSpy("fake log function");
				var i, j;
				var fakeLoggerContainer = new DependancyInjectionContainer({
					TobliDate: DependancyInjectionContainer.wrap(fakeDateConstructor),
					TobliLogger: getTobliLogger,
					NativeError: DependancyInjectionContainer.wrap(fakeErrorConstructor),
					NativeLogFunc: DependancyInjectionContainer.wrap(fakeLogFunc)
				});
				var logger = fakeLoggerContainer.get('TobliLogger');
				var logLevelResult = logger.logLevel('END_USER');
				logLevelResult.log.apply(logLevelResult, callerArgs);
				verifyCustomLogRan(fakeLogFunc, formattedDate, traceData, callerArgs);
				for (i = 1; i < expectedLogLevels.length; i++) {
					fakeLogFunc = jasmine.createSpy("fake log function");
					fakeLoggerContainer = new DependancyInjectionContainer({
						TobliLogger: getTobliLogger,
						NativeLogFunc: DependancyInjectionContainer.wrap(fakeLogFunc)
					});
					logger = fakeLoggerContainer.get('TobliLogger');
					logLevelResult = logger.logLevel(expectedLogLevels[i]);
					logLevelResult.log.apply(logLevelResult, callerArgs);
					verifyLogDidNotRun(fakeLogFunc);
				}
				for (i = 0; i < expectedLogLevels.length; i++) {
					for (j = 0; j <= i; j++) {
						fakeLogFunc = jasmine.createSpy("fake log function");
						fakeLoggerContainer = new DependancyInjectionContainer({
							TobliDate: DependancyInjectionContainer.wrap(fakeDateConstructor),
							TobliLogger: getTobliLogger,
							NativeError: DependancyInjectionContainer.wrap(fakeErrorConstructor),
							NativeLogFunc: DependancyInjectionContainer.wrap(fakeLogFunc)
						});
						logger = fakeLoggerContainer.get('TobliLogger');
						logger.setLogLevel(expectedLogLevels[i]);
						logLevelResult = logger.logLevel(expectedLogLevels[j]);
						logLevelResult.log.apply(logLevelResult, callerArgs);
						verifyCustomLogRan(fakeLogFunc, formattedDate, traceData, callerArgs);
					}
					for (j = i + 1; j < expectedLogLevels.length; j++) {
						fakeLogFunc = jasmine.createSpy("fake log function");
						fakeLoggerContainer = new DependancyInjectionContainer({
							TobliLogger: getTobliLogger,
							NativeLogFunc: DependancyInjectionContainer.wrap(fakeLogFunc)
						});
						logger = fakeLoggerContainer.get('TobliLogger');
						logger.setLogLevel(expectedLogLevels[i]);
						logLevelResult = logger.logLevel(expectedLogLevels[j]);
						logLevelResult.log.apply(logLevelResult, callerArgs);
						verifyLogDidNotRun(fakeLogFunc);
					}
				}
			})
		);
	});

	it('should return an object with a logLevel() method that properly augments logNative() method', function () {
		jasmine.iterateOverTestDataSets([
				{name: 'callerArgs', data: [[], [1, 2, 3], ['a'], ['b', 'c', 'de', 'f']]}],
			null,
			(function (callerArgs) {
				var fakeLogFunc = jasmine.createSpy("fake log function");
				var fakeLoggerContainer = new DependancyInjectionContainer({
					TobliLogger: getTobliLogger,
					NativeLogFunc: DependancyInjectionContainer.wrap(fakeLogFunc)
				});
				var i,j;
				var logger = fakeLoggerContainer.get('TobliLogger');
				var logLevelResult = logger.logLevel('END_USER');
				logLevelResult.logNative.apply(logLevelResult, callerArgs);
				verifyNativeLogRan(fakeLogFunc, callerArgs);
				for (i = 1; i < expectedLogLevels.length; i++) {
					fakeLogFunc = jasmine.createSpy("fake log function");
					fakeLoggerContainer = new DependancyInjectionContainer({
						TobliLogger: getTobliLogger,
						NativeLogFunc: DependancyInjectionContainer.wrap(fakeLogFunc)
					});
					logger = fakeLoggerContainer.get('TobliLogger');
					logLevelResult = logger.logLevel(expectedLogLevels[i]);
					logLevelResult.logNative.apply(logLevelResult, callerArgs);
					verifyLogDidNotRun(fakeLogFunc);
				}
				for (i = 0; i < expectedLogLevels.length; i++) {
					for (j = 0; j <= i; j++) {
						fakeLogFunc = jasmine.createSpy("fake log function");
						fakeLoggerContainer = new DependancyInjectionContainer({
							TobliLogger: getTobliLogger,
							NativeLogFunc: DependancyInjectionContainer.wrap(fakeLogFunc)
						});
						logger = fakeLoggerContainer.get('TobliLogger');
						logger.setLogLevel(expectedLogLevels[i]);
						logLevelResult = logger.logLevel(expectedLogLevels[j]);
						logLevelResult.logNative.apply(logLevelResult, callerArgs);
						verifyNativeLogRan(fakeLogFunc, callerArgs);
					}
					for (j = i + 1; j < expectedLogLevels.length; j++) {
						fakeLogFunc = jasmine.createSpy("fake log function");
						fakeLoggerContainer = new DependancyInjectionContainer({
							TobliLogger: getTobliLogger,
							NativeLogFunc: DependancyInjectionContainer.wrap(fakeLogFunc)
						});
						logger = fakeLoggerContainer.get('TobliLogger');
						logger.setLogLevel(expectedLogLevels[i]);
						logLevelResult = logger.logLevel(expectedLogLevels[j]);
						logLevelResult.logNative.apply(logLevelResult, callerArgs);
						verifyLogDidNotRun(fakeLogFunc);
					}
				}

				// Manual (redundant) test for readability:
				fakeLogFunc = jasmine.createSpy("fake log function");
				fakeLoggerContainer = new DependancyInjectionContainer({
					TobliLogger: getTobliLogger,
					NativeLogFunc: DependancyInjectionContainer.wrap(fakeLogFunc)
				});
				logger = fakeLoggerContainer.get('TobliLogger');
				logger.setLogLevel('CRITICAL'); // show only critical errors
				logger.logLevel('DEBUG').logNative('This message is only interesting when debugging.');
				verifyLogDidNotRun(fakeLogFunc);
				logger.logLevel('END_USER').logNative('This message is should be seen by everybody.');
				verifyNativeLogRan(fakeLogFunc, ['This message is should be seen by everybody.']);
			})
		);
	});
});
