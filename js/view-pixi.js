(function () {

    var options = {
        brickSize: 40,
        backgroundColor: 0xf6f6f6,
        brickColor: 0x4284b6
    };

    Tetris.ViewPixi = function (containerSelector) {

        var stage = new PIXI.Stage(options.backgroundColor),
            renderer = PIXI.autoDetectRenderer(Tetris.options.width * options.brickSize, Tetris.options.height * options.brickSize),
            graphics = new PIXI.Graphics();

        var drawBrick = function (x, y) {
            graphics.drawRect(x * options.brickSize, y * options.brickSize, options.brickSize, options.brickSize);
        };

        var container = document.querySelector(containerSelector);
        container.appendChild(renderer.view);
        stage.addChild(graphics);

        this.render = function (area) {
            graphics.clear();
            graphics.beginFill(options.brickColor);
            area.forEach(function (row, y) {
                row.forEach(function (brick, x) {
                    if (brick)
                        drawBrick(x, y);
                });
            });
            graphics.endFill();
            renderer.render(stage);
        };

        this.getContainer = function () {
            return renderer.view;
        }

    };
})();

