/*
	Source:
	van Creij, Maurice (2018). "urls.js: A library of useful functions to ease working with URL query parameters.", http://www.woollymittens.nl/.

	License:
	This work is licensed under a Creative Commons Attribution 3.0 Unported License.
*/

var urls = {

	// retrieves the query parameters from an url
	load: function (url) {
		var a, b, parts = [], data = {}, namevalue, value;
		parts = url.split('#')[0].replace('?', '&').split('&');
		for (a = 1, b = parts.length; a < b; a += 1) {
			namevalue = parts[a].split('=');
			value = parseFloat(namevalue[1]);
			data[namevalue[0]] = (!isNaN(value)) ? value : namevalue[1];
		}
		return data;
	},

	// stores query parameters to an url
	save: function (url, data) {
		var name;
		// clean the url
		url = url.split('?')[0].split('#')[0];
		// for all name value pairs
		for (name in data) {
			if (data.hasOwnProperty(name)) {
				// add them to the url
				url += '&' + name + '=' + data[name];
			}
		}
		// make sure the first value starts with a ?
		return url.replace('&', '?');
	},

	// replace a value in a query parameter
	replace: function (url, name, value) {
		var old, match, nameValue;
		// if the value is present in the url
		match = new RegExp(name + '=', 'gi');
		if (match.test(url)) {
			// isolate the old value
			old  = url.split('#')[0].split(name + '=')[1].split('&')[0];
			// insert the new value
			return url.replace(name + '=' + old, name + '=' + value);
		} else {
			// add the value instead of replacing it
			nameValue = this.load(url);
			nameValue[name] = value;
			return this.save(url, nameValue);
		}
	},

	// source - http://phpjs.org/functions/base64_encode/
	// http://kevin.vanzonneveld.net
	// +  original by: Tyler Akins (http://rumkin.com)
	// +  improved by: Bayron Guevara
	// +  improved by: Thunder.m
	// +  improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +  bugfixed by: Pellentesque Malesuada
	// +  improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +  improved by: Rafał Kukawski (http://kukawski.pl)
	// *   example 1: base64_encode('Kevin van Zonneveld');
	// *   returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
	encode: function (data) {
		var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
			ac = 0,
			enc = "",
			tmpArr = [];
		if (!data) {
			return data;
		}
		do { // pack three octets into four hexets
			o1 = data.charCodeAt(i++);
			o2 = data.charCodeAt(i++);
			o3 = data.charCodeAt(i++);
			bits = o1 << 16 | o2 << 8 | o3;
			h1 = bits >> 18 & 0x3f;
			h2 = bits >> 12 & 0x3f;
			h3 = bits >> 6 & 0x3f;
			h4 = bits & 0x3f;
			// use hexets to index into b64, and append result to encoded string
			tmpArr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
		} while (i < data.length);
		enc = tmpArr.join('');
		var r = data.length % 3;
		return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
	},

	// source - http://phpjs.org/functions/base64_decode/
	// http://kevin.vanzonneveld.net
	// +  original by: Tyler Akins (http://rumkin.com)
	// +  improved by: Thunder.m
	// +   input by: Aman Gupta
	// +  improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +  bugfixed by: Onno Marsman
	// +  bugfixed by: Pellentesque Malesuada
	// +  improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// +   input by: Brett Zamir (http://brett-zamir.me)
	// +  bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	// *   example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
	// *   returns 1: 'Kevin van Zonneveld'
	decode: function (data) {
		var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
			ac = 0,
			dec = "",
			tmpArr = [];
		if (!data) {
			return data;
		}
		data += '';
		do { // unpack four hexets into three octets using index points in b64
			h1 = b64.indexOf(data.charAt(i++));
			h2 = b64.indexOf(data.charAt(i++));
			h3 = b64.indexOf(data.charAt(i++));
			h4 = b64.indexOf(data.charAt(i++));
			bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
			o1 = bits >> 16 & 0xff;
			o2 = bits >> 8 & 0xff;
			o3 = bits & 0xff;
			if (h3 == 64) {
				tmpArr[ac++] = String.fromCharCode(o1);
			} else if (h4 == 64) {
				tmpArr[ac++] = String.fromCharCode(o1, o2);
			} else {
				tmpArr[ac++] = String.fromCharCode(o1, o2, o3);
			}
		} while (i < data.length);
		dec = tmpArr.join('');
		return dec;
	}

};

// return as a require.js module
if (typeof module !== 'undefined') {
	exports = module.exports = urls;
}
