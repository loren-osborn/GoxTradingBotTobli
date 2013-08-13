describe("getTobliDateConstructor", function() {
	var OneArgDateWithFakeCurrentTime = (function OneArgDateWithFakeCurrentTime(initalDateSpec) {
		initalDateSpec = (initalDateSpec || (OneArgDateWithFakeCurrentTime.fakeCurrentTimeString));
		return new Date(initalDateSpec);
	});
	OneArgDateWithFakeCurrentTime.fakeCurrentTimeString = '2013-09-10 08:11:07';
	
	it("should be a function that returns a well behaved constructor", function() {
		expect(getTobliDateConstructor).isAFunction({withName:'getTobliDateConstructor'});
		expect(getTobliDateConstructor()).toBeAWellBehavedConstructor({withName:'TobliDate', returningObjectOfClass: Date});
	});
	
	it("returns a constructor with expected methods", function() {
		var expectedMethods = [
		    'formatDateAndTimeWithLabeledTodayDate',
		    'FIXME_formatDayMonthAndTimeWithImplicitTodayDate',
		    'FIXME_formatUtcDateWithLocalTimeWithSeconds',
		    'isSameDate',
		    'getWeekdayName'
		];
		var i;
		var newObj = new (getTobliDateConstructor())();
		for (i = 0; i < expectedMethods.length; i++) {
			expect(newObj[expectedMethods[i]]).isAFunction();
		}
	});
	
	it("returns a constructor for a Date with expected default value", function() {
		var newObj = new (getTobliDateConstructor())();
		var stockDate = new Date();
		expect(typeof newObj).toEqual(typeof stockDate);
		expect(newObj instanceof Date).toBeTruthy();
		expect(newObj.constructor).toEqual(Date);
		expect(newObj.getTime()).toBeCloseTo(stockDate.getTime(), -1);
	});
	
	it("returns a constructor for a constructor passing correct number of args through", function() {
		var SingleArgDate = jasmine.createSpy("SingleArgDate spy");
		var singleArgDateObj = new (getTobliDateConstructor(SingleArgDate))(1);
        expect(SingleArgDate).toHaveBeenCalledWith(1);
        

		var DoubleArgDate = jasmine.createSpy("DoubleArgDate spy");
		var doubleArgDateObj = new (getTobliDateConstructor(DoubleArgDate))('foo', 'bar');
        expect(DoubleArgDate).toHaveBeenCalledWith('foo', 'bar');
        

		var TrippleArgDate = jasmine.createSpy("TrippleArgDate spy");
		var trippleArgDate = new (getTobliDateConstructor(TrippleArgDate))(3,'.14',159);
        expect(TrippleArgDate).toHaveBeenCalledWith(3,'.14',159);
	});
	
	it("returns a constructor that throws an exception when given too many arguments", function() {
	    expect(function () {
	    	new (getTobliDateConstructor())(1,2,3,4,5,6,7,8);
	    }).toThrow('Too many variadic constructor without eval support (disabled in Chrome plugins)');
	});
  /*
  var player;
  var song;

  beforeEach(function() {
    player = new Player();
    song = new Song();
  });

  it("should be able to play a Song", function() {
    player.play(song);
    expect(player.currentlyPlayingSong).toEqual(song);

    //demonstrates use of custom matcher
    expect(player).toBePlaying(song);
  });

  describe("when song has been paused", function() {
    beforeEach(function() {
      player.play(song);
      player.pause();
    });

    it("should indicate that the song is currently paused", function() {
      expect(player.isPlaying).toBeFalsy();

      // demonstrates use of 'not' with a custom matcher
      expect(player).not.toBePlaying(song);
    });

    it("should be possible to resume", function() {
      player.resume();
      expect(player.isPlaying).toBeTruthy();
      expect(player.currentlyPlayingSong).toEqual(song);
    });
  });

  // demonstrates use of spies to intercept and test method calls
  it("tells the current song if the user has made it a favorite", function() {
    spyOn(song, 'persistFavoriteStatus');

    player.play(song);
    player.makeFavorite();

    expect(song.persistFavoriteStatus).toHaveBeenCalledWith(true);
  });

  //demonstrates use of expected exceptions
  describe("#resume", function() {
    it("should throw an exception if song is already playing", function() {
      player.play(song);

      expect(function() {
        player.resume();
      }).toThrow("song is already playing");
    });
  }); */
});