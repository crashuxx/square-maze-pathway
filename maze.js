// You can use either PIXI.WebGLRenderer or PIXI.CanvasRenderer
var renderer = new PIXI.WebGLRenderer(400, 250);

document.body.appendChild(renderer.view);

var stage = new PIXI.Container();

var characterTexture = PIXI.Texture.fromImage("assets/valcape_8D.png");
var iconsTexture = PIXI.Texture.fromImage("assets/rpgicons.png");
var wallTexture = PIXI.Texture.fromImage("assets/scraps_bricks.png");

var scale = {x: 2, y: 2};
var map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1],
    [-1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

var walls = [];
for (var y = 0; y < map.length; y++) {
    for (var x = 0; x < map[y].length; x++) {
        if (map[y][x] == 1) {
            var wall = new PIXI.extras.TilingSprite(wallTexture, 16, 16);
            wall.position.x = x * 16 * scale.x;
            wall.position.y = y * 16 * scale.y;
            wall.scale.set(scale.x, scale.y);
            walls.push(wall);
        }
        if (map[y][x] == -1) {
            var icon = new PIXI.extras.TilingSprite(iconsTexture, 16, 16);
            icon.position.x = x * 16 * scale.x;
            icon.position.y = y * 16 * scale.y;
            icon.scale.set(scale.x, scale.y);
            icon.tilePosition.x -= 16;
            walls.push(icon);
        }
    }
}

walls.forEach(function (e) {
    stage.addChild(e)
});

var characterSprite = new PIXI.extras.TilingSprite(characterTexture, 32, 32);

stage.addChild(characterSprite);

requestAnimationFrame(animate);

var lastTime = Date.now();
var timeSinceLastFrame = 0;

/**
 *
 * @param sprite extras.TilingSprite
 * @constructor
 */
var Character = function (sprite) {
    /**
     * @type extras.TilingSprite
     */
    this.sprite = sprite;
    this.frameTime = 0;
    /**
     * @private
     * @type {boolean}
     */
    this.animate = true;
    /**
     * @private
     * @type {number}
     */
    this.animation = 0;
    this.to = null;

    this.setAnimation = function (animation) {
        this.animation = animation
    };

    this.update = function (timeDiff) {
        this.frameTime += timeDiff;

        if (this.animate) {
            var frame = Math.floor(this.frameTime / 250) % 3;
            this.sprite.tilePosition.x = -frame * 32;
        }
        this.sprite.tilePosition.y = -this.animation * 32;

        if (this.to != null) {
            var diff = this.frameTime - this.to.startTime;
            if (diff > 1000) {
                this.sprite.position.set(this.to.x, this.to.y);
                var func = this.to.trigger;
                this.to = null;

                if (typeof(func) != 'undefined') func();
            } else {
                var p = diff / 1000;
                var x = (this.to.oldX - this.to.x) * p;
                var y = (this.to.oldY - this.to.y) * p;

                this.sprite.position.x = this.to.oldX - x;
                this.sprite.position.y = this.to.oldY - y;
            }
        }
    };

    this.setPosition = function (x, y) {
        this.sprite.position.x = x;
        this.sprite.position.y = y;
    };

    this.moveTo = function (x, y, trigger) {
        this.to = {trigger: trigger, x: x, y: y, startTime: this.frameTime, oldX: this.sprite.position.x, oldY: this.sprite.position.y};
    };
};

Character.TOP = 3;
Character.BOTTOM = 0;
Character.LEFT = 1;
Character.RIGHT = 2;

var chX = 9;
var chY = 5;

var character = new Character(characterSprite);
character.setPosition(chX * 32, chY * 32);
character.setAnimation(Character.TOP);

var step = function () {
    if (map[chY][chX] == -1) {
        character.animate = false;
        character.setAnimation(5);
        return;
    }

    if (character.animation == Character.TOP) {
        if (map[chY][chX + 1] == 0) {
            character.setAnimation(Character.RIGHT);
            character.moveTo((chX + 1) * 32, chY * 32, function () {
                chX = chX + 1;
                step();
            });
        } else if (map[chY - 1][chX] <= 0) {
            character.setAnimation(Character.TOP);
            character.moveTo(chX * 32, (chY - 1) * 32, function () {
                chY = chY - 1;
                step();
            });
        } else if (map[chY][chX - 1] <= 0) {
            character.setAnimation(Character.LEFT);
            character.moveTo((chX - 1) * 32, chY * 32, function () {
                chX = chX - 1;
                step();
            });
        } else if (map[chY + 1][chX] <= 0) {
            character.setAnimation(Character.BOTTOM);
            character.moveTo(chX * 32, (chY + 1) * 32, function () {
                chY = chY + 1;
                step();
            });
        }
    } else if (character.animation == Character.BOTTOM) {
        if (map[chY][chX - 1] <= 0) {
            character.setAnimation(Character.LEFT);
            character.moveTo((chX - 1) * 32, chY * 32, function () {
                chX = chX - 1;
                step();
            });
        } else if (map[chY + 1][chX] <= 0) {
            character.setAnimation(Character.BOTTOM);
            character.moveTo(chX * 32, (chY + 1) * 32, function () {
                chY = chY + 1;
                step();
            });
        } else if (map[chY][chX + 1] <= 0) {
            character.setAnimation(Character.RIGHT);
            character.moveTo((chX + 1) * 32, chY * 32, function () {
                chX = chX + 1;
                step();
            });
        } else if (map[chY - 1][chX] <= 0) {
            character.setAnimation(Character.TOP);
            character.moveTo(chX * 32, (chY - 1) * 32, function () {
                chY = chY - 1;
                step();
            });
        }
    } else if (character.animation <= Character.LEFT) {
        if (map[chY - 1][chX] == 0) {
            character.setAnimation(Character.TOP);
            character.moveTo(chX * 32, (chY - 1) * 32, function () {
                chY = chY - 1;
                step();
            });
        } else if (map[chY][chX - 1] <= 0) {
            character.setAnimation(Character.LEFT);
            character.moveTo((chX - 1) * 32, chY * 32, function () {
                chX = chX - 1;
                step();
            });
        } else if (map[chY + 1][chX] <= 0) {
            character.setAnimation(Character.BOTTOM);
            character.moveTo(chX * 32, (chY + 1) * 32, function () {
                chY = chY + 1;
                step();
            });
        } else if (map[chY][chX + 1] <= 0) {
            character.setAnimation(Character.RIGHT);
            character.moveTo((chX + 1) * 32, chY * 32, function () {
                chX = chX + 1;
                step();
            });
        }
    } else if (character.animation <= Character.RIGHT) {
        if (map[chY + 1][chX] == 0) {
            character.setAnimation(Character.BOTTOM);
            character.moveTo(chX * 32, (chY + 1) * 32, function () {
                chY = chY + 1;
                step();
            });
        } else if (map[chY][chX + 1] <= 0) {
            character.setAnimation(Character.RIGHT);
            character.moveTo((chX + 1) * 32, chY * 32, function () {
                chX = chX + 1;
                step();
            });
        } else if (map[chY - 1][chX] <= 0) {
            character.setAnimation(Character.TOP);
            character.moveTo(chX * 32, (chY - 1) * 32, function () {
                chY = chY - 1;
                step();
            });
        } else if (map[chY][chX - 1] <= 0) {
            character.setAnimation(Character.LEFT);
            character.moveTo((chX - 1) * 32, chY * 32, function () {
                chX = chX - 1;
                step();
            });
        }
    }
};

step();

function animate() {
    character.update(timeSinceLastFrame);

    renderer.render(stage);

    var now = Date.now();
    timeSinceLastFrame = now - lastTime;
    lastTime = now;
    requestAnimationFrame(animate);
}
