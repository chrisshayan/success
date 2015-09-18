Template.jobFilter.onRendered(function() {
    var el = $("#job-filter");
    el.tagsinput({
        tagClass: "tag label label-primary",
        maxTags: 5,
        typeaheadjs: {
            displayKey: 'skillName',
            valueKey: 'skillName',
            source: function (q, sync, async) {
                self.searchId && Meteor.clearTimeout(self.searchId);
                self.searchId = Meteor.setTimeout(function () {
                    Meteor.call("searchSkill", q, function (err, result) {
                        if (err) throw err;
                        result = _.sortByOrder(result, ['char', 'asc']);
                        async(result)
                    });
                }, 300);
            }
        },
        freeInput: true
    });

    var filterChanged = function() {
        var items = el.tagsinput('items');
        ReactiveCookie.set('jobFilter', EJSON.stringify(items));
    }

    el.on('itemAdded', function (event) {
        filterChanged();
        event.preventDefault();
    });
    el.on('itemRemoved', function (event) {
        filterChanged();
        event.preventDefault();
    });
});

Template.jobFilter.helpers({
    currentFilter: function() {
        return EJSON.parse(ReactiveCookie.get('jobFilter')) || [];
    }
})