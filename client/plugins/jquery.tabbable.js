///*!
// * jQuery.tabbable 1.0 - Simple utility for selecting the next / previous '.tabbable' element.
// * https://github.com/marklagendijk/jQuery.tabbable
// *
// * Includes '.tabbable' and '.focusable' selectors from jQuery UI Core
// *
// * Copyright 2013, Mark Lagendijk
// * Released under the MIT license
// *
// */
//(function($){
//	'use strict';
//
//	/**
//	 * Focusses the next .focusable element. Elements with tabindex=-1 are focusable, but not tabable.
//	 * Does not take into account that the taborder might be different as the .tabbable elements order
//	 * (which happens when using tabindexes which are greater than 0).
//	 */
//	$.focusNext = function(){
//		selectNextTabbableOrFocusable('.focusable');
//	};
//
//	/**
//	 * Focusses the previous .focusable element. Elements with tabindex=-1 are focusable, but not tabable.
//	 * Does not take into account that the taborder might be different as the .tabbable elements order
//	 * (which happens when using tabindexes which are greater than 0).
//	 */
//	$.focusPrev = function(){
//		selectPrevTabbableOrFocusable('.focusable');
//	};
//
//	/**
//	 * Focusses the next :tabable element.
//	 * Does not take into account that the taborder might be different as the .tabbable elements order
//	 * (which happens when using tabindexes which are greater than 0).
//	 */
//	$.tabNext = function(){
//		selectNextTabbableOrFocusable('.tabbable');
//	};
//
//	/**
//	 * Focusses the previous .tabbable element
//	 * Does not take into account that the taborder might be different as the .tabbable elements order
//	 * (which happens when using tabindexes which are greater than 0).
//	 */
//	$.tabPrev = function(){
//		selectPrevTabbableOrFocusable('.tabbable');
//	};
//
//
//
//
//})(jQuery);