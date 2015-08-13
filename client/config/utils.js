function transformEntryId(id) {
    if(_.isNaN(+id))
        return id;
    return +id;
}