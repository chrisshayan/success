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

FormTabEvents = {
	bind() {
		document.addEventListener('keydown', this.onTab);
	},
	unbind() {
		document.removeEventListener('keydown', this.onTab);
	},
	onTab() {
		if (event.which === 9) {
			event.preventDefault();

			var selectables = $('.tabbable');
			var current = $(':focus');

			if(event.shiftKey){
				var prevIndex = selectables.length - 1;
				if(current.length === 1){
					var currentIndex = selectables.index(current);
					if(currentIndex > 0){
						prevIndex = currentIndex - 1;
					}
				}

				selectables.eq(prevIndex).focus();
			}
			else{
				var nextIndex = 0;
				if(current.length === 1){
					var currentIndex = selectables.index(current);
					if(currentIndex + 1 < selectables.length){
						nextIndex = currentIndex + 1;
					}
				}
				selectables.eq(nextIndex).focus();
			}
		}
	}
};