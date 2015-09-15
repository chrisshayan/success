Migrations.add({
    version: 2,
    name: "test migration 2",
    up: function () {
        console.log("up to version 2")
    },
    down: function() {
        console.log("down to version 2")
    }
});