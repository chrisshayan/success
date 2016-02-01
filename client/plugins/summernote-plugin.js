//(function (factory) {
//	/* global define */
//	if (typeof define === 'function' && define.amd) {
//		// AMD. Register as an anonymous module.
//		define(['jquery'], factory);
//	} else {
//		// Browser globals: jQuery
//		factory(window.jQuery);
//	}
//}(function ($) {
//	// template
//	var tmpl = $.summernote.renderer.getTemplate();
//
//	/**
//	 * @class plugin.hello
//	 *
//	 * Hello Plugin
//	 */
//	$.summernote.addPlugin({
//		/** @property {String} name name of plugin */
//		name: 'mail',
//		buttons: {
//			mailPlaceholder: function (lang, options) {
//				var list = '<li><a data-event="selectPlaceholder" href="#" data-value="candidate_first_name">Candidate first name</a></li>';
//				list += '<li><a data-event="selectPlaceholder" href="#" data-value="position">Job title</a></li>';
//				list += '<li><a data-event="selectPlaceholder" href="#" data-value="company">Company name</a></li>';
//				list += '<li><a data-event="selectPlaceholder" href="#" data-value="mail_signature">Mail signature</a></li>';
//				var dropdown = '<ul class="dropdown-menu">' + list + '</ul>';
//
//				return tmpl.iconButton(options.iconPrefix + 'asterisk', {
//					title: 'Placeholder',
//					hide: true,
//					dropdown: dropdown
//				});
//			}
//		},
//
//		events: { // events
//			selectPlaceholder: function (event, editor, layoutInfo, value) {
//				var $editable = layoutInfo.editable();
//				editor.insertText($editable, sprintf(" [[%s]]", value));
//			}
//		}
//	});
//}));