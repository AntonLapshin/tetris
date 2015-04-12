var TetrisViewPixi = function (containerSelector) {
    var options = {
        brickSize: 20,
        backgroundColor: 0xf6f6f6,
        brickColor: 0x4284b6,
        width: 10,
        height: 16
    };

    var stage = new PIXI.Stage(options.backgroundColor),
        renderer = PIXI.autoDetectRenderer(options.width * options.brickSize, options.height * options.brickSize),
        graphics = new PIXI.Graphics();

    var drawBrick = function (x, y) {
        graphics.drawRect(x * options.brickSize, y * options.brickSize, options.brickSize, options.brickSize);
    };

    this.init = function(container){
        container.appendChild(renderer.view);
        stage.addChild(graphics);
        return renderer.view;
    };

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
};
