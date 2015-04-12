(function () {

    window.Tetris = {
        options: {
            width: 10,
            height: 16,
            delay: 500,
            shiftdownDelay: 10
        },
        roundType: {
            render: 0, rotate: 1, collisions: 2
        },
        command: {
            left: 0, rotate: 1, right: 2, down: 3, shiftdown: 4, pause: 5, restart: 6
        },

        Game: function(containerSelector){
            var view = new Tetris.ViewPixi(containerSelector),
                container = view.getContainer(),
                engine = new Tetris.Engine();

            engine.on('render', view.render);

            var selectedContainer;
            document.addEventListener('mousedown', function (e) {
                selectedContainer = e.target;
            }, false);
            document.addEventListener('keydown', function (e) {
                if (container != selectedContainer)
                    return;

                var command;
                switch (e.keyCode) {
                    case 37:
                        command = Tetris.command.left;
                        break;
                    case 38:
                        command = Tetris.command.rotate;
                        break;
                    case 39:
                        command = Tetris.command.right;
                        break;
                    case 40:
                        command = Tetris.command.down;
                        break;
                    case 32:
                        command = Tetris.command.shiftdown;
                        break;
                    default:
                        return;
                }
                engine.execute(command);
            }, false);

            this.start = function(){
                engine.start();
            }
        }
    }
})();