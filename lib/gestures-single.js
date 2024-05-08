export class GesturesSingle {
	constructor(parent) {
		this.parent = parent;
		this.config = parent.config;
		this.element = parent.config.element;
		this.lastTouch = null;
		this.touchOrigin = null;
		this.touchProgression = null;
		// set the required events for mouse
		this.element.addEventListener('mousedown', this.onStartTouch.bind(this));
		this.element.addEventListener('mousemove', this.onChangeTouch.bind(this));
		document.body.addEventListener('mouseup', this.onEndTouch.bind(this));
		// set the required events for touch
		this.element.addEventListener('touchstart', this.onStartTouch.bind(this));
		this.element.addEventListener('touchmove', this.onChangeTouch.bind(this));
		document.body.addEventListener('touchend', this.onEndTouch.bind(this));
	}

	cancelTouch(evt) {
		if (this.config.cancelTouch) {
			evt.preventDefault();
		}
	}

	startTouch(evt) {
		// if the functionality wasn't paused
		if (!this.parent.paused) {
			// get the coordinates from the event
			var coords = this.parent.readEvent(evt);
			// note the start position
			this.touchOrigin = {
				'x' : coords.x,
				'y' : coords.y,
				'target' : evt.target || evt.srcElement
			};
			this.touchProgression = {
				'x' : this.touchOrigin.x,
				'y' : this.touchOrigin.y
			};
		}
	}

	changeTouch(evt) {
		// if there is an origin
		if (this.touchOrigin) {
			// get the coordinates from the event
			var coords = this.parent.readEvent(evt);
			// get the gesture parameters
			this.config.drag({
				'x' : this.touchOrigin.x,
				'y' : this.touchOrigin.y,
				'horizontal' : coords.x - this.touchProgression.x,
				'vertical' : coords.y - this.touchProgression.y,
				'event' : evt,
				'source' : this.touchOrigin.target
			});
			// update the current position
			this.touchProgression = {
				'x' : coords.x,
				'y' : coords.y
			};
		}
	}

	endTouch(evt) {
		// if the numbers are valid
		if (this.touchOrigin && this.touchProgression) {
			// calculate the motion
			var distance = {
				'x' : this.touchProgression.x - this.touchOrigin.x,
				'y' : this.touchProgression.y - this.touchOrigin.y
			};
			// if there was very little movement, but this is the second touch in quick successionif (
			if (
				this.lastTouch &&
				Math.abs(this.touchOrigin.x - this.lastTouch.x) < 10 &&
				Math.abs(this.touchOrigin.y - this.lastTouch.y) < 10 &&
				new Date().getTime() - this.lastTouch.time < 500 &&
				new Date().getTime() - this.lastTouch.time > 100
			) {
				// treat this as a double tap
				this.config.doubleTap({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'event' : evt, 'source' : this.touchOrigin.target});
			// if the horizontal motion was the largest
			} else if (Math.abs(distance.x) > Math.abs(distance.y)) {
				// if there was a right swipe
				if (distance.x > this.config.threshold) {
					// report the associated swipe
					this.config.swipeRight({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : distance.x, 'event' : evt, 'source' : this.touchOrigin.target});
				// else if there was a left swipe
				} else if (distance.x < -this.config.threshold) {
					// report the associated swipe
					this.config.swipeLeft({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : -distance.x, 'event' : evt, 'source' : this.touchOrigin.target});
				}
			// else
			} else {
				// if there was a down swipe
				if (distance.y > this.config.threshold) {
					// report the associated swipe
					this.config.swipeDown({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : distance.y, 'event' : evt, 'source' : this.touchOrigin.target});
				// else if there was an up swipe
				} else if (distance.y < -this.config.threshold) {
					// report the associated swipe
					this.config.swipeUp({'x' : this.touchOrigin.x, 'y' : this.touchOrigin.y, 'distance' : -distance.y, 'event' : evt, 'source' : this.touchOrigin.target});
				}
			}
			// store the history of this touch
			this.lastTouch = {
				'x' : this.touchOrigin.x,
				'y' : this.touchOrigin.y,
				'time' : new Date().getTime()
			};
		}
		// clear the input
		this.touchProgression = null;
		this.touchOrigin = null;
	}

	onStartTouch(evt) {
		// handle the event
		this.startTouch(evt);
		this.changeTouch(evt);
	}

	onChangeTouch(evt) {
		// optionally cancel the default behaviour
		this.cancelTouch(evt);
		// handle the event
		this.changeTouch(evt);
	}

	onEndTouch(evt) {
		// handle the event
		this.endTouch(evt);
	}
}
