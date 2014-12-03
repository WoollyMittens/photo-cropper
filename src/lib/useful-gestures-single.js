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
useful.Gestures.prototype.Single = function (parent) {
	// properties
	"use strict";
	this.parent = parent;
	this.cfg = parent.cfg;
	this.obj = parent.cfg.element;
	this.lastTouch = null;
	this.touchOrigin = null;
	this.touchProgression = null;
	// methods
	this.start = function () {
		// set the required events for mouse
		this.obj.addEventListener('mousedown', this.onStartTouch());
		this.obj.addEventListener('mousemove', this.onChangeTouch());
		document.body.addEventListener('mouseup', this.onEndTouch());
		this.obj.addEventListener('mousewheel', this.onChangeWheel());
		if (navigator.userAgent.match(/firefox/gi)) { this.obj.addEventListener('DOMMouseScroll', this.onChangeWheel()); }
		// set the required events for touch
		this.obj.addEventListener('touchstart', this.onStartTouch());
		this.obj.addEventListener('touchmove', this.onChangeTouch());
		document.body.addEventListener('touchend', this.onEndTouch());
		this.obj.addEventListener('mspointerdown', this.onStartTouch());
		this.obj.addEventListener('mspointermove', this.onChangeTouch());
		document.body.addEventListener('mspointerup', this.onEndTouch());
		// disable the start function so it can't be started twice
		this.init = function () {};
	};
	this.cancelTouch = function (event) {
		if (this.cfg.cancelTouch) {
			event = event || window.event;
			event.preventDefault();
		}
	};
	this.startTouch = function (event) {
		// if the functionality wasn't paused
		if (!this.parent.paused) {
			// get the coordinates from the event
			var coords = this.parent.readEvent(event);
			// note the start position
			this.touchOrigin = {
				'x' : coords.x,
				'y' : coords.y,
				'target' : event.target || event.srcElement
			};
			this.touchProgression = {
				'x' : this.touchOrigin.x,
				'y' : this.touchOrigin.y
			};
		}
	};
	this.changeTouch = function (event) {
		// if there is an origin
		if (this.touchOrigin) {
			// get the coordinates from the event
			var coords = this.parent.readEvent(event);
			// get the gesture parameters
			this.cfg.drag({
				'x' : this.touchOrigin.x,
				'y' : this.touchOrigin.y,
				'horizontal' : coords.x - this.touchProgression.x,
				'vertical' : coords.y - this.touchProgression.y,
				'event' : event,
				'source' : this.touchOrigin.target
			});
			// update the current position
			this.touchProgression = {
				'x' : coords.x,
				'y' : coords.y
			};
		}
	};
	this.endTouch = function (event) {
		// if the numbers are valid
		if (this.touchOrigin && this.touchProgression) {
			// calculate the motion
			var distance = {
				'x' : this.touchProgression.x - this.touchOrigin.x,
				'y' : this.touchProgression.y - this.touchOrigin.y
			};
			// if there was very little movement, but this is the second touch in quick successionif (
			if (
				this.lastTouch &&
				Math.abs(this.touchOrigin.x - this.lastTouch.x) < 10 &&
				Math.abs(this.touchOrigin.y - this.lastTouch.y) < 10 &&
				new Date().getTime() - this.lastTouch.time < 500 &&
				new Date().getTime() - this.lastTouch.time > 100
			) {
				// treat this as a double tap
				this.cfg.doubleTap({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'event' : event, 'source' : this.touchOrigin.target});
			// if the horizontal motion was the largest
			} else if (Math.abs(distance.x) > Math.abs(distance.y)) {
				// if there was a right swipe
				if (distance.x > this.cfg.threshold) {
					// report the associated swipe
					this.cfg.swipeRight({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : distance.x, 'event' : event, 'source' : this.touchOrigin.target});
				// else if there was a left swipe
				} else if (distance.x < -this.cfg.threshold) {
					// report the associated swipe
					this.cfg.swipeLeft({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : -distance.x, 'event' : event, 'source' : this.touchOrigin.target});
				}
			// else
			} else {
				// if there was a down swipe
				if (distance.y > this.cfg.threshold) {
					// report the associated swipe
					this.cfg.swipeDown({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : distance.y, 'event' : event, 'source' : this.touchOrigin.target});
				// else if there was an up swipe
				} else if (distance.y < -this.cfg.threshold) {
					// report the associated swipe
					this.cfg.swipeUp({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : -distance.y, 'event' : event, 'source' : this.touchOrigin.target});
				}
			}
			// store the history of this touch
			this.lastTouch = {
				'x' : this.touchOrigin.x,
				'y' : this.touchOrigin.y,
				'time' : new Date().getTime()
			};
		}
		// clear the input
		this.touchProgression = null;
		this.touchOrigin = null;
	};
	this.changeWheel = function (event) {
		// measure the wheel distance
		var scale = 1, distance = ((window.event) ? window.event.wheelDelta / 120 : -event.detail / 3);
		// get the coordinates from the event
		var coords = this.parent.readEvent(event);
		// equate wheeling up / down to zooming in / out
		scale = (distance > 0) ? +this.cfg.increment : scale = -this.cfg.increment;
		// report the zoom
		this.cfg.pinch({
			'x' : coords.x,
			'y' : coords.y,
			'scale' : scale,
			'event' : event,
			'source' : event.target || event.srcElement
		});
	};
	// touch events
	this.onStartTouch = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// get event object
			event = event || window.event;
			// handle the event
			context.startTouch(event);
			context.changeTouch(event);
		};
	};
	this.onChangeTouch = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// get event object
			event = event || window.event;
			// optionally cancel the default behaviour
			context.cancelTouch(event);
			// handle the event
			context.changeTouch(event);
		};
	};
	this.onEndTouch = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// get event object
			event = event || window.event;
			// handle the event
			context.endTouch(event);
		};
	};
	// mouse wheel events
	this.onChangeWheel = function () {
		// store the context
		var context = this;
		// return and event handler
		return function (event) {
			// get event object
			event = event || window.event;
			// optionally cancel the default behaviour
			context.cancelTouch(event);
			// handle the event
			context.changeWheel(event);
		};
	};
	// go
	this.start();
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Gestures.Single;
}
