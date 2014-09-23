/*
	Source:
	van Creij, Maurice (2012). "useful.cropper.js: A simple image cropper", version 20130510, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// private functions
	useful.Cropper_Busy = function (parent) {
		this.parent = parent;
		this.build = function () {
			// add a busy message
			this.spinner = document.createElement('span');
			this.spinner.className = 'cr-busy';
			this.spinner.innerHTML = 'Please wait...';
			this.spinner.style.visibility = 'hidden';
			this.parent.obj.appendChild(this.spinner);
		};
		this.show = function () {
			// show the busy message
			this.spinner.style.visibility = 'visible';
		};
		this.hide = function () {
			// show the busy message
			this.spinner.style.visibility = 'hidden';
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Cropper_Busy;
	}

})();
