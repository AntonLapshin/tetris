var TetrisEngine = function (containerSelector, view) {
    var options = {
        width: 10,
        height: 16,
        delay: 500
    };

    var FORMS = ['0000*1111*0000*0000', '100*111*000', '001*111*000', '11*11', '011*110*000', '011*110*000', '010*111*000', '110*011*000'];

    var random = function (max) {
        return Math.floor(Math.random() * max);
    };

    var Shape = function () {
        var form = FORMS[random(FORMS.length)],
            left = Math.floor(options.width / 2) + random(4) - 3,
            top = 0;

        this.state = form.split('*');
        this.previousState = null;
        this.newState = this.state;
        this.position = {left: left, top: top};
        this.previousPosition = null;
        this.newPosition = this.position;

        this.commit = function () {
            if (this.newState) {
                this.previousState = this.state;
                this.state = this.newState;
            }
            if (this.newPosition) {
                this.previousPosition = this.position;
                this.position = this.newPosition;
            }
        };

        this.rotate = function () {
            this.newState = [];
            this.newPosition = this.position;

            var self = this;
            this.round(this.state, function (x, y) {
                if (self.newState[y] === undefined)
                    self.newState[y] = '';
                self.newState[y] += self.state[self.state.length - x - 1][y];
            }, true);
        };

        this.round = function (state, callback, fully) {
            var size = state.length,
                x, y;

            for (y = 0; y < size; y++) {
                for (x = 0; x < size; x++) {
                    if (fully === true) {
                        callback(x, y);
                        continue;
                    }
                    if (state[y][x] == 1) {
                        var result = callback(x, y);
                        if (result === false)
                            return;
                    }
                }
            }
        };

        this.move = function (x, y) {
            this.newState = this.state.slice(0);
            this.newPosition = {left: this.position.left + x, top: this.position.top + y};
        };

        return this;
    };

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

    var render = function () {
        if (!activeShape)
            return;

        var left, top;

        if (activeShape.previousPosition) {
            left = activeShape.previousPosition.left;
            top = activeShape.previousPosition.top;
            activeShape.round(activeShape.previousState, function (x, y) {
                area[top + y][left + x] = 0;
            });
        }
        left = activeShape.position.left;
        top = activeShape.position.top;
        activeShape.round(activeShape.state, function (x, y) {
            area[top + y][left + x] = 1;
        });
        fire('render', area, this);
    };

    //todo: refactor
    var checkCollisions = function () {
        var isCollided = false,
            ns = activeShape.newState,
            s = activeShape.state,
            np = activeShape.newPosition,
            p = activeShape.position;

        activeShape.round(activeShape.newState, function (x, y) {
            if (x + np.left < 0 || x + np.left >= options.width) {
                isCollided = true;
                return false;
            }

            var yy = y + np.top - p.top,
                xx = x + np.left - p.left;
            if (xx < 0 || yy < 0 || xx >= s.length || yy >= s.length ||
                s[y + np.top - p.top][x + np.left - p.left] == 0) {
                if (np.top + y >= options.height || area[np.top + y][np.left + x] == 1) {
                    isCollided = true;
                    return false;
                }
            }
        });
        return isCollided;
    };

    var keydown = function (e) {
        if (!activeShape)
            return;

        switch (e.keyCode) {
            case 37:
                activeShape.move(-1, 0);
                break;
            case 38:
                activeShape.rotate();
                break;
            case 39:
                activeShape.move(1, 0);
                break;
            case 40:
                activeShape.move(0, 1);
                break;
            case 32:
                shiftdown();
                return;
                break;
            default:
                return;
        }
        if (checkCollisions())
            return;
        activeShape.commit();
        render();
    };

    var shiftdown = function () {
        if (!activeShape)
            return;
        activeShape.move(0, 1);
        if (checkCollisions())
            return;

        activeShape.commit();
        render();

        setTimeout(shiftdown, 10);
    };

    var step = function () {
        if (!activeShape) {
            activeShape = new Shape();
            if (checkGameover()) {
                fire('gameover');
                return;
            }
            fire('newshape', activeShape, this);
        } else {
            activeShape.move(0, 1);
            if (checkCollisions()) {
                activeShape = null;
            }
            else {
                activeShape.commit();
            }
        }

        render();

        setTimeout(step, options.delay);
    };

    var checkGameover = function () {
        var gameover = false;
        activeShape.round(activeShape.state, function (x, y) {
            if (area[activeShape.position.top + y][activeShape.position.left + x] == 1) {
                gameover = true;
                return false;
            }
        });
        return gameover;
    };

    this.options = function () {
        return options;
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

    this.start = function () {
        area = [];
        for (var y = 0; y < options.height; y++) {
            area[y] = [];
            for (var x = 0; x < options.width; x++) {
                area[y][x] = 0;
            }
        }
        fire('start');
        step();
        return this;
    };

    var container = view.init(document.querySelector(containerSelector));
    this.on('render', view.render);

    var selectedContainer;
    document.addEventListener('mousedown', function (e) {
        selectedContainer = e.target;
    }, false);
    document.addEventListener('keydown', function (e) {
        if (container != selectedContainer)
            return;
        keydown(e);
    }, false);
};