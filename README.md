# cropper.js: A simple image cropper

A visual touch interface for generating cropping coordinates.

## Example

https://woollymittens.github.io/photo-cropper/

## How to include the script

The includes can be added to the HTML document:

```html
<link rel="stylesheet" href="css/photo-cropper.css"/>
<script src="js/photo-cropper.js" type="module"></script>
```

Or as a [Javascript module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules):

```js
@import { Cropper } from "./js/cropper.js');
``

## How to start the script

```javascript
var cropper = new PhotoCropper({
  'element' : document.getElementById('id'),
  'left' : 0.1,
  'top' : 0.1,
  'right' : 0.9,
  'bottom' : 0.9,
  'minimum' : 0.2,
  'aspect' : 0.75,
  'onchange' : function(){},
  'delay' : 1000,
  'realtime' : false,
  'offset' : 2,
  'slice' : 'php/imageslice.php?src={src}&width={width}&height={height}&left={left}&top={top}&right={right}&bottom={bottom}'
});
```

**id : {string}** - The ID attribute of an element somewhere in the document.

**crop : {array}** - An array of default cropping coordinates as fractions from the left, top, right and bottom of the image.

**left : {float}** - At what fraction from the left to crop the image. i.e. 0 is the extreme left side.

**top : {float}** - At what fraction from the top to crop the image. i.e. 0 is the extreme top side.

**right : {float}** - At what fraction from the right to crop the image. i.e. 1 is the extreme bottom side.

**bottom : {float}** - At what fraction from the bottom to crop the image. i.e. 1 is the extreme right side.

**minimum : {float}** - The smallest fraction of the image that is able to be cropped. This value should be large enough to avoid overlapping guides.

**aspect : {float}** - A fixed aspect ratio for the box to conform to.

**onchange : {function}** - An external function to call after every change to the cropping area.

**delay : {integer}** - The time in miliseconds to wait before triggering the onchange function. This limits the rate at which the function is called.

**realtime : {boolean}** - Turns on realtime updating of the values. The buttons are unnecessary in that case.

**offset : {integer}** - A fudge factor in pixels to compensate for slight alignment differences, usually caused by borders and paddings.

**'slice' : {string}** - A webservice for resizing images. An example is provided as *./php/imageslice.php*.

## How to control the script

### Update

```javascript
cropper.update({left:0.1, top:0.2, right:0.7, bottom:0.6});
```

Preset a crop setting.

### Apply

```javascript
cropper.toolbar.apply();
```

Apply the cropping settings.

### Reset

```javascript
cropper.toolbar.reset();
```

Reset the cropper.

## License

This work is licensed under a [MIT License](https://opensource.org/licenses/MIT). The latest version of this and other scripts by the same author can be found on [Github](https://github.com/WoollyMittens).
