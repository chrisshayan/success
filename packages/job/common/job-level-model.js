JobLevel = BaseModel.extendAndSetupCollection("job_levels");
JobLevel.appendSchema({
    vnwId: {
        type: Number
    },
    name: {
        type: String
    },
    languageId: {
        type: Number
    },
    order: {
        type: Number
    }
});

