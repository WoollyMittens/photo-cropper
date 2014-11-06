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
			if (event.pageX !== undefined) {
				coords.x = event.pageX;
				coords.y = event.pageY;
			} else if (event.touches && event.touches[0]) {
				coords.x = event.touches[0].pageX;
				coords.y = event.touches[0].pageY;
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

/*
	Source:
	van Creij, Maurice (2012). "useful.instances.js: A library of useful functions to ease working with instances of constructors.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// Invoke strict mode
	"use strict";

	// public functions
	useful.Instances = function (objs, constructor, cfg) {
		// properties
		this.objs = objs;
		this.constructor = constructor;
		this.cfg = cfg;
		this.constructs = [];
		// starts and stores an instance of the constructor for every element
		this.start = function () {
			for (var a = 0, b = this.objs.length; a < b; a += 1) {
				// store a constructed instance with cloned cfg object
				this.constructs[a] = new this.constructor(this.objs[a], Object.create(this.cfg));
			}
			// disable the start function so it can't be started twice
			this.start = function () {};
			// empty the timeout
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
		this.start();
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Instances;
	}

})();

/*
	Source:
	van Creij, Maurice (2012). "useful.polyfills.js: A library of useful polyfills to ease working with HTML5 in legacy environments.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// Invoke strict mode
	"use strict";

	// Create a private object for this library
	useful.polyfills = {

		// enabled the use of HTML5 elements in Internet Explorer
		html5 : function () {
			var a, b, elementsList;
			elementsList = ['section', 'nav', 'article', 'aside', 'hgroup', 'header', 'footer', 'dialog', 'mark', 'dfn', 'time', 'progress', 'meter', 'ruby', 'rt', 'rp', 'ins', 'del', 'figure', 'figcaption', 'video', 'audio', 'source', 'canvas', 'datalist', 'keygen', 'output', 'details', 'datagrid', 'command', 'bb', 'menu', 'legend'];
			if (navigator.userAgent.match(/msie/gi)) {
				for (a = 0 , b = elementsList.length; a < b; a += 1) {
					document.createElement(elementsList[a]);
				}
			}
		},

		// allow array.indexOf in older browsers
		arrayIndexOf : function () {
			if (!Array.prototype.indexOf) {
				Array.prototype.indexOf = function (obj, start) {
					for (var i = (start || 0), j = this.length; i < j; i += 1) {
						if (this[i] === obj) { return i; }
					}
					return -1;
				};
			}
		},

		// allow document.querySelectorAll (https://gist.github.com/connrs/2724353)
		querySelectorAll : function () {
			if (!document.querySelectorAll) {
				document.querySelectorAll = function (a) {
					var b = document, c = b.documentElement.firstChild, d = b.createElement("STYLE");
					return c.appendChild(d), b.__qsaels = [], d.styleSheet.cssText = a + "{x:expression(document.__qsaels.push(this))}", window.scrollBy(0, 0), b.__qsaels;
				};
			}
		},

		// allow addEventListener (https://gist.github.com/jonathantneal/3748027)
		addEventListener : function () {
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
		},

		// allow console.log
		consoleLog : function () {
			var overrideTest = new RegExp('console-log', 'i');
			if (!window.console || overrideTest.test(document.querySelectorAll('html')[0].className)) {
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
					// add a break after the message
					messages += '<hr/>';
					// output the queue to the panel
					reportPanel.innerHTML = messages + reportString;
				};
			}
		},

		// allows Object.create (https://gist.github.com/rxgx/1597825)
		objectCreate : function () {
			if (typeof Object.create !== "function") {
				Object.create = function (original) {
					function Clone() {}
					Clone.prototype = original;
					return new Clone();
				};
			}
		},

		// allows String.trim (https://gist.github.com/eliperelman/1035982)
		stringTrim : function () {
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
		},

		// allows localStorage support
		localStorage : function () {
			if (!window.localStorage) {
				if (/MSIE 8|MSIE 7|MSIE 6/i.test(navigator.userAgent)){
					window.localStorage = {
						getItem: function(sKey) {
							if (!sKey || !this.hasOwnProperty(sKey)) {
								return null;
							}
							return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
						},
						key: function(nKeyId) {
							return unescape(document.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
						},
						setItem: function(sKey, sValue) {
							if (!sKey) {
								return;
							}
							document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
							this.length = document.cookie.match(/\=/g).length;
						},
						length: 0,
						removeItem: function(sKey) {
							if (!sKey || !this.hasOwnProperty(sKey)) {
								return;
							}
							document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
							this.length--;
						},
						hasOwnProperty: function(sKey) {
							return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
						}
					};
					window.localStorage.length = (document.cookie.match(/\=/g) || window.localStorage).length;
				} else {
				    Object.defineProperty(window, "localStorage", new(function() {
				        var aKeys = [],
				            oStorage = {};
				        Object.defineProperty(oStorage, "getItem", {
				            value: function(sKey) {
				                return sKey ? this[sKey] : null;
				            },
				            writable: false,
				            configurable: false,
				            enumerable: false
				        });
				        Object.defineProperty(oStorage, "key", {
				            value: function(nKeyId) {
				                return aKeys[nKeyId];
				            },
				            writable: false,
				            configurable: false,
				            enumerable: false
				        });
				        Object.defineProperty(oStorage, "setItem", {
				            value: function(sKey, sValue) {
				                if (!sKey) {
				                    return;
				                }
				                document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
				            },
				            writable: false,
				            configurable: false,
				            enumerable: false
				        });
				        Object.defineProperty(oStorage, "length", {
				            get: function() {
				                return aKeys.length;
				            },
				            configurable: false,
				            enumerable: false
				        });
				        Object.defineProperty(oStorage, "removeItem", {
				            value: function(sKey) {
				                if (!sKey) {
				                    return;
				                }
				                document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
				            },
				            writable: false,
				            configurable: false,
				            enumerable: false
				        });
				        this.get = function() {
				            var iThisIndx;
				            for (var sKey in oStorage) {
				                iThisIndx = aKeys.indexOf(sKey);
				                if (iThisIndx === -1) {
				                    oStorage.setItem(sKey, oStorage[sKey]);
				                } else {
				                    aKeys.splice(iThisIndx, 1);
				                }
				                delete oStorage[sKey];
				            }
				            for (aKeys; aKeys.length > 0; aKeys.splice(0, 1)) {
				                oStorage.removeItem(aKeys[0]);
				            }
				            for (var aCouple, iKey, nIdx = 0, aCouples = document.cookie.split(/\s*;\s*/); nIdx < aCouples.length; nIdx++) {
				                aCouple = aCouples[nIdx].split(/\s*=\s*/);
				                if (aCouple.length > 1) {
				                    oStorage[iKey = unescape(aCouple[0])] = unescape(aCouple[1]);
				                    aKeys.push(iKey);
				                }
				            }
				            return oStorage;
				        };
				        this.configurable = false;
				        this.enumerable = true;
				    })());
				}
			}
		}

	};

	// startup
	useful.polyfills.html5();
	useful.polyfills.arrayIndexOf();
	useful.polyfills.querySelectorAll();
	useful.polyfills.addEventListener();
	useful.polyfills.consoleLog();
	useful.polyfills.objectCreate();
	useful.polyfills.stringTrim();
	useful.polyfills.localStorage();

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.polyfills;
	}

})();

