/**
 * Created by HungNguyen on 8/21/15.
 */



var profile = new SimpleSchema({
    firstname: {
        type: String,
        optional: true
    },
    lastname: {
        type: String,
        optional: true
    }
});

Collection = Meteor.users;

User.appendSchema({
    emails: {
        type: [Object],
        // this must be optional if you also use other login services like facebook,
        // but if you use only accounts-password, then it can be required
        optional: true
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    emailSignature: {
        type: String,
        optional: true
    },
    username: {
        type: String,
        optional: true
    },

    userId: {
        type: Number,
        optional: true
    },
    vnwData: {
        type: Object,
        blackbox: true,
        optional: true
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    roles: {
        type: [String],
        optional: true
    },
    profile: {
        type: profile,
        optional: true
    },

    createdAt: {
        type: Date
    }
});
