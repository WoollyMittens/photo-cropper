/*
	Source:
	van Creij, Maurice (2012). "useful.cropper.js: A simple image cropper", version 20130510, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.

	Prerequisites:
	<script src="./js/useful.js"></script>
	<!--[if IE]>
		<script src="./js/html5.js"></script>
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
	<![endif]-->
*/

(function (useful) {

	// invoke strict mode
	"use strict";

	// private functions
	var cropper = {};
	cropper = {
		cropper : null,
		names : ['tl', 'tc', 'tr', 'ml', 'mr', 'bl', 'bc', 'br'],
		setup : function (element, settings) {
			// store the parent element
			settings.parent = element;
			// store the image
			settings.image = settings.parent.getElementsByTagName('img')[0];
			// store the hidden field
			settings.output = settings.parent.getElementsByTagName('input');
			// validate presets
			settings.onchange = settings.onchange || function () {};
			settings.delay = settings.delay || 1000;
			settings.minimum = settings.minimum || 0.2;
			settings.crop = settings.crop || [0.1, 0.1, 0.9, 0.9];
			settings.url = settings.image.src;
			settings.offset = settings.offset || 4;
			// build the busy message
			cropper.busy.build(settings);
			// build the indicator
			cropper.indicator.build(settings);
			// build the toolbar
			cropper.toolbar.build(settings);
			// ask the indicator to update after the image loads
			cropper.start(settings);
		},
		start : function (settings) {
			// if the image has loaded
			if (settings.image.offsetWidth > 0 && settings.image.offsetHeight > 0) {
				// update the indicator
				cropper.update(settings);
				cropper.preset(settings);
			// else
			} else {
				// wait for the image to load
				settings.image.onload = function () {
					// update the indicator
					cropper.update(settings);
					cropper.preset(settings);
				};
			}
		},
		preset : function (settings) {
			var query, width, height, aspect;
			// if there's anything to measure yet
			if (settings.image.offsetWidth) {
				// retrieve the crop coordinates from the url
				query = useful.urls.load(settings.url);
				// if we started out with a cropped image
				if (query.left > 0 || query.top > 0 || query.right < 1 || query.bottom < 1) {
					// validate the input
					query.left = query.left || 0;
					query.top = query.top || 0;
					query.right = query.right || 1;
					query.bottom = query.bottom || 1;
					// store the cropping dimensions
					settings.left = query.left;
					settings.top = query.top;
					settings.right = query.right;
					settings.bottom = query.bottom;
					// guess what the original dimensions could have been
					width = settings.image.offsetWidth;
					height = settings.image.offsetHeight;
					aspect = (height / (settings.bottom - settings.top)) / (width / (settings.right - settings.left));
					if (width > height) {
						height = width * aspect;
					} else {
						width = height / aspect;
					}
					// round the numbers
					width = Math.round(width);
					height = Math.round(height);
					// limit the image's size to the original parent
					settings.image.style.maxWidth = width + 'px';
					settings.image.style.maxHeight = height + 'px';
					// guess what the reset url of the uncropped image might have been
					settings.url = useful.urls.replace(settings.url, 'width', width);
					settings.url = useful.urls.replace(settings.url, 'height', height);
					settings.url = useful.urls.replace(settings.url, 'left', 0);
					settings.url = useful.urls.replace(settings.url, 'top', 0);
					settings.url = useful.urls.replace(settings.url, 'right', 1);
					settings.url = useful.urls.replace(settings.url, 'bottom', 1);
					// restore the container's original size
					settings.parent.style.width = width + 'px';
					settings.parent.style.height = height + 'px';
					// set the image to center
					settings.image.style.marginTop = Math.round((settings.parent.offsetHeight - settings.image.offsetHeight - settings.offset) / 2) + 'px';
					// disable the indicator
					settings.applyButton.disabled = true;
					settings.parent.className = settings.parent.className.replace(' cr-disabled', '') + ' cr-disabled';
				}
			}
		},
		update : function (settings) {
			// refresh the hidden field
			settings.output[0].value = settings.left;
			settings.output[1].value = settings.top;
			settings.output[2].value = settings.right;
			settings.output[3].value = settings.bottom;
			// redraw the indicator
			cropper.indicator.update(settings);
			// trigger external onchange event
			clearTimeout(cropper.timeout);
			cropper.timeout = setTimeout(function () {
				settings.onchange(settings.output[0]);
			}, settings.delay);
		},
		busy : {
			build : function (settings) {
				// add a busy message
				settings.busy = document.createElement('span');
				settings.busy.className = 'cr-busy';
				settings.busy.innerHTML = 'Please wait...';
				settings.busy.style.visibility = 'hidden';
				settings.parent.appendChild(settings.busy);
			},
			show : function (settings) {
				// show the busy message
				settings.busy.style.visibility = 'visible';
			},
			hide : function (settings) {
				// show the busy message
				settings.busy.style.visibility = 'hidden';
			}
		},
		indicator : {
			build : function (settings) {
				// create the indicator
				settings.overlay = document.createElement('span');
				settings.overlay.className = 'cr-overlay';
				settings.overlay.style.background = 'url(' + settings.image.src + ')';
				// create the handles
				cropper.indicator.handles.build(settings);
				// add the indicator to the parent
				settings.parent.appendChild(settings.overlay);
				// add the interaction
				settings.moving = false;
				useful.interaction.watch(settings.overlay, {
					'start' : function () {
						settings.moving = true;
					},
					'end' : function () {
						settings.moving = false;
					},
					'move' : function (coords) {
						if (!settings.sizing) {
							cropper.indicator.move(settings, coords);
						}
					}
				});
			},
			update : function (settings) {
				var left, top, right, bottom;
				// get the dimensions of the component
				settings.width = settings.image.offsetWidth;
				settings.height = settings.image.offsetHeight;
				// convert the crop fractions into pixel values
				left = settings.left * settings.width;
				top = settings.top * settings.height;
				right = settings.width - settings.right * settings.width;
				bottom = settings.height - settings.bottom * settings.height;
				// reposition the indicator
				settings.overlay.style.left = left + 'px';
				settings.overlay.style.top = top + 'px';
				settings.overlay.style.right = right + 'px';
				settings.overlay.style.bottom = bottom + 'px';
				// reposition the background image
				settings.overlay.style.backgroundPosition = '-' + left + 'px -' + top + 'px';
			},
			move : function (settings, coords) {
				var horizontal, vertical, left, top, right, bottom;
				// measure the movement in fractions of the dimensions
				horizontal = (coords[0].move.x - coords[0].start.x) / settings.width;
				vertical = (coords[0].move.y - coords[0].start.y) / settings.height;
				// calculate the new crop fractions
				left = settings.left + horizontal;
				top = settings.top + vertical;
				right = settings.right + horizontal;
				bottom = settings.bottom + vertical;
				// if all are within limits
				if (left >= 0 && top >= 0 && right <= 1 && bottom <= 1 && left < right && top < bottom) {
					// apply the movement to the crop fractions
					settings.left = left;
					settings.top = top;
					settings.right = right;
					settings.bottom = bottom;
				}
				// reset the start coordinates
				coords[0].start.x = coords[0].move.x;
				coords[0].start.y = coords[0].move.y;
				// update the display
				cropper.update(settings);
			},
			handles : {
				build : function (settings) {
					var a, b, name;
					// create the handles
					settings.handles = {};
					for (a = 0 , b = cropper.names.length; a < b; a += 1) {
						name = cropper.names[a];
						settings.handles[name] = document.createElement('span');
						settings.handles[name].className = 'cr-' + name;
						settings.overlay.appendChild(settings.handles[name]);
						// event handlers for moving the handle
						settings.sizing = false;
						cropper.indicator.handles.move(settings, name);
					}
				},
				move : function (settings, name) {
					// event handlers for moving the handle
					useful.interaction.watch(settings.handles[name], {
						'start' : function () {
							settings.sizing = true;
						},
						'end' : function () {
							settings.sizing = false;
						},
						'move' : function (coords) {
							// pick appropriate rules for the handle
							switch (name) {
							case 'tl' :
								cropper.indicator.handles.left(settings, coords);
								cropper.indicator.handles.top(settings, coords);
								break;
							case 'tc' :
								cropper.indicator.handles.top(settings, coords);
								break;
							case 'tr' :
								cropper.indicator.handles.right(settings, coords);
								cropper.indicator.handles.top(settings, coords);
								break;
							case 'ml' :
								cropper.indicator.handles.left(settings, coords);
								break;
							case 'mr' :
								cropper.indicator.handles.right(settings, coords);
								break;
							case 'bl' :
								cropper.indicator.handles.left(settings, coords);
								cropper.indicator.handles.bottom(settings, coords);
								break;
							case 'bc' :
								cropper.indicator.handles.bottom(settings, coords);
								break;
							case 'br' :
								cropper.indicator.handles.right(settings, coords);
								cropper.indicator.handles.bottom(settings, coords);
								break;
							}
							// cancel touch shenanigans
							return false;
						}
					});
				},
				left : function (settings, coords) {
					var horizontal, left, right, limit;
					// measure the movement in fractions of the dimensions
					horizontal = (coords[0].move.x - coords[0].start.x) / settings.width;
					// calculate the new crop fractions
					left = settings.left + horizontal;
					right = settings.right + horizontal;
					limit = settings.right - settings.minimum;
					// if all are within limits
					if (left >= 0 && left < limit) {
						// apply the movement to the crop fractions
						settings.left = left;
					}
					// reset the start coordinates
					coords[0].start.x = coords[0].move.x;
					// update the display
					cropper.update(settings);
				},
				top : function (settings, coords) {
					var vertical, top, bottom, limit;
					// measure the movement in fractions of the dimensions
					vertical = (coords[0].move.y - coords[0].start.y) / settings.height;
					// calculate the new crop fractions
					top = settings.top + vertical;
					bottom = settings.bottom + vertical;
					limit = settings.bottom - settings.minimum;
					// if all are within limits
					if (top >= 0 && top < limit) {
						// apply the movement to the crop fractions
						settings.top = top;
					}
					// reset the start coordinates
					coords[0].start.y = coords[0].move.y;
					// update the display
					cropper.update(settings);
				},
				right : function (settings, coords) {
					var horizontal, left, right, limit;
					// measure the movement in fractions of the dimensions
					horizontal = (coords[0].move.x - coords[0].start.x) / settings.width;
					// calculate the new crop fractions
					left = settings.left + horizontal;
					right = settings.right + horizontal;
					limit = settings.left + settings.minimum;
					// if all are within limits
					if (right <= 1 && right > limit) {
						// apply the movement to the crop fractions
						settings.right = right;
					}
					// reset the start coordinates
					coords[0].start.x = coords[0].move.x;
					// update the display
					cropper.update(settings);
				},
				bottom : function (settings, coords) {
					var vertical, top, bottom, limit;
					// measure the movement in fractions of the dimensions
					vertical = (coords[0].move.y - coords[0].start.y) / settings.height;
					// calculate the new crop fractions
					top = settings.top + vertical;
					bottom = settings.bottom + vertical;
					limit = settings.top + settings.minimum;
					// if all are within limits
					if (bottom <= 1 && bottom > limit) {
						// apply the movement to the crop fractions
						settings.bottom = bottom;
					}
					// reset the start coordinates
					coords[0].start.y = coords[0].move.y;
					// update the display
					cropper.update(settings);
				}
			}
		},
		toolbar : {
			build : function (settings) {
				// create the toolbar
				settings.toolbar = document.createElement('figcaption');
				// create the apply button
				settings.applyButton = document.createElement('button');
				settings.applyButton.setAttribute('type', 'button');
				settings.applyButton.className = 'cr-apply button';
				settings.applyButton.innerHTML = 'Apply';
				settings.toolbar.appendChild(settings.applyButton);
				settings.applyButton.onclick = function () {
					cropper.toolbar.apply(settings);
				};
				// create the reset button
				settings.resetButton = document.createElement('button');
				settings.resetButton.setAttribute('type', 'button');
				settings.resetButton.className = 'cr-reset button';
				settings.resetButton.innerHTML = 'Reset';
				settings.toolbar.appendChild(settings.resetButton);
				settings.resetButton.onclick = function () {
					cropper.toolbar.reset(settings);
				};
				// add the toolbar
				settings.parent.appendChild(settings.toolbar);
			},
			apply : function (settings) {
				var src, width, height;
				// normalise the dimensions
				width = settings.overlay.offsetWidth;
				height = settings.overlay.offsetHeight;
				if (width > height) {
					height = settings.image.offsetWidth / width * settings.overlay.offsetHeight;
					width = settings.image.offsetWidth;
				} else {
					width = settings.image.offsetHeight / height * settings.overlay.offsetWidth;
					height = settings.image.offsetHeight;
				}
				// fix the container
				settings.parent.style.width = settings.image.offsetWidth + 'px';
				settings.parent.style.height = settings.image.offsetHeight + 'px';
				// show busy message
				cropper.busy.show(settings);
				// upon loading
				settings.image.onload = function () {
					// set the image to center
					settings.image.style.marginTop = Math.round((settings.parent.offsetHeight - settings.image.offsetHeight - settings.offset) / 2) + 'px';
					// hide the busy message
					cropper.busy.hide(settings);
				};
				// round the numbers
				width = Math.round(width);
				height = Math.round(height);
				// replace the image with a cropped version
				src = settings.image.src;
				src = useful.urls.replace(src, 'width', width);
				src = useful.urls.replace(src, 'height', height);
				src = useful.urls.replace(src, 'left', settings.left);
				src = useful.urls.replace(src, 'top', settings.top);
				src = useful.urls.replace(src, 'right', settings.right);
				src = useful.urls.replace(src, 'bottom', settings.bottom);
				settings.image.src = src;
				// disable the indicator
				settings.applyButton.disabled = true;
				settings.parent.className = settings.parent.className.replace(' cr-disabled', '') + ' cr-disabled';
				// cancel the click
				return false;
			},
			reset : function (settings) {
				// show busy message
				cropper.busy.show(settings);
				// upon loading
				settings.image.onload = function () {
					// undo the margin
					settings.image.style.marginTop = 0;
					// reset the indicator
					cropper.update(settings);
					// enable the indicator
					settings.applyButton.disabled = false;
					settings.parent.className = settings.parent.className.replace(' cr-disabled', '');
					// hide the busy message
					cropper.busy.hide(settings);
				};
				// replace the image with an uncropped version
				settings.image.src = settings.url;
				settings.overlay.style.backgroundImage = 'url(' + settings.url + ')';
				// cancel the click
				return false;
			}
		}
	};

	// public functions
	useful.events = useful.events || {};
	useful.events.add = function (element, eventName, eventHandler) {
		// exceptions
		eventName = (navigator.userAgent.match(/Firefox/i) && eventName.match(/mousewheel/i)) ? 'DOMMouseScroll' : eventName;
		// prefered method
		if ('addEventListener' in element) {
			element.addEventListener(eventName, eventHandler, false);
		}
		// alternative method
		else if ('attachEvent' in element) {
			element.attachEvent('on' + eventName, function (event) { eventHandler(event); });
		}
		// desperate method
		else {
			element['on' + eventName] = eventHandler;
		}
	};
	useful.events.cancel = function (event) {
		if (event) {
			if (event.preventDefault) { event.preventDefault(); }
			else if (event.preventManipulation) { event.preventManipulation(); }
			else { event.returnValue = false; }
		}
	};

	useful.models = useful.models || {};
	useful.models.clone = function (model) {
		var clonedModel, ClonedModel;
		// if the method exists
		if (typeof(Object.create) !== 'undefined') {
			clonedModel = Object.create(model);
		}
		// else use a fall back
		else {
			ClonedModel = function () {};
			ClonedModel.prototype = model;
			clonedModel = new ClonedModel();
		}
		// return the clone
		return clonedModel;
	};

	useful.css = useful.css || {};
	useful.css.select = function (input, parent) {
		var a, b, elements;
		// validate the input
		parent = parent || document;
		input = (typeof input === 'string') ? {'rule' : input, 'parent' : parent} : input;
		input.parent = input.parent || document;
		input.data = input.data || {};
		// use querySelectorAll to select elements, or defer to jQuery
		elements = (typeof(document.querySelectorAll) !== 'undefined') ?
			input.parent.querySelectorAll(input.rule) :
			(typeof(jQuery) !== 'undefined') ? jQuery(input.parent).find(input.rule).get() : [];
		// if there was a handler
		if (typeof(input.handler) !== 'undefined') {
			// for each element
			for (a = 0 , b = elements.length; a < b; a += 1) {
				// run the handler and pass a unique copy of the data (in case it's a model)
				input.handler(elements[a], useful.models.clone(input.data));
			}
		// else assume the function was called for a list of elements
		} else {
			// return the selected elements
			return elements;
		}
	};

	useful.interaction = useful.interaction || {};
	useful.interaction.watch = function (element, handlers, coordinates) {
		// if touch is supported
		if (!!('ontouchstart' in window) || !!('onmsgesturechange' in window)) {
			// use touch
			useful.interaction.touch(element, handlers, coordinates);
		} else {
			// fall back on mouse
			useful.interaction.mouse(element, handlers, coordinates);
		}
	};
	useful.interaction.mouse = function (element, handlers, coordinates) {
		var wheel, start, move, end;

		// default handlers
		handlers = handlers || {};
		handlers.wheel = handlers.wheel || function () {};
		handlers.start = handlers.start || function () {};
		handlers.move = handlers.move || function () {};
		handlers.end = handlers.end || function () {};

		// default coordinates
		coordinates = coordinates || {};

		// handle the mouse wheel movement
		wheel = function (event) {
			// get the reading from the mouse wheel
			coordinates.wheel = {
				y : ((window.event) ? window.event.wheelDelta / 120 : -event.detail / 3)
			};
			// THINGS TO DO WHEN SCROLLED
			handlers.wheel(coordinates);
			// cancel the scrolling
			useful.events.cancel(event);
		};
		element.onmousewheel = wheel;
		if (navigator.userAgent.match(/firefox/gi)) { element.addEventListener('DOMMouseScroll', wheel, false); }

		// handle the start of the mouse movement
		start = function (event) {
			// get the event properties
			event = event || window.event;
			// reset the positions
			coordinates[0] = {};
			// store the start positions
			coordinates[0].start = {
				x : (event.pageX || event.x),
				y : (event.pageY || event.y)
			};
			// THINGS TO DO WHEN MOUSE DOWN
			handlers.start(coordinates);
			// cancel the click
			useful.events.cancel(event);
		};
		useful.events.add(element, 'mousedown', start);

		// handle the duration of the mouse movement
		move = function (event) {
			// get the event properties
			event = event || window.event;
			// if there is a touch in progress
			if (coordinates[0] && coordinates[0].start) {
				// store the duration positions
				coordinates[0].move = {
					x : (event.pageX || event.x),
					y : (event.pageY || event.y)
				};
				// THINGS TO DO WHEN DRAGGED
				handlers.move(coordinates);
			}
			// cancel the click
			useful.events.cancel(event);
		};
		useful.events.add(document, 'mousemove', move);

		// handle the end of the mouse movement
		end = function (event) {
			// get the event properties
			event = event || window.event;
			// store the end position
			if (coordinates[0]) {
				coordinates[0].end = {
					x : (event.pageX || event.x),
					y : (event.pageY || event.y)
				};
			}
			// THINGS TO DO WHEN MOUSE UP
			handlers.end(coordinates);
			// clear the positions
			coordinates[0] = {};
			// cancel the click
			useful.events.cancel(event);
		};
		useful.events.add(document, 'mouseup', end);
	};
	useful.interaction.touch = function (element, handlers, coordinates) {
		var start, move, end;

		// default handlers
		handlers = handlers || {};
		handlers.start = handlers.start || function () {};
		handlers.move = handlers.move || function () {};
		handlers.end = handlers.end || function () {};

		// default coordinates
		coordinates = coordinates || {};

		// handle the start of the touch
		start = function (event) {
			var a, b, interactions, id;
			// for all interactions
			interactions = event.touches || [event];
			for (a = 0 , b = interactions.length; a < b; a += 1) {
				// get a reference id for the event
				id = event.pointerId || a;
				// reset the positions
				coordinates[id] = {};
				// store the start positions
				coordinates[id].start = {
					x : interactions[a].pageX,
					y : interactions[a].pageY
				};
				// THINGS TO DO WHEN TOUCH DOWN
				handlers.start(coordinates);
			}
			// cancel the default
			//useful.events.cancel(event);
		};
		element.ontouchstart = start;
		element.onmspointerdown = start;

		// handle the duration of the touch
		move = function (event) {
			var a, b, interactions, id;
			// for all interactions
			interactions = event.touches || [event];
			for (a = 0 , b = interactions.length; a < b; a += 1) {
				// get a reference id for the event
				id = event.pointerId || a;
				// if there is a touch in progress
				if (coordinates[id] && coordinates[id].start) {
					// store the move positions
					coordinates[id].move = {
						x : interactions[a].pageX,
						y : interactions[a].pageY
					};
					// THINGS TO DO WHEN SWIPED
					handlers.move(coordinates);
				}
			}
			// cancel the default
			useful.events.cancel(event);
		};
		element.ontouchmove = move;
		element.onmspointermove = move;

		// handle the end of the touch
		end = function (event) {
			var interactions, a, b, id;
			// for all interactions
			interactions = event.touches || [event];
			for (a = 0 , b = interactions.length; a < b; a += 1) {
				// if there is a touch in progress
				if (coordinates[id] && coordinates[id].start) {
					// store the end positions
					coordinates[id].end = {
						x : interactions[a].pageX,
						y : interactions[a].pageY
					};
					// THINGS TO DO WHEN TOUCH UP
					handlers.end(coordinates);
				}
				// clear the positions afterwards
				coordinates[id] = {};
			}
			// cancel the default
			//useful.events.cancel(event);
		};
		element.ontouchend = end;
		element.onmspointerup = end;

	};
	useful.interaction.gestures = function (element, handlers, coordinates) {
		var start, move, end;

		// default handlers
		handlers = handlers || {};
		handlers.start = handlers.start || function () {};
		handlers.move = handlers.move || function () {};
		handlers.end = handlers.end || function () {};

		// default coordinates
		coordinates = coordinates || {};

		// handle the start of the gesture
		start = function (event) {
			// reset the positions
			coordinates[0] = {};
			// store the start positions
			coordinates[0].start = {
				rotation : event.rotation,
				scale : event.scale
			};
			// THINGS TO DO WHEN TOUCH DOWN
			handlers.start(coordinates);
		};
		element.ongesturestart = start;
		element.onmsgesturestart = start;

		// handle the duration of the gesture
		move = function (event) {
			// if there is a touch in progress
			if (coordinates[0] && coordinates[0].start) {
				// store the move positions
				coordinates[0].move = {
					rotation : event.rotation,
					scale : event.scale
				};
				// THINGS TO DO WHEN SWIPED
				handlers.move(coordinates);
			}
		};
		element.ongesturechange = move;
		element.onmsgesturechange = move;

		// handle the end of the gesture
		end = function (event) {
			// store the end positions
			coordinates[0].end = {
				rotation : event.rotation,
				scale : event.scale
			};
			// THINGS TO DO WHEN TOUCH UP
			handlers.end(coordinates);
			// clear the positions afterwards
			coordinates[0] = {};
		};
		element.ongestureend = end;
		element.onmsmsgestureend = end;
	};

	useful.urls = useful.urls || {};
	useful.urls.load = function (url) {
		var a, b, parts = [], data = {}, namevalue, value;
		parts = url.split('#')[0].replace('?', '&').split('&');
		for (a = 1 , b = parts.length; a < b; a += 1) {
			namevalue = parts[a].split('=');
			value = parseFloat(namevalue[1]);
			data[namevalue[0]] = (!isNaN(value)) ? value : namevalue[1];
		}
		return data;
	};
	useful.urls.save = function (url, data) {
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
	useful.urls.replace = function (url, name, value) {
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
			nameValue = useful.urls.load(url);
			nameValue[name] = value;
			return useful.urls.save(url, nameValue);
		}
	};

	useful.cropper = {};
	useful.cropper.setup = cropper.setup;

}(window.useful = window.useful || {}));
