/*
	Source:
	van Creij, Maurice (2014). "useful.cropper.js: A simple image cropper", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Cropper = useful.Cropper || function () {};

// extend the constructor
useful.Cropper.prototype.Busy = function (parent) {
	// properties
	"use strict";
	this.parent = parent;
	// methods
	this.build = function () {
		var cfg = this.parent.cfg;
		// add a busy message
		this.spinner = document.createElement('span');
		this.spinner.className = 'cr-busy';
		this.spinner.innerHTML = 'Please wait...';
		this.spinner.style.visibility = 'hidden';
		cfg.element.appendChild(this.spinner);
	};
	this.show = function () {
		// show the busy message
		this.spinner.style.visibility = 'visible';
	};
	this.hide = function () {
		// show the busy message
		this.spinner.style.visibility = 'hidden';
	};
	// build the busy message
	this.build();
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Cropper.Busy;
}
