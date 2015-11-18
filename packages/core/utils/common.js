Utils.APPLICATION_STAGES = {
    //0: {
    //    id: 0,
    //    alias: "sourced",
    //    label: "Sourced"
    //},
    1: {
        id: 1,
        alias: "applied",
        label: "Applied"
    },
    2: {
        id: 2,
        alias: "phone",
        label: "Phone Screen"
    },
    3: {
        id: 3,
        alias: "interview",
        label: "Interview"
    },
    4: {
        id: 4,
        alias: "offer",
        label: "Offer"
    },
    5: {
        id: 5,
        alias: "hired",
        label: "Hired"
    }
};


Utils.formatDate = function(date) {
    if(!date) return date;
    return moment(date).format("DD-MM-YYYY");
};