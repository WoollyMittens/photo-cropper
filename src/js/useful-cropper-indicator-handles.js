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
