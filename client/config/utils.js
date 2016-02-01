function transformEntryId(id) {
    if(_.isNaN(+id))
        return id;
    return +id;
}

Utils = {};

checkAccessPermission = function({onSuccess, onFail}) {
	const current = _.clone(Router.current());
	const data = {
		routeName: current.route.getName(),
		params: _.toPlainObject(current.params),
		queryParams: _.toPlainObject(current.params.query)
	};
	Meteor.call('checkAccessPermission', data, (err, result) => {
		if(err || !result) {
			onFail && onFail();
		} else {
			onSuccess && onSuccess();
		}
	});
};