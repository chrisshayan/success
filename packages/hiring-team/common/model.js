/**
 * Created by HungNguyen on 10/5/15.
 */

var model = BaseModel.extendAndSetupCollection("hiringTeam");

Collection = model.collection;


model.appendSchema({
    companyId: {
        type: Number
    },
    email: {
        type: String
    },
    userId: {
        type: String
    },

    name: {
        type: String
    },

    status: {
        type: Number,
        defaultValue: 0 // 0 : pending, 1 accepted
    },
    roleId: {
        type: [String],
        defaultValue: []
    },
    dateAdded: {
        type: Date,
        defaultValue: new Date()
    },
    expiredAt: {
        type: Date,
        defaultValue: moment().add(1, 'day').toDate()
    }
});

HiringTeam = model;
