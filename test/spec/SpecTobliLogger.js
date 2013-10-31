describe('getTobliLogger', function() {
	// Sample backtrace from Google Chrome 30.0.1599.101
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

	it('should be a function', function() {
		expect(getTobliLogger).isAFunction({withName:'getTobliLogger'});
	});

	it('should return an object with a log() method', function() {
		var result = getTobliLogger();
		expect(result.log).isAFunction({withName:'log'});
	});

	it('should return an object with a log() method that calls the expected methods on container objects', function() {
		jasmine.iterateOverTestDataSets([
				{name: 'formattedDate', data: ['yesterday', 'a long time ago', '2000-01-01 11:12:13']},
				{name: 'traceData', data: [
					{trace: sampleBackTrace, file: 'Users', line: undefined},
					{trace: "line 1\nline 2\nline 3/after 1st slash/after 2nd slash/after 3rd slash before colon:after 1st colon:after 2nd colon/after 4th slash\nline 4", file: 'after 3rd slash before colon', line: 'after 1st colon'},
					{trace: "line 1//:/:\nline 2//:/:\nline 3/after 1st ::slash/after ::2nd slash/after 3rd slash before colon:after 1st colon:after 2nd colon/after 4th slash::://::\nline 4//:/:", file: 'after 3rd slash before colon', line: 'after 1st colon'}]},
				{name: 'callerArgs', data: [[], [1, 2, 3], ['a', 'b', 'c']]}],
			null,
			(function (formattedDate, traceData, callerArgs) {
				var fakeDate = {FIXME_formatUtcDateWithLocalTimeWithSeconds: (function() { return formattedDate; })};
				var fakeDateConstructor = (function() {
					expect(arguments.length).toEqual(0);
					return fakeDate;
				});
				var fakeErrorConstructor = (function() {
					expect(arguments.length).toEqual(0);
					return {stack: traceData.trace};
				});
				var fakeLogFunc = jasmine.createSpy("fake log function");
				var fakeLoggerContainer = new DependancyInjectionContainer({
					TobliDate: DependancyInjectionContainer.wrap(fakeDateConstructor),
					TobliLogger: getTobliLogger,
					NativeError: DependancyInjectionContainer.wrap(fakeErrorConstructor),
					NativeLogFunc: DependancyInjectionContainer.wrap(fakeLogFunc)
				});
				fakeLoggerContainer.get('TobliLogger').log.apply(null, callerArgs);
			    expect(fakeLogFunc.calls.length).toEqual(1);
			    expect(fakeLogFunc.calls[0].args[0]).toEqual(formattedDate);
			    expect(fakeLogFunc.calls[0].args[1]).toEqual('[' + traceData.file + ':' + traceData.line + ']');
			    expect(fakeLogFunc.calls[0].args.slice(2)).toEqual(callerArgs);
			})
		);
	});
});
