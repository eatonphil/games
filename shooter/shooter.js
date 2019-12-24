'use strict';

class Sprite {
  constructor(pixels) {
    this.offset = { x: 0, y: 0 };
    this.slowdown = 1;
    this.pixels = pixels;
  }

  getBoundary(cmp) {
    let current = this.pixels[0];
    for (let i = 1; i < this.pixels.length; i++) {
      const next = this.pixels[i];
      if (cmp(next, current)) {
	current = next;
      }
    }

    return current;
  }

  getRightBoundary() {
    const cmp = (next, current) => next.x > current.x;
    return this.getBoundary(cmp);
  }

  getLeftBoundary() {
    const cmp = (next, current) => next.x < current.x;
    return this.getBoundary(cmp);
  }

  getTopBoundary() {
    const cmp = (next, current) => next.y > current.y;
    return this.getBoundary(cmp);
  }

  getBottomBoundary() {
    const cmp = (next, current) => next.y < current.y;
    return this.getBoundary(cmp);
  }

  // Implemented by extending classes
  calc() {}
}

class AlienSprite extends Sprite {
  constructor() {
    super([
      { x: 1, y: 0, fillStyle: 'red' },
      { x: 2, y: 0, fillStyle: 'red' },
      { x: 3, y: 0, fillStyle: 'red' },

      { x: 0, y: 1, fillStyle: 'black' },
      { x: 1, y: 1, fillStyle: 'black' },
      { x: 2, y: 1, fillStyle: 'black' },
      { x: 3, y: 1, fillStyle: 'black' },
      { x: 4, y: 1, fillStyle: 'black' },

      { x: 1, y: 2, fillStyle: 'black' },
      { x: 2, y: 2, fillStyle: 'black' },
      { x: 3, y: 2, fillStyle: 'black' },

      { x: 2, y: 3, fillStyle: 'red' },
    ]);
  }

  calc(intersections, counter) {
    for (let i = 0; i < intersections.length; i++) {
      const sprite = intersections[i];
      if (sprite instanceof BulletSprite) {
	return 'delete';
      }

      if (sprite instanceof ManSprite) {
	return 'gameover';
      }
    }

    if (counter % this.slowdown === 0) {
      this.offset.y += 1 * (Math.random() - 0.5 > 0 ? 1 : -1);
      this.offset.x--;
    }
  }
}

class BulletSprite extends Sprite {
  constructor() {
    super([{ x: 0, y: 0, fillStyle: '#ff33de' }]);
    this.slowdown = 1;
  }

  calc(intersections, counter) {
    for (let i = 0; i < intersections.length; i++) {
      const sprite = intersections[i];
      if (sprite instanceof AlienSprite) {
	return 'delete';
      }
    }

    if (counter % this.slowdown === 0) {
      this.offset.x++;
    }
  }
}

class ManSprite extends Sprite {
  constructor() {
    super([
      { x: 2, y: 0, fillStyle: 'black' },
      { x: 4, y: 0, fillStyle: 'black' },
      { x: 3, y: 0, fillStyle: 'black' },

      { x: 2, y: 1, fillStyle: '#00807a' },
      { x: 3, y: 1, fillStyle: 'white' },
      { x: 4, y: 1, fillStyle: '#00807a' },

      { x: 2, y: 2, fillStyle: 'white' },
      { x: 3, y: 2, fillStyle: 'white' },
      { x: 4, y: 2, fillStyle: 'white' },

      { x: 3, y: 3, fillStyle: 'white' },

      { x: 1, y: 4, fillStyle: 'black' },
      { x: 2, y: 4, fillStyle: '#4600bd' },
      { x: 3, y: 4, fillStyle: 'black' },
      { x: 4, y: 4, fillStyle: 'black' },
      { x: 5, y: 4, fillStyle: 'black' },

      { x: 0, y: 5, fillStyle: '#4600bd' },
      { x: 1, y: 5, fillStyle: 'black' },
      { x: 2, y: 5, fillStyle: '#4600bd' },
      { x: 3, y: 5, fillStyle: '#4600bd' },
      { x: 4, y: 5, fillStyle: '#4600bd' },
      { x: 5, y: 5, fillStyle: '#4600bd' },
      { x: 6, y: 5, fillStyle: '#4600bd' },
      { x: 7, y: 5, fillStyle: '#4600bd' },

      { x: 1, y: 6, fillStyle: 'white' },
      { x: 2, y: 6, fillStyle: 'white' },
      { x: 3, y: 6, fillStyle: '#4600bd' },
      { x: 4, y: 6, fillStyle: 'black' },
      { x: 5, y: 6, fillStyle: 'white' },

      { x: 2, y: 7, fillStyle: '#4600bd' },
      { x: 3, y: 7, fillStyle: 'black' },
      { x: 4, y: 7, fillStyle: 'black' },

      { x: 2, y: 8, fillStyle: 'black' },
      { x: 4, y: 8, fillStyle: 'black' },

      { x: 2, y: 9, fillStyle: 'black' },
      { x: 4, y: 9, fillStyle: 'black' },

      { x: 2, y: 10, fillStyle: 'black' },
      { x: 4, y: 10, fillStyle: 'black' },


      { x: 2, y: 12, fillStyle: 'red' },
      { x: 4, y: 12, fillStyle: 'red' },

      { x: 2, y: 13, fillStyle: 'red' },
      { x: 4, y: 13, fillStyle: 'red' },
    ]);

    this.slowdown = 1;
  }
}

