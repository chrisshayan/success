Meteor.startup(function() {
    if(Meteor.job_levels.find().count() <= 0) {
        // pull job levels from Vietnamworks
        var query = Utils.VNW_QUERIES.pullJobLevels;
        var raw = Utils.fetchVNWData(query);
        _.each(raw, function(_i) {
            new JobLevel({
                vnwId: _i.joblevelid,
                name: _i.joblevelname,
                languageId: _i.languageid,
                order: _i.joblevelorder
            }).save();
        });
    }
});
