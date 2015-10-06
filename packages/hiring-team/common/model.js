/**
 * Created by HungNguyen on 10/5/15.
 */

var model = BaseModel.extendAndSetupCollection("hiringTeam");


Collection = model.collection;


model.appendSchema({
    companyId: {
        type: Number
    },
    userId: {
        type: Number
    },
    roleId: {
        type: [String]
    }
});