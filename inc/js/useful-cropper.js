/*
	Source:
	van Creij, Maurice (2012). "useful.gestures.js: A library of useful functions to ease working with touch and gestures.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

(function (useful) {

	// invoke strict mode
	"use strict";

	// object
	useful.Gestures = function (obj, cfg) {
		// properties
		this.obj = obj;
		this.cfg = cfg;
		this.touchOrigin = null;
		this.touchProgression = null;
		this.gestureOrigin = null;
		this.gestureProgression = null;
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
			this.obj.addEventListener('gesturestart', this.onStartGesture());
			this.obj.addEventListener('gesturechange', this.onChangeGesture());
			this.obj.addEventListener('gestureend', this.onEndGesture());
			this.obj.addEventListener('msgesturestart', this.onStartGesture());
			this.obj.addEventListener('msgesturechange', this.onChangeGesture());
			this.obj.addEventListener('msgestureend', this.onEndGesture());
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
			// get the offset if the target shifts
			var offsets = this.correctOffset(event.target || event.srcElement);
			// note the start position
			this.touchOrigin = {
				'x' : event.x || event.layerX + offsets.x || event.pageX || event.touches[0].pageX,
				'y' : event.y || event.layerY + offsets.y || event.pageY || event.touches[0].pageY,
				'target' : event.target || event.srcElement
			};
			this.touchProgression = {
				'x' : this.touchOrigin.x,
				'y' : this.touchOrigin.y
			};
		};
		this.changeTouch = function (event) {
			// if there is an origin
			if (this.touchOrigin) {
				// get the offset if the target shifts
				var offsets = this.correctOffset(event.target || event.srcElement),
					x = event.x || event.layerX + offsets.x || event.pageX || event.touches[0].pageX,
					y = event.y || event.layerY + offsets.y || event.pageY || event.touches[0].pageY;
				// get the gesture parameters
				this.cfg.drag({
					'x' : this.touchOrigin.x,
					'y' : this.touchOrigin.y,
					'horizontal' : x - this.touchProgression.x,
					'vertical' : y - this.touchProgression.y,
					'event' : event,
					'source' : this.touchOrigin.target
				});
				// update the current position
				this.touchProgression = {
					'x' : x,
					'y' : y
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
				// if the horizontal motion was the largest
				if (Math.abs(distance.x) > Math.abs(distance.y)) {
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
			}
			// clear the input
			this.touchProgression = null;
			this.touchOrigin = null;
		};
		this.changeWheel = function (event) {
			// measure the wheel distance
			var scale = 1, distance = ((window.event) ? window.event.wheelDelta / 120 : -event.detail / 3);
			// equate wheeling up / down to zooming in / out
			scale = (distance > 0) ? +this.cfg.increment : scale = -this.cfg.increment;
			// report the zoom
			this.cfg.pinch({
				'x' : 0,
				'y' : 0,
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
		};
		this.changeGesture = function (event) {
			// if there is an origin
			if (this.gestureOrigin) {
				// get the distances from the event
				var scale = event.scale,
					rotation = event.rotation;
				// get the gesture parameters
				this.cfg.pinch({
					'x' : event.x || event.layerX || event.pageX || event.touches[0].pageX,
					'y' : event.y || event.layerY || event.pageY || event.touches[0].pageY,
					'scale' : scale - this.gestureProgression.scale,
					'event' : event,
					'target' : this.gestureOrigin.target
				});
				this.cfg.twist({
					'x' : event.x || event.layerX || event.pageX || event.touches[0].pageX,
					'y' : event.y || event.layerY || event.pageY || event.touches[0].pageY,
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
		// touch events
		this.onStartTouch = function () {
			// store the context
			var context = this;
			// return and event handler
			return function (event) {
				// get event object
				event = event || window.event;
				// optionally cancel the default behaviour
				context.cancelTouch(event);
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
				// optionally cancel the default behaviour
				context.cancelTouch(event);
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
				// get event object
				event = event || window.event;
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
				// get event object
				event = event || window.event;
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
				// get event object
				event = event || window.event;
				// optionally cancel the default behaviour
				context.cancelGesture(event);
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
	};

}(window.useful = window.useful || {}));

/*
	Source:
	van Creij, Maurice (2012). "useful.instances.js: A library of useful functions to ease working with instances of constructors.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.

	Usage:
	var instances = new useful.Instances(document.querySelectorAll('#id.classname'), Constructor, {'foo':'bar'});
	instances.wait(); or instances.start();
	object = instances.get(element);
*/

(function (useful) {

	// Invoke strict mode
	"use strict";

	// public functions
	useful.Instances = function (objs, constructor, cfgs) {
		// properties
		this.objs = objs;
		this.constructor = constructor;
		this.cfgs = cfgs;
		this.constructs = [];
		this.delay = 200;
		// keeps trying until the DOM is ready
		this.wait = function () {
			var scope = this;
			scope.timeout = (document.readyState.match(/interactive|loaded|complete/i)) ?
				scope.start():
				setTimeout(function () { scope.wait(); }, scope.delay);
		};
		// starts and stores an instance of the constructor for every element
		this.start = function () {
			for (var a = 0, b = this.objs.length; a < b; a += 1) {
				// store a constructed instance with cloned cfgs object
				this.constructs[a] = new this.constructor(this.objs[a], Object.create(this.cfgs));
				this.constructs[a].start();
			}
			return null;
		};
		// returns the constructs
		this.getAll = function () {
			return this.constructs;
		};
		// returns the object that goes with the element
		this.getByObject = function (element) {
			return this.constructs[this.constructs.indexOf(element)];
		};
		// returns the object that goes with the index
		this.getByIndex = function (index) {
			return this.constructs[index];
		};
	};

}(window.useful = window.useful || {}));

/*
	Source:
	van Creij, Maurice (2012). "useful.polyfills.js: A library of useful polyfills to ease working with HTML5 in legacy environments.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

(function (useful) {

	// Invoke strict mode
	"use strict";

	// private functions
	var polyfills = polyfills || {};

	// enabled the use of HTML5 elements in Internet Explorer
	polyfills.html5 = function () {
		var a, b, elementsList;
		elementsList = ['section', 'nav', 'article', 'aside', 'hgroup', 'header', 'footer', 'dialog', 'mark', 'dfn', 'time', 'progress', 'meter', 'ruby', 'rt', 'rp', 'ins', 'del', 'figure', 'figcaption', 'video', 'audio', 'source', 'canvas', 'datalist', 'keygen', 'output', 'details', 'datagrid', 'command', 'bb', 'menu', 'legend'];
		if (navigator.userAgent.match(/msie/gi)) {
			for (a = 0 , b = elementsList.length; a < b; a += 1) {
				document.createElement(elementsList[a]);
			}
		}
	};

	// allow array.indexOf in older browsers
	polyfills.arrayIndexOf = function () {
		if (!Array.prototype.indexOf) {
			Array.prototype.indexOf = function (obj, start) {
				for (var i = (start || 0), j = this.length; i < j; i += 1) {
					if (this[i] === obj) { return i; }
				}
				return -1;
			};
		}
	};

	// allow document.querySelectorAll (https://gist.github.com/connrs/2724353)
	polyfills.querySelectorAll = function () {
		if (!document.querySelectorAll) {
			document.querySelectorAll = function (a) {
				var b = document, c = b.documentElement.firstChild, d = b.createElement("STYLE");
				return c.appendChild(d), b.__qsaels = [], d.styleSheet.cssText = a + "{x:expression(document.__qsaels.push(this))}", window.scrollBy(0, 0), b.__qsaels;
			};
		}
	};

	// allow addEventListener (https://gist.github.com/jonathantneal/3748027)
	polyfills.addEventListener = function () {
		!window.addEventListener && (function (WindowPrototype, DocumentPrototype, ElementPrototype, addEventListener, removeEventListener, dispatchEvent, registry) {
			WindowPrototype[addEventListener] = DocumentPrototype[addEventListener] = ElementPrototype[addEventListener] = function (type, listener) {
				var target = this;
				registry.unshift([target, type, listener, function (event) {
					event.currentTarget = target;
					event.preventDefault = function () { event.returnValue = false; };
					event.stopPropagation = function () { event.cancelBubble = true; };
					event.target = event.srcElement || target;
					listener.call(target, event);
				}]);
				this.attachEvent("on" + type, registry[0][3]);
			};
			WindowPrototype[removeEventListener] = DocumentPrototype[removeEventListener] = ElementPrototype[removeEventListener] = function (type, listener) {
				for (var index = 0, register; register = registry[index]; ++index) {
					if (register[0] == this && register[1] == type && register[2] == listener) {
						return this.detachEvent("on" + type, registry.splice(index, 1)[0][3]);
					}
				}
			};
			WindowPrototype[dispatchEvent] = DocumentPrototype[dispatchEvent] = ElementPrototype[dispatchEvent] = function (eventObject) {
				return this.fireEvent("on" + eventObject.type, eventObject);
			};
		})(Window.prototype, HTMLDocument.prototype, Element.prototype, "addEventListener", "removeEventListener", "dispatchEvent", []);
	};

	// allow console.log
	polyfills.consoleLog = function () {
		if (!window.console) {
			window.console = {};
			window.console.log = function () {
				// if the reporting panel doesn't exist
				var a, b, messages = '', reportPanel = document.getElementById('reportPanel');
				if (!reportPanel) {
					// create the panel
					reportPanel = document.createElement('DIV');
					reportPanel.id = 'reportPanel';
					reportPanel.style.background = '#fff none';
					reportPanel.style.border = 'solid 1px #000';
					reportPanel.style.color = '#000';
					reportPanel.style.fontSize = '12px';
					reportPanel.style.padding = '10px';
					reportPanel.style.position = (navigator.userAgent.indexOf('MSIE 6') > -1) ? 'absolute' : 'fixed';
					reportPanel.style.right = '10px';
					reportPanel.style.bottom = '10px';
					reportPanel.style.width = '180px';
					reportPanel.style.height = '320px';
					reportPanel.style.overflow = 'auto';
					reportPanel.style.zIndex = '100000';
					reportPanel.innerHTML = '&nbsp;';
					// store a copy of this node in the move buffer
					document.body.appendChild(reportPanel);
				}
				// truncate the queue
				var reportString = (reportPanel.innerHTML.length < 1000) ? reportPanel.innerHTML : reportPanel.innerHTML.substring(0, 800);
				// process the arguments
				for (a = 0, b = arguments.length; a < b; a += 1) {
					messages += arguments[a] + '<br/>';
				}
				// output the queue to the panel
				reportPanel.innerHTML = messages + reportString;
			};
		}
	};

	// allows Object.create (https://gist.github.com/rxgx/1597825)
	polyfills.objectCreate = function () {
		if (typeof Object.create !== "function") {
			Object.create = function (original) {
				function Clone() {}
				Clone.prototype = original;
				return new Clone();
			};
		}
	};

	// allows String.trim (https://gist.github.com/eliperelman/1035982)
	polyfills.stringTrim = function () {
		if (!String.prototype.trim) {
			String.prototype.trim = function () { return this.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, ''); };
		}
		if (!String.prototype.ltrim) {
			String.prototype.ltrim = function () { return this.replace(/^\s+/, ''); };
		}
		if (!String.prototype.rtrim) {
			String.prototype.rtrim = function () { return this.replace(/\s+$/, ''); };
		}
		if (!String.prototype.fulltrim) {
			String.prototype.fulltrim = function () { return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g, '').replace(/\s+/g, ' '); };
		}
	};

	// for immediate use
	polyfills.html5();
	polyfills.arrayIndexOf();
	polyfills.querySelectorAll();
	polyfills.addEventListener();
	polyfills.consoleLog();
	polyfills.objectCreate();
	polyfills.stringTrim();

}(window.useful = window.useful || {}));

/*
	Source:
	van Creij, Maurice (2012). "useful.urls.js: A library of useful functions to ease working with URL query parameters.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

(function (useful) {

	// Invoke strict mode
	"use strict";

	// private functions
	var urls = urls || {};

	// retrieves the query parameters from an url
	urls.load = function (url) {
		var a, b, parts = [], data = {}, namevalue, value;
		parts = url.split('#')[0].replace('?', '&').split('&');
		for (a = 1, b = parts.length; a < b; a += 1) {
			namevalue = parts[a].split('=');
			value = parseFloat(namevalue[1]);
			data[namevalue[0]] = (!isNaN(value)) ? value : namevalue[1];
		}
		return data;
	};

	// stores query parameters to an url
	urls.save = function (url, data) {
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
	};

	// replace a value in a query parameter
	urls.replace = function (url, name, value) {
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
			nameValue = urls.load(url);
			nameValue[name] = value;
			return urls.save(url, nameValue);
		}
	};

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
	urls.encode = function (data) {
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
	};

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
	urls.decode = function (data) {
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
	};

	// public functions
	useful.urls = useful.urls || {};
	useful.urls.load = urls.load;
	useful.urls.save = urls.save;
	useful.urls.encode = urls.encode;
	useful.urls.decode = urls.decode;
	useful.urls.replace = urls.replace;

}(window.useful = window.useful || {}));

/*
	Source:
	van Creij, Maurice (2012). "useful.cropper.js: A simple image cropper", version 20130510, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

(function (useful) {

	// invoke strict mode
	"use strict";

	// private functions
	useful.Cropper = function (obj, cfg) {
		this.obj = obj;
		this.cfg = cfg;
		this.names = ['tl', 'tc', 'tr', 'ml', 'mr', 'bl', 'bc', 'br'];
		this.start = function () {
			var context = this;
			// store the image
			context.cfg.image = context.obj.getElementsByTagName('img')[0];
			// store the hidden fields
			context.cfg.output = context.obj.getElementsByTagName('input');
			context.cfg.values = {};
			// validate presets
			context.cfg.onchange = context.cfg.onchange || function () {};
			context.cfg.delay = context.cfg.delay || 1000;
			context.cfg.timeout = null;
			context.cfg.realtime = context.cfg.realtime || false;
			context.cfg.minimum = context.cfg.minimum || 0.2;
			context.cfg.crop = context.cfg.crop || [0.1, 0.1, 0.9, 0.9];
			context.cfg.url = context.cfg.image.src;
			context.cfg.offset = context.cfg.offset || 4;
			// build the busy message
			context.busy.build(context);
			// build the indicator
			context.indicator.build(context);
			// build the toolbar
			if (!context.cfg.realtime) {
				context.toolbar.build(context);
			}
			// ask the indicator to update after the image loads
			context.loaded(context);
		};
		this.loaded = function (context) {
			// if the image has loaded
			if (context.cfg.image.offsetWidth > 0 && context.cfg.image.offsetHeight > 0) {
				// update the indicator
				context.update();
				context.preset();
			// else
			} else {
				// wait for the image to load
				context.cfg.image.onload = function () {
					// update the indicator
					context.update();
					context.preset();
				};
			}
		};
		this.preset = function () {
			var context = this, query, width, height, aspect;
			// if there's anything to measure yet
			if (context.cfg.image.offsetWidth) {
				// retrieve the crop coordinates from the url
				query = useful.urls.load(context.cfg.url);
				// if we started out with a cropped image
				if (query.left > 0 || query.top > 0 || query.right < 1 || query.bottom < 1) {
					// validate the input
					query.left = query.left || 0;
					query.top = query.top || 0;
					query.right = query.right || 1;
					query.bottom = query.bottom || 1;
					// store the cropping dimensions
					context.cfg.left = query.left;
					context.cfg.top = query.top;
					context.cfg.right = query.right;
					context.cfg.bottom = query.bottom;
					// guess what the original dimensions could have been
					width = context.cfg.image.offsetWidth / (context.cfg.right - context.cfg.left);
					height = context.cfg.image.offsetHeight / (context.cfg.bottom - context.cfg.top);
					aspect = height / width;
					// scale to the available space
					width = context.obj.offsetWidth;
					height = Math.round(width * aspect);
					// limit the image's size to the original parent
					context.cfg.image.style.maxWidth = width + 'px';
					context.cfg.image.style.maxHeight = height + 'px';
					// guess what the reset url of the uncropped image might have been
					context.cfg.url = useful.urls.replace(context.cfg.url, 'width', width);
					context.cfg.url = useful.urls.replace(context.cfg.url, 'height', height);
					context.cfg.url = useful.urls.replace(context.cfg.url, 'left', 0);
					context.cfg.url = useful.urls.replace(context.cfg.url, 'top', 0);
					context.cfg.url = useful.urls.replace(context.cfg.url, 'right', 1);
					context.cfg.url = useful.urls.replace(context.cfg.url, 'bottom', 1);
					// restore the container's original size
					context.obj.style.width = width + 'px';
					context.obj.style.height = height + 'px';
					// if continuous updates are on
					if (context.cfg.realtime) {
						// load the original image
						context.cfg.image.onload = function () { context.update(); };
						context.cfg.image.src = context.cfg.url;
						context.cfg.overlay.style.background = 'url(' + context.cfg.url + ')';
					} else {
						// set the image to center
						context.cfg.image.style.marginTop = Math.round((context.obj.offsetHeight - context.cfg.image.offsetHeight - context.cfg.offset) / 2) + 'px';
						// disable the indicator
						context.cfg.applyButton.disabled = true;
						context.obj.className = context.obj.className.replace(' cr-disabled', '') + ' cr-disabled';
					}
				}
			}
		};
		this.update = function (values, changed) {
			var context = this;
			changed = (changed === true);
			// process any override values
			if (values && values.left) { this.cfg.left = values.left; }
			if (values && values.top) { this.cfg.top = values.top; }
			if (values && values.right) { this.cfg.right = values.right; }
			if (values && values.bottom) { this.cfg.bottom = values.bottom; }
			// refresh the hidden fields
			this.cfg.output[0].value = this.cfg.left;
			this.cfg.output[1].value = this.cfg.top;
			this.cfg.output[2].value = this.cfg.right;
			this.cfg.output[3].value = this.cfg.bottom;
			// refresh the json object of values
			this.cfg.values = {
				'left' : this.cfg.left,
				'top' : this.cfg.top,
				'right' : this.cfg.right,
				'bottom' : this.cfg.bottom
			};
			// redraw the indicator
			this.indicator.update(this);
			// update the onchange event periodically
			if (changed && context.cfg.realtime) {
				clearTimeout(context.cfg.timeout);
				context.cfg.timeout = setTimeout(function () {
					context.cfg.onchange(context.cfg.values);
				}, context.cfg.delay);
			}
		};
		// busy
		this.busy = {};
		this.busy.build = function (context) {
			// add a busy message
			context.cfg.busy = document.createElement('span');
			context.cfg.busy.className = 'cr-busy';
			context.cfg.busy.innerHTML = 'Please wait...';
			context.cfg.busy.style.visibility = 'hidden';
			context.obj.appendChild(context.cfg.busy);
		};
		this.busy.show = function (context) {
			// show the busy message
			context.cfg.busy.style.visibility = 'visible';
		};
		this.busy.hide = function (context) {
			// show the busy message
			context.cfg.busy.style.visibility = 'hidden';
		};
		// indicator
		this.indicator = {};
		this.indicator.build = function (context) {
			// create the indicator
			context.cfg.overlay = document.createElement('span');
			context.cfg.overlay.className = 'cr-overlay';
			context.cfg.overlay.style.background = 'url(' + context.cfg.image.src + ')';
			// create the handles
			context.indicator.handles.build(context);
			// add the indicator to the parent
			context.obj.appendChild(context.cfg.overlay);
			// add the interaction
			var gestures = new useful.Gestures(context.cfg.overlay.parentNode, {
				'threshold' : 50,
				'increment' : 0.1,
				'cancelTouch' : true,
				'cancelGesture' : true,
				'drag' : function (metrics) {
					switch (metrics.source.className) {
					case 'cr-tl' :
						context.indicator.handles.left(context, metrics.horizontal);
						context.indicator.handles.top(context, metrics.vertical);
						break;
					case 'cr-tc' :
						context.indicator.handles.top(context, metrics.vertical);
						break;
					case 'cr-tr' :
						context.indicator.handles.right(context, metrics.horizontal);
						context.indicator.handles.top(context, metrics.vertical);
						break;
					case 'cr-ml' :
						context.indicator.handles.left(context, metrics.horizontal);
						break;
					case 'cr-mr' :
						context.indicator.handles.right(context, metrics.horizontal);
						break;
					case 'cr-bl' :
						context.indicator.handles.left(context, metrics.horizontal);
						context.indicator.handles.bottom(context, metrics.vertical);
						break;
					case 'cr-bc' :
						context.indicator.handles.bottom(context, metrics.vertical);
						break;
					case 'cr-br' :
						context.indicator.handles.right(context, metrics.horizontal);
						context.indicator.handles.bottom(context, metrics.vertical);
						break;
					default :
						context.indicator.move(context, metrics.horizontal, metrics.vertical);
					}
				}
			});
			gestures.start();
		};
		this.indicator.update = function (context) {
			var left, top, right, bottom;
			// get the dimensions of the component
			context.cfg.width = context.cfg.image.offsetWidth;
			context.cfg.height = context.cfg.image.offsetHeight;
			// convert the crop fractions into pixel values
			left = context.cfg.left * context.cfg.width;
			top = context.cfg.top * context.cfg.height;
			right = context.cfg.width - context.cfg.right * context.cfg.width;
			bottom = context.cfg.height - context.cfg.bottom * context.cfg.height;
			// reposition the indicator
			context.cfg.overlay.style.left = left + 'px';
			context.cfg.overlay.style.top = top + 'px';
			context.cfg.overlay.style.right = right + 'px';
			context.cfg.overlay.style.bottom = bottom + 'px';
			// reposition the background image
			context.cfg.overlay.style.backgroundPosition = '-' + left + 'px -' + top + 'px';
		};
		this.indicator.move = function (context, x, y) {
			var horizontal, vertical, left, top, right, bottom;
			// measure the movement in fractions of the dimensions
			horizontal = x / context.cfg.width;
			vertical = y / context.cfg.height;
			// calculate the new crop fractions
			left = context.cfg.left + horizontal;
			top = context.cfg.top + vertical;
			right = context.cfg.right + horizontal;
			bottom = context.cfg.bottom + vertical;
			// if all are within limits
			if (left >= 0 && top >= 0 && right <= 1 && bottom <= 1 && left < right && top < bottom) {
				// apply the movement to the crop fractions
				context.cfg.left = left;
				context.cfg.top = top;
				context.cfg.right = right;
				context.cfg.bottom = bottom;
			}
			// update the display
			context.update(context, true);
		};
		// indicator handles
		this.indicator.handles = {};
		this.indicator.handles.build = function (context) {
			var a, b, name;
			// create the handles
			context.cfg.handles = {};
			for (a = 0, b = context.names.length; a < b; a += 1) {
				name = context.names[a];
				context.cfg.handles[name] = document.createElement('span');
				context.cfg.handles[name].className = 'cr-' + name;
				context.cfg.overlay.appendChild(context.cfg.handles[name]);
				// event handlers for moving the handle
				// NOTE: the parent element will handle the touch event
			}
		};
		this.indicator.handles.left = function (context, distance) {
			var horizontal, left, right, limit;
			// measure the movement in fractions of the dimensions
			horizontal = distance / context.cfg.width;
			// calculate the new crop fractions
			left = context.cfg.left + horizontal;
			right = context.cfg.right + horizontal;
			limit = context.cfg.right - context.cfg.minimum;
			// if all are within limits
			if (left >= 0 && left < limit) {
				// apply the movement to the crop fractions
				context.cfg.left = left;
			}
			// update the display
			context.update(context, true);
		};
		this.indicator.handles.top = function (context, distance) {
			var vertical, top, bottom, limit;
			// measure the movement in fractions of the dimensions
			vertical = distance / context.cfg.height;
			// calculate the new crop fractions
			top = context.cfg.top + vertical;
			bottom = context.cfg.bottom + vertical;
			limit = context.cfg.bottom - context.cfg.minimum;
			// if all are within limits
			if (top >= 0 && top < limit) {
				// apply the movement to the crop fractions
				context.cfg.top = top;
			}
			// update the display
			context.update(context, true);
		};
		this.indicator.handles.right = function (context, distance) {
			var horizontal, left, right, limit;
			// measure the movement in fractions of the dimensions
			horizontal = distance / context.cfg.width;
			// calculate the new crop fractions
			left = context.cfg.left + horizontal;
			right = context.cfg.right + horizontal;
			limit = context.cfg.left + context.cfg.minimum;
			// if all are within limits
			if (right <= 1 && right > limit) {
				// apply the movement to the crop fractions
				context.cfg.right = right;
			}
			// update the display
			context.update(context, true);
		};
		this.indicator.handles.bottom = function (context, distance) {
			var vertical, top, bottom, limit;
			// measure the movement in fractions of the dimensions
			vertical = distance / context.cfg.height;
			// calculate the new crop fractions
			top = context.cfg.top + vertical;
			bottom = context.cfg.bottom + vertical;
			limit = context.cfg.top + context.cfg.minimum;
			// if all are within limits
			if (bottom <= 1 && bottom > limit) {
				// apply the movement to the crop fractions
				context.cfg.bottom = bottom;
			}
			// update the display
			context.update(context, true);
		};
		// toolbar
		this.toolbar = {};
		this.toolbar.build = function (context) {
			// create the toolbar
			context.cfg.toolbar = document.createElement('figcaption');
			// create the apply button
			context.cfg.applyButton = document.createElement('button');
			context.cfg.applyButton.setAttribute('type', 'button');
			context.cfg.applyButton.className = 'cr-apply button';
			context.cfg.applyButton.innerHTML = 'Apply';
			context.cfg.toolbar.appendChild(context.cfg.applyButton);
			context.cfg.applyButton.onclick = function () {
				context.toolbar.apply(context);
			};
			// create the reset button
			context.cfg.resetButton = document.createElement('button');
			context.cfg.resetButton.setAttribute('type', 'button');
			context.cfg.resetButton.className = 'cr-reset button';
			context.cfg.resetButton.innerHTML = 'Reset';
			context.cfg.toolbar.appendChild(context.cfg.resetButton);
			context.cfg.resetButton.onclick = function () {
				context.toolbar.reset(context);
			};
			// add the toolbar
			context.obj.appendChild(context.cfg.toolbar);
		};
		this.toolbar.apply = function (context) {
			var src, width, height, aspect;
			// normalise the dimensions
			width = context.cfg.overlay.offsetWidth;
			height = context.cfg.overlay.offsetHeight;
			aspect = context.obj.offsetHeight / context.obj.offsetWidth;
			if (height / width < aspect) {
				height = context.cfg.image.offsetWidth / width * context.cfg.overlay.offsetHeight;
				width = context.cfg.image.offsetWidth;
			} else {
				width = context.cfg.image.offsetHeight / height * context.cfg.overlay.offsetWidth;
				height = context.cfg.image.offsetHeight;
			}
			// fix the container
			context.obj.style.width = context.cfg.image.offsetWidth + 'px';
			context.obj.style.height = context.cfg.image.offsetHeight + 'px';
			// show busy message
			context.busy.show(context);
			// upon loading
			context.cfg.image.onload = function () {
				// set the image to center
				context.cfg.image.style.marginTop = Math.round((context.obj.offsetHeight - context.cfg.image.offsetHeight - context.cfg.offset) / 2) + 'px';
				// hide the busy message
				context.busy.hide(context);
			};
			// round the numbers
			width = Math.round(width);
			height = Math.round(height);
			// replace the image with a cropped version
			src = context.cfg.image.src;
			src = useful.urls.replace(src, 'width', width);
			src = useful.urls.replace(src, 'height', height);
			src = useful.urls.replace(src, 'left', context.cfg.left);
			src = useful.urls.replace(src, 'top', context.cfg.top);
			src = useful.urls.replace(src, 'right', context.cfg.right);
			src = useful.urls.replace(src, 'bottom', context.cfg.bottom);
			context.cfg.image.src = src;
			// disable the indicator
			context.cfg.applyButton.disabled = true;
			context.obj.className = context.obj.className.replace(' cr-disabled', '') + ' cr-disabled';
			// trigger any external onchange event
			context.cfg.onchange(context.cfg.values);
			// cancel the click
			return false;
		};
		this.toolbar.reset = function (context) {
			// show busy message
			context.busy.show(context);
			// upon loading
			context.cfg.image.onload = function () {
				// undo the margin
				context.cfg.image.style.marginTop = 0;
				// undo the values
				context.cfg.left = 0;
				context.cfg.top = 0;
				context.cfg.right = 1;
				context.cfg.bottom = 1;
				// reset the indicator
				context.update(context);
				// enable the indicator
				context.cfg.applyButton.disabled = false;
				context.obj.className = context.obj.className.replace(' cr-disabled', '');
				// hide the busy message
				context.busy.hide(context);
			};
			// replace the image with an uncropped version
			context.cfg.image.src = context.cfg.url;
			context.cfg.overlay.style.backgroundImage = 'url(' + context.cfg.url + ')';
			// trigger any external onchange event
			context.cfg.onchange(context.cfg.values);
			// cancel the click
			return false;
		};
	};

}(window.useful = window.useful || {}));
