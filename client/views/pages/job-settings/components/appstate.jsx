AppState = {
    Container: {
        childContextTypes: {
            _state: React.PropTypes.object,
            _data: React.PropTypes.object,
            _actions: React.PropTypes.object
        },

        getChildContext: function() {
            return {
                _state: this.registerAppState(),
                _data: this.registerAppData(),
                _actions: this.registerAppActions()
            }
        }
    },

    Child: {

    }
};