class GameState {
  constructor() {
    this.aliens = 0;
    this.escaped = 0;
    this.remaining = 20;
    this.level = 1;
    this.running = true;
  }

  calc(game, counter) {
    const newSprites = game.sprites.map((sprite, i) => {
      const intersections = game.getIntersections(sprite);
      const action = sprite.calc(intersections, counter);
      switch (action) {
	case 'gameover':
	  this.running = false;
	  return null;
	case 'delete':
	  if (sprite instanceof AlienSprite) {
	    this.aliens++;
	  }

	  return null;
	default:
	  if (sprite instanceof AlienSprite) {
	    if (sprite.offset.x * game.pixelWidth < 0) {
	      this.escaped++;
	      return null;
	    }
	  }

	  if (sprite instanceof BulletSprite) {
	    if (sprite.offset.x * game.pixelWidth > game.width) {
	      return null;
	    }
	  }
	  return sprite;
      }
    }).filter(Boolean);

    // Reset it afterward so all calculations take place on sprites
    // as they were at the start of calculating.
    game.sprites = newSprites;

    // Add a new alien every so often
    if (this.remaining && Math.random() > .97) {
      const alien = new AlienSprite();
      alien.offset.x = (game.width / game.pixelWidth) - 10;
      alien.offset.y = Math.floor(Math.random() * (game.height / game.pixelHeight));
      alien.slowdown = this.level * 100;
      game.sprites.push(alien);
      this.remaining--;
    } else if (this.aliens + this.escaped === this.level * 20) {
      this.level++;
      this.remaining = this.level * 20;
    }
  }
}


class FixedQueue {
  constructor(n) {
    this.n = n;
    this.items = [];
  }

  push(i) {
    while(this.items.length >= this.n) {
      this.items.unshift();
    }

    this.items.push(i);
  }

  pop() {
    return this.items.pop();
  }
}

class Game {
  constructor(width, height, controlledSprite, gameState, renderExtra) {
    this.frequency = 1; // ms
    this.pixelHeight = 5;
    this.pixelWidth = 5;
    this.sprites = [controlledSprite];
    this.keyEvents = new FixedQueue(10);
    this.count = 0;

    this.width = width;
    this.height = height;
    this.controlledSprite = controlledSprite;
    this.gameState = gameState;
    this.renderExtra = renderExtra;
  }

