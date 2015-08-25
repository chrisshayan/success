/**
 * Created by HungNguyen on 8/21/15.
 */



Collection = User._collection;

User.appendSchema({
    emailSignature: {
        type: String,
        optional: true
    },
    userId: {
        type: Number
    },
    data: {
        type: String
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date
    }
});