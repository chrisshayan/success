/**
 * Created by HungNguyen on 8/21/15.
 */


var CONFIG = {
    DEFAULT_CANDIDATE_OPTIONS: {
        _id: 1,
        userId: 1,
        "vnwData.city": 1,
        "vnwData.username": 1,
        "vnwData.firstname": 1,
        "vnwData.lastname": 1,
        "vnwData.genderid": 1,
        "vnwData.birthday": 1,
        "vnwData.address": 1,
        "vnwData.district": 1,
        "vnwData.email1": 1,
        "vnwData.homephone": 1,
        "vnwData.cellphone": 1,
        "vnwData.createddate": 1
    }

};

Core.registerConfig('candidate', CONFIG);