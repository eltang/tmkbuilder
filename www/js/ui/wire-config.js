/*** WIRE CONFIG ***/

// Wire placement selector.
$('#config-wire-row, #config-wire-col').change(function() {
	// Get and clamp the value.
	var value = $(this).val();
	if (isNaN(value)) value = 0;
	value = Math.min(Math.max(value, 0), $(this).prop('max'));

	// Set the value to the clamped value.
	$(this).val(value);

	// Get the currently active key.
	var key = getActiveKey();

	// Set the key's position.
	if ($(this).is('#config-wire-row')) key.row = value;
	if ($(this).is('#config-wire-col')) key.col = value;

	// Redraw the wires.
	drawWires();
});

/*
 * Load the wire config.
 */
function loadWireConfig() {
	// Show the panel.
	$('.config-wire').show();

	// Set the maximum and minimum values for the row and column selectors.
	$('#config-wire-row').prop('max', _keyboard.rows - 1);
	$('#config-wire-col').prop('max', _keyboard.cols - 1);

	// Get the currently active key.
	var key = getActiveKey();

	// Set the row and column selector values.
	$('#config-wire-row').val(key.row);
	$('#config-wire-col').val(key.col);

	// Redraw the wires.
	drawWires();
}

/*
 * Hide all wire config items.
 */
function hideWireMode() {
	$('.config-wire').hide();
	$('.config-pin').hide();
	hideWires();
}

/*
 * Gets the position of a key given its ID.
 *
 * @param id The id of the key.
 *
 * @return The x and y positions of the key.
 */
function getKeyPosition(id) {
	var key = _keys[id];
	var x = key.position().left + key.width() / 2;
	var y = key.position().top + key.height() / 2;
	return { x: x, y: y };
}

/*
 * Draws wires on the keyboard.
 */
function drawWires() {
	// Show key pads.
	$('.key-pad').show();

	// Hide all row and column indicators.
	$('.keyboard-row-indicator, .keyboard-col-indicator').hide();

	// Iterate through all the keys.
	for (var i in _keyboard.keys) {
		var key = _keyboard.keys[i];

		// Find the nearest previous keys along the row and column.
		var prevRow, prevCol;
		var prevRowI, prevColI;
		for (var j in _keyboard.keys) {
			var otherKey = _keyboard.keys[j];

			if (otherKey.col == key.col) {
				if (otherKey.row < key.row &&
					(prevRow === undefined || otherKey.row > prevRow.row)) {
					prevRow = otherKey;
					prevRowI = j;
				}
			}
			if (otherKey.row == key.row) {
				if (otherKey.col < key.col &&
					(prevCol === undefined || otherKey.col > prevCol.col)) {
					prevCol = otherKey;
					prevColI = j;
				}
			}
		}

		// Destroy the previous lines.
		if (_rowLines[i]) {
			_rowLines[i].remove();
			delete _rowLines[i];
		}
		if (_colLines[i]) {
			_colLines[i].remove();
			delete _colLines[i];
		}

		// Draw lines.
		var from = getKeyPosition(i);
		if (prevRow !== undefined) {
			var to = getKeyPosition(prevRowI);
			_rowLines[i] = $.line(from, to, {
				lineColor: '#2c3e50'
			});
			_rowLines[i].css('pointer-events', 'none');
		}
		if (prevCol !== undefined) {
			var to = getKeyPosition(prevColI);
			_colLines[i] = $.line(from, to, {
				lineColor: '#c0392b'
			});
			_colLines[i].css('pointer-events', 'none');
		}

		// Unset prevRow and prevCol;
		prevRow = prevCol = undefined;

		// Move the row and column indicators.
		var rowInd = _rowInds[key.row];
		var colInd = _colInds[key.col];
		if (!rowInd.is(':visible') || from.x < rowInd.data('x')) {
			rowInd.css({
				'top': _keys[i].position().top,
				'line-height': _keys[i].height() + 'px'
			});
			rowInd.data('x', from.x);
		}
		if (!colInd.is(':visible') || from.y < rowInd.data('y')) {
			colInd.css({
				'left': _keys[i].position().left,
				'width': _keys[i].width()
			});
			colInd.data('y', from.y);
		}

		// Show the pin assignments on the indicators.
		_rowInds[key.row].html('(' + PINS[_keyboard.rowPins[key.row]] + ') ' + key.row);
		_colInds[key.col].html('(' + PINS[_keyboard.colPins[key.col]] + ')<br>' + key.col);

		// Show the indicators.
		_rowInds[key.row].show();
		_colInds[key.col].show();
	}
}

/*
 * Hides the wire display.
 */
function hideWires() {
	// Hide key pads.
	$('.key-pad').hide();

	// Hide all row and column indicators.
	$('.keyboard-row-indicator, .keyboard-col-indicator').hide();

	// Destroy all the wires.
	for (var i in _rowLines) {
		_rowLines[i].remove();
		delete _rowLines[i];
	}
	for (var i in _colLines) {
		_colLines[i].remove();
		delete _colLines[i];
	}
}

/*
 * Sets the pin config.
 */
function setPinConfig() {

	function createPinSelector(type, pinNum) {
		// Create the elements.
		var element = $('<div></div>');
		var label = $('<label style="width:1rem; text-align:left;"></label>');
		var select = $('<select></select>');

		// Set the values.
		label.text(pinNum);
		for (var i in PINS) {
			var option = $('<option></option>');
			option.text(PINS[i]);
			option.val(i);
			select.append(option);
		}

		// Pack the elements.
		element.append(label);
		element.append(select);

		// Change event.
		element.change(function() {
			// Change the pin.
			var value = parseInt(this.select.val());
			if (this.type == 0) {
				_keyboard.rowPins[this.pinNum] = value;
			} else {
				_keyboard.colPins[this.pinNum] = value;
			}

		// Redraw the wires.
		drawWires();
		}.bind({ type: type, pinNum: pinNum, select: select }));

		return element;
	}

	// Add fields for each row and column.
	for (var row = 0; row < _keyboard.rows; row ++) {
		var selector = createPinSelector(0, row);
		$('#config-pin-rows').append(selector);
	}
	for (var col = 0; col < _keyboard.cols; col ++) {
		var selector = createPinSelector(1, col);
		$('#config-pin-cols').append(selector);
	}
}
