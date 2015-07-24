var limit = 10;

Template.rightSidebar.onCreated(function () {
    var instance = this;

    instance.autorun(function () {
        /*var sub = instance.subscribe('JobApplications', {limit: limit});
        if (sub.ready()) {
            console.log('connected candidate list already');
        }*/

    });
});


Template.rightSidebar.helpers({
    latestApplications: function () {
        return [];
        //var data = Collections.Applications.find({}, {limit: 10}).fetch();
        //
        //data = data.map(function (datum) {
        //    console.log(datum.createddate);
        //    if (datum.createddate)
        //        datum['_createddate'] = moment(datum.createddate).calendar();
        //    return datum;
        //});
        //
        //console.log(data);
        //return data;
    }
});


Template.rightSidebar.rendered = function () {

    // Initialize slimscroll for right sidebar
    $('.sidebar-container').slimScroll({
        height: '100%',
        railOpacity: 0.4,
        wheelStep: 10
    });


    // Move right sidebar top after scroll
    $(window).scroll(function () {
        if ($(window).scrollTop() > 0 && !$('body').hasClass('fixed-nav')) {
            $('#right-sidebar').addClass('sidebar-top');
        } else {
            $('#right-sidebar').removeClass('sidebar-top');
        }
    });

};

