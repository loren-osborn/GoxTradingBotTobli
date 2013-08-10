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