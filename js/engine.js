(function () {

    var FORMS = ['0000*1111*0000*0000', '100*111*000', '001*111*000', '11*11', '011*110*000', '011*110*000', '010*111*000', '110*011*000'];

    var random = function (max) {
        return Math.floor(Math.random() * max);
    };

    Tetris.Engine = function () {
        var area,
            activeShape,
            handlers = {};

        var fire = function (eventType, o, ctx) {
            ctx = ctx || window;
            if (!handlers[eventType])
                return;
            handlers[eventType].forEach(function (fn) {
                fn.call(ctx, o);
            });
        };

        var render = function (brush) {
            if (!activeShape)
                return;

            activeShape.round(Tetris.roundType.render, function (state, x, y) {
                area[state.pos.y + y][state.pos.x + x] = brush;
            });

            if (brush === 1) {
                fire('render', area, this);
            }
        };

        var checkCollisions = function () {
            var isCollided = false;

            activeShape.round(Tetris.roundType.collisions, function (state, x, y) {
                if (state.pos.y + y === Tetris.options.height ||
                    area[state.pos.y + y][state.pos.x + x] == 1 ||
                    state.pos.x + x === -1 || state.pos.x + x === Tetris.options.width) {
                    isCollided = true;
                    return false;
                }
            });

            return isCollided;
        };

        var shiftdown = function () {
            if (!activeShape)
                return;

            activeShape.move(0, 1);
            if (checkCollisions())
                return;

            render(0);
            activeShape.commit();
            render(1);

            setTimeout(shiftdown, Tetris.options.shiftdownDelay);
        };

        var step = function () {
            if (pause)
                return;

            if (!activeShape) {
                var form = FORMS[random(FORMS.length)],
                    x = Math.floor(Tetris.options.width / 2) + random(4) - 3,
                    y = 0;
                activeShape = new Tetris.Shape(form, x, y);
                if (checkCollisions()) {
                    fire('gameover');
                    return;
                }
                fire('newshape', activeShape, this);
            } else {
                activeShape.move(0, 1);
                if (checkCollisions()) {
                    activeShape = null;
                    removeLine();
                }
                else {
                    render(0);
                    activeShape.commit();
                }
            }

            render(1);

            setTimeout(step, Tetris.options.delay);
        };

        var shiftArea = function (start) {
            for (var y = start - 1; y >= 0; y--) {
                for (var x = 0; x < Tetris.options.width; x++) {
                    area[y + 1][x] = area[y][x];
                }
            }
        };

        var removeLine = function (start) {
            for(var y = start || area.length - 1; y >= 0; y--){
                var isAllFilled = true;
                for (var x = 0; x < Tetris.options.width; x++) {
                    if (area[y][x] == 0) {
                        isAllFilled = false;
                        break;
                    }
                }
                if (isAllFilled) {
                    shiftArea(y);
                    y++;
                }
            }
        };

        this.on = function (eventType, callback) {
            if (!handlers[eventType])
                handlers[eventType] = [];
            handlers[eventType].push(callback);
            return this;
        };

        this.off = function (eventType, callback) {
            handlers[eventType] = handlers[eventType].filter(
                function (fn) {
                    if (fn !== callback) {
                        return fn;
                    }
                }
            );
            return this;
        };

        this.execute = function (command) {
            if (!activeShape)
                return;

            switch (command) {
                case Tetris.command.left:
                    activeShape.move(-1, 0);
                    break;
                case Tetris.command.rotate:
                    activeShape.rotate();
                    break;
                case Tetris.command.right:
                    activeShape.move(1, 0);
                    break;
                case Tetris.command.down:
                    activeShape.move(0, 1);
                    break;
                case Tetris.command.shiftdown:
                    shiftdown();
                    return;
                default:
                    return;
            }
            if (checkCollisions())
                return;

            render(0);
            activeShape.commit();
            render(1);
        };

        this.start = function () {
            area = [];
            for (var y = 0; y < Tetris.options.height; y++) {
                area[y] = [];
                for (var x = 0; x < Tetris.options.width; x++) {
                    area[y][x] = 0;
                }
            }
            fire('start');
            step();
            return this;
        };

        var pause;

        this.pause = function () {
            pause = !pause;
            pause && step();
        };
    };
})();
