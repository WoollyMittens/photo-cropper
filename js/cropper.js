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
if (typeof define != 'undefined') define([], function () { return Cropper });
if (typeof module != 'undefined') module.exports = Cropper;

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
