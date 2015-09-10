Meteor.startup(function() {
    if(Meteor.cities.find().count() <= 0) {
        // Initial cities
        // pull from Vietnamworks
        var query = Utils.VNW_QUERIES.pullCities;
        var raw = Utils.fetchVNWData(query);
        _.each(raw, function(_i) {
            new City({
                vnwId: _i.cityid,
                name: _i.cityname,
                languageId: _i.languageid,
                order: _i.cityorder
            }).save();
        });
    }
});
