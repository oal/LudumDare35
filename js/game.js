(function () {

    var shapes = [
        'square',
        'triangle',
        'circle'
    ];

    var tilePoints = function (numTiles) {
        return 0.5 * (numTiles * numTiles - numTiles + 2);
    };

    var nextShape = function (currShape) {
        return (++currShape) % 3;
    };

    var selectSquare = function (tiles, centerIndex) {

    };

    var selectTriangle = function (tiles, centerIndex) {

    };

    var selectCircle = function (tiles, centerIndex) {
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

    var selectTiles = function (tiles, shape, centerIndex) {
        switch (shape) {
            case 0:
                return selectSquare(tiles, centerIndex);
            case 1:
                return selectTriangle(tiles, centerIndex);
            case 2:
                return selectCircle(tiles, centerIndex);
            default:
                console.error('Umm, this should never happen.');
        }
    };

    new Vue({
        el: '#game',
        data: {
            levelSize: 9,
            tiles: [],
            points: 0,
            currentShape: 2,
            shape: {
                type: 'circle',
                size: 3
            }
        },
        methods: {
            genLevel: function () {
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

                this.tiles = level;
            },
            highlightFrom: function (targetIndex) {
                for(var i = 0; i < this.tiles.length; i++) {
                    var tile = this.tiles[i];
                    tile.highlight = false;
                    tile.active = false;
                }

                if(this.tiles[targetIndex].locked) {
                    return
                }

                var hy = Math.floor(targetIndex / this.levelSize);
                var hx = targetIndex - hy * this.levelSize;

                var activeShape = this.tiles[targetIndex].shape;

                var selectedTiles = selectTiles(this.tiles, this.currentShape, targetIndex);
                for(i = 0; i< selectedTiles.length; i++) {
                    var tile = this.tiles[selectedTiles[i]];
                    if(tile.locked) continue;
                    tile.highlight = true;
                    if(tile.shape === activeShape) tile.active = true;
                }
                this.tiles[targetIndex].active = true;
            },
            playMove: function (targetIndex) {
                if (this.tiles[targetIndex].locked) return;
                this.tiles[targetIndex].locked = true;

                var numTiles = 0;
                for (var i = 0; i < this.tiles.length; i++) {
                    var tile = this.tiles[i];
                    if (tile.active && tile.highlight && !tile.locked) {
                        numTiles++;
                        tile.shape = nextShape(tile.shape);
                    }
                    tile.active = false;
                    tile.highlight = false;
                }
                var points = tilePoints(numTiles);

                this.points += points;
            }
        },
        computed: {
            activePoints: function () {
                var numTiles = 0;
                for (var i = 0; i < this.tiles.length; i++) {
                    var tile = this.tiles[i];
                    if (tile.active && tile.highlight) {
                        numTiles++;
                    }
                }
                return tilePoints(numTiles);
            }
        }
    });
})();