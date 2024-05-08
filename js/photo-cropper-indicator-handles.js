export class PhotoCropperIndicatorHandles {
	constructor(parent) {
		this.parent = parent;
		this.config = parent.config;
		// create the handles
		this.config.handles = {};
		for (let name of this.config.names) {
			this.config.handles[name] = document.createElement('span');
			this.config.handles[name].className = 'cr-' + name;
			this.config.overlay.appendChild(this.config.handles[name]);
		}
	}

	left(distance) {
		var config = this.config;
		var horizontal, left, right, limit;
		// measure the movement in fractions of the dimensions
		horizontal = distance / config.width;
		// calculate the new crop fractions
		left = config.left + horizontal;
		right = config.right + horizontal;
		limit = config.right - config.minimum;
		// if all are within limits
		if (left >= 0 && left < limit) {
			// apply the movement to the crop fractions
			config.left = left;
		}
	}

	top(distance) {
		var config = this.config;
		var vertical, top, bottom, limit;
		// measure the movement in fractions of the dimensions
		vertical = distance / config.height;
		// calculate the new crop fractions
		top = config.top + vertical;
		bottom = config.bottom + vertical;
		limit = config.bottom - config.minimum;
		// if all are within limits
		if (top >= 0 && top < limit) {
			// apply the movement to the crop fractions
			config.top = top;
		}
	}

	right(distance) {
		var config = this.config;
		var horizontal, left, right, limit;
		// measure the movement in fractions of the dimensions
		horizontal = distance / config.width;
		// calculate the new crop fractions
		left = config.left + horizontal;
		right = config.right + horizontal;
		limit = config.left + config.minimum;
		// if all are within limits
		if (right <= 1 && right > limit) {
			// apply the movement to the crop fractions
			config.right = right;
		}
	}

	bottom(distance) {
		var config = this.config;
		var vertical, top, bottom, limit;
		// measure the movement in fractions of the dimensions
		vertical = distance / config.height;
		// calculate the new crop fractions
		top = config.top + vertical;
		bottom = config.bottom + vertical;
		limit = config.top + config.minimum;
		// if all are within limits
		if (bottom <= 1 && bottom > limit) {
			// apply the movement to the crop fractions
			config.bottom = bottom;
		}
	}
}
