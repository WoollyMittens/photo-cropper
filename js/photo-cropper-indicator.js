import { Gestures } from '../lib/gestures.js';
import { PhotoCropperIndicatorHandles } from './photo-cropper-indicator-handles.js';

export class PhotoCropperIndicator {
	constructor(parent) {
		this.parent = parent;
		this.config = parent.config;
		this.context = parent.context;
		// create the indicator
		this.config.overlay = document.createElement('span');
		this.config.overlay.className = 'cr-overlay';
		this.config.overlay.style.background = 'url(' + this.config.image.src + ')';
		// create the handles
		this.handles = new PhotoCropperIndicatorHandles(this);
		// add the indicator to the parent
		this.config.element.appendChild(this.config.overlay);
		// add the interaction
		this.gestures = new Gestures({
			'element': this.config.overlay.parentNode,
			'threshold': 50,
			'increment': 0.1,
			'cancelTouch': true,
			'cancelGesture': true,
			'drag': this.handler.bind(this)
		});
	}

	handler(metrics) {
		// move the handles
		switch (metrics.source.className) {
			case 'cr-tl' :
				this.handles.left(metrics.horizontal);
				this.handles.top(metrics.vertical);
				this.parent.update(null, true, 'tl');
				break;
			case 'cr-tc' :
				this.handles.top(metrics.vertical);
				this.parent.update(null, true, 'tc');
				break;
			case 'cr-tr' :
				this.handles.right(metrics.horizontal);
				this.handles.top(metrics.vertical);
				this.parent.update(null, true, 'tr');
				break;
			case 'cr-ml' :
				this.handles.left(metrics.horizontal);
				this.parent.update(null, true, 'ml');
				break;
			case 'cr-mr' :
				this.handles.right(metrics.horizontal);
				this.parent.update(null, true, 'mr');
				break;
			case 'cr-bl' :
				this.handles.left(metrics.horizontal);
				this.handles.bottom(metrics.vertical);
				this.parent.update(null, true, 'bl');
				break;
			case 'cr-bc' :
				this.handles.bottom(metrics.vertical);
				this.parent.update(null, true, 'bc');
				break;
			case 'cr-br' :
				this.handles.right(metrics.horizontal);
				this.handles.bottom(metrics.vertical);
				this.parent.update(null, true, 'br');
				break;
			default :
				this.move(metrics.horizontal, metrics.vertical);
				this.parent.update(null, true, null);
		}
	}

	update() {
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
	}

	move(x, y) {
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
	}
}
