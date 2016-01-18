const tmpl = Template['LastApplications'];

tmpl.onCreated(function () {
    const instance = Template.instance();
    instance.props = new ReactiveDict();
    instance.props.set('isLoading', false);

    instance.autorun(() => {
        instance.props.set('isLoading', true);
        const sub = Meteor.subscribe('applications.lastApplications');
        if(sub.ready()) {
            instance.props.set('isLoading', false);
        }
    });
});


tmpl.helpers({
    isLoading() {
        return Template.instance().props.get('isLoading');
    },

    items() {
        return Application.find({}, {
            limit: 10,
            sort: {
                appliedDate: -1
            }
        })
    }
});