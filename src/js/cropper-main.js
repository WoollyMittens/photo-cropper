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
