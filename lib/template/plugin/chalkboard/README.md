# Chalkboard

With this plugin you can add a chalkboard to reveal.js. The plugin provides two possibilities to include handwritten notes to your presentation:

- you can make notes directly on the slides, e.g. to comment on certain aspects,
- you can open a chalkboard on which you can make notes.

The main use case in mind when implementing the plugin is classroom usage in which you may want to explain some course content and quickly need to make some notes. 

The plugin records all drawings made so that they can be play backed using the ```autoSlide``` feature or the ```audio-slideshow``` plugin. 

[Check out the live demo](https://rajgoel.github.io/reveal.js-demos/chalkboard-demo.html)

The chalkboard effect is based on [Chalkboard](https://github.com/mmoustafa/Chalkboard) by Mohamed Moustafa.

## Installation

Copy the file ```chalkboard.js``` and the  ```img``` directory into the plugin folder of your reveal.js presentation, i.e. ```plugin/chalkboard```.

Add the plugins to the dependencies in your presentation as shown below. 

```javascript
Reveal.initialize({
	// ...
	chalkboard: { 
		// optionally load pre-recorded chalkboard drawing from file
		src: "chalkboard.json",
	},
	dependencies: [
		// ... 
		{ src: 'plugin/chalkboard/chalkboard.js' },
		// ... 
	],
	keyboard: {
	    67: function() { RevealChalkboard.toggleNotesCanvas() },	// toggle notes canvas when 'c' is pressed
	    66: function() { RevealChalkboard.toggleChalkboard() },	// toggle chalkboard when 'b' is pressed
	    46: function() { RevealChalkboard.clear() },	// clear chalkboard when 'DEL' is pressed
	     8: function() { RevealChalkboard.reset() },	// reset chalkboard data on current slide when 'BACKSPACE' is pressed
	    68: function() { RevealChalkboard.download() },	// downlad recorded chalkboard drawing when 'd' is pressed
	},
	// ...

});
```
In order to include buttons for opening and closing the notes canvas or the chalkboard you should make sure that ```font-awesome``` is available. The easiest way is to include 
```
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
```
to the ```head``` section of you HTML-file.

## Usage

### Enable & disable 

With above configuration the notes canvas is opened and closed when pressing 'c' and the chalkboard is opened and closed when pressing 'b'.

### Mouse
- Click the left mouse button and drag to write on notes canvas or chalkboard
- Click the right mouse button and drag to wipe away previous drawings

### Touch
- Touch and move to write on notes canvas or chalkboard
- Touch and hold for half a second, then move to wipe away previous drawings

### Keyboard
- Click the 'DEL' key to clear the chalkboard </li>
- Click the 'd' key to download chalkboard drawings</li>
- Click the 'BACKSPACE' key to delete all chalkboard drawings on the current slide</li>

## Playback

If the ```autoSlide``` feature is set or if the ```audio-slideshow``` plugin is used, pre-recorded chalkboard drawings can be played. The slideshow plays back the user interaction with the chalkboard in the same way as it was conducted when recording the data.

## PDF-Export

If the slideshow is opened in [print mode](https://github.com/hakimel/reveal.js/#pdf-export) the pre-recorded chalkboard drawings (which must be provided in a file, see ```src``` option) are included in the PDF-file. Each drawing on the chalkboard is added after the slide that was shown when opening the chalkboard. Drawings are also included if they had been cleared (using the 'DEL' key). Drawings on the notes canvas are not included in the PDF-file.   


## Configuration

The plugin has several configuration options:

- ```src```: Optional filename for pre-recorded drawings.
- ```readOnly```: Configuation option allowing to prevent changes to existing drawings. If set to ```true``` no changes can be made, if set to false ```false``` changes can be made, if unset or set to ```undefined``` no changes to the drawings can be made after returning to a slide or fragment for which drawings had been recorded before. In any case the recorded drawings for a slide or fragment can be cleared by pressing the 'DEL' key (i.e. by using the ```RevealChalkboard.clear()``` function).
- ```toggleNotesButton```: If set to ```true``` a button for opening and closing the notes canvas is shown. Alternatively, the css position attributes can be provided if the default position is not appropriate. 
- ```toggleChalkboardButton```: If set to ```true``` a button for opening and closing the chalkboard is shown. Alternatively, the css position attributes can be provided if the default position is not appropriate. 
- ```transition```: Gives the duration (in milliseconds) of the transition for a slide change, so that the notes canvas is drawn after the transition is completed.
- ```theme```: Can be set to either ```"chalkboard"``` or ```"whiteboard"```.

The following configuration options allow to change the appearance of the notes canvas and the chalkboard. All of these options require two values, the first gives the value for the notes canvas, the second for the chalkboard.

- ```color```: The first value gives the pen color, the second value gives the color of the chalk.
- ```background```: The first value expects a (semi-)transparent color which is used to provide visual feedback that the notes canvas is enabled, the second value expects a filename to a background image for the chalkboard.
- ```pen```: The first value expects a filename for an image of the pen used for the notes canvas, the second value expects a filename  for an image of the pen used for the chalkboard.

All of the configurations are optional and the default values shown below are used if the options are not provided.

```javascript
Reveal.initialize({
	// ...
	chalkboard: { 
		src: null,
		readOnly: undefined, 
		toggleChalkboardButton: { left: "30px", bottom: "30px", top: "auto", right: "auto" },
		toggleNotesButton: { left: "30px", bottom: "30px", top: "auto", right: "auto" },
		transition: 800,
		theme: "chalkboard",
		// configuration options for notes canvas and chalkboard
		color: [ 'rgba(0,0,255,1)', 'rgba(255,255,255,0.5)' ],
		background: [ 'rgba(127,127,127,.1)' , 'reveal.js-plugins/chalkboard/img/blackboard.png' ],
		pen:  [ 'url(reveal.js-plugins/chalkboard/img/boardmarker.png), auto', 'url(reveal.js-plugins/chalkboard/img/chalk.png), auto' ],
	},
	// ...

});
```

**Note:** Customisation of pens has changed since version 0.5 of the plugin, it is now possible to use standard cursors, e.g. by setting ```pen:  [ 'crosshair', 'pointer' ]```. Please update your parameters if migrating from an older version.

## License

MIT licensed

Copyright (C) 2016 Asvin Goel
