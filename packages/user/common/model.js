/**
 * Created by HungNguyen on 8/21/15.
 */



var profile = new SimpleSchema({
    firstname: {
        type: String
    },
    lastname: {
        type: String
    }
});

Collection = Meteor.users;

User.appendSchema({
    emailSignature: {
        type: String,
        optional: true
    },
    userId: {
        type: Number
    },
    vnwData: {
        type: Object
    },
    'vnwData.$.userid': {
        type: String
    },
    role: {
        type: Number
    },
    profile: {
        type: profile
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
});