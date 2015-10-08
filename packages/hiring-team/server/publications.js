/**
 * Created by HungNguyen on 10/5/15.
 */



var publications = {
    hiringTeamSettings: function (companyId, options) {
        var query = companyId ? {companyId: companyId} : {};
        console.log(query);
        return Meteor['hiringTeam'].find(query, options || {});
    }
};


Meteor.publish('hiringTeamList', publications.hiringTeamSettings);