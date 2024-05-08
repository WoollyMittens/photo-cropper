import { Urls } from '../lib/urls.js';

export class PhotoCropperToolbar {
	constructor(parent) {
		this.parent = parent;
		this.config = parent.config;
		this.ui = {};
		this.urls = new Urls();
		// build the toolbar
		if (!this.config.realtime) { this.build(); }
	}

	build() {
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
		config.applyButton.onclick = this.apply.bind(this);
		// create the reset button
		config.resetButton = document.createElement('button');
		config.resetButton.setAttribute('type', 'button');
		config.resetButton.className = 'cr-reset button';
		config.resetButton.innerHTML = 'Reset';
		config.toolbar.appendChild(config.resetButton);
		config.resetButton.onclick = this.reset.bind(this);
		// add the toolbar
		config.element.appendChild(config.toolbar);
	}

	apply() {
		var config = this.config;
		// if the apply button is enabled
		if (!config.applyButton.disabled) {
			var src, width, height, aspect;
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
			config.image.onload = this.onReveal.bind(this);
			// round the numbers
			width = Math.round(width);
			height = Math.round(height);
			// replace the image with a cropped version
			src = config.image.src;
			src = this.urls.replace(src, 'width', width);
			src = this.urls.replace(src, 'height', height);
			src = this.urls.replace(src, 'left', config.left);
			src = this.urls.replace(src, 'top', config.top);
			src = this.urls.replace(src, 'right', config.right);
			src = this.urls.replace(src, 'bottom', config.bottom);
			src = this.urls.replace(src, 'time', new Date().getTime());
			config.image.src = src;
			// disable the indicator
			config.applyButton.disabled = true;
			config.element.className = config.element.className.replace(' cr-disabled', '') + ' cr-disabled';
			// trigger any external onchange event
			config.onchange(config.values);
		}
		// cancel the click
		return false;
	}

	reset() {
		var config = this.config;
		// show busy message
		this.parent.busy.show();
		// upon loading
		config.image.onload = this.onRevert.bind(this);
		// replace the image with an uncropped version
		config.url = this.urls.replace(config.url, 'name', new Date().getTime());
		config.image.src =  config.url;
		config.overlay.style.backgroundImage = 'url(' + config.url + ')';
		// trigger any external onchange event
		config.onchange(config.values);
		// cancel the click
		return false;
	}

	onReveal() {
		var config = this.config;
		// set the image to center
		config.image.style.marginTop = Math.round((config.element.offsetHeight - config.image.offsetHeight - config.offset) / 2) + 'px';
		// hide the busy message
		this.parent.busy.hide();
	}

	onRevert() {
		var config = this.config;
		// undo the margin
		config.image.style.marginTop = 0;
		// undo the values
		config.left = config.reset[0];
		config.top = config.reset[1];
		config.right = config.reset[2];
		config.bottom = config.reset[3];
		// reset the indicator
		this.parent.update();
		// enable the indicator
		config.applyButton.disabled = false;
		config.element.className = config.element.className.replace(' cr-disabled', '');
		// hide the busy message
		this.parent.busy.hide();
	}
}
