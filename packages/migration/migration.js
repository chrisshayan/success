Migrations.unlock = function () {
    Migrations._collection.update({_id: "control"}, {$set: {"locked": false}});
}