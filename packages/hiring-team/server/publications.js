/**
 * Created by HungNguyen on 10/5/15.
 */



var publications = {
    hiringTeam: function (_jId) {
        return Collection.find({_id: _jId});
    }
};


Meteor.publish('getHiringTeam', publications.hiringTeam);
//Meteor.publish('hiringTeamList', publications.hiringTeamSettings);