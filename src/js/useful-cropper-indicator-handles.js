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
useful.Cropper.prototype.Handles = function (parent) {
	// properties
	"use strict";
	this.parent = parent;
	this.root = parent.parent;
	// methods
	this.build = function () {
		var cfg = this.root.cfg;
		var a, b, name;
		// create the handles
		cfg.handles = {};
		for (a = 0, b = cfg.names.length; a < b; a += 1) {
			name = cfg.names[a];
			cfg.handles[name] = document.createElement('span');
			cfg.handles[name].className = 'cr-' + name;
			cfg.overlay.appendChild(cfg.handles[name]);
		}
	};
	this.left = function (distance) {
		var cfg = this.root.cfg;
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
		var cfg = this.root.cfg;
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
		var cfg = this.root.cfg;
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
		var cfg = this.root.cfg;
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
	// build the handles
	this.build();
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Cropper.Indicator.Handles;
}
