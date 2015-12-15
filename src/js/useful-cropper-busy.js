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

	// PROPERTIES
	
	"use strict";
	this.parent = parent;
	this.config = parent.config;

	// METHODS
	
	this.init = function () {
		var config = this.config;
		// add a busy message
		this.spinner = document.createElement('span');
		this.spinner.className = 'cr-busy';
		this.spinner.innerHTML = 'Please wait...';
		this.spinner.style.visibility = 'hidden';
		config.element.appendChild(this.spinner);
		// return the object
		return this;
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
	exports = module.exports = useful.Cropper.Busy;
}
