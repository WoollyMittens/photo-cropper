/*
	Source:
	van Creij, Maurice (2012). "useful.gestures.js: A library of useful functions to ease working with touch and gestures.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// invoke strict mode
	"use strict";

	// object
	useful.Gestures = function (obj, cfg) {
		// properties
		this.obj = obj;
		this.cfg = cfg;
		this.lastTouch = null;
		this.touchOrigin = null;
		this.touchProgression = null;
		this.gestureOrigin = null;
		this.gestureProgression = null;
		this.paused = false;
		// methods
		this.start = function () {
			// check the configuration properties
			this.checkConfig(this.cfg);
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
			this.start = function () {};
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
			if (event.x !== undefined) {
				coords.x = event.x;
				coords.y = event.y;
			} else if (event.touches && event.touches[0]) {
				coords.x = event.touches[0].pageX;
				coords.y = event.touches[0].pageY;
			} else if (event.pageX !== undefined) {
				coords.x = event.pageX;
				coords.y = event.pageY;
			} else {
				offsets = this.correctOffset(event.target || event.srcElement);
				coords.x = event.layerX + offsets.x;
				coords.y = event.layerY + offsets.y;
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
		this.cancelTouch = function (event) {
			if (this.cfg.cancelTouch) {
				event = event || window.event;
				event.preventDefault();
			}
		};
		this.startTouch = function (event) {
			// if the functionality wasn't paused
			if (!this.paused) {
				// get the coordinates from the event
				var coords = this.readEvent(event);
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
				var coords = this.readEvent(event);
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
			var coords = this.readEvent(event);
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
		this.cancelGesture = function (event) {
			if (this.cfg.cancelGesture) {
				event = event || window.event;
				event.preventDefault();
			}
		};
		this.startGesture = function (event) {
			// if the functionality wasn't paused
			if (!this.paused) {
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
				var coords = this.readEvent(event);
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
			if (!this.paused && event.touches.length === 2) {
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
				var coords = this.readEvent(event);
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
				context.cancelGesture(event);
				// handle the event
				context.changeWheel(event);
			};
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
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Gestures;
	}

})();
