companyInfoForm = BlazeComponent.extendComponent({
    onCreated: function () {
        var instance = Template.instance();
        var data = this.data();

        /*if (!data.numberOfMonthSync) {
         Meteor.call('setNumberOfMonth', defaultMonth, data.companyId);
         }*/
        this.month = new ReactiveVar(data.numberOfMonthSync);
        //this.month = new ReactiveVar(0);

        instance.autorun(function () {

        });
    },

    options: function () {
        return [{label: '3 month ago', value: 3},
            {label: '6 month ago', value: 6},
            {label: '9 month ago', value: 9},
            {label: '12 month ago', value: 12}];
    },

    events: function () {
        var self = this;
        return [{
            'change #select-nom': function (e) {
                $('.nomonth-action').toggle(!(this.month.get() == e.target.value));
            },
            'click .nomonth.confirm': function (e) {
                e.preventDefault();
                var value = $('#select-nom').val();
                Meteor.call('setNumberOfMonth', +value, self.data().companyId, function (err, isChange) {
                    if (isChange) {
                        self.month.set(+value);
                        Notification.success('Saved');
                    } else {
                        Notification.error('Error, please try again!');
                    }

                    $('#select-nom').trigger('change');
                });

            },
            'click .nomonth.cancel': function (e) {
                e.preventDefault();
                var value = (self.month.get()) ? self.month.get() : self.defaultMonth;
                $('#select-nom').val(value).trigger('change');
            }
        }];
    },

    defaultMonth: function () {
        return 6;
    },

    onRendered: function () {
        var value = (this.month.get()) ? this.month.get() : this.defaultMonth;
        $('#select-nom').val(value).trigger('change');
    },

    onDestroyed: function () {

    }

}).register('companyInfoForm');