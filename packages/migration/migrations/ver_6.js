//Migrations.add({
//    version: 5,
//    name: "add new field 'searchable' to application",
//    up: function () {
//        var apps = Collections.Applications.find({searchable: null}, {fields: {candidateId: 1}});
//        var canFields = {
//            "data.firstname": 1,
//            "data.lastname": 1,
//            "data.city": 1,
//            "data.username": 1,
//            "data.email1": 1,
//            "data.email2": 1
//        };
//        _.each(apps, function(app) {
//            var candidate = Collections.Candidates.findOne({candidateId: app.candidateId}, { fields: canFields });
//            if(!candidate) return;
//            var candidateInfo = {
//                firstName: candidate.data.firstname || candidate.data.firstName
//            }
//        });
//    },
//    down: function () {
//        console.log("down to version 4");
//    }
//});Migrations.add({
//    version: 5,
//    name: "add new field 'searchable' to application",
//    up: function () {
//        var apps = Collections.Applications.find({searchable: null}, {fields: {candidateId: 1}});
//        var canFields = {
//            "data.firstname": 1,
//            "data.lastname": 1,
//            "data.city": 1,
//            "data.username": 1,
//            "data.email1": 1,
//            "data.email2": 1
//        };
//        _.each(apps, function(app) {
//            var candidate = Collections.Candidates.findOne({candidateId: app.candidateId}, { fields: canFields });
//            if(!candidate) return;
//            var candidateInfo = {
//                firstName: candidate.data.firstname || candidate.data.firstName
//            }
//        });
//    },
//    down: function () {
//        console.log("down to version 4");
//    }
//});