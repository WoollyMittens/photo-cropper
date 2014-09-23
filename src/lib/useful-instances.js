/*
	Source:
	van Creij, Maurice (2012). "useful.instances.js: A library of useful functions to ease working with instances of constructors.", version 20121126, http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

// public object
var useful = useful || {};

(function(){

	// Invoke strict mode
	"use strict";

	// public functions
	useful.Instances = function (objs, constructor, cfg) {
		// properties
		this.objs = objs;
		this.constructor = constructor;
		this.cfg = cfg;
		this.constructs = [];
		// starts and stores an instance of the constructor for every element
		this.start = function () {
			for (var a = 0, b = this.objs.length; a < b; a += 1) {
				// store a constructed instance with cloned cfg object
				this.constructs[a] = new this.constructor(this.objs[a], Object.create(this.cfg));
			}
			// disable the start function so it can't be started twice
			this.start = function () {};
			// empty the timeout
			return null;
		};
		// returns the constructs
		this.getAll = function () {
			return this.constructs;
		};
		// returns the object that goes with the element
		this.getByObject = function (element) {
			return this.constructs[this.constructs.indexOf(element)];
		};
		// returns the object that goes with the index
		this.getByIndex = function (index) {
			return this.constructs[index];
		};
		this.start();
	};

	// return as a require.js module
	if (typeof module !== 'undefined') {
		exports = module.exports = useful.Instances;
	}

})();