/*
	Source:
	van Creij, Maurice (2014). "useful.urls.js: A library of useful functions to ease working with URL query parameters.", version 20140828, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// Invoke strict mode
	"use strict";

	// Create a private object for this library
	useful.urls = {

		// retrieves the query parameters from an url
		load : function (url) {
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
		save : function (url, data) {
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
		replace : function (url, name, value) {
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
		encode : function (data) {
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
		decode : function (data) {
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
		exports = module.exports = useful.urls;
	}

})();

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
	useful.Cropper_Indicator_Handles = function (parent) {
		this.parent = parent;
		// indicator handles
		this.build = function () {
			var cfg = this.parent.cfg;
			var a, b, name;
			// create the handles
			cfg.handles = {};
			for (a = 0, b = this.parent.names.length; a < b; a += 1) {
				name = this.parent.names[a];
				cfg.handles[name] = document.createElement('span');
				cfg.handles[name].className = 'cr-' + name;
				cfg.overlay.appendChild(cfg.handles[name]);
				// event handlers for moving the handle
				// NOTE: the parent element will handle the touch event
			}
		};
		this.left = function (distance) {
			var cfg = this.parent.cfg;
			var horizontal, left, right, limit;
			// measure the movement in fractions of the dimensions
			horizontal = distance / cfg.width;
			// calculate the new crop fractions
			left = cfg.left + horizontal;
			right = cfg.right + horizontal;
			limit = cfg.right - cfg.minimum;
			// if all are within limits
			if (left >= 0 && left < limit) {
				// apply the movement to the crop fractions
				cfg.left = left;
			}
		};
		this.top = function (distance) {
			var cfg = this.parent.cfg;
			var vertical, top, bottom, limit;
			// measure the movement in fractions of the dimensions
			vertical = distance / cfg.height;
			// calculate the new crop fractions
			top = cfg.top + vertical;
			bottom = cfg.bottom + vertical;
			limit = cfg.bottom - cfg.minimum;
			// if all are within limits
			if (top >= 0 && top < limit) {
				// apply the movement to the crop fractions
				cfg.top = top;
			}
		};
		this.right = function (distance) {
			var cfg = this.parent.cfg;
			var horizontal, left, right, limit;
			// measure the movement in fractions of the dimensions
			horizontal = distance / cfg.width;
			// calculate the new crop fractions
			left = cfg.left + horizontal;
			right = cfg.right + horizontal;
			limit = cfg.left + cfg.minimum;
			// if all are within limits
			if (right <= 1 && right > limit) {
				// apply the movement to the crop fractions
				cfg.right = right;
			}
		};
		this.bottom = function (distance) {
			var cfg = this.parent.cfg;
			var vertical, top, bottom, limit;
			// measure the movement in fractions of the dimensions
			vertical = distance / cfg.height;
			// calculate the new crop fractions
			top = cfg.top + vertical;
			bottom = cfg.bottom + vertical;
			limit = cfg.top + cfg.minimum;
			// if all are within limits
			if (bottom <= 1 && bottom > limit) {
				// apply the movement to the crop fractions
				cfg.bottom = bottom;
			}
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Cropper_Indicator_Handles;
	}

})();

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
	useful.Cropper_Indicator = function (parent) {
		// properties
		this.parent = parent;
		// components
		this.handles = new useful.Cropper_Indicator_Handles(this.parent);
		// methods
		this.build = function () {
			var cfg = this.parent.cfg;
			// create the indicator
			cfg.overlay = document.createElement('span');
			cfg.overlay.className = 'cr-overlay';
			cfg.overlay.style.background = 'url(' + cfg.image.src + ')';
			// create the handles
			this.handles.build();
			// add the indicator to the parent
			this.parent.obj.appendChild(cfg.overlay);
			// add the interaction
			var context = this;
			var gestures = new useful.Gestures(cfg.overlay.parentNode, {
				'threshold' : 50,
				'increment' : 0.1,
				'cancelTouch' : true,
				'cancelGesture' : true,
				'drag' : function (metrics) {
					// move the handles
					switch (metrics.source.className) {
						case 'cr-tl' :
							context.handles.left(metrics.horizontal);
							context.handles.top(metrics.vertical);
							context.parent.update(null, true, 'tl');
							break;
						case 'cr-tc' :
							context.handles.top(metrics.vertical);
							context.parent.update(null, true, 'tc');
							break;
						case 'cr-tr' :
							context.handles.right(metrics.horizontal);
							context.handles.top(metrics.vertical);
							context.parent.update(null, true, 'tr');
							break;
						case 'cr-ml' :
							context.handles.left(metrics.horizontal);
							context.parent.update(null, true, 'ml');
							break;
						case 'cr-mr' :
							context.handles.right(metrics.horizontal);
							context.parent.update(null, true, 'mr');
							break;
						case 'cr-bl' :
							context.handles.left(metrics.horizontal);
							context.handles.bottom(metrics.vertical);
							context.parent.update(null, true, 'bl');
							break;
						case 'cr-bc' :
							context.handles.bottom(metrics.vertical);
							context.parent.update(null, true, 'bc');
							break;
						case 'cr-br' :
							context.handles.right(metrics.horizontal);
							context.handles.bottom(metrics.vertical);
							context.parent.update(null, true, 'br');
							break;
						default :
							context.move(metrics.horizontal, metrics.vertical);
							context.parent.update(null, true, null);
					}
				}
			});
		};
		this.update = function () {
			var cfg = this.parent.cfg;
			var left, top, right, bottom;
			// get the dimensions of the component
			cfg.width = cfg.image.offsetWidth;
			cfg.height = cfg.image.offsetHeight;
			// convert the crop fractions into pixel values
			left = cfg.left * cfg.width;
			top = cfg.top * cfg.height;
			right = cfg.width - cfg.right * cfg.width;
			bottom = cfg.height - cfg.bottom * cfg.height;
			// reposition the indicator
			cfg.overlay.style.left = left + 'px';
			cfg.overlay.style.top = top + 'px';
			cfg.overlay.style.right = right + 'px';
			cfg.overlay.style.bottom = bottom + 'px';
			// reposition the background image
			cfg.overlay.style.backgroundPosition = '-' + left + 'px -' + top + 'px';
		};
		this.move = function (x, y) {
			var cfg = this.parent.cfg;
			var horizontal, vertical, left, top, right, bottom;
			// measure the movement in fractions of the dimensions
			horizontal = x / cfg.width;
			vertical = y / cfg.height;
			// calculate the new crop fractions
			left = cfg.left + horizontal;
			top = cfg.top + vertical;
			right = cfg.right + horizontal;
			bottom = cfg.bottom + vertical;
			// if all are within limits
			if (left >= 0 && top >= 0 && right <= 1 && bottom <= 1 && left < right && top < bottom) {
				// apply the movement to the crop fractions
				cfg.left = left;
				cfg.top = top;
				cfg.right = right;
				cfg.bottom = bottom;
			}
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Cropper_Indicator;
	}

})();

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
	useful.Cropper_Toolbar = function (parent) {
		this.parent = parent;
		this.ui = {};
		this.build = function () {
			var cfg = this.parent.cfg;
			var context = this;
			// create the toolbar
			cfg.toolbar = document.createElement('figcaption');
			// create the apply button
			cfg.applyButton = document.createElement('button');
			cfg.applyButton.setAttribute('type', 'button');
			cfg.applyButton.className = 'cr-apply button';
			cfg.applyButton.innerHTML = 'Apply';
			cfg.toolbar.appendChild(cfg.applyButton);
			cfg.applyButton.onclick = function () {
				context.apply();
			};
			// create the reset button
			cfg.resetButton = document.createElement('button');
			cfg.resetButton.setAttribute('type', 'button');
			cfg.resetButton.className = 'cr-reset button';
			cfg.resetButton.innerHTML = 'Reset';
			cfg.toolbar.appendChild(cfg.resetButton);
			cfg.resetButton.onclick = function () {
				context.reset();
			};
			// add the toolbar
			this.parent.obj.appendChild(cfg.toolbar);
		};
		this.apply = function () {
			var cfg = this.parent.cfg;
			var src, width, height, aspect;
			var context = this;
			// normalise the dimensions
			width = cfg.overlay.offsetWidth;
			height = cfg.overlay.offsetHeight;
			aspect = this.parent.obj.offsetHeight / this.parent.obj.offsetWidth;
			if (height / width < aspect) {
				height = cfg.image.offsetWidth / width * cfg.overlay.offsetHeight;
				width = cfg.image.offsetWidth;
			} else {
				width = cfg.image.offsetHeight / height * cfg.overlay.offsetWidth;
				height = cfg.image.offsetHeight;
			}
			// fix the container
			this.parent.obj.style.width = cfg.image.offsetWidth + 'px';
			this.parent.obj.style.height = cfg.image.offsetHeight + 'px';
			// show busy message
			this.parent.busy.show();
			// upon loading
			cfg.image.onload = function () {
				// set the image to center
				cfg.image.style.marginTop = Math.round((context.parent.obj.offsetHeight - cfg.image.offsetHeight - cfg.offset) / 2) + 'px';
				// hide the busy message
				context.parent.busy.hide();
			};
			// round the numbers
			width = Math.round(width);
			height = Math.round(height);
			// replace the image with a cropped version
			src = cfg.image.src;
			src = useful.urls.replace(src, 'width', width);
			src = useful.urls.replace(src, 'height', height);
			src = useful.urls.replace(src, 'left', cfg.left);
			src = useful.urls.replace(src, 'top', cfg.top);
			src = useful.urls.replace(src, 'right', cfg.right);
			src = useful.urls.replace(src, 'bottom', cfg.bottom);
			src = useful.urls.replace(src, 'time', new Date().getTime());
			cfg.image.src = src;
			// disable the indicator
			cfg.applyButton.disabled = true;
			this.parent.obj.className = this.parent.obj.className.replace(' cr-disabled', '') + ' cr-disabled';
			// trigger any external onchange event
			cfg.onchange(cfg.values);
			// cancel the click
			return false;
		};
		this.reset = function () {
			var cfg = this.parent.cfg;
			var context = this;
			// show busy message
			this.parent.busy.show();
			// upon loading
			cfg.image.onload = function () {
				// undo the margin
				cfg.image.style.marginTop = 0;
				// undo the values
				cfg.left = cfg.reset[0];
				cfg.top = cfg.reset[1];
				cfg.right = cfg.reset[2];
				cfg.bottom = cfg.reset[3];
				// reset the indicator
				context.parent.update();
				// enable the indicator
				cfg.applyButton.disabled = false;
				context.parent.obj.className = context.parent.obj.className.replace(' cr-disabled', '');
				// hide the busy message
				context.parent.busy.hide();
			};
			// replace the image with an uncropped version
			cfg.url = useful.urls.replace(cfg.url, 'name', new Date().getTime());
			cfg.image.src =  cfg.url;
			cfg.overlay.style.backgroundImage = 'url(' + cfg.url + ')';
			// trigger any external onchange event
			cfg.onchange(cfg.values);
			// cancel the click
			return false;
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Cropper_Toolbar;
	}

})();

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
	useful.Cropper = function (obj, cfg) {
		// properties
		this.obj = obj;
		this.cfg = cfg;
		this.names = ['tl', 'tc', 'tr', 'ml', 'mr', 'bl', 'bc', 'br'];
		// components
		this.busy = new useful.Cropper_Busy(this);
		this.indicator = new useful.Cropper_Indicator(this);
		this.toolbar = new useful.Cropper_Toolbar(this);
		// methods
		this.start = function () {
			// store the image
			this.cfg.image = this.obj.getElementsByTagName('img')[0];
			// store the hidden fields
			this.cfg.output = this.obj.getElementsByTagName('input');
			this.cfg.values = null;
			// validate presets
			this.cfg.onchange = this.cfg.onchange || function () {};
			this.cfg.delay = this.cfg.delay || 1000;
			this.cfg.timeout = null;
			this.cfg.realtime = this.cfg.realtime || false;
			this.cfg.minimum = this.cfg.minimum || 0.2;
			this.cfg.crop = this.cfg.crop || [0.1, 0.1, 0.9, 0.9];
			this.cfg.url = this.cfg.image.src;
			this.cfg.offset = this.cfg.offset || 4;
			this.cfg.reset = [this.cfg.left, this.cfg.top, this.cfg.right, this.cfg.bottom];
			// build the busy message
			this.busy.build();
			// build the indicator
			this.indicator.build();
			// build the toolbar
			if (!this.cfg.realtime) {
				this.toolbar.build();
			}
			// ask the indicator to update after the image loads
			this.loaded();
			// disable the start function so it can't be started twice
			this.start = function () {};
		};
		this.loaded = function () {
			// if the image has loaded
			if (this.cfg.image.offsetWidth > 0 && this.cfg.image.offsetHeight > 0) {
				// update the indicator
				this.update();
				this.preset();
			// else
			} else {
				// wait for the image to load
				var context = this;
				this.cfg.image.onload = function () {
					// update the indicator
					context.update();
					context.preset();
				};
			}
		};
		this.preset = function () {
			var query, width, height, aspect;
			// if there's anything to measure yet
			if (this.cfg.image.offsetWidth) {
				// retrieve the crop coordinates from the url
				query = useful.urls.load(this.cfg.url);
				// if we started out with a cropped image
				if (query.left > 0 || query.top > 0 || query.right < 1 || query.bottom < 1) {
					// validate the input
					query.left = query.left || 0;
					query.top = query.top || 0;
					query.right = query.right || 1;
					query.bottom = query.bottom || 1;
					// store the cropping dimensions
					this.cfg.left = query.left;
					this.cfg.top = query.top;
					this.cfg.right = query.right;
					this.cfg.bottom = query.bottom;
					// guess what the original dimensions could have been
					width = this.cfg.image.offsetWidth / (this.cfg.right - this.cfg.left);
					height = this.cfg.image.offsetHeight / (this.cfg.bottom - this.cfg.top);
					aspect = height / width;
					// scale to the available space
					width = this.obj.offsetWidth;
					height = Math.round(width * aspect);
					// limit the image's size to the original parent
					this.cfg.image.style.maxWidth = width + 'px';
					this.cfg.image.style.maxHeight = height + 'px';
					// guess what the reset url of the uncropped image might have been
					this.cfg.url = useful.urls.replace(this.cfg.url, 'width', width);
					this.cfg.url = useful.urls.replace(this.cfg.url, 'height', height);
					this.cfg.url = useful.urls.replace(this.cfg.url, 'left', 0);
					this.cfg.url = useful.urls.replace(this.cfg.url, 'top', 0);
					this.cfg.url = useful.urls.replace(this.cfg.url, 'right', 1);
					this.cfg.url = useful.urls.replace(this.cfg.url, 'bottom', 1);
					// restore the container's original size
					this.obj.style.width = width + 'px';
					this.obj.style.height = height + 'px';
					// if continuous updates are on
					if (this.cfg.realtime) {
						// load the original image
						var context = this;
						this.cfg.image.onload = function () { context.update(); };
						this.cfg.image.src = this.cfg.url;
						this.cfg.overlay.style.background = 'url(' + this.cfg.url + ')';
					} else {
						// set the image to center
						this.cfg.image.style.marginTop = Math.round((this.obj.offsetHeight - this.cfg.image.offsetHeight - this.cfg.offset) / 2) + 'px';
						// disable the indicator
						this.cfg.applyButton.disabled = true;
						this.obj.className = this.obj.className.replace(' cr-disabled', '') + ' cr-disabled';
					}
				}
			}
		};
		this.correct = function (handle) {
			// determine the dominant motion
			var dLeft = Math.abs(this.cfg.values.left - this.cfg.left),
				dTop = Math.abs(this.cfg.values.top - this.cfg.top),
				dRight = Math.abs(this.cfg.values.right - this.cfg.right),
				dBottom = Math.abs(this.cfg.values.bottom - this.cfg.bottom),
				aspect = this.cfg.aspect;
			// implement the aspect ratio from the required corner
			switch (handle) {
				case 'tl' :
					if (dLeft > dTop) { this.cfg.top = this.cfg.bottom - (this.cfg.right - this.cfg.left) * aspect; }
					else { this.cfg.left = this.cfg.right - (this.cfg.bottom - this.cfg.top) / aspect; }
					break;
				case 'tc' :
					this.cfg.right = this.cfg.left + (this.cfg.bottom - this.cfg.top) / aspect;
					break;
				case 'tr' :
					if (dRight > dTop) { this.cfg.top = this.cfg.bottom - (this.cfg.right - this.cfg.left) * aspect; }
					else { this.cfg.right = this.cfg.left + (this.cfg.bottom - this.cfg.top) / aspect;  }
					break;
				case 'ml' :
					this.cfg.bottom = this.cfg.top + (this.cfg.right - this.cfg.left) * aspect;
					break;
				case 'mr' :
					this.cfg.bottom = this.cfg.top + (this.cfg.right - this.cfg.left) * aspect;
					break;
				case 'bl' :
					if (dLeft > dBottom) { this.cfg.bottom = this.cfg.top + (this.cfg.right - this.cfg.left) * aspect; }
					else { this.cfg.left = this.cfg.right - (this.cfg.bottom - this.cfg.top) / aspect; }
					break;
				case 'bc' :
					this.cfg.right = this.cfg.left + (this.cfg.bottom - this.cfg.top) / aspect;
					break;
				case 'br' :
					if (dRight > dBottom) { this.cfg.bottom = this.cfg.top + (this.cfg.right - this.cfg.left) * aspect; }
					else { this.cfg.right = this.cfg.left + (this.cfg.bottom - this.cfg.top) / aspect; }
					break;
			}
		};
		this.update = function (values, changed, handle) {
			changed = (changed === true);
			// process any override values
			if (values && values.left) { this.cfg.left = values.left; }
			if (values && values.top) { this.cfg.top = values.top; }
			if (values && values.right) { this.cfg.right = values.right; }
			if (values && values.bottom) { this.cfg.bottom = values.bottom; }
			// correct the values for aspect ratio
			if (this.cfg.aspect && this.cfg.values && handle) { this.correct(handle); }
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
			if (changed && this.cfg.realtime) {
				clearTimeout(this.cfg.timeout);
				var context = this;
				this.cfg.timeout = setTimeout(function () {
					context.cfg.onchange(context.cfg.values);
				}, this.cfg.delay);
			}
		};
		// go
		this.start();
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Cropper;
	}

})();
