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
