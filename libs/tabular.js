
TabularTables = {};

TabularTables.HiringTeam = new Tabular.Table({
    name: "HiringTeam",
    collection: Meteor.hiringTeam,
    selector: function (userId) {
        var f = {};
        var user = Meteor.users.findOne({_id: userId});
        var company = Collections.CompanySettings.findOne({companyId: user.companyId || null});
        if (company) {
            f['companyId'] = company.companyId;
        }
        return f;
    },
    columns: [
        {data: "name", title: "Name"},
        {data: "email", title: "Email"},
        {
            data: "username",
            title: "Username",
            render: function(val, type, doc) {
                return '@' + val;
            }
        },
        {
            data: "dateAdded",
            title: "Date added",
            render: function(val, type, doc) {
                return moment(val).calendar();
            }
        },
        {
            data: "status",
            title: "Status",
            render: function(val, type, doc) {
                if (val == void 0) return 'unknown';

                switch (val) {
                    case 1 :
                        return 'confirmed';
                    case 0 :
                    default :
                        return 'pending';

                }
            }
        },
        {
            tmpl: Meteor.isClient && Template.hiringTeamActionsCell
        }
    ]
});
