Meteor.startup(function() {
    if(Meteor.industries.find().count() <= 0) {
        // Initial cities
        // pull from Vietnamworks
        var query = Utils.VNW_QUERIES.pullIndustries;
        var raw = Utils.fetchVNWData(query);
        _.each(raw, function(_i) {
            new Industry({
                vnwId: _i.industryid,
                name: _i.industryname,
                languageId: _i.languageid,
                order: _i.industryorder
            }).save();
        });
    }
});
