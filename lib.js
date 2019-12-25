'use strict';

class Game {
  constructor(width, height, gameState, controller, renderExtra) {
    this.frequency = 1; // ms
    this.pixelHeight = 10;
    this.pixelWidth = 10;
    this.sprites = [];
    this.keyEvents = new FixedQueue(10);
    this.count = 0;

    this.width = width;
    this.height = height;
    this.gameState = gameState;
    this.controller = controller;
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

    this.controller.handle(this, e);
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

      const y1 = (bottom.y + sprite.offset.y) * this.pixelHeight;
      const y2 = (top.y + sprite.offset.y) * this.pixelHeight + this.pixelHeight;
      const y3 = (otherBottom.y + other.offset.y) * this.pixelHeight;
      const y4 = (otherTop.y + other.offset.y) * this.pixelHeight + this.pixelHeight;

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
    this.gameState.calc(this, this.count += 50);
    this.render();
    setTimeout(() => this.loop(), this.frequency);
  }
}

class Sprite {
  constructor(pixels) {
    this.offset = { x: 0, y: 0 };
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
