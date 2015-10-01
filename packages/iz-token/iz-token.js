var jwt = Npm.require('jwt-simple');
IZToken = {};
IZToken.Collection = new Mongo.Collection('iz_tokens');
function getSecretKey() {
    if (Meteor.settings.hasOwnProperty("IZTOKEN_SECRET")) {
        return Meteor.settings.IZTOKEN_SECRET;
    } else if (IZToken.secret) {
        return IZToken.secret;
    } else {
        throw new Meteor.Error(400, 'Please set secret as a setting with name IZTOKEN_SECRET');
    }
}

IZToken.encode = function (data) {
    try {
        var secret = getSecretKey();
        return jwt.encode(data, secret);
    } catch (e) {
        console.log("Encode failed: ", e);
        return false;
    }
}


IZToken.decode = function (data) {
    try {
        var secret = getSecretKey();
        return jwt.decode(data, secret);
    } catch(e) {
        console.log("Decode failed: ", e);
        return false;
    }
}

/**
 * @param  {Optional} data that need use after verify
 * @param  {Number} duration is number of seconds
 * @return {Object}
 */
IZToken.generate = function (data, duration) {
    check(data, Match.Any);
    check(duration, Number);
    var secret = getSecretKey();
    var token = {
        data: jwt.encode(data, secret),
        createdDate: new Date(),
        duration: duration
    };
    IZToken.Collection.insert(token);
    return token.data;
}

IZToken.verify = function (data) {
    check(data, String);
    var secret = getSecretKey();
    var result = {
        success: false,
        code: 2,
        msg: "Access token not found"
    };
    var token = IZToken.Collection.findOne({data: data});
    if (token) {
        var expiredDate = moment(token.createdDate).add(token.duration, 'second');
        if (expiredDate.valueOf() < Date.now()) {
            result = {
                success: false,
                code: 3,
                msg: "Access token is expired"
            };
        } else {
            result = {
                success: true,
                code: 1,
                msg: ""
            };
        }
    }
    return result;
}

IZToken.getData = function (data) {
    check(data, String);
    return jwt.decode(data, getSecretKey());
}

IZToken.reset = function () {
    IZToken.Collection.remove({});
}