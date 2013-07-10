# useful.cropper.js: A simple image cropper

A visual touch interface for generating cropping coordinates.

Try the <a href="http://www.woollymittens.nl/useful/default.php?url=cropper">cropper demo</a>.

## How to use the script

The stylesheet is best included in the header of the document.

```html
<link rel="stylesheet" href="./css/cropper.css"/>
```

This include can be added to the header or placed inline before the script is invoked.

```html
<script src="./js/useful.cropper.js"></script>
```

To enable the use of HTML5 tags in Internet Explorer 8 and lower, include *html5.js*. To provide an alternative for *document.querySelectorAll* in Internet Explorer 8 and lower, include *jQuery*.

```html
<!--[if lte IE 9]>
	<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
<![endif]-->
```

### Using vanilla JavaScript

This is the safest way of starting the script, but allows for only one target element at a time.

```javascript
var parent = documentGetElementById('id');
useful.cropper.setup(parent, {
	'left' : 0.1,
	'top' : 0.1,
	'right' : 0.9,
	'bottom' : 0.9,
	'minimum' : 0.2,
	'onchange' : function(){},
	'delay' : 1000,
	'offset' : 2,
	'slice' : './php/imageslice.php?src=../{src}&width={width}&height={height}&left={left}&top={top}&right={right}&bottom={bottom}'
});
```

**id : {string}** - The ID attribute of an element somewhere in the document.

**parent : {DOM node}** - The DOM element around which the functionality is centred.

**crop : {array}** - An array of default cropping coordinates as fractions from the left, top, right and bottom of the image.

**left : {float}** - At what fraction from the left to crop the image. i.e. 0 is the extreme left side.

**top : {float}** - At what fraction from the top to crop the image. i.e. 0 is the extreme top side.

**right : {float}** - At what fraction from the right to crop the image. i.e. 1 is the extreme bottom side.

**bottom : {float}** - At what fraction from the bottom to crop the image. i.e. 1 is the extreme right side.

**minimum : {float}** - The smallest fraction of the image that is able to be cropped. This value should be large enough to avoid overlapping guides.

**onchange : {function}** - An external function to call after every change to the cropping area.

**delay : {integer}** - The time in miliseconds to wait before triggering the onchange function. This limits the rate at which the function is called.

**offset : {integer}** - A fudge factor in pixels to compensate for slight alignment differences, usually caused by borders and paddings.

**'slice' : {string}** - A webservice for resizing images. An example is provided as *./php/imageslice.php*.

### Using document.querySelectorAll

This method allows CSS Rules to be used to apply the script to one or more nodes at the same time.

```javascript
useful.css.select({
	rule : 'figure.cropper',
	handler : useful.cropper.setup,
	data : {
		'left' : 0.1,
		'top' : 0.1,
		'right' : 0.9,
		'bottom' : 0.9,
		'minimum' : 0.2,
		'onchange' : function(){},
		'delay' : 1000,
		'offset' : 2,
		'slice' : './php/imageslice.php?src=../{src}&width={width}&height={height}&left={left}&top={top}&right={right}&bottom={bottom}'
	}
});
```

**rule : {string}** - The CSS Rule for the intended target(s) of the script.

**handler : {function}** - The public function that starts the script.

**data : {object}** - Name-value pairs with configuration data.

### Using jQuery

This method is similar to the previous one, but uses jQuery for processing the CSS rule.

```javascript
$('figure.cropper').each(function (index, element) {
	useful.cropper.setup(element, {
		'left' : 0.1,
		'top' : 0.1,
		'right' : 0.9,
		'bottom' : 0.9,
		'minimum' : 0.2,
		'onchange' : function(){},
		'delay' : 1000,
		'offset' : 2,
		'slice' : './php/imageslice.php?src=../{src}&width={width}&height={height}&left={left}&top={top}&right={right}&bottom={bottom}'
	});
});
```

## License
This work is licensed under a Creative Commons Attribution 3.0 Unported License. The latest version of this and other scripts by the same author can be found at http://www.woollymittens.nl/