  init() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvasContext = this.canvas.getContext("2d");
    document.body.appendChild(this.canvas);
    document.body.style.textAlign = 'center';
    document.body.onkeydown = (e) => {
      this.keyEvents.push(e);
    }
  }

  reset() {
    this.canvasContext.fillStyle = '#ddddee';
    this.canvasContext.fillRect(0, 0, this.width, this.height);
  }

  input() {
    const e = this.keyEvents.pop();
    if (!e) {
      return;
    }

    switch (e.code) {
      case 'ArrowRight':
	this.controlledSprite.offset.x += 5;
	break;
      case 'ArrowLeft':
	this.controlledSprite.offset.x -= 5;
	break;
      case 'ArrowDown':
	this.controlledSprite.offset.y += 5;
	break;
      case 'ArrowUp':
	this.controlledSprite.offset.y -= 5;
	break;
      case 'Space':
	const bullet = new BulletSprite();
	const rightBoundary = this.controlledSprite.getRightBoundary();
	bullet.offset.x = rightBoundary.x + this.controlledSprite.offset.x + 1;
	bullet.offset.y = rightBoundary.y + this.controlledSprite.offset.y;
	this.sprites.push(bullet);
	break;
    }
  }

  getIntersections(sprite) {
    const left = sprite.getLeftBoundary();
    const right = sprite.getRightBoundary();
    const top = sprite.getTopBoundary();
    const bottom = sprite.getBottomBoundary();

    return this.sprites.map((other, j) => {
      if (other === sprite) {
	return null;
      }

      const otherLeft = other.getLeftBoundary();
      const otherRight = other.getRightBoundary();
      const otherTop = other.getTopBoundary();
      const otherBottom = other.getBottomBoundary();

      const x1 = (left.x + sprite.offset.x) * this.pixelWidth;
      const x2 = (right.x + sprite.offset.x) * this.pixelWidth + this.pixelWidth;
      const x3 = (otherLeft.x + other.offset.x) * this.pixelWidth;
      const x4 = (otherRight.x + other.offset.x) * this.pixelWidth + this.pixelWidth;

      const y1 = (left.y + sprite.offset.y) * this.pixelHeight;
      const y2 = (right.y + sprite.offset.y) * this.pixelHeight + this.pixelHeight;
      const y3 = (otherLeft.y + other.offset.y) * this.pixelHeight;
      const y4 = (otherRight.y + other.offset.y) * this.pixelHeight + this.pixelHeight;

      if (((x1 <= x3 && x3 <= x2) || (x3 <= x1 && x1 <= x4)) &&
	  ((y1 <= y3 && y3 <= y2) || (y3 <= y1 && y1 <= y4))) {
	return other;
      }

      return null;
    }).filter(Boolean);
  }

  render() {
    this.reset();

    this.sprites.forEach((sprite) => {
      sprite.pixels.forEach((pixel) => {
	this.canvasContext.fillStyle = pixel.fillStyle;
	const x = sprite.offset.x + pixel.x;
	const y = sprite.offset.y + pixel.y;
	this.canvasContext.fillRect(x * this.pixelWidth, y * this.pixelHeight, this.pixelWidth, this.pixelHeight);
      });
    });

    this.renderExtra.call(this);
  }

  loop() {
    if (!this.gameState.running) {
      return;
    }

    this.input();
    this.gameState.calc(this, this.count++);
    this.render();
    setTimeout(() => this.loop(), this.frequency);
  }
}

function renderScore() {
  const width = 850;
  const height = 50;

  this.canvasContext.fillStyle = 'black';
  this.canvasContext.fillRect(this.width / 2 - width / 2, 0, width, height);

  this.canvasContext.fillStyle = 'white';
  this.canvasContext.font = '16px Arial';
  this.canvasContext.fillText('Level: ' + this.gameState.level, this.width / 2 - width / 2 + 100, height / 2 + 5);
  this.canvasContext.fillText('Killed: ' + this.gameState.aliens, this.width / 2 - width / 2 + 250, height / 2 + 5);
  this.canvasContext.fillText('Escaped: ' + this.gameState.escaped, this.width / 2 - width / 2 + 400, height / 2 + 5);
  this.canvasContext.fillText('Remaining: ' + this.gameState.remaining, this.width / 2 - width / 2 + 550, height / 2 + 5);
  this.canvasContext.fillText('Score: ' + (this.gameState.aliens - this.gameState.escaped), this.width / 2 - width / 2 + 700, height / 2 + 5);
}

function init() {
  document.body.style.margin = '0';
  const gameState = new GameState();
  const game = new Game(
    document.body.offsetWidth,
    document.body.offsetHeight,
    new ManSprite(),
    gameState,
    renderScore);
  game.init();
  game.loop();
}

window.onload = init;
