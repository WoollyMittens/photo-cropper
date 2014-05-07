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
			this.cfg.values = {};
			// validate presets
			this.cfg.onchange = this.cfg.onchange || function () {};
			this.cfg.delay = this.cfg.delay || 1000;
			this.cfg.timeout = null;
			this.cfg.realtime = this.cfg.realtime || false;
			this.cfg.minimum = this.cfg.minimum || 0.2;
			this.cfg.crop = this.cfg.crop || [0.1, 0.1, 0.9, 0.9];
			this.cfg.url = this.cfg.image.src;
			this.cfg.offset = this.cfg.offset || 4;
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
		this.update = function (values, changed) {
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

}(window.useful = window.useful || {}));
