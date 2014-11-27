/*
	Source:
	van Creij, Maurice (2014). "useful.gestures.js: A library of useful functions to ease working with touch and gestures.", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Gestures = useful.Gestures || function () {};

// extend the constructor
useful.Gestures.prototype.init = function (cfg) {
	// properties
	"use strict";
	this.cfg = cfg;
	this.obj = cfg.element;
	this.paused = false;
	// methods
	this.start = function () {
		// check the configuration properties
		this.checkConfig(this.cfg);
		// add the single touch events
		this.single = new this.Single(this);
		// add the multi touch events
		this.multi = new this.Multi(this);
		// disable the start function so it can't be started twice
		this.init = function () {};
	};
	this.checkConfig = function (config) {
		// add default values for missing ones
		config.threshold = config.threshold || 50;
		config.increment = config.increment || 0.1;
		// cancel all events by default
		if (config.cancelTouch === undefined || config.cancelTouch === null) { config.cancelTouch = true; }
		if (config.cancelGesture === undefined || config.cancelGesture === null) { config.cancelGesture = true; }
		// add dummy event handlers for missing ones
		config.swipeUp = config.swipeUp || function () {};
		config.swipeLeft = config.swipeLeft || function () {};
		config.swipeRight = config.swipeRight || function () {};
		config.swipeDown = config.swipeDown || function () {};
		config.drag = config.drag || function () {};
		config.pinch = config.pinch || function () {};
		config.twist = config.twist || function () {};
		config.doubleTap = config.doubleTap || function () {};
	};
	this.readEvent = function (event) {
		var coords = {}, offsets;
		// try all likely methods of storing coordinates in an event
		if (event.touches && event.touches[0]) {
			coords.x = event.touches[0].pageX;
			coords.y = event.touches[0].pageY;
		} else if (event.pageX !== undefined) {
			coords.x = event.pageX;
			coords.y = event.pageY;
		} else {
			coords.x = event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
			coords.y = event.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
		}
		return coords;
	};
	this.correctOffset = function (element) {
		var offsetX = 0, offsetY = 0;
		// if there is an offset
		if (element.offsetParent) {
			// follow the offsets back to the right parent element
			while (element !== this.obj) {
				offsetX += element.offsetLeft;
				offsetY += element.offsetTop;
				element = element.offsetParent;
			}
		}
		// return the offsets
		return { 'x' : offsetX, 'y' : offsetY };
	};
	// external API
	this.enableDefaultTouch = function () {
		this.cfg.cancelTouch = false;
	};
	this.disableDefaultTouch = function () {
		this.cfg.cancelTouch = true;
	};
	this.enableDefaultGesture = function () {
		this.cfg.cancelGesture = false;
	};
	this.disableDefaultGesture = function () {
		this.cfg.cancelGesture = true;
	};
	// go
	this.start();
	return this;
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Gestures;
}
