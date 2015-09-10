Industry = BaseModel.extendAndSetupCollection("industries");

Industry.appendSchema({
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
