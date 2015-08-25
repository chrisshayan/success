/**
 * Created by HungNguyen on 8/21/15.
 */

var model = BaseModel.extendAndSetupCollection("vnw_resumes");

Collection = model.collection;

model.appendSchema({
    data: Object,
    createdAt: Date,
    updatedAt: Date

});

Resume.model = model;