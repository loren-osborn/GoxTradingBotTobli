function getTobliDateConstructor(dateConstructor) {
	dateConstructor = dateConstructor || Date;
	var weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	var TobliDate;
	var zeroPadTwoDigits = function zeroPadTwoDigits(d) {
		return ((d < 10) ? '0' : '') + d.toString();
	}
	var createWithVariadicArgs = (function () {
		var cache = [
		    /*
                eval requires sandboxing inside chrome plugins.
                This preloads cache with the 4 most common cases,
                but can still fail if args contains more than
                three arguments. That shouldn't happen as
                this function is currently used, but if this needs
                to be added in the future, this function must be
                moved to a sandboxed page.
            */
			(function createWithNoArgs(constructor, args) {
			    return new constructor();
			}),
			(function createWithOneArg(constructor, args) {
			    return new constructor(args[0]);
			}),
			(function createWithTwoArgs(constructor, args) {
			    return new constructor(args[0],args[1]);
			}),
			(function createWithThreeArgs(constructor, args) {
			    return new constructor(args[0],args[1],args[2]);
			})
        ];
		return (function createWithVariadicArgs(constructor, args) {
			var funcSource = '';
			var argList = [];
			var i = 0;
			if ((args.length >= cache.length) || !(cache[args.length])) {
				for (i = 0; i < args.length; i++) {
					argList[i] = 'args[' + i + ']';
				}
				funcSource =
                    'return (function (constructor, args) {' +
                        'return new constructor(' + argList + ');' +
				    '});'; 
				cache[args.length] = eval(funcSource);
			}
			return cache[args.length](constructor, args);
		});
	})();
	var formatDate = (function formatDate(d) {
		return d.getFullYear()+"-"+zeroPadTwoDigits(d.getMonth()+1)+"-"+zeroPadTwoDigits(d.getDate());
	});
	var formatTime = (function formatTime(t) {
		return zeroPadTwoDigits(t.getHours()) + ":"+zeroPadTwoDigits(t.getMinutes());
	});
	var formatTimeWithSeconds = (function formatTimeWithSeconds(t) {
		return formatTime(t) + ":" + zeroPadTwoDigits(t.getSeconds());
	});
	var tobliDateMethods = {};
	/*
	// Only used by commented out code elsewhere.
	tobliDateMethods.formatTimeAndDate = (function formatTimeAndDate() {
		return formatDate(this) + " " + formatTime(this);
	});
	*/
	var dateTimeFormatGenerator = (function dateTimeFormatGenerator(todayLabel, dateFormater) {
		return (function formatWithConditionalDate() {
			var timePrefix = '';
			if (!(this.isSameDate(new (TobliDate)()))) {
				timePrefix = dateFormater(this) + ' ';
			} else {
				timePrefix = todayLabel;
			}
			return (timePrefix + formatTime(this));
		});
	});
	tobliDateMethods.formatDateAndTimeWithLabeledTodayDate = dateTimeFormatGenerator('Today ', formatDate);
	tobliDateMethods.FIXME_formatDayMonthAndTimeWithImplicitTodayDate = dateTimeFormatGenerator('', (function formatEuDate(d) {
		return d.getDate() + '/' + (d.getMonth()+1);
	}));
	tobliDateMethods.FIXME_formatUtcDateWithLocalTimeWithSeconds = (function FIXME_formatUtcDateWithLocalTimeWithSeconds() {
		return (
			this.getUTCFullYear()+"-"+zeroPadTwoDigits(this.getUTCMonth()+1)+"-"+zeroPadTwoDigits(this.getUTCDate()) + 
		    " " + formatTimeWithSeconds(this)
		);
	});
	tobliDateMethods.isSameDate = (function isSameDate(other) {
		return (
				(this.getFullYear() == other.getFullYear()) &&
				(this.getMonth() == other.getMonth()) &&
				(this.getDate() == other.getDate())
		);
	});
	tobliDateMethods.getWeekdayName = (function getWeekdayName() {
		return weekdays[this.getDay()];
	});
	TobliDate = (function TobliDate() {
		var result = createWithVariadicArgs(dateConstructor, arguments);
		var methodName;
		for (methodName in tobliDateMethods) {
			result[methodName] = tobliDateMethods[methodName];
		}
		return result;
	});
	return TobliDate;
}