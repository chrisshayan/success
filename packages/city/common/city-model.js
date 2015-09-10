City = BaseModel.extendAndSetupCollection("cities");

City.appendSchema({
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