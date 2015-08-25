/**
 * Created by HungNguyen on 8/21/15.
 */

var model = BaseModel.extendAndSetupCollection("vnw_activities");

Collection = model.collection;

model.appendSchema({
    data: Object,
    createdAt: Date,
    updatedAt: Date

});

Activity.model = model;