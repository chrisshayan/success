Migrations.add({
    version: 7,
    name: "add new field 'candidateInfo' in application",
    up: function () {
        Collections.Candidates.find({}).forEach(function(can) {
            var candidateInfo = {
                firstName: can.data.firstname || can.data.firstName || '',
                lastName: can.data.lastname || can.data.lastName || '',
                emails: [can.data.username, can.data.email, can.data.email1, can.data.email2],
                city: can.data.city
            };
            candidateInfo['fullname'] = [candidateInfo.lastName, candidateInfo.firstName].join(' ');
            candidateInfo.emails = _.without(candidateInfo.emails, null, undefined,'');
            Collections.Applications.update({candidateId: can.candidateId}, {$set: {candidateInfo: candidateInfo}}, {multi:true});
        });
    },
    down: function () {
        console.log("down to version 7");
        Collections.Applications.update({}, {$unset: {candidateInfo: ''}}, {multi: true});
    }
});