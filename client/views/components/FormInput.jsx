FormInput = React.createClass({
    getDefaultProps() {
        return {
            label: '',
            type: 'text',
            placeholder: '',
            value: '',
            error: null,
            disabled: false,
            hasStatic: false
        }
    },

    value() {
        return this.refs.input
            ? this.refs.input.value
            : '';
    },

    reset(val){
        this.refs.input.value = val || this.props.value;
    },

    clear() {
        this.refs.input.value = '';

    },

    focus() {
        this.refs.input.focus();
    },

    renderStaticForm(isEditable, editToggle, val){
        if (isEditable)
            return (editToggle) ? '' : <p className="form-control-static">{val}</p>;
        else
            return '';

    },

    render() {
        const {label, type, placeholder, value, error, disabled, isEditable, editToggle, labelClass, inputClass} = this.props;
        const containerClass = classNames('form-group', {error: !!error});
        const self = this;

        return (
            <div className={containerClass}>
                <div className={labelClass || 'col-sm-3 control-label'}>
                    <label>{ label }</label>
                </div>
                <div className={inputClass || 'col-sm-9'}>
                    {self.renderStaticForm(isEditable, editToggle, value)}
                    <input
                        ref='input'
                        className='form-control'
                        type={ editToggle || !isEditable ? type || 'text' : 'hidden'}
                        placeholder={ placeholder }
                        disabled={ disabled }
                        defaultValue={ value }/>
                    {error && (<p className="msg">{ error }</p>)}

                </div>

            </div>

        )
    }
});