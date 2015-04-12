(function () {

    var State = function (form, x, y) {
        this.form = form;
        this.pos = {
            x: x,
            y: y
        };
        this.clone = function () {
            return new State(this.form, this.pos.x, this.pos.y);
        }
    };

    var state,
        stateNew;

    var getLedgeRow = function(dy){
        if (dy === 0)
            return -1;

        if (dy === -1)
            return 0;

        for (var y = stateNew.form.length - 1; y >= 0; y--){
            for(var x = 0; x < stateNew.form[y].length; x++){
                if (stateNew.form[y][x] == 1)
                    return y;
            }
        }
    };

    var getLedgeColumn = function(dx){
        if (dx === 0)
            return -1;

        if (dx === -1)
            return 0;

        for (var x = stateNew.form.length - 1; x >= 0; x--){
            for(var y = 0; y < stateNew.form[0].length; y++){
                if (stateNew.form[y][x] == 1)
                    return x;
            }
        }
    };

    Tetris.Shape = function (form, x, y) {
        state = new State(form.split('*'), x, y);
        stateNew = null;

        this.commit = function () {
            state = stateNew;
        };

        this.rotate = function () {
            stateNew = new State();
            stateNew.form = [];
            stateNew.pos = state.pos;

            var form = state.form,
                formNew = stateNew.form;

            this.round(Tetris.roundType.rotate, function (state, x, y) {
                if (formNew[y] === undefined)
                    formNew[y] = '';
                formNew[y] += form[form.length - x - 1][y];
            });
        };

        this.round = function (type, callback) {
            var size = state.form.length,
                x, y, column, row;

            if (type === Tetris.roundType.collisions && stateNew) {
                var dx = stateNew.pos.x - state.pos.x,
                    dy = stateNew.pos.y - state.pos.y;
                column = getLedgeColumn(dx);
                row = getLedgeRow(dy);
            }

            for (y = 0; y < size; y++) {
                for (x = 0; x < size; x++) {
                    if (type === Tetris.roundType.rotate)
                        callback(state, x, y);
                    else if (type === Tetris.roundType.render && state.form[y][x] == 1)
                        callback(state, x, y);
                    else if (type === Tetris.roundType.collisions) {
                        if (stateNew === null) {
                            // all bricks are potential collided
                            if (state.form[y][x] == 1)
                                callback(state, x, y);
                        }
                        // only bricks of ledged side are potential collided
                        else if (x === column && stateNew.form[y][x] == 1 || y === row && stateNew.form[y][x] == 1) {
                            var result = callback(stateNew, x, y);
                            if (result === false)
                                return;
                        }
                    }
                }
            }
        };

        this.move = function (x, y) {
            stateNew = state.clone();
            stateNew.pos.x += x;
            stateNew.pos.y += y;
        };

        return this;
    };
})();