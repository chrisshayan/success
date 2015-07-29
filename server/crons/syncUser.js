/**
 * Created by HungNguyen on 7/24/15.
 */


var VNW_TABLES = Meteor.settings.tables,
    VNW_QUERIES = Meteor.settings.queries;
var fetchVNWData = Meteor.wrapAsync(function (sql, callback) {
    //execute
    connection.query(sql, function (err, rows, fields) {
        if (err) throw err;
        callback(null, rows);
    });
});


//Namespace to share methods to manual sync data from Vietnamworks
SYNC_VNW.syncUser = function (userInfo) {
    var _user = Collections.Users.findOne({userId: userInfo.userid});

    if (!_user) {
        var _user = new Schemas.User();
        _user.data = userInfo;
        _user.companyId = userInfo.companyid;
        _user.userId = userInfo.userid;
        _user.username = userInfo.username;
        _user.createdAt = userInfo.createddate;
        Collections.Users.insert(_user);

        //Intitial user data
        Meteor.defer(function () {
            Recruit.initialEmployerData(userInfo.userid, userInfo.username);
            SYNC_VNW.addQueue('initCompany', _user);
        });
        _user.isNew = true;

    } else if (!_.isEqual(_user.data, userInfo)) {
        Collections.Users.update(_user._id, {$set: {data: userInfo, lastSyncedAt: new Date()}});
        _user.isNew = false;

    } else {
        _user.isNew = false;
    }

    return _user;

    /*
     //Sync data first time
     SYNC_VNW.pullJobs(_user.userId, _user.companyId);*/
};
