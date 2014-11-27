/*
	Source:
	van Creij, Maurice (2014). "useful.cropper.js: A simple image cropper", version 20141127, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// create the constructor if needed
var useful = useful || {};
useful.Cropper = useful.Cropper || function () {};

// extend the constructor
useful.Cropper.prototype.init = function (cfg) {
	// properties
	"use strict";
	this.cfg = cfg;
	this.cfg.names = ['tl', 'tc', 'tr', 'ml', 'mr', 'bl', 'bc', 'br'];
	this.cfg.image = cfg.element.getElementsByTagName('img')[0];
	this.cfg.output = cfg.element.getElementsByTagName('input');
	this.cfg.values = null;
	this.cfg.onchange = cfg.onchange || function () {};
	this.cfg.delay = cfg.delay || 1000;
	this.cfg.timeout = null;
	this.cfg.realtime = cfg.realtime || false;
	this.cfg.minimum = cfg.minimum || 0.2;
	this.cfg.crop = cfg.crop || [0.1, 0.1, 0.9, 0.9];
	this.cfg.url = cfg.image.src;
	this.cfg.offset = cfg.offset || 4;
	this.cfg.reset = [cfg.left, cfg.top, cfg.right, cfg.bottom];
	// components
	this.busy = new this.Busy(this);
	this.indicator = new this.Indicator(this);
	this.toolbar = new this.Toolbar(this);
	// methods
	this.watch = function () {
		var cfg = this.cfg;
		// if the image has loaded
		if (cfg.image.offsetWidth > 0 && cfg.image.offsetHeight > 0) {
			// update the indicator
			this.update();
			this.preset();
		// else
		} else {
			// wait for the image to load
			var context = this;
			cfg.image.onload = function () {
				// update the indicator
				context.update();
				context.preset();
			};
		}
	};
	this.preset = function () {
		var query, width, height, aspect, cfg = this.cfg;
		// if there's anything to measure yet
		if (cfg.image.offsetWidth) {
			// retrieve the crop coordinates from the url
			query = useful.urls.load(cfg.url);
			// if we started out with a cropped image
			if (query.left > 0 || query.top > 0 || query.right < 1 || query.bottom < 1) {
				// validate the input
				query.left = query.left || 0;
				query.top = query.top || 0;
				query.right = query.right || 1;
				query.bottom = query.bottom || 1;
				// store the cropping dimensions
				cfg.left = query.left;
				cfg.top = query.top;
				cfg.right = query.right;
				cfg.bottom = query.bottom;
				// guess what the original dimensions could have been
				width = cfg.image.offsetWidth / (cfg.right - cfg.left);
				height = cfg.image.offsetHeight / (cfg.bottom - cfg.top);
				aspect = height / width;
				// scale to the available space
				width = cfg.element.offsetWidth;
				height = Math.round(width * aspect);
				// limit the image's size to the original parent
				cfg.image.style.maxWidth = width + 'px';
				cfg.image.style.maxHeight = height + 'px';
				// guess what the reset url of the uncropped image might have been
				cfg.url = useful.urls.replace(cfg.url, 'width', width);
				cfg.url = useful.urls.replace(cfg.url, 'height', height);
				cfg.url = useful.urls.replace(cfg.url, 'left', 0);
				cfg.url = useful.urls.replace(cfg.url, 'top', 0);
				cfg.url = useful.urls.replace(cfg.url, 'right', 1);
				cfg.url = useful.urls.replace(cfg.url, 'bottom', 1);
				// restore the container's original size
				cfg.element.style.width = width + 'px';
				cfg.element.style.height = height + 'px';
				// if continuous updates are on
				if (cfg.realtime) {
					// load the original image
					var context = this;
					cfg.image.onload = function () { context.update(); };
					cfg.image.src = cfg.url;
					cfg.overlay.style.background = 'url(' + cfg.url + ')';
				} else {
					// set the image to center
					cfg.image.style.marginTop = Math.round((cfg.element.offsetHeight - cfg.image.offsetHeight - cfg.offset) / 2) + 'px';
					// disable the indicator
					cfg.applyButton.disabled = true;
					cfg.element.className = cfg.element.className.replace(' cr-disabled', '') + ' cr-disabled';
				}
			}
		}
	};
	this.correct = function (handle) {
		var cfg = this.cfg;
		// determine the dominant motion
		var dLeft = Math.abs(cfg.values.left - cfg.left),
			dTop = Math.abs(cfg.values.top - cfg.top),
			dRight = Math.abs(cfg.values.right - cfg.right),
			dBottom = Math.abs(cfg.values.bottom - cfg.bottom),
			aspect = cfg.aspect;
		// implement the aspect ratio from the required corner
		switch (handle) {
			case 'tl' :
				if (dLeft > dTop) { cfg.top = cfg.bottom - (cfg.right - cfg.left) * aspect; }
				else { cfg.left = cfg.right - (cfg.bottom - cfg.top) / aspect; }
				break;
			case 'tc' :
				cfg.right = cfg.left + (cfg.bottom - cfg.top) / aspect;
				break;
			case 'tr' :
				if (dRight > dTop) { cfg.top = cfg.bottom - (cfg.right - cfg.left) * aspect; }
				else { cfg.right = cfg.left + (cfg.bottom - cfg.top) / aspect;  }
				break;
			case 'ml' :
				cfg.bottom = cfg.top + (cfg.right - cfg.left) * aspect;
				break;
			case 'mr' :
				cfg.bottom = cfg.top + (cfg.right - cfg.left) * aspect;
				break;
			case 'bl' :
				if (dLeft > dBottom) { cfg.bottom = cfg.top + (cfg.right - cfg.left) * aspect; }
				else { cfg.left = cfg.right - (cfg.bottom - cfg.top) / aspect; }
				break;
			case 'bc' :
				cfg.right = cfg.left + (cfg.bottom - cfg.top) / aspect;
				break;
			case 'br' :
				if (dRight > dBottom) { cfg.bottom = cfg.top + (cfg.right - cfg.left) * aspect; }
				else { cfg.right = cfg.left + (cfg.bottom - cfg.top) / aspect; }
				break;
		}
	};
	this.update = function (values, changed, handle) {
		var cfg = this.cfg;
		changed = (changed === true);
		// process any override values
		if (values && values.left) { cfg.left = values.left; }
		if (values && values.top) { cfg.top = values.top; }
		if (values && values.right) { cfg.right = values.right; }
		if (values && values.bottom) { cfg.bottom = values.bottom; }
		// correct the values for aspect ratio
		if (cfg.aspect && cfg.values && handle) { this.correct(handle); }
		// refresh the hidden fields
		cfg.output[0].value = cfg.left;
		cfg.output[1].value = cfg.top;
		cfg.output[2].value = cfg.right;
		cfg.output[3].value = cfg.bottom;
		// refresh the json object of values
		cfg.values = {
			'left' : cfg.left,
			'top' : cfg.top,
			'right' : cfg.right,
			'bottom' : cfg.bottom
		};
		// redraw the indicator
		this.indicator.update(this);
		// update the onchange event periodically
		if (changed && cfg.realtime) {
			clearTimeout(cfg.timeout);
			var context = this;
			cfg.timeout = setTimeout(function () {
				context.cfg.onchange(context.cfg.values);
			}, cfg.delay);
		}
	};
	// startup
	this.watch();
	this.init = function () {};
	return this;
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Cropper;
}
