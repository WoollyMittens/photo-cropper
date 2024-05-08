export class PhotoCropperBusy {
	constructor(parent) {
		this.config = parent.config;
		// add the spinner element
		this.spinner = document.createElement('span');
		this.spinner.className = 'cr-busy';
		this.spinner.innerHTML = 'Please wait...';
		this.spinner.style.visibility = 'hidden';
		this.config.element.appendChild(this.spinner);
	}

	show() {
		// show the busy message
		this.spinner.style.visibility = 'visible';
	}

	hide() {
		// show the busy message
		this.spinner.style.visibility = 'hidden';
	}
}
