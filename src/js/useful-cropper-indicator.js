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
useful.Cropper.prototype.Indicator = function (parent) {

	// PROPERTIES
	
	"use strict";
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
		this.handles = new this.context.Handles(this).init();
		// add the indicator to the parent
		config.element.appendChild(config.overlay);
		// add the interaction
		var _this = this;
		var gestures = new useful.Gestures().init({
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
};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = useful.Cropper.Indicator;
}
