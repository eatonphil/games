'use strict';

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
  }

  calc(intersections, counter) {
    for (let i = 0; i < intersections.length; i++) {
      const sprite = intersections[i];
      if (sprite instanceof AlienSprite) {
	return 'delete';
      }
    }

    if (counter) {
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

    this.slowdown = 1000;
    this.goal = { x: 0, y: 0 };
  }

  calc(intersections, counter) {
    if (counter % this.slowdown === 0) {
      if (this.goal.x !== 0) {
	this.offset.x += this.goal.x;
	this.goal.x += this.goal.x < 0 ? 1 : -1;
      }

      if (this.goal.y !== 0) {
	this.offset.y += this.goal.y;
	this.goal.y += this.goal.y < 0 ? 1 : -1;
      }
    }
  }
}

class Controller {
  constructor(sprite) {
    this.controlledSprite = sprite;
  }

  handle(game, e) {
    const delta = Math.floor(Math.random() * 5);
    switch (e.code) {
      case 'ArrowRight':
	this.controlledSprite.goal.x += delta;
	break;
      case 'ArrowLeft':
	this.controlledSprite.goal.x -= delta;
	break;
      case 'ArrowDown':
	this.controlledSprite.goal.y += delta;
	break;
      case 'ArrowUp':
	this.controlledSprite.goal.y -= delta;
	break;
      case 'Space':
	const bullet = new BulletSprite();
	const rightBoundary = this.controlledSprite.getRightBoundary();
	bullet.offset.x = rightBoundary.x + this.controlledSprite.offset.x + 1;
	bullet.offset.y = rightBoundary.y + this.controlledSprite.offset.y;
	game.sprites.push(bullet);
	break;
    }
  }
}

class GameState {
  constructor() {
    this.aliens = 0;
    this.escaped = 0;
    this.remaining = 20;
    this.level = 1;
    this.running = true;
    this.score = 0;
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
	    this.score++;
	  }

	  return null;
	default:
	  if (sprite instanceof AlienSprite) {
	    if (sprite.offset.x * game.pixelWidth < 0) {
	      this.escaped++;
	      this.score--;
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
      // Rounded to the nearest 100
      alien.slowdown = Math.round(Math.floor(1000 / this.level) / 100) * 100;
      game.sprites.push(alien);
      this.remaining--;
    } else if (this.aliens + this.escaped === this.level * 20) {
      this.aliens = 0;
      this.escaped = 0;
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
  this.canvasContext.fillText('Score: ' + this.gameState.score, this.width / 2 - width / 2 + 700, height / 2 + 5);
}

function init() {
  document.body.style.margin = '0';
  const gameState = new GameState();
  const character = new ManSprite();
  const controller = new Controller(character);
  const game = new Game(
    document.body.offsetWidth,
    document.body.offsetHeight,
    gameState,
    controller,
    renderScore);
  game.init();
  game.sprites.push(character);
  game.loop();
}

window.onload = init;
