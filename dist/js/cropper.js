/*
	Source:
	van Creij, Maurice (2018). "gestures.js: A library of useful functions to ease working with touch and gestures.", http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// extend the constructor
var Gestures = function (config) {

	// PROPERTIES

	// METHODS

	this.only = function (config) {
		// start an instance of the script
		return new this.Main(config, this);
	};

	this.each = function (config) {
		var _config, _context = this, instances = [];
		// for all element
		for (var a = 0, b = config.elements.length; a < b; a += 1) {
			// clone the configuration
			_config = Object.create(config);
			// insert the current element
			_config.element = config.elements[a];
			// delete the list of elements from the clone
			delete _config.elements;
			// start a new instance of the object
			instances[a] = new this.Main(_config, _context);
		}
		// return the instances
		return instances;
	};

	// START

	return (config.elements) ? this.each(config) : this.only(config);

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = Gestures;
}

// extend the class
Gestures.prototype.Main = function (config, context) {

	// PROPERTIES

	this.config = config;
	this.context = context;
	this.element = config.element;
	this.paused = false;

	// METHODS

	this.init = function () {
		// check the configuration properties
		this.config = this.checkConfig(config);
		// add the single touch events
		if (config.allowSingle) { this.single = new this.context.Single(this); }
		// add the multi touch events
		if (config.allowMulti) { this.multi = new this.context.Multi(this); }
	};

	this.checkConfig = function (config) {
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
			while (element !== this.element) {
				offsetX += element.offsetLeft;
				offsetY += element.offsetTop;
				element = element.offsetParent;
			}
		}
		// return the offsets
		return { 'x' : offsetX, 'y' : offsetY };
	};

	// EXTERNAL

	this.enableDefaultTouch = function () {
		this.config.cancelTouch = false;
	};

	this.disableDefaultTouch = function () {
		this.config.cancelTouch = true;
	};

	this.enableDefaultGesture = function () {
		this.config.cancelGesture = false;
	};

	this.disableDefaultGesture = function () {
		this.config.cancelGesture = true;
	};

	// EVENTS

	this.init();

};

// extend the class
Gestures.prototype.Multi = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = parent.config.element;
	this.gestureOrigin = null;
	this.gestureProgression = null;

	// METHODS

	this.init = function () {
		// set the required events for mouse
		this.element.addEventListener('mousewheel', this.onChangeWheel());
		if (navigator.userAgent.match(/firefox/gi)) { this.element.addEventListener('DOMMouseScroll', this.onChangeWheel()); }
		// set the required events for gestures
		if ('ongesturestart' in window) {
			this.element.addEventListener('gesturestart', this.onStartGesture());
			this.element.addEventListener('gesturechange', this.onChangeGesture());
			this.element.addEventListener('gestureend', this.onEndGesture());
		} else if ('msgesturestart' in window) {
			this.element.addEventListener('msgesturestart', this.onStartGesture());
			this.element.addEventListener('msgesturechange', this.onChangeGesture());
			this.element.addEventListener('msgestureend', this.onEndGesture());
		} else {
			this.element.addEventListener('touchstart', this.onStartFallback());
			this.element.addEventListener('touchmove', this.onChangeFallback());
			this.element.addEventListener('touchend', this.onEndFallback());
		}
	};

	this.cancelGesture = function (event) {
		if (this.config.cancelGesture) {
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
			this.config.pinch({
				'x' : coords.x,
				'y' : coords.y,
				'scale' : scale - this.gestureProgression.scale,
				'event' : event,
				'target' : this.gestureOrigin.target
			});
			this.config.twist({
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

	// FALLBACK

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
			this.config.pinch({
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

	this.changeWheel = function (event) {
		// measure the wheel distance
		var scale = 1, distance = ((window.event) ? window.event.wheelDelta / 120 : -event.detail / 3);
		// get the coordinates from the event
		var coords = this.parent.readEvent(event);
		// equate wheeling up / down to zooming in / out
		scale = (distance > 0) ? +this.config.increment : scale = -this.config.increment;
		// report the zoom
		this.config.pinch({
			'x' : coords.x,
			'y' : coords.y,
			'scale' : scale,
			'event' : event,
			'source' : event.target || event.srcElement
		});
	};

	// GESTURE EVENTS

	this.onStartGesture = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			_this.cancelGesture(event);
			// handle the event
			_this.startGesture(event);
			_this.changeGesture(event);
		};
	};

	this.onChangeGesture = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			_this.cancelGesture(event);
			// handle the event
			_this.changeGesture(event);
		};
	};

	this.onEndGesture = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// handle the event
			_this.endGesture(event);
		};
	};

	// FALLBACK EVENTS

	this.onStartFallback = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			//_this.cancelGesture(event);
			// handle the event
			_this.startFallback(event);
			_this.changeFallback(event);
		};
	};

	this.onChangeFallback = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// optionally cancel the default behaviour
			_this.cancelGesture(event);
			// handle the event
			_this.changeFallback(event);
		};
	};

	this.onEndFallback = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// handle the event
			_this.endGesture(event);
		};
	};

	// MOUSE EVENTS

	this.onChangeWheel = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// get event elementect
			event = event || window.event;
			// optionally cancel the default behaviour
			_this.cancelGesture(event);
			// handle the event
			_this.changeWheel(event);
		};
	};

	// EVENTS

	this.init();

};

// extend the class
Gestures.prototype.Single = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.element = parent.config.element;
	this.lastTouch = null;
	this.touchOrigin = null;
	this.touchProgression = null;

	// METHODS

	this.init = function () {
		// set the required events for mouse
		this.element.addEventListener('mousedown', this.onStartTouch());
		this.element.addEventListener('mousemove', this.onChangeTouch());
		document.body.addEventListener('mouseup', this.onEndTouch());
		// set the required events for touch
		this.element.addEventListener('touchstart', this.onStartTouch());
		this.element.addEventListener('touchmove', this.onChangeTouch());
		document.body.addEventListener('touchend', this.onEndTouch());
		this.element.addEventListener('mspointerdown', this.onStartTouch());
		this.element.addEventListener('mspointermove', this.onChangeTouch());
		document.body.addEventListener('mspointerup', this.onEndTouch());
	};

	this.cancelTouch = function (event) {
		if (this.config.cancelTouch) {
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
			this.config.drag({
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
				this.config.doubleTap({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'event' : event, 'source' : this.touchOrigin.target});
			// if the horizontal motion was the largest
			} else if (Math.abs(distance.x) > Math.abs(distance.y)) {
				// if there was a right swipe
				if (distance.x > this.config.threshold) {
					// report the associated swipe
					this.config.swipeRight({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : distance.x, 'event' : event, 'source' : this.touchOrigin.target});
				// else if there was a left swipe
				} else if (distance.x < -this.config.threshold) {
					// report the associated swipe
					this.config.swipeLeft({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : -distance.x, 'event' : event, 'source' : this.touchOrigin.target});
				}
			// else
			} else {
				// if there was a down swipe
				if (distance.y > this.config.threshold) {
					// report the associated swipe
					this.config.swipeDown({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : distance.y, 'event' : event, 'source' : this.touchOrigin.target});
				// else if there was an up swipe
				} else if (distance.y < -this.config.threshold) {
					// report the associated swipe
					this.config.swipeUp({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : -distance.y, 'event' : event, 'source' : this.touchOrigin.target});
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

	// TOUCH EVENTS

	this.onStartTouch = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// get event elementect
			event = event || window.event;
			// handle the event
			_this.startTouch(event);
			_this.changeTouch(event);
		};
	};

	this.onChangeTouch = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// get event elementect
			event = event || window.event;
			// optionally cancel the default behaviour
			_this.cancelTouch(event);
			// handle the event
			_this.changeTouch(event);
		};
	};

	this.onEndTouch = function () {
		// store the _this
		var _this = this;
		// return and event handler
		return function (event) {
			// get event elementect
			event = event || window.event;
			// handle the event
			_this.endTouch(event);
		};
	};

	// EVENTS

	this.init();

};

/*
	Source:
	van Creij, Maurice (2018). "urls.js: A library of useful functions to ease working with URL query parameters.", http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

var urls = {

	// retrieves the query parameters from an url
	load: function (url) {
		var a, b, parts = [], data = {}, namevalue, value;
		parts = url.split('#')[0].replace('?', '&').split('&');
		for (a = 1, b = parts.length; a < b; a += 1) {
			namevalue = parts[a].split('=');
			value = parseFloat(namevalue[1]);
			data[namevalue[0]] = (!isNaN(value)) ? value : namevalue[1];
		}
		return data;
	},

	// stores query parameters to an url
	save: function (url, data) {
		var name;
		// clean the url
		url = url.split('?')[0].split('#')[0];
		// for all name value pairs
		for (name in data) {
			if (data.hasOwnProperty(name)) {
				// add them to the url
				url += '&' + name + '=' + data[name];
			}
		}
		// make sure the first value starts with a ?
		return url.replace('&', '?');
	},

	// replace a value in a query parameter
	replace: function (url, name, value) {
		var old, match, nameValue;
		// if the value is present in the url
		match = new RegExp(name + '=', 'gi');
		if (match.test(url)) {
			// isolate the old value
			old  = url.split('#')[0].split(name + '=')[1].split('&')[0];
			// insert the new value
			return url.replace(name + '=' + old, name + '=' + value);
		} else {
			// add the value instead of replacing it
			nameValue = this.load(url);
			nameValue[name] = value;
			return this.save(url, nameValue);
		}
	},

	// source - http://phpjs.org/functions/base64_encode/
	// http://kevin.vanzonneveld.net
	// +  original by: Tyler Akins (http://rumkin.com)
	// +  improved by: Bayron Guevara
	// +  improved by: Thunder.m
	// +  improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +  bugfixed by: Pellentesque Malesuada
	// +  improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +  improved by: Rafał Kukawski (http://kukawski.pl)
	// *   example 1: base64_encode('Kevin van Zonneveld');
	// *   returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
	encode: function (data) {
		var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
			ac = 0,
			enc = "",
			tmpArr = [];
		if (!data) {
			return data;
		}
		do { // pack three octets into four hexets
			o1 = data.charCodeAt(i++);
			o2 = data.charCodeAt(i++);
			o3 = data.charCodeAt(i++);
			bits = o1 << 16 | o2 << 8 | o3;
			h1 = bits >> 18 & 0x3f;
			h2 = bits >> 12 & 0x3f;
			h3 = bits >> 6 & 0x3f;
			h4 = bits & 0x3f;
			// use hexets to index into b64, and append result to encoded string
			tmpArr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
		} while (i < data.length);
		enc = tmpArr.join('');
		var r = data.length % 3;
		return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
	},

	// source - http://phpjs.org/functions/base64_decode/
	// http://kevin.vanzonneveld.net
	// +  original by: Tyler Akins (http://rumkin.com)
	// +  improved by: Thunder.m
	// +   input by: Aman Gupta
	// +  improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +  bugfixed by: Onno Marsman
	// +  bugfixed by: Pellentesque Malesuada
	// +  improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +   input by: Brett Zamir (http://brett-zamir.me)
	// +  bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// *   example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
	// *   returns 1: 'Kevin van Zonneveld'
	decode: function (data) {
		var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
			ac = 0,
			dec = "",
			tmpArr = [];
		if (!data) {
			return data;
		}
		data += '';
		do { // unpack four hexets into three octets using index points in b64
			h1 = b64.indexOf(data.charAt(i++));
			h2 = b64.indexOf(data.charAt(i++));
			h3 = b64.indexOf(data.charAt(i++));
			h4 = b64.indexOf(data.charAt(i++));
			bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
			o1 = bits >> 16 & 0xff;
			o2 = bits >> 8 & 0xff;
			o3 = bits & 0xff;
			if (h3 == 64) {
				tmpArr[ac++] = String.fromCharCode(o1);
			} else if (h4 == 64) {
				tmpArr[ac++] = String.fromCharCode(o1, o2);
			} else {
				tmpArr[ac++] = String.fromCharCode(o1, o2, o3);
			}
		} while (i < data.length);
		dec = tmpArr.join('');
		return dec;
	}

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = urls;
}

/*
	Source:
	van Creij, Maurice (2018). "photowall.js: Simple photo wall", http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// establish the class
var Cropper = function (config) {

	this.only = function (config) {
		// start an instance of the script
		return new this.Main(config, this);
	};

	this.each = function (config) {
		var _config, _context = this, instances = [];
		// for all element
		for (var a = 0, b = config.elements.length; a < b; a += 1) {
			// clone the configuration
			_config = Object.create(config);
			// insert the current element
			_config.element = config.elements[a];
			// start a new instance of the object
			instances[a] = new this.Main(_config, _context);
		}
		// return the instances
		return instances;
	};

	return (config.elements) ? this.each(config) : this.only(config);

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = Cropper;
}

// extend the class
Cropper.prototype.Busy = function (parent) {

	// PROPERTIES

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

	this.init();
	
};

// extend the class
Cropper.prototype.Handles = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;

	// METHODS

	this.init = function () {
		var config = this.config;
		var a, b, name;
		// create the handles
		config.handles = {};
		for (a = 0, b = config.names.length; a < b; a += 1) {
			name = config.names[a];
			config.handles[name] = document.createElement('span');
			config.handles[name].className = 'cr-' + name;
			config.overlay.appendChild(config.handles[name]);
		}
		// return the object
		return this;
	};

	this.left = function (distance) {
		var config = this.config;
		var horizontal, left, right, limit;
		// measure the movement in fractions of the dimensions
		horizontal = distance / config.width;
		// calculate the new crop fractions
		left = config.left + horizontal;
		right = config.right + horizontal;
		limit = config.right - config.minimum;
		// if all are within limits
		if (left >= 0 && left < limit) {
			// apply the movement to the crop fractions
			config.left = left;
		}
	};

	this.top = function (distance) {
		var config = this.config;
		var vertical, top, bottom, limit;
		// measure the movement in fractions of the dimensions
		vertical = distance / config.height;
		// calculate the new crop fractions
		top = config.top + vertical;
		bottom = config.bottom + vertical;
		limit = config.bottom - config.minimum;
		// if all are within limits
		if (top >= 0 && top < limit) {
			// apply the movement to the crop fractions
			config.top = top;
		}
	};

	this.right = function (distance) {
		var config = this.config;
		var horizontal, left, right, limit;
		// measure the movement in fractions of the dimensions
		horizontal = distance / config.width;
		// calculate the new crop fractions
		left = config.left + horizontal;
		right = config.right + horizontal;
		limit = config.left + config.minimum;
		// if all are within limits
		if (right <= 1 && right > limit) {
			// apply the movement to the crop fractions
			config.right = right;
		}
	};

	this.bottom = function (distance) {
		var config = this.config;
		var vertical, top, bottom, limit;
		// measure the movement in fractions of the dimensions
		vertical = distance / config.height;
		// calculate the new crop fractions
		top = config.top + vertical;
		bottom = config.bottom + vertical;
		limit = config.top + config.minimum;
		// if all are within limits
		if (bottom <= 1 && bottom > limit) {
			// apply the movement to the crop fractions
			config.bottom = bottom;
		}
	};

	this.init();
	
};

// extend the class
Cropper.prototype.Indicator = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.context = parent.context;

	// METHODS

	this.init = function () {
		var config = this.config;
		// create the indicator
		config.overlay = document.createElement('span');
		config.overlay.className = 'cr-overlay';
		config.overlay.style.background = 'url(' + config.image.src + ')';
		// create the handles
		this.handles = new this.context.Handles(this);
		// add the indicator to the parent
		config.element.appendChild(config.overlay);
		// add the interaction
		var _this = this;
		var gestures = new Gestures({
			'element' : config.overlay.parentNode,
			'threshold' : 50,
			'increment' : 0.1,
			'cancelTouch' : true,
			'cancelGesture' : true,
			'drag' : function (metrics) {
				// move the handles
				switch (metrics.source.className) {
					case 'cr-tl' :
						_this.handles.left(metrics.horizontal);
						_this.handles.top(metrics.vertical);
						_this.parent.update(null, true, 'tl');
						break;
					case 'cr-tc' :
						_this.handles.top(metrics.vertical);
						_this.parent.update(null, true, 'tc');
						break;
					case 'cr-tr' :
						_this.handles.right(metrics.horizontal);
						_this.handles.top(metrics.vertical);
						_this.parent.update(null, true, 'tr');
						break;
					case 'cr-ml' :
						_this.handles.left(metrics.horizontal);
						_this.parent.update(null, true, 'ml');
						break;
					case 'cr-mr' :
						_this.handles.right(metrics.horizontal);
						_this.parent.update(null, true, 'mr');
						break;
					case 'cr-bl' :
						_this.handles.left(metrics.horizontal);
						_this.handles.bottom(metrics.vertical);
						_this.parent.update(null, true, 'bl');
						break;
					case 'cr-bc' :
						_this.handles.bottom(metrics.vertical);
						_this.parent.update(null, true, 'bc');
						break;
					case 'cr-br' :
						_this.handles.right(metrics.horizontal);
						_this.handles.bottom(metrics.vertical);
						_this.parent.update(null, true, 'br');
						break;
					default :
						_this.move(metrics.horizontal, metrics.vertical);
						_this.parent.update(null, true, null);
				}
			}
		});
		// return the object
		return this;
	};

	this.update = function () {
		var config = this.config;
		var left, top, right, bottom;
		// get the dimensions of the component
		config.width = config.image.offsetWidth;
		config.height = config.image.offsetHeight;
		// convert the crop fractions into pixel values
		left = config.left * config.width;
		top = config.top * config.height;
		right = config.width - config.right * config.width;
		bottom = config.height - config.bottom * config.height;
		// reposition the indicator
		config.overlay.style.left = left + 'px';
		config.overlay.style.top = top + 'px';
		config.overlay.style.right = right + 'px';
		config.overlay.style.bottom = bottom + 'px';
		// reposition the background image
		config.overlay.style.backgroundPosition = '-' + left + 'px -' + top + 'px';
	};

	this.move = function (x, y) {
		var config = this.config;
		var horizontal, vertical, left, top, right, bottom;
		// measure the movement in fractions of the dimensions
		horizontal = x / config.width;
		vertical = y / config.height;
		// calculate the new crop fractions
		left = config.left + horizontal;
		top = config.top + vertical;
		right = config.right + horizontal;
		bottom = config.bottom + vertical;
		// if all are within limits
		if (left >= 0 && top >= 0 && right <= 1 && bottom <= 1 && left < right && top < bottom) {
			// apply the movement to the crop fractions
			config.left = left;
			config.top = top;
			config.right = right;
			config.bottom = bottom;
		}
	};

	this.init();

};

// extend the class
Cropper.prototype.Main = function (config, context) {

	// PROPERTIES

	this.config = config;
	this.context = context;
	this.config.names = ['tl', 'tc', 'tr', 'ml', 'mr', 'bl', 'bc', 'br'];
	this.config.image = config.element.getElementsByTagName('img')[0];
	this.config.output = config.element.getElementsByTagName('input');
	this.config.values = null;
	this.config.onchange = config.onchange || function () {};
	this.config.delay = config.delay || 1000;
	this.config.timeout = null;
	this.config.realtime = config.realtime || false;
	this.config.minimum = config.minimum || 0.2;
	this.config.crop = config.crop || [0.1, 0.1, 0.9, 0.9];
	this.config.url = config.image.src;
	this.config.offset = config.offset || 4;
	this.config.reset = [config.left, config.top, config.right, config.bottom];

	// COMPONENTS

	this.busy = new this.context.Busy(this);
	this.indicator = new this.context.Indicator(this);
	this.toolbar = new this.context.Toolbar(this);

	// METHODS

	this.init = function () {
		var config = this.config;
		// if the image has loaded
		if (config.image.offsetWidth > 0 && config.image.offsetHeight > 0) {
			// update the indicator
			this.update();
			this.preset();
		// else
		} else {
			// wait for the image to load
			var _this = this;
			config.image.onload = function () {
				// update the indicator
				_this.update();
				_this.preset();
			};
		}
		// return the object
		return this;
	};

	this.preset = function () {
		var query, width, height, aspect, config = this.config;
		// if there's anything to measure yet
		if (config.image.offsetWidth) {
			// retrieve the crop coordinates from the url
			query = urls.load(config.url);
			// if we started out with a cropped image
			if (query.left > 0 || query.top > 0 || query.right < 1 || query.bottom < 1) {
				// validate the input
				query.left = query.left || 0;
				query.top = query.top || 0;
				query.right = query.right || 1;
				query.bottom = query.bottom || 1;
				// store the cropping dimensions
				config.left = query.left;
				config.top = query.top;
				config.right = query.right;
				config.bottom = query.bottom;
				// guess what the original dimensions could have been
				width = config.image.offsetWidth / (config.right - config.left);
				height = config.image.offsetHeight / (config.bottom - config.top);
				aspect = height / width;
				// scale to the available space
				width = config.element.offsetWidth;
				height = Math.round(width * aspect);
				// limit the image's size to the original parent
				config.image.style.maxWidth = width + 'px';
				config.image.style.maxHeight = height + 'px';
				// guess what the reset url of the uncropped image might have been
				config.url = urls.replace(config.url, 'width', width);
				config.url = urls.replace(config.url, 'height', height);
				config.url = urls.replace(config.url, 'left', 0);
				config.url = urls.replace(config.url, 'top', 0);
				config.url = urls.replace(config.url, 'right', 1);
				config.url = urls.replace(config.url, 'bottom', 1);
				// restore the container's original size
				config.element.style.width = width + 'px';
				config.element.style.height = height + 'px';
				// if continuous updates are on
				if (config.realtime) {
					// load the original image
					var _this = this;
					config.image.onload = function () { _this.update(); };
					config.image.src = config.url;
					config.overlay.style.background = 'url(' + config.url + ')';
				} else {
					// set the image to center
					config.image.style.marginTop = Math.round((config.element.offsetHeight - config.image.offsetHeight - config.offset) / 2) + 'px';
					// disable the indicator
					config.applyButton.disabled = true;
					config.element.className = config.element.className.replace(' cr-disabled', '') + ' cr-disabled';
				}
			}
		}
	};

	this.correct = function (handle) {
		var config = this.config;
		// determine the dominant motion
		var dLeft = Math.abs(config.values.left - config.left),
			dTop = Math.abs(config.values.top - config.top),
			dRight = Math.abs(config.values.right - config.right),
			dBottom = Math.abs(config.values.bottom - config.bottom),
			aspect = config.aspect;
		// implement the aspect ratio from the required corner
		switch (handle) {
			case 'tl' :
				if (dLeft > dTop) { config.top = config.bottom - (config.right - config.left) * aspect; }
				else { config.left = config.right - (config.bottom - config.top) / aspect; }
				break;
			case 'tc' :
				config.right = config.left + (config.bottom - config.top) / aspect;
				break;
			case 'tr' :
				if (dRight > dTop) { config.top = config.bottom - (config.right - config.left) * aspect; }
				else { config.right = config.left + (config.bottom - config.top) / aspect;  }
				break;
			case 'ml' :
				config.bottom = config.top + (config.right - config.left) * aspect;
				break;
			case 'mr' :
				config.bottom = config.top + (config.right - config.left) * aspect;
				break;
			case 'bl' :
				if (dLeft > dBottom) { config.bottom = config.top + (config.right - config.left) * aspect; }
				else { config.left = config.right - (config.bottom - config.top) / aspect; }
				break;
			case 'bc' :
				config.right = config.left + (config.bottom - config.top) / aspect;
				break;
			case 'br' :
				if (dRight > dBottom) { config.bottom = config.top + (config.right - config.left) * aspect; }
				else { config.right = config.left + (config.bottom - config.top) / aspect; }
				break;
		}
	};

	this.update = function (values, changed, handle) {
		var config = this.config;
		changed = (changed === true);
		// process any override values
		if (values && values.left) { config.left = values.left; }
		if (values && values.top) { config.top = values.top; }
		if (values && values.right) { config.right = values.right; }
		if (values && values.bottom) { config.bottom = values.bottom; }
		// correct the values for aspect ratio
		if (config.aspect && config.values && handle) { this.correct(handle); }
		// refresh the hidden fields
		config.output[0].value = config.left;
		config.output[1].value = config.top;
		config.output[2].value = config.right;
		config.output[3].value = config.bottom;
		// refresh the json object of values
		config.values = {
			'left' : config.left,
			'top' : config.top,
			'right' : config.right,
			'bottom' : config.bottom
		};
		// redraw the indicator
		this.indicator.update(this);
		// update the onchange event periodically
		if (changed && config.realtime) {
			clearTimeout(config.timeout);
			var _this = this;
			config.timeout = setTimeout(function () {
				_this.config.onchange(_this.config.values);
			}, config.delay);
		}
	};

	// EVENTS

	this.init();

};

// extend the class
Cropper.prototype.Toolbar = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;
	this.ui = {};

	// METHODS

	this.init = function () {
		// build the toolbar
		if (!this.config.realtime) { this.build(); }
		// return the object
		return this;
	};

	this.build = function () {
		var config = this.config;
		var _this = this;
		// create the toolbar
		config.toolbar = document.createElement('figcaption');
		// create the apply button
		config.applyButton = document.createElement('button');
		config.applyButton.setAttribute('type', 'button');
		config.applyButton.className = 'cr-apply button';
		config.applyButton.innerHTML = 'Apply';
		config.toolbar.appendChild(config.applyButton);
		config.applyButton.onclick = function () {
			_this.apply();
		};
		// create the reset button
		config.resetButton = document.createElement('button');
		config.resetButton.setAttribute('type', 'button');
		config.resetButton.className = 'cr-reset button';
		config.resetButton.innerHTML = 'Reset';
		config.toolbar.appendChild(config.resetButton);
		config.resetButton.onclick = function () {
			_this.reset();
		};
		// add the toolbar
		config.element.appendChild(config.toolbar);
	};

	this.apply = function () {
		var config = this.config;
		// if the apply button is enabled
		if (!config.applyButton.disabled) {
			var src, width, height, aspect;
			var _this = this;
			// normalise the dimensions
			width = config.overlay.offsetWidth;
			height = config.overlay.offsetHeight;
			aspect = config.element.offsetHeight / config.element.offsetWidth;
			if (height / width < aspect) {
				height = config.image.offsetWidth / width * config.overlay.offsetHeight;
				width = config.image.offsetWidth;
			} else {
				width = config.image.offsetHeight / height * config.overlay.offsetWidth;
				height = config.image.offsetHeight;
			}
			// fix the container
			config.element.style.width = config.image.offsetWidth + 'px';
			config.element.style.height = config.image.offsetHeight + 'px';
			// show busy message
			this.parent.busy.show();
			// upon loading
			config.image.onload = function () {
				// set the image to center
				config.image.style.marginTop = Math.round((config.element.offsetHeight - config.image.offsetHeight - config.offset) / 2) + 'px';
				// hide the busy message
				_this.parent.busy.hide();
			};
			// round the numbers
			width = Math.round(width);
			height = Math.round(height);
			// replace the image with a cropped version
			src = config.image.src;
			src = urls.replace(src, 'width', width);
			src = urls.replace(src, 'height', height);
			src = urls.replace(src, 'left', config.left);
			src = urls.replace(src, 'top', config.top);
			src = urls.replace(src, 'right', config.right);
			src = urls.replace(src, 'bottom', config.bottom);
			src = urls.replace(src, 'time', new Date().getTime());
			config.image.src = src;
			// disable the indicator
			config.applyButton.disabled = true;
			config.element.className = config.element.className.replace(' cr-disabled', '') + ' cr-disabled';
			// trigger any external onchange event
			config.onchange(config.values);
		}
		// cancel the click
		return false;
	};

	this.reset = function () {
		var config = this.config;
		var _this = this;
		// show busy message
		this.parent.busy.show();
		// upon loading
		config.image.onload = function () {
			// undo the margin
			config.image.style.marginTop = 0;
			// undo the values
			config.left = config.reset[0];
			config.top = config.reset[1];
			config.right = config.reset[2];
			config.bottom = config.reset[3];
			// reset the indicator
			_this.parent.update();
			// enable the indicator
			config.applyButton.disabled = false;
			config.element.className = config.element.className.replace(' cr-disabled', '');
			// hide the busy message
			_this.parent.busy.hide();
		};
		// replace the image with an uncropped version
		config.url = urls.replace(config.url, 'name', new Date().getTime());
		config.image.src =  config.url;
		config.overlay.style.backgroundImage = 'url(' + config.url + ')';
		// trigger any external onchange event
		config.onchange(config.values);
		// cancel the click
		return false;
	};

	this.init();
};
