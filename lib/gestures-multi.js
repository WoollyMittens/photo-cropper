export class GesturesMulti {
	constructor(parent) {
		// store the properties
		this.parent = parent;
		this.config = parent.config;
		this.element = parent.config.element;
		this.gestureOrigin = null;
		this.gestureProgression = null;
		// set the required events for mouse
		this.element.addEventListener('mousewheel', this.onChangeWheel.bind(this));
		if (navigator.userAgent.match(/firefox/gi)) { this.element.addEventListener('DOMMouseScroll', this.onChangeWheel.bind(this)); }
		// set the required events for gestures
		if ('ongesturestart' in window) {
			this.element.addEventListener('gesturestart', this.onStartGesture.bind(this));
			this.element.addEventListener('gesturechange', this.onChangeGesture.bind(this));
			this.element.addEventListener('gestureend', this.onEndGesture.bind(this));
		} else if ('msgesturestart' in window) {
			this.element.addEventListener('msgesturestart', this.onStartGesture.bind(this));
			this.element.addEventListener('msgesturechange', this.onChangeGesture.bind(this));
			this.element.addEventListener('msgestureend', this.onEndGesture.bind(this));
		} else {
			this.element.addEventListener('touchstart', this.onStartFallback.bind(this));
			this.element.addEventListener('touchmove', this.onChangeFallback.bind(this));
			this.element.addEventListener('touchend', this.onEndFallback.bind(this));
		}
	}

	cancelGesture(evt) {
		if (evt && this.config.cancelGesture) {
			evt.preventDefault();
		}
	}

	startGesture(evt) {
		// if the functionality wasn't paused
		if (!this.parent.paused) {
			// note the start position
			this.gestureOrigin = {
				'scale' : evt.scale,
				'rotation' : evt.rotation,
				'target' : evt.target || evt.srcElement
			};
			this.gestureProgression = {
				'scale' : this.gestureOrigin.scale,
				'rotation' : this.gestureOrigin.rotation
			};
		}
	}

	changeGesture(evt) {
		// if there is an origin
		if (this.gestureOrigin) {
			// get the distances from the event
			var scale = evt.scale,
				rotation = evt.rotation;
			// get the coordinates from the event
			var coords = this.parent.readEvent(evt);
			// get the gesture parameters
			this.config.pinch({
				'x' : coords.x,
				'y' : coords.y,
				'scale' : scale - this.gestureProgression.scale,
				'event' : evt,
				'target' : this.gestureOrigin.target
			});
			this.config.twist({
				'x' : coords.x,
				'y' : coords.y,
				'rotation' : rotation - this.gestureProgression.rotation,
				'event' : evt,
				'target' : this.gestureOrigin.target
			});
			// update the current position
			this.gestureProgression = {
				'scale' : evt.scale,
				'rotation' : evt.rotation
			};
		}
	}

	endGesture() {
		// note the start position
		this.gestureOrigin = null;
	}

	startFallback(evt) {
		// if the functionality wasn't paused
		if (!this.parent.paused && evt.touches.length === 2) {
			// note the start position
			this.gestureOrigin = {
				'touches' : [
					{ 'pageX' : evt.touches[0].pageX, 'pageY' : evt.touches[0].pageY },
					{ 'pageX' : evt.touches[1].pageX, 'pageY' : evt.touches[1].pageY }
				],
				'target' : evt.target || evt.srcElement
			};
			this.gestureProgression = {
				'touches' : this.gestureOrigin.touches
			};
		}
	}

	changeFallback(evt) {
		// if there is an origin
		if (this.gestureOrigin && evt.touches.length === 2) {
			// get the coordinates from the event
			var coords = this.parent.readEvent(evt);
			// calculate the scale factor
			var scale = 0, progression = this.gestureProgression;
			scale += (evt.touches[0].pageX - evt.touches[1].pageX) / (progression.touches[0].pageX - progression.touches[1].pageX);
			scale += (evt.touches[0].pageY - evt.touches[1].pageY) / (progression.touches[0].pageY - progression.touches[1].pageY);
			scale = scale - 2;
			// get the gesture parameters
			this.config.pinch({
				'x' : coords.x,
				'y' : coords.y,
				'scale' : scale,
				'event' : evt,
				'target' : this.gestureOrigin.target
			});
			// update the current position
			this.gestureProgression = {
				'touches' : [
					{ 'pageX' : evt.touches[0].pageX, 'pageY' : evt.touches[0].pageY },
					{ 'pageX' : evt.touches[1].pageX, 'pageY' : evt.touches[1].pageY }
				]
			};
		}
	}

	endFallback() {
		// note the start position
		this.gestureOrigin = null;
	}

	changeWheel(evt) {
		// measure the wheel distance
		var scale = 1, distance = (evt.wheelDelta) ? evt.wheelDelta / 120 : -evt.detail / 3;
		// get the coordinates from the event
		var coords = this.parent.readEvent(evt);
		// equate wheeling up / down to zooming in / out
		scale = (distance > 0) ? +this.config.increment : scale = -this.config.increment;
		// report the zoom
		this.config.pinch({
			'x' : coords.x,
			'y' : coords.y,
			'scale' : scale,
			'event' : evt,
			'source' : evt.target || evt.srcElement
		});
	}

	onStartGesture(evt) {
		// optionally cancel the default behaviour
		this.cancelGesture(evt);
		// handle the event
		this.startGesture(evt);
		this.changeGesture(evt);
	}

	onChangeGesture(evt) {
		// optionally cancel the default behaviour
		this.cancelGesture(evt);
		// handle the event
		this.changeGesture(evt);
	}

	onEndGesture(evt) {
		// handle the event
		this.endGesture(evt);
	}

	onStartFallback(evt) {
		// handle the event
		this.startFallback(evt);
		this.changeFallback(evt);
	}

	onChangeFallback(evt) {
		// optionally cancel the default behaviour
		this.cancelGesture(evt);
		// handle the event
		this.changeFallback(evt);
	}

	onEndFallback(evt) {
		// handle the event
		this.endGesture(evt);
	}

	onChangeWheel(evt) {
		// optionally cancel the default behaviour
		this.cancelGesture(evt);
		// handle the event
		this.changeWheel(evt);
	}
}
