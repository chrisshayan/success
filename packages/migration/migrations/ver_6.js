Migrations.add({
    version: 6,
    name: "transform job tags to lower case",
    up: function () {
        Collections.Jobs.find({tags: {$exists: true, $not: {$size: 0}}}).forEach(function (doc) {
            var tags = [];
            _.each(doc.tags, function (t) {
                tags.push(t.toLowerCase());
            });
            Collections.Jobs.update({_id: doc._id}, {$set: {tags: tags}});
        });

    },
    down: function () {
        console.log("down to version 5");
    }
});