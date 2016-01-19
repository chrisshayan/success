FormInput = React.createClass({
	getDefaultProps() {
		return {
			label: '',
			type: 'text',
			placeholder: '',
			value: '',
			error: null,
			disabled: false
		}
	},

	value() {
		return this.refs.input
			? this.refs.input.getDOMNode().value
			: '' ;
	},

	clear() {
		this.refs.input.getDOMNode().value = '';
	},

	focus() {
		this.refs.input.getDOMNode().focus();
	},

	render() {
		const {label, type, placeholder, value, error, disabled} = this.props;
		const containerClass = classNames('form-group', {error: !!error});

		return (
			<div className={containerClass}>
				<label className='control-label'>{ label }</label>

				<input
					ref='input'
					className='form-control'
					type={ type }
					placeholder={ placeholder }
					disabled={ disabled }
					defaultValue={ value } />

				{error && (<p className="msg">{ error }</p>)}
			</div>
		);
	}
});