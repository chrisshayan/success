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

Collection = User._collection;

User.appendSchema({
    emailSignature: {
        type: String,
        optional: true
    },
    vnw_password: {
        type: String,
        optional: true
    },
    userId: {
        type: Number
    },
    vnwData: {
        type: Object,
        blackbox: true
    },
    'vnwData.$.userid': {
        type: String,
        optional: true
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