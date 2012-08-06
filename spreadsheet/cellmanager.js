function Cell(id) {
    this.listeners = [];
    this.id = id;
    this.value = '';
    this.formula = '';
}

Cell.prototype.propagateChange = function() {
    var cell;
    // here, we may want to compute the value based on the formula, not rely on a "value" property.
    var newValue = this.value;
    for (ndx in this.listeners) {
        cell = this.listeners[ndx];
        cell.updateValue(newValue);
    }
    return this;
};


Cell.prototype.beginListening = function(cell) {
    var that = this;
    var alreadyListening = cell.listeners.some(
        function(c) {
            return that === c;
        }
    );
    if (!alreadyListening) {
        cell.listeners.push(this);
    }
    return this;
};


Cell.prototype.updateValue = function(newValue) {
    // Thew new value actually needs to update the formula, not the value itself.
    this.value = newValue;
    this.refresh();
    this.propagateChange();
};


Cell.prototype.updateFormula = function(newFormula) {
    this.formula = newFormula;
};


Cell.prototype.refresh = function() {
    document.getElementById(this.id).innerHTML = this.value;
};




CellManager = (function() {
    return {
        initializeCells: function() {
            var cells = {},
                id;
            for (var y = 0; y < spreadsheetParams.rows; y++) {
                for (var x = 0; x < spreadsheetParams.cols; x++) {
                    linearNdx = y*spreadsheetParams.cols + x;
                    id = String.fromCharCode(65 + x) + (y + 1);
                    cells[id] = new Cell(id);
                }
            }
            this.cells = cells;
        },

        checkStatus: function(obj) {
            var id = obj.id;
            var currentFormula = this.cells[id].formula;
            var newFormula = obj.innerHTML;
            var newValue;
            if (newFormula.charAt(0) === '=') {
                newFormula = newFormula.substr(1);
                newValue = Parser.parse(newFormula);
            }
            else {
                newValue = newFormula;
            }
            if (1 || newFormula !== currentFormula) {
                this.cells[id].updateFormula(newFormula);
                this.cells[id].updateValue(newValue);
            }
        },

        lookup: function(coords) {
            cellNdx = coords.toUpperCase();
            literal = this.cells[cellNdx].value;
            return literal;
        }

    };
})();

CellManager.initializeCells();

/*
cells[2].beginListening(cells[3]);

if (cells[3].hasChanged) {
    cells[3].propagateChange();
}
*/