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

    render() {
        const {label, type, placeholder, value, error, disabled, isStatic, labelClass, inputClass} = this.props;
        const containerClass = classNames('form-group', {error: !!error});

        return (
            <div className={containerClass}>
                <div className={labelClass || 'col-sm-3 control-label'}>
                    <label>{ label }</label>
                </div>
                <div className={inputClass || 'col-sm-9'}>
                    <input
                        ref='input'
                        className='form-control'
                        type={ isStatic ?  'text' :  type }
                        placeholder={ placeholder }
                        disabled={ disabled }
                        defaultValue={ value }/>
                    {error && (<p className="msg">{ error }</p>)}
                    <p hidden={isStatic} className="form-control-static">{value}</p>
                </div>

            </div>

        )

    }
});