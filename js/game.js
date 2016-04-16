(function () {

    var clickSound = new Audio('sound/move.wav');

    var tilePoints = function (numTiles) {
        return 0.5 * (numTiles * numTiles - numTiles + 2);
    };

    var nextShape = function (currShape) {
        return (++currShape) % 3;
    };

    var selectTiles = function (tiles, centerIndex) {
        var selectedIndexes = [];

        var levelSize = Math.sqrt(tiles.length);
        var hy = Math.floor(centerIndex / levelSize);
        var hx = centerIndex - hy * levelSize;

        var k = 0;
        for (var y = 0; y < levelSize; y++) {
            for (var x = 0; x < levelSize; x++) {
                k = y * levelSize + x;

                var tile = tiles[k];

                var dy = hy - y;
                var dx = hx - x;
                if (Math.ceil(Math.sqrt(dx * dx + dy * dy)) < 3) {
                    selectedIndexes.push(tile.index);
                }
            }
        }

        return selectedIndexes;
    };

    new Vue({
        el: '#game',
        data: {
            gameOver: false,
            instructions: false,
            levelSize: 9,
            points: 0,
            tiles: []
        },
        methods: {
            toggleInstructions: function () {
                this.instructions = !this.instructions;
            },
            pointScores: function () {
                var mapping = [];
                for (var i = 1; i <= 12; i++) {
                    mapping.push([i, tilePoints(i)]);
                }
                return mapping;
            },
            restart: function () {
                var level = [];
                for (var i = 0; i < this.levelSize * this.levelSize; i++) {
                    level.push({
                        shape: ~~(Math.random() * 3),
                        index: i,
                        highlight: false,
                        active: false,
                        locked: false
                    });
                }

                this.gameOver = false;
                this.instructions = false;
                this.points = 0;
                this.tiles = level;
            },
            highlightFrom: function (targetIndex) {
                for (var i = 0; i < this.tiles.length; i++) {
                    var tile = this.tiles[i];
                    tile.highlight = false;
                    tile.active = false;
                }

                if (this.tiles[targetIndex].locked) {
                    return
                }

                var activeShape = this.tiles[targetIndex].shape;
                var selectedTiles = selectTiles(this.tiles, targetIndex);

                for (i = 0; i < selectedTiles.length; i++) {
                    var tile = this.tiles[selectedTiles[i]];
                    if (tile.locked) continue;
                    if (tile.shape === activeShape) tile.active = true;
                    else tile.highlight = true;
                }

                this.tiles[targetIndex].highlight = true;
                this.tiles[targetIndex].active = true;
            },
            playMove: function (targetIndex) {
                if (this.tiles[targetIndex].locked) return;
                this.tiles[targetIndex].locked = true;

                var numTiles = 0;
                for (var i = 0; i < this.tiles.length; i++) {
                    var tile = this.tiles[i];
                    if (tile.active && !tile.highlight && !tile.locked) {
                        numTiles++;
                        tile.shape = nextShape(tile.shape);
                    }
                    tile.active = false;
                    tile.highlight = false;
                }

                this.points += tilePoints(numTiles);

                clickSound.pause();
                clickSound.currentTime = 0;
                clickSound.play();

                this.checkGameOver();
            },
            checkGameOver: function () {
                for (var i = 0; i < this.tiles.length; i++) {
                    if (!this.tiles[i].locked) return false;
                }

                this.gameOver = true;
            }
        },
        computed: {
            activePoints: function () {
                var numTiles = 0;
                for (var i = 0; i < this.tiles.length; i++) {
                    var tile = this.tiles[i];
                    if (tile.active && !tile.highlight) {
                        numTiles++;
                    }
                }
                return tilePoints(numTiles);
            }
        }
    });
})();