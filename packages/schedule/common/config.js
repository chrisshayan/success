/**
 * Created by HungNguyen on 8/21/15.
 */


var CONFIG = {
    defaultPublishOptions: {
        fields: {
            _id: 1,
            candidateId: 1,
            createdAt: 1,
            "data.city": 1,
            "data.username": 1,
            "data.firstname": 1,
            "data.lastname": 1,
            "data.genderid": 1,
            "data.birthday": 1,
            "data.address": 1,
            "data.district": 1,
            "data.email1": 1,
            "data.homephone": 1,
            "data.cellphone": 1,
            "data.firstName": 1,
            "data.lastName": 1,
            "data.headline": 1,
            "data.email": 1,
            "data.phone": 1,
            "data.source": 1,
            "data.otherSource": 1,
            "data.profileLink": 1,
            "data.comment": 1,
            "data.skills": 1
        }
    }
};

Core.registerConfig('candidate', CONFIG);