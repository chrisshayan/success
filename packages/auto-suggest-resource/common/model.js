/**
 * Created by HungNguyen on 8/21/15.
 */

var model = BaseModel.extendAndSetupCollection("skills");

Collection = model.collection;


model.appendSchema({
    vnwId: {
        type: id,
        optional: true
    },
    skillId: {
        type: String  // id for searching
    },
    skillName: {
        type: String // display skill name
    }
});

Skills = model;