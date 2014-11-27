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
useful.Gestures.prototype.Multi = function (parent) {
	// properties
	"use strict";
	this.parent = parent;
	this.cfg = parent.cfg;
	this.obj = parent.cfg.element;
	this.gestureOrigin = null;
	this.gestureProgression = null;
	// methods
	this.start = function () {
		// set the required events for gestures
		if ('ongesturestart' in window) {
			this.obj.addEventListener('gesturestart', this.onStartGesture());
			this.obj.addEventListener('gesturechange', this.onChangeGesture());
			this.obj.addEventListener('gestureend', this.onEndGesture());
		} else if ('msgesturestart' in window) {
			this.obj.addEventListener('msgesturestart', this.onStartGesture());
			this.obj.addEventListener('msgesturechange', this.onChangeGesture());
			this.obj.addEventListener('msgestureend', this.onEndGesture());
		} else {
			this.obj.addEventListener('touchstart', this.onStartFallback());
			this.obj.addEventListener('touchmove', this.onChangeFallback());
			this.obj.addEventListener('touchend', this.onEndFallback());
		}
		// disable the start function so it can't be started twice
		this.init = function () {};
	};
	this.cancelGesture = function (event) {
		if (this.cfg.cancelGesture) {
			event = event || window.event;
			event.preventDefault();
		}
	};
	this.startGesture = function (event) {
		// if the functionality wasn't paused
		if (!this.parent.paused) {
			// note the start position
			this.gestureOrigin = {
				'scale' : event.scale,
				'rotation' : event.rotation,
				'target' : event.target || event.srcElement
			};
			this.gestureProgression = {
				'scale' : this.gestureOrigin.scale,
				'rotation' : this.gestureOrigin.rotation
			};
		}
	};
	this.changeGesture = function (event) {
		// if there is an origin
		if (this.gestureOrigin) {
			// get the distances from the event
			var scale = event.scale,
				rotation = event.rotation;
			// get the coordinates from the event
			var coords = this.parent.readEvent(event);
			// get the gesture parameters
			this.cfg.pinch({
				'x' : coords.x,
				'y' : coords.y,
				'scale' : scale - this.gestureProgression.scale,
				'event' : event,
				'target' : this.gestureOrigin.target
			});
			this.cfg.twist({
				'x' : coords.x,
				'y' : coords.y,
				'rotation' : rotation - this.gestureProgression.rotation,
				'event' : event,
				'target' : this.gestureOrigin.target
			});
			// update the current position
			this.gestureProgression = {
				'scale' : event.scale,
				'rotation' : event.rotation
			};
		}
	};
	this.endGesture = function () {
		// note the start position
		this.gestureOrigin = null;
	};
	// fallback functionality
	this.startFallback = function (event) {
		// if the functionality wasn't paused
		if (!this.parent.paused && event.touches.length === 2) {
			// note the start position
			this.gestureOrigin = {
				'touches' : [
					{ 'pageX' : event.touches[0].pageX, 'pageY' : event.touches[0].pageY },
					{ 'pageX' : event.touches[1].pageX, 'pageY' : event.touches[1].pageY }
				],
				'target' : event.target || event.srcElement
			};
			this.gestureProgression = {
				'touches' : this.gestureOrigin.touches
			};
		}
	};
	this.changeFallback = function (event) {
		// if there is an origin
		if (this.gestureOrigin && event.touches.length === 2) {
			// get the coordinates from the event
			var coords = this.parent.readEvent(event);
			// calculate the scale factor
			var scale = 0, progression = this.gestureProgression;
			scale += (event.touches[0].pageX - event.touches[1].pageX) / (progression.touches[0].pageX - progression.touches[1].pageX);
			scale += (event.touches[0].pageY - event.touches[1].pageY) / (progression.touches[0].pageY - progression.touches[1].pageY);
			scale = scale - 2;
			// get the gesture parameters
			this.cfg.pinch({
				'x' : coords.x,
				'y' : coords.y,
				'scale' : scale,
				'event' : event,
				'target' : this.gestureOrigin.target
			});
			// update the current position
			this.gestureProgression = {
				'touches' : [
					{ 'pageX' : event.touches[0].pageX, 'pageY' : event.touches[0].pageY },
					{ 'pageX' : event.touches[1].pageX, 'pageY' : event.touches[1].pageY }
				]
			};
		}
	};
	this.endFallback = function () {
		// note the start position
		this.gestureOrigin = null;
	};
	// gesture events
	this.onStartGesture = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			context.cancelGesture(event);
			// handle the event
			context.startGesture(event);
			context.changeGesture(event);
		};
	};
	this.onChangeGesture = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			context.cancelGesture(event);
			// handle the event
			context.changeGesture(event);
		};
	};
	this.onEndGesture = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// handle the event
			context.endGesture(event);
		};
	};
	// gesture events
	this.onStartFallback = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			//context.cancelGesture(event);
			// handle the event
			context.startFallback(event);
			context.changeFallback(event);
		};
	};
	this.onChangeFallback = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			context.cancelGesture(event);
			// handle the event
			context.changeFallback(event);
		};
	};
	this.onEndFallback = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// handle the event
			context.endGesture(event);
		};
	};
	// go
	this.start();
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Gestures.Multi;
}
