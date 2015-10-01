Migrations.add({
    version: 12,
    name: "Clean skill terms, priority field, remove duplicate",
    up: function () {
        console.log("up to version 12");
        /**
         * remove all skill with length <= 1
         */
        console.log("> remove all skill with length <= 1")
        Collections.SkillTerms.remove({
            $where: "this.skillName.trim().length <= 1"
        });

        /**
         * Clean and transform to lower case
         */
        console.log("> Clean and transform to lower case");
        console.log("> Add field skillLength for sorting");
        Collections.SkillTerms.find({}, {
            fields: {
                skillName: 1
            }
        }).forEach(function (doc) {
            var _name = doc.skillName.toLowerCase().trim();
            _name = _name.replace(/["'<>]/gi, '').replace(/\s+/g, ' ');
            Collections.SkillTerms.update({
                _id: doc._id
            }, {
                $set: {
                    skillName: _name,
                    skillLength: _name.length
                }
            });
        })

    },
    down: function () {
        console.log("down to version 11");

    }
});
