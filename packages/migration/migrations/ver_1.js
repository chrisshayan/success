Migrations.add({
    version: 1,
    name: "test migration",
    up: function () {
        console.log("up to version 1")
    },
    down: function() {
        console.log("down to version 1")
    }
});