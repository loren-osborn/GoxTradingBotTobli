describe("getTobliDateConstructor", function() {
	var OneArgDateWithFakeCurrentTime = (function OneArgDateWithFakeCurrentTime(initalDateSpec) {
		initalDateSpec = (initalDateSpec || (OneArgDateWithFakeCurrentTime.fakeCurrentTimeString));
		return new Date(initalDateSpec);
	});
	OneArgDateWithFakeCurrentTime.fakeCurrentTimeString = '2013-09-10 08:11:07';

	var testZeroPadding = (function testZeroPadding(setter, test) {
		setter(0);
		test('00');
		setter(1);
		test('01');
		setter(9);
		test('09');
		setter(10);
		test('10');
		setter(12);
		test('12');
	});

	var DummyDate = (function DummyDate(altSourceObj) {
		if (altSourceObj == null) {
			altSourceObj = DummyDate;
		}
		return {
			getUTCFullYear: (function getUTCFullYear() { return altSourceObj.utcYear; }),
			getUTCMonth: (function getUTCMonth() { return altSourceObj.utcMonth; }),
			getUTCDate: (function getUTCDate() { return altSourceObj.utcDay; }),
			getFullYear: (function getFullYear() { return altSourceObj.year; }),
			getMonth: (function getMonth() { return altSourceObj.month; }),
			getDate: (function getDate() { return altSourceObj.day; }),
			getHours: (function getHours() { return altSourceObj.hours; }),
			getMinutes: (function getMinutes() { return altSourceObj.minutes; }),
			getSeconds: (function getSeconds() { return altSourceObj.seconds; }),
		};
	});
	DummyDate.utcYear = 2000;
	DummyDate.utcMonth = 0;
	DummyDate.utcDay = 0;
	DummyDate.year = 2000;
	DummyDate.month = 0;
	DummyDate.day = 0;
	DummyDate.hours = 0;
	DummyDate.minutes = 0;
	DummyDate.seconds = 0;

	it("should be a function that returns a well behaved constructor", function() {
		expect(getTobliDateConstructor).isAFunction({withName:'getTobliDateConstructor'});
		expect(getTobliDateConstructor(DependancyInjectionContainer.wrap(Date))).toBeAWellBehavedConstructor({withName:'TobliDate', returningObjectOfClass: Date});
	});

	it("returns a constructor with expected methods", function() {
		var expectedMethods = [
			// 'formatTimeAndDate',
			'formatDateAndTimeWithLabeledTodayDate',
			'FIXME_formatDayMonthAndTimeWithImplicitTodayDate',
			'FIXME_formatUtcDateWithLocalTimeWithSeconds',
			'isSameDate',
			'getWeekdayName',
			'getUnixTime',
			'getMicroTime',
			'getMinuteId',
			'setUnixTime',
			'setMicroTime',
			'setMinuteId'
		];
		var i;
		var newObj = new (getTobliDateConstructor(DependancyInjectionContainer.wrap(Date)))();
		for (i = 0; i < expectedMethods.length; i++) {
			expect(newObj[expectedMethods[i]]).isAFunction();
		}
	});

	it("returns a constructor for a Date with expected default value", function() {
		var newObj = new (getTobliDateConstructor(DependancyInjectionContainer.wrap(Date)))();
		var stockDate = new Date();
		expect(typeof newObj).toEqual(typeof stockDate);
		expect(newObj instanceof Date).toBeTruthy();
		expect(newObj.constructor).toEqual(Date);
		expect(newObj.getTime()).toBeCloseTo(stockDate.getTime(), -1);
	});

	it("returns a constructor for a custom constructor passing correct number of args through", function() {
		var SingleArgDate = jasmine.createSpy("SingleArgDate spy");
		var singleArgDateObj = new (getTobliDateConstructor(DependancyInjectionContainer.wrap(SingleArgDate)))(1);
		expect(SingleArgDate).toHaveBeenCalledWith(1);


		var DoubleArgDate = jasmine.createSpy("DoubleArgDate spy");
		var doubleArgDateObj = new (getTobliDateConstructor(DependancyInjectionContainer.wrap(DoubleArgDate)))('foo', 'bar');
		expect(DoubleArgDate).toHaveBeenCalledWith('foo', 'bar');


		var TrippleArgDate = jasmine.createSpy("TrippleArgDate spy");
		var trippleArgDate = new (getTobliDateConstructor(DependancyInjectionContainer.wrap(TrippleArgDate)))(3, '.14', 159);
		expect(TrippleArgDate).toHaveBeenCalledWith(3, '.14', 159);
	});

	it("returns a constructor that throws an exception when given too many arguments", function() {
		expect(function () {
			new (getTobliDateConstructor(DependancyInjectionContainer.wrap(Date)))(1, 2, 3, 4, 5, 6, 7, 8);
		}).toThrow('Too many variadic constructor arguments without eval support (disabled in Chrome plugins)');
	});

	/*
	it("returns a constructor with working formatTimeAndDate() method (when not commented out)", function() {
		var DummyTobliDate = getTobliDateConstructor(DependancyInjectionContainer.wrap(DummyDate));
		var testCount = 0;
		var testYear = (function testYear(year) {
			DummyDate.year = year;
			year = '' + year;
			testZeroPadding(
				(function (month) { DummyDate.month = month - 1; }),
				(function (month) {
					if (month != '00') { // invalid test cases
						testZeroPadding(
							(function (day) { DummyDate.day = day; }),
							(function (day) {
								if (day != '00') { // invalid test cases
									testZeroPadding(
										(function (hour) { DummyDate.hours = hour; }),
										(function (hour) {
											testZeroPadding(
												(function (min) { DummyDate.minutes = min; }),
												(function (min) {
													var dateObj = new DummyTobliDate();
													expect(dateObj.formatTimeAndDate()).
														toEqual(year + '-' + month + '-' + day + ' ' + hour + ':' + min);
													testCount++;
												})
											);
										})
									);
								}
							})
						);
					}
				})
			);
		});
		testYear(2000);
		testYear(2005);
		expect(testCount).toEqual(2 * 4 * 4 * 5 * 5);
	});
	*/

	it("returns a constructor with working formatDateAndTimeWithLabeledTodayDate() method", function() {
		var DummyTobliDate = getTobliDateConstructor(DependancyInjectionContainer.wrap(DummyDate));
		var testCount = 0;
		var testYear = (function testYear(year) {
			DummyDate.year = year;
			year = '' + year;
			testZeroPadding(
				(function (month) { DummyDate.month = month - 1; }),
				(function (month) {
					if (month != '00') { // invalid test cases
						testZeroPadding(
							(function (day) { DummyDate.day = day; }),
							(function (day) {
								if (day != '00') { // invalid test cases
									testZeroPadding(
										(function (hour) { DummyDate.hours = hour; }),
										(function (hour) {
											testZeroPadding(
												(function (min) { DummyDate.minutes = min; }),
												(function (min) {
													expect(DummyDate.year + '').toEqual(year);
													var dateObj = new DummyTobliDate();
													expect(dateObj.formatDateAndTimeWithLabeledTodayDate()).
														toEqual('Today ' + hour + ':' + min);
													dateObj = new DummyTobliDate({
														year: DummyDate.year,
														month: DummyDate.month,
														day: DummyDate.day,
														hours: DummyDate.hours,
														minutes: DummyDate.minutes
													});
													DummyDate.year++;
													expect(dateObj.formatDateAndTimeWithLabeledTodayDate()).
														toEqual(year + '-' + month + '-' + day + ' ' + hour + ':' + min);
													testCount++;
													expect(DummyDate.year + '').not.toEqual(year);
													DummyDate.year--;
													expect(DummyDate.year + '').toEqual(year);
												})
											);
										})
									);
								}
							})
						);
					}
				})
			);
		});
		testYear(2000);
		testYear(2005);
		expect(testCount).toEqual(2 * 4 * 4 * 5 * 5);
	});

	it("returns a constructor with working FIXME_formatDayMonthAndTimeWithImplicitTodayDate() method", function() {
		var DummyTobliDate = getTobliDateConstructor(DependancyInjectionContainer.wrap(DummyDate));
		var testCount = 0;
		var testDayMonth = (function testDayMonth(day, month) {
			DummyDate.day = day;
			day = '' + day;
			DummyDate.month = month - 1;
			month = '' + month;
			testZeroPadding(
				(function (hour) { DummyDate.hours = hour; }),
				(function (hour) {
					testZeroPadding(
						(function (min) { DummyDate.minutes = min; }),
						(function (min) {
							var dateObj = new DummyTobliDate();
							expect(dateObj.FIXME_formatDayMonthAndTimeWithImplicitTodayDate()).
								toEqual(hour + ':' + min);
							dateObj = new DummyTobliDate({
								year: DummyDate.year,
								month: DummyDate.month,
								day: DummyDate.day,
								hours: DummyDate.hours,
								minutes: DummyDate.minutes
							});
							DummyDate.year++;
							expect(dateObj.FIXME_formatDayMonthAndTimeWithImplicitTodayDate()).
								toEqual(day + '/' + month + ' ' + hour + ':' + min);
							testCount++;
						})
					);
				})
			);
		});
		testDayMonth(10, 11);
		testDayMonth(12, 3);
		testDayMonth(4, 15);
		testDayMonth(6, 7);
		expect(testCount).toEqual(4 * 5 * 5);
	});

	it("returns a constructor with working FIXME_formatUtcDateWithLocalTimeWithSeconds() method", function() {
		var DummyTobliDate = getTobliDateConstructor(DependancyInjectionContainer.wrap(DummyDate));
		var testCount = 0;
		var testYear = (function testYear(year) {
			DummyDate.utcYear = year;
			year = '' + year;
			testZeroPadding(
				(function (month) { DummyDate.utcMonth = month - 1; }),
				(function (month) {
					if (month != '00') { // invalid test cases
						testZeroPadding(
							(function (day) { DummyDate.utcDay = day; }),
							(function (day) {
								if (day != '00') { // invalid test cases
									testZeroPadding(
										(function (hour) { DummyDate.hours = hour; }),
										(function (hour) {
											testZeroPadding(
												(function (min) { DummyDate.minutes = min; }),
												(function (min) {
													testZeroPadding(
														(function (sec) { DummyDate.seconds = sec; }),
														(function (sec) {
															var dateObj = new DummyTobliDate();
															expect(dateObj.FIXME_formatUtcDateWithLocalTimeWithSeconds()).
																toEqual(year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec);
															testCount++;
														})
													);
												})
											);
										})
									);
								}
							})
						);
					}
				})
			);
		});
		testYear(2000);
		testYear(2005);
		expect(testCount).toEqual(2 * 4 * 4 * 5 * 5 * 5);
	});

	it("returns a constructor with working isSameDate() method", function() {
		var sampleYears = [2000, 2001, 2002];
		var sampleMonths = ['Jan', 'Feb', 'Mar'];
		var i, j, k;
		var FIRST_VALID_DAY_OF_MONTH = 1;
		var earlyComparisonDate, lateComparisonDate;
		var TobliDate = getTobliDateConstructor(DependancyInjectionContainer.wrap(Date));
		var controlDateString = 'Feb 2, 2001';
		var comparisonDateString;
		var earlyControlDate = new TobliDate(controlDateString + ' 00:00:00');
		var lateControlDate = new TobliDate(controlDateString + ' 23:59:59');
		var expectedMatch;
		var matchCount = 0;
		var testCount = 0;
		for (i = 0; i < sampleMonths.length; i++) {
			for (j = 0; j < 3; j++) {
				for (k = 0; k < sampleYears.length; k++) {
					expectedMatch = (i == 1) && (j == 1) && (k == 1);
					if (expectedMatch) {
						matchCount++;
						expect(expectedMatch).toEqual(true);
						expect(testCount).toEqual((3 * 3) + 3 + 1);
					} else {
						expect(expectedMatch).toEqual(false);
					}
					testCount++;
					comparisonDateString = sampleMonths[i] + ' ' + (j + FIRST_VALID_DAY_OF_MONTH) + ', ' + sampleYears[k];
					earlyComparisonDate = new TobliDate(comparisonDateString + ' 00:00:00');
					lateComparisonDate = new TobliDate(comparisonDateString + ' 23:59:59');
					expect(earlyControlDate.isSameDate(earlyComparisonDate)).toEqual(expectedMatch);
					expect(earlyControlDate.isSameDate(lateComparisonDate)).toEqual(expectedMatch);
					expect(lateControlDate.isSameDate(earlyComparisonDate)).toEqual(expectedMatch);
					expect(lateControlDate.isSameDate(lateComparisonDate)).toEqual(expectedMatch);
				}
			}
		}
		expect(testCount).toEqual(3 * 3 * 3);
		expect(matchCount).toEqual(1);
	});

	it("returns a constructor with working getWeekdayName() method", function() {
		// Jan 1, 2000 is a Saturday:
		var expectedDayNames = [null, "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
		var i;
		var FIRST_VALID_DAY_OF_MONTH = 1;
		var testDate;
		var TobliDate = getTobliDateConstructor(DependancyInjectionContainer.wrap(Date));
		for (i = FIRST_VALID_DAY_OF_MONTH; i < expectedDayNames.length; i++) {
			testDate = new TobliDate('Jan ' + i + ', 2000 00:00:00');
			expect(testDate.getWeekdayName()).toEqual(expectedDayNames[i]);
			testDate = new TobliDate('Jan ' + i + ', 2000 23:59:59');
			expect(testDate.getWeekdayName()).toEqual(expectedDayNames[i]);
		}
	});

	it("returns a constructor with working getters and setters for MinuteId, UnixTime, and MicroTime comparable to getTime and setTime methods as well as createFrom... class methods", function() {
		var TobliDate = getTobliDateConstructor(DependancyInjectionContainer.wrap(Date));
		var dateObj = new TobliDate();
		expect(TobliDate.createFromTime).toBeUndefined();
		TobliDate.createFromTime = (function createFromTime(t) {
			expect(t).toBeOfType('Number');
			var result = new TobliDate();
			result.setTime(t);
			return result;
		});
		var unitsToTest = [
			{name:'MinuteId', microseconds:60 * 1000 * 1000},
			{name:'UnixTime', microseconds:1000 * 1000},
			{name:'Time', microseconds:1000}, // built-in JavaScript time units
			{name:'MicroTime', microseconds:1},
		];
		var testTime = 946684800000;
		var unitOffsets = [0, 0.333, 0.499999, 0.5, 0.999, 1, 1.25, 2, 5];
		var unitIndex, offsetIndex;
		var sample;
		var getExpectedValue = (function getExpectedValue(input, unitMicroSeconds) {
			// JavaScript Numbers are stored as double-precision floating points, that have 53 bit mantissas
			// so should be able to store any integer from -1.8014399e+16 to +1.8014399e+16 losslessly
			// JavaScript Dates are stored as millisecond offsets from January 1, 1970 which we are converting to
			// microseconds here, so we should be able to loose no precision with any date through
			// October 29, 2540 23:35:09.481984 UTC instead of the ~285,000 years we could measure if we stuck
			// to millisecond accuracy
			expect(input).toBeOfType('Number');
			expect(unitMicroSeconds).toBeOneOf([1, 1000, 1000 * 1000, 60 * 1000 * 1000]);
			var jsTime = Math.floor((input * unitMicroSeconds) / 1000);
			return Math.floor((jsTime * 1000) / unitMicroSeconds);
		});
		var toUnits = (function toUnits(input, unitMicroSeconds) {
			expect(input).toBeOfType('Number');
			expect(unitMicroSeconds).toBeOneOf([1, 1000, 1000 * 1000, 60 * 1000 * 1000]);
			return (input * 1000) / unitMicroSeconds;
		});
		var toNativeTime = (function toNativeTime(input, unitMicroSeconds) {
			expect(input).toBeOfType('Number');
			expect(unitMicroSeconds).toBeOneOf([1, 1000, 1000 * 1000, 60 * 1000 * 1000]);
			return (input * unitMicroSeconds) / 1000;
		});
		var getDateSetTo = (function getDateSetTo(units, name, microseconds) {
			expect(units).toBeOfType('Number');
			expect(name).toBeOfType('String');
			expect(microseconds).toBeOneOf([1, 1000, 1000 * 1000, 60 * 1000 * 1000]);
			expect(units).not.toBeUndefined();
			expect(name).not.toBeUndefined();
			expect(microseconds).not.toBeUndefined();
			expect(units).toBeGreaterThan(0);
			expect(microseconds).toBeGreaterThan(0);
			var otherDateObj = new TobliDate();
			var retVal = dateObj['set' + name](units);
			var expected = getExpectedValue(units, microseconds);
			var nativeExpected = toNativeTime(expected, microseconds);
			var otherRetVal = otherDateObj.setTime(nativeExpected);
			expect(retVal).toBeOfType('Number');
			expect(otherRetVal).toBeOfType('Number');
			expect(retVal).toBe(expected);
			expect(otherRetVal).toBe(nativeExpected);
			return dateObj;
		});
		var testSetterAndGetter = (function testSetterAndGetter(input, name, microseconds, setterFunction) {
			expect(input).toBeOfType('Number');
			expect(name).toBeOfType('String');
			expect(microseconds).toBeOneOf([1, 1000, 1000 * 1000, 60 * 1000 * 1000]);
			expect(setterFunction).isAFunction();
			var expected = getExpectedValue(input, microseconds);
			var nativeExpected = toNativeTime(expected, microseconds);
			var result = setterFunction(input);
			expect(result.getTime()).toEqual(nativeExpected);
			expect(result['get' + name]()).toEqual(expected);
		});
		for (unitIndex = 0; unitIndex < unitsToTest.length; unitIndex++) {
			expect(TobliDate['createFrom' + unitsToTest[unitIndex].name]).isAFunction({withName:('createFrom' + unitsToTest[unitIndex].name)});
			expect(dateObj['get' + unitsToTest[unitIndex].name]).isAFunction({withName:('get' + unitsToTest[unitIndex].name)});
			expect(dateObj['set' + unitsToTest[unitIndex].name]).isAFunction({withName:('set' + unitsToTest[unitIndex].name)});
			for (offsetIndex = 0; offsetIndex < unitOffsets.length; offsetIndex++) {
				sample = toUnits(testTime + unitOffsets[offsetIndex], unitsToTest[unitIndex].microseconds);
				testSetterAndGetter(sample, unitsToTest[unitIndex].name, unitsToTest[unitIndex].microseconds, (function (x) { return getDateSetTo(x, unitsToTest[unitIndex].name, unitsToTest[unitIndex].microseconds); }));
				testSetterAndGetter(sample, unitsToTest[unitIndex].name, unitsToTest[unitIndex].microseconds, (function (x) { return (TobliDate['createFrom' + unitsToTest[unitIndex].name])(x); }));
			}
			for (offsetIndex = 0; offsetIndex < unitOffsets.length; offsetIndex++) {
				sample = toUnits(testTime, unitsToTest[unitIndex].microseconds) + unitOffsets[offsetIndex];
				testSetterAndGetter(sample, unitsToTest[unitIndex].name, unitsToTest[unitIndex].microseconds, (function (x) { return getDateSetTo(x, unitsToTest[unitIndex].name, unitsToTest[unitIndex].microseconds); }));
				testSetterAndGetter(sample, unitsToTest[unitIndex].name, unitsToTest[unitIndex].microseconds, (function (x) { return (TobliDate['createFrom' + unitsToTest[unitIndex].name])(x); }));
			}
		}
	});
});

