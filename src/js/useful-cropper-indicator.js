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
	useful.Cropper_Indicator = function (parent) {
		// properties
		this.parent = parent;
		// components
		this.handles = new useful.Cropper_Indicator_Handles(this.parent);
		// methods
		this.build = function () {
			var cfg = this.parent.cfg;
			// create the indicator
			cfg.overlay = document.createElement('span');
			cfg.overlay.className = 'cr-overlay';
			cfg.overlay.style.background = 'url(' + cfg.image.src + ')';
			// create the handles
			this.handles.build();
			// add the indicator to the parent
			this.parent.obj.appendChild(cfg.overlay);
			// add the interaction
			var context = this;
			var gestures = new useful.Gestures(cfg.overlay.parentNode, {
				'threshold' : 50,
				'increment' : 0.1,
				'cancelTouch' : true,
				'cancelGesture' : true,
				'drag' : function (metrics) {
					// move the handles
					switch (metrics.source.className) {
						case 'cr-tl' :
							context.handles.left(metrics.horizontal);
							context.handles.top(metrics.vertical);
							context.parent.update(null, true, 'tl');
							break;
						case 'cr-tc' :
							context.handles.top(metrics.vertical);
							context.parent.update(null, true, 'tc');
							break;
						case 'cr-tr' :
							context.handles.right(metrics.horizontal);
							context.handles.top(metrics.vertical);
							context.parent.update(null, true, 'tr');
							break;
						case 'cr-ml' :
							context.handles.left(metrics.horizontal);
							context.parent.update(null, true, 'ml');
							break;
						case 'cr-mr' :
							context.handles.right(metrics.horizontal);
							context.parent.update(null, true, 'mr');
							break;
						case 'cr-bl' :
							context.handles.left(metrics.horizontal);
							context.handles.bottom(metrics.vertical);
							context.parent.update(null, true, 'bl');
							break;
						case 'cr-bc' :
							context.handles.bottom(metrics.vertical);
							context.parent.update(null, true, 'bc');
							break;
						case 'cr-br' :
							context.handles.right(metrics.horizontal);
							context.handles.bottom(metrics.vertical);
							context.parent.update(null, true, 'br');
							break;
						default :
							context.move(metrics.horizontal, metrics.vertical);
							context.parent.update(null, true, null);
					}
				}
			});
		};
		this.update = function () {
			var cfg = this.parent.cfg;
			var left, top, right, bottom;
			// get the dimensions of the component
			cfg.width = cfg.image.offsetWidth;
			cfg.height = cfg.image.offsetHeight;
			// convert the crop fractions into pixel values
			left = cfg.left * cfg.width;
			top = cfg.top * cfg.height;
			right = cfg.width - cfg.right * cfg.width;
			bottom = cfg.height - cfg.bottom * cfg.height;
			// reposition the indicator
			cfg.overlay.style.left = left + 'px';
			cfg.overlay.style.top = top + 'px';
			cfg.overlay.style.right = right + 'px';
			cfg.overlay.style.bottom = bottom + 'px';
			// reposition the background image
			cfg.overlay.style.backgroundPosition = '-' + left + 'px -' + top + 'px';
		};
		this.move = function (x, y) {
			var cfg = this.parent.cfg;
			var horizontal, vertical, left, top, right, bottom;
			// measure the movement in fractions of the dimensions
			horizontal = x / cfg.width;
			vertical = y / cfg.height;
			// calculate the new crop fractions
			left = cfg.left + horizontal;
			top = cfg.top + vertical;
			right = cfg.right + horizontal;
			bottom = cfg.bottom + vertical;
			// if all are within limits
			if (left >= 0 && top >= 0 && right <= 1 && bottom <= 1 && left < right && top < bottom) {
				// apply the movement to the crop fractions
				cfg.left = left;
				cfg.top = top;
				cfg.right = right;
				cfg.bottom = bottom;
			}
		};
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Cropper_Indicator;
	}

})();
