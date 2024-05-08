import { GesturesSingle } from './gestures-single.js';
import { GesturesMulti } from './gestures-multi.js';

export class Gestures {
	constructor(config) {
		// store the configuration properties
		this.config = this.checkConfig(config);
		this.element = config.element;
		this.paused = false;
		// add the single touch events
		if (config.allowSingle) { this.single = new GesturesSingle(this); }
		// add the multi touch events
		if (config.allowMulti) { this.multi = new GesturesMulti(this); }
	}

	checkConfig(config) {
		// add default values for missing ones
		config.threshold = config.threshold || 50;
		config.increment = config.increment || 0.1;
		// cancel all events by default
		if (config.cancelTouch === undefined || config.cancelTouch === null) { config.cancelTouch = true; }
		if (config.cancelGesture === undefined || config.cancelGesture === null) { config.cancelGesture = true; }
		// add dummy event handlers for missing ones
		if (config.swipeUp || config.swipeLeft || config.swipeRight || config.swipeDown || config.drag || config.doubleTap) {
			config.allowSingle = true;
			config.swipeUp = config.swipeUp || function () {};
			config.swipeLeft = config.swipeLeft || function () {};
			config.swipeRight = config.swipeRight || function () {};
			config.swipeDown = config.swipeDown || function () {};
			config.drag = config.drag || function () {};
			config.doubleTap = config.doubleTap || function () {};
		}
		// if there's pinch there's also twist
		if (config.pinch || config.twist) {
			config.allowMulti = true;
			config.pinch = config.pinch || function () {};
			config.twist = config.twist || function () {};
		}
		// return the fixed config
		return config;
	}

	readEvent(evt) {
		var coords = {}, offsets;
		// try all likely methods of storing coordinates in an event
		if (evt.touches && evt.touches[0]) {
			coords.x = evt.touches[0].pageX;
			coords.y = evt.touches[0].pageY;
		} else if (evt.pageX !== undefined) {
			coords.x = evt.pageX;
			coords.y = evt.pageY;
		} else {
			coords.x = evt.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
			coords.y = evt.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
		}
		return coords;
	}

	correctOffset(element) {
		var offsetX = 0, offsetY = 0;
		// if there is an offset
		if (element.offsetParent) {
			// follow the offsets back to the right parent element
			while (element !== this.element) {
				offsetX += element.offsetLeft;
				offsetY += element.offsetTop;
				element = element.offsetParent;
			}
		}
		// return the offsets
		return { 'x' : offsetX, 'y' : offsetY };
	}

	enableDefaultTouch() {
		this.config.cancelTouch = false;
	}

	disableDefaultTouch() {
		this.config.cancelTouch = true;
	}

	enableDefaultGesture() {
		this.config.cancelGesture = false;
	}

	disableDefaultGesture() {
		this.config.cancelGesture = true;
	}
}
