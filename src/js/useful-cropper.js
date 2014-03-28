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
			// disable the start function so it can't be started twice
			this.start = function () {};
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
		// go
		this.start();
	};

}(window.useful = window.useful || {}));
