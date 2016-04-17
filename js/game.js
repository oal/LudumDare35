(function () {

    var clickSound = new Audio('sound/move.wav');
    var musicSound = new Audio('sound/music.mp3');
    musicSound.loop = true;
    musicSound.volume = 0.1;

    var tilePoints = function (numTiles) {
        if (numTiles === 0) return 0;
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
            highscore: 0,
            tiles: [],
            enableSound: false,
            lastAction: new Date()
        },
        methods: {
            toggleInstructions: function () {
                this.instructions = !this.instructions;
                ga('send', 'event', 'Quadrisic', 'instructions', 'Toggle');
            },
            toggleSound: function () {
                this.enableSound = !this.enableSound;
                if (this.enableSound) {
                    musicSound.play();
                } else {
                    clickSound.currentTime = 0;
                    musicSound.pause();
                }
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
                        shape: (Math.random() * 3)|0,
                        index: i,
                        highlight: false,
                        active: false,
                        locked: false
                    });
                }

                if (this.tiles.length > 0) ga('send', 'event', 'Quadrisic', 'start', 'Restart', this.points);
                else ga('send', 'event', 'Quadrisic', 'start', 'Start', this.points);

                this.gameOver = false;
                this.instructions = false;
                this.points = 0;
                this.tiles = level;
            },
            highlightFrom: function (targetIndex) {
                var tile;
                for (var i = 0; i < this.tiles.length; i++) {
                    tile = this.tiles[i];
                    tile.highlight = false;
                    tile.active = false;
                }

                if (this.tiles[targetIndex].locked || this.gameOver) {
                    return
                }

                var activeShape = this.tiles[targetIndex].shape;
                var selectedTiles = selectTiles(this.tiles, targetIndex);

                for (i = 0; i < selectedTiles.length; i++) {
                    tile = this.tiles[selectedTiles[i]];
                    if (tile.locked) continue;

                    if (tile.shape === activeShape) {
                        tile.active = true;
                    }
                    else {
                        tile.highlight = true;
                    }
                }

                this.tiles[targetIndex].highlight = true;
                this.tiles[targetIndex].active = true;

                this.lastAction = new Date();
            },
            playMove: function (targetIndex) {
                var target = this.tiles[targetIndex];
                if (target.locked) return;

                // If highlight and click was done within 100ms, stop and let the user confirm.
                // This is needed for confirming moves on mobile.
                var now = new Date();
                if (now - this.lastAction < 100) return;
                this.lastAction = now;

                var numTiles = 0;
                for (var i = 0; i < this.tiles.length; i++) {
                    if (i === targetIndex) continue;

                    var tile = this.tiles[i];
                    if (tile.active && !tile.highlight && !tile.locked) {
                        numTiles++;
                        tile.shape = nextShape(tile.shape);
                    }
                    tile.active = false;
                    tile.highlight = false;
                }

                if (numTiles === 0) return;
                target.locked = true;

                this.points += tilePoints(numTiles);

                if (this.enableSound) {
                    clickSound.pause();
                    clickSound.currentTime = 0;
                    clickSound.play();
                }

                this.checkGameOver();
            },
            checkGameOver: function () {
                for (var i = 0; i < this.tiles.length; i++) {
                    if (!this.tiles[i].locked) {
                        var possibleTiles = selectTiles(this.tiles, i);
                        for (var j = 0; j < possibleTiles.length; j++) {
                            if (possibleTiles[j] === i) continue;

                            var tile = this.tiles[possibleTiles[j]];
                            if (!tile.locked && tile.shape === this.tiles[i].shape) {
                                return false;
                            }
                        }
                    }
                }

                this.gameOver = true;
                if (this.points > localStorage.getItem('highscore')) {
                    localStorage.setItem('highscore', this.points);
                }
                this.highscore = localStorage.getItem('highscore');

                ga('send', 'event', 'Quadrisic', 'gameover', 'Points', this.points);
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