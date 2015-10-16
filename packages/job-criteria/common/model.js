/**
 * Created by HungNguyen on 8/21/15.
 */
var model = BaseModel.extendAndSetupCollection("job_criteria");
Collection = model.collection;


var criteriaSchema = new SimpleSchema({
    name: {
        type: String
    },
    value: {
        type: [String],
        optional: true
    }
});


model.appendSchema({
    jobId: {
        type: Number
    },
    category: {
        type: [criteriaSchema]
    }
});

JobCriteria = model;
