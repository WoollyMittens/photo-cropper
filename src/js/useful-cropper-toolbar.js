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
