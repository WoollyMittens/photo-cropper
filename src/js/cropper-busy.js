// extend the class
Cropper.prototype.Busy = function (parent) {

	// PROPERTIES

	this.parent = parent;
	this.config = parent.config;

	// METHODS

	this.init = function () {
		var config = this.config;
		// add a busy message
		this.spinner = document.createElement('span');
		this.spinner.className = 'cr-busy';
		this.spinner.innerHTML = 'Please wait...';
		this.spinner.style.visibility = 'hidden';
		config.element.appendChild(this.spinner);
		// return the object
		return this;
	};

	this.show = function () {
		// show the busy message
		this.spinner.style.visibility = 'visible';
	};

	this.hide = function () {
		// show the busy message
		this.spinner.style.visibility = 'hidden';
	};

	this.init();
	
};
