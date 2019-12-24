'use strict';

const X = 1;
const _ = 0;

class Sprite {
  constructor(pixels, fillStyle = 'blue') {
    this.pixels = pixels.reduce((all, row, y) =>
      [...all, ...row.map((value, x) => value === X ? { x, y, fillStyle } : undefined).filter(Boolean)], [])
    this.offset = { x: 0, y: 0 };
    this.speed = 1;
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
      [_, _, X, _, _],
      [X, X, X, X, X],
      [_, X, X, X, _],
    ], 'green');
  }

  calc(intersections) {
    for (let i = 0; i < intersections.length; i++) {
      const sprite = intersections[i];
      if (sprite instanceof BulletSprite) {
	return 'delete';
      }

      if (sprite instanceof ManSprite) {
	return 'gameover';
      }
    }

    if (Math.random() > .5) {
      this.offset.y += this.speed * (Math.random() - 0.5 > 0 ? 1 : -1);
    }
    this.offset.x -= this.speed;
  }
}

class BulletSprite extends Sprite {
  constructor() {
    super([[X]], 'red');
  }

  calc(intersections) {
    for (let i = 0; i < intersections.length; i++) {
      const sprite = intersections[i];
      if (sprite instanceof AlienSprite) {
	return 'delete';
      }
    }

    this.offset.x += this.speed;
  }
}

class ManSprite extends Sprite {
  constructor() {
    super([
      [_, _, X, _, _, _],
      [_, X, X, X, _, _],
      [_, _, X, _, _, _],
      [X, X, X, X, _, _],
      [_, X, X, X, X, X],
      [_, _, X, _, _, _],
      [_, X, _, X, _, _],
      [_, X, _, X, _, _],
    ]);

    this.speed = 2;
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
  constructor(width, height, controlledSprite) {
    this.running = true;
    this.frequency = 100; // ms
    this.pixelHeight = 10;
    this.pixelWidth = 10;
    this.sprites = [controlledSprite];
    this.keyEvents = new FixedQueue(10);
    this.controlledSprite = controlledSprite;

    this.width = width;
    this.height = height;
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
    this.canvasContext.fillStyle = 'black';
    this.canvasContext.fillRect(0, 0, this.width, this.height);
  }

  input() {
    const e = this.keyEvents.pop();
    if (!e) {
      return;
    }

    switch (e.code) {
      case 'ArrowRight':
	this.controlledSprite.offset.x += this.controlledSprite.speed;
	break;
      case 'ArrowLeft':
	this.controlledSprite.offset.x -= this.controlledSprite.speed;
	break;
      case 'ArrowDown':
	this.controlledSprite.offset.y += this.controlledSprite.speed;
	break;
      case 'ArrowUp':
	this.controlledSprite.offset.y -= this.controlledSprite.speed;
	break;
      case 'Space':
	const bullet = new BulletSprite();
	const rightBoundary = this.controlledSprite.getRightBoundary();
	bullet.offset.x = rightBoundary.x + this.controlledSprite.offset.x + this.controlledSprite.speed;
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

  calc() {
    const newSprites = this.sprites.map((sprite, i) => {
      const intersections = this.getIntersections(sprite);
      const action = sprite.calc(intersections);
      switch (action) {
	case 'gameover':
	  this.running = false;
	  return null;
	case 'delete':
	  return null;
	default:
	  return sprite;
      }
    }).filter(Boolean);

    // Reset it afterward so all calculations take place on sprites
    // as they were at the start of calculating.
    this.sprites = newSprites;

    // Add a new alien every so often
    if (Math.random() > .96) {
      const alien = new AlienSprite();
      alien.offset.x = (this.width / this.pixelWidth) - 10;
      alien.offset.y = Math.floor(Math.random() * (this.height / this.pixelHeight));
      this.sprites.push(alien);
    }
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
  }

  loop() {
    if (!this.running) {
      return;
    }

    this.input();
    this.calc();
    this.render();
    setTimeout(() => this.loop(), this.frequency);
  }
}

function init() {
  const game = new Game(800, 600, new ManSprite());
  game.init();
  game.loop();
}

window.onload = init;
