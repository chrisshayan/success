const tmpl = Template['LastOpenJobs'];

tmpl.onCreated(function () {
    const instance = Template.instance();
    instance.props = new ReactiveDict();
    instance.props.set('isLoading', true);
    instance.props.set('items', []);

    Meteor.call('ES.lastOpenJobs', (err, items) => {
        instance.props.set('isLoading', false);

        if (!err && items) {
            console.log(items);
            instance.props.set('items', items);
        }
    });
});

tmpl.helpers({
    isLoading() {
        return Template.instance().props.get('isLoading');
    },

    items() {
        return Template.instance().props.get('items');
    }
});