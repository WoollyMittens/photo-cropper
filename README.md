# useful.cropper.js: A simple image cropper

A visual touch interface for generating cropping coordinates.

Try the <a href="http://www.woollymittens.nl/useful/default.php?url=cropper">demo</a>.

## How to include the script

The stylesheet is best included in the header of the document.

```html
<link rel="stylesheet" href="./css/cropper.css"/>
```

This include can be added to the header or placed inline before the script is invoked.

```html
<script src="./js/cropper.min.js"></script>
```

To enable the use of HTML5 tags in Internet Explorer 8 and lower, include *html5.js*. To provide an alternative for *document.querySelectorAll* and CSS3 animations in Internet Explorer 8 and lower, include *jQuery*.

```html
<!--[if lte IE 9]>
	<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
<![endif]-->
```

## How to start the script

This is the safest way of starting the script, but allows for only one target element at a time.

```javascript
var cropper = new useful.Cropper( document.getElementById('id'), {
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
cropper.start();
```

**id : {string}** - The ID attribute of an element somewhere in the document.

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
var croppers = new useful.Instances(
	document.querySelectorAll('figure.cropper'),
	useful.Cropper,
	{
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
);
croppers.wait();
```

The "Instances" function clones the settings for each element in the CSS rule.

### Using jQuery

This method is similar to the previous one, but uses jQuery for processing the CSS rule and cloning the settings.

```javascript
var croppers = [];
$('figure.cropper').each(function (index, element) {
	croppers[index] = new useful.Cropper( element, {
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
	croppers[index].start();
});
```

## How to control the script

### Update

```javascript
cropper.update({left:0.1, top:0.2, right:0.7, bottom:0.6});
```

Preset a crop setting.

### Apply

```javascript
cropper.toolbar.apply(cropper);
```

Apply the cropping settings.

### Reset

```javascript
cropper.toolbar.reset(cropper);
```

Reset the cropper.

## Prerequisites

To concatenate and minify the script yourself, the following prerequisites are required:
+ https://github.com/WoollyMittens/useful-instances
+ https://github.com/WoollyMittens/useful-interactions
+ https://github.com/WoollyMittens/useful-polyfills
+ https://github.com/WoollyMittens/useful-urls.js

## License
This work is licensed under a Creative Commons Attribution 3.0 Unported License. The latest version of this and other scripts by the same author can be found at http://www.woollymittens.nl/
