/*** INITIAL SETUP ***/

// Upload button.
$('#tfb-upload').click(function() {
	// Get the file.
	readFile(function(json) {
		try {
			_keyboard = JSON.parse(json);
			if (_keyboard.isKeyboard != 'thisIsAKeyboard') throw 'invalid layout';
			init();
		} catch (e) {
			console.error(e);
			showError('Bad configuration file.');
		}
	});
});

// Import button.
$('#kle-import').click(function() {
	// Get the contents of the textarea.
	var json = $('#kle').val();

	// Attempt to create the keyboard.
	try {
		_keyboard = fromKLE(json);
		init();
	} catch (e) {
		console.error(e);
		showError('Invalid layout.');
	}
});

/*
 * Initialize the editor.
 */
function init() {
	// Hide errors.
	$('#err').hide();

	// Reset and show the config screen.
	resetConfig();
	showScreen('config');

	// Show the wire config.
	setConfigMode(MODE_WIRE);

	// Set the pin config.
	setPinConfig();

	// Add a key chooser to key config.
	$('.config-key').append(createChooser(setKeycode));

	// Add a key chooser to macro editor.
	$('.config-macro-selector').append(createChooser(addMacroAction));
}
