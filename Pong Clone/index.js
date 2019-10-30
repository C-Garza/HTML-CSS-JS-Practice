window.onload = function() {
  let animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) {window.setTimeout(callback, 1000/60)};
  let gameMenu = document.querySelector(".game-menu");
  let viewportHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  let windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  let keysDown = [];
  let playerOneKeysDown = [];
  let playerTwoKeysDown = [];
  let isKeyDown = false;
  let isPlayerOneKeyDown = false;
  let isPlayerTwoKeyDown = false;
  let isMenuOpen = false;

  ////GAME VARIABLES
  let BALL_SPEED_X = -6;
  let BALL_SPEED_Y = 0;
  let BALL_DEACCELERATION = 1;
  let PADDLE_SPEED_Y = 10;
  let IS_COMP = false;
  let COMP_PADDLE_SPEED_Y = 5;
  let COMP_PADDLE_SPEED_Y_MULTIPLYER = 1.6;
  let COMP_PADDLE_SPEED_Y_CHALLENGE = COMP_PADDLE_SPEED_Y * COMP_PADDLE_SPEED_Y_MULTIPLYER;
  let COMP_CHALLENGE = false;
  let COMP_CHALLENGE_ENABLED = true;
  let REALISTIC_PADDLE = false;
  let FINAL_SCORE = 5;
  let GAME_ROUND_END = false;
  let GAME_IN_PROGRESS = false;
  let GAME_FINISH = false;
  let HAS_SOUND = true;
  if(BALL_DEACCELERATION <= 0) {
    BALL_DEACCELERATION = 1;
  }

  ////HANDLE RESET TO DEFAULT
  let gameOptions = document.querySelector(".game-menu-options");
  let gameOptionsAdvanced = document.querySelector(".game-menu-advanced-options");
  let gameMenuReset = document.querySelector(".game-menu-reset");
  let cloneOne = gameOptions.cloneNode(true);
  let cloneTwo = gameOptionsAdvanced.cloneNode(true);
  function resetToDefault() {
    BALL_SPEED_X = -6;
    BALL_SPEED_Y = 0;
    BALL_DEACCELERATION = 1;
    PADDLE_SPEED_Y = 10;
    COMP_PADDLE_SPEED_Y = 5;
    COMP_PADDLE_SPEED_Y_MULTIPLYER = 1.6;
    HAS_SOUND = true;
    REALISTIC_PADDLE = false;
    COMP_CHALLENGE_ENABLED = true;
    FINAL_SCORE = 5;
  }
  ////GAME SOUNDS
  let pong_hit = new Audio("pong_hit.mp3");
  let pong_hit_two = new Audio("pong_hit_two.mp3");
  let pong_plop = new Audio("pong_plop.mp3");
  let pong_point = new Audio("pong_point.mp3");

  ////PADDLE OBJECT
  let Paddle = {
    init: function init(whichSide) {
      return {
        width: 10,
        height: 80,
        x: whichSide === "left" ? 75 : this.canvas.width - 75,
        y: (this.canvas.height / 2) - 40,
        x_speed: 0,
        y_speed: 0,
        score: 0
      };
    }
  };
  ////BALL OBJECT
  let Ball = {
    init: function init() {
      return {
        width: 10,
        height: 10,
        x: (this.canvas.width / 2) - 5,
        y: (this.canvas.height / 2) - 5,
        x_speed: BALL_SPEED_X,
        y_speed: BALL_SPEED_Y
      };
    }
  };
  ////GAME OBJECT AND LOGIC
  let Game = {
    ////INSTANTIATE OBJECTS AND BOARD
    init: function init() {
      this.canvas = document.getElementById("game-board");
      this.context = this.canvas.getContext("2d");

      this.canvas.width = windowWidth;
      this.canvas.height = viewportHeight;

      this.playerOne = Paddle.init.call(this, "left");
      this.playerTwo = Paddle.init.call(this);
      this.ball = Ball.init.call(this);

      COMP_CHALLENGE = false;

      ////IF GAME HAS BEGUN
      this.isRunning = false;
      ////CONTROL FPS (60FPS)
      this.fps = 1000 / 60;
      this.then = Date.now();
      Game.draw();
    },
    ////DRAW NEW FRAME
    draw: function draw() {
      this.context.save();
			this.context.setTransform(1,0,0,1,0,0);
      this.context.clearRect(0 , 0, this.canvas.width, this.canvas.height);

      this.context.fillStyle = "black";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.context.fillStyle = "white";
      this.render(this.playerOne);
      this.render(this.playerTwo);
      if(this.isRunning) {
        this.render(this.ball);
      }

      this.menu();
      this.context.restore();
    },
    ////GAME LOOP
    loop: function loop() {
      Game.winMenu();
      if(Game.isRunning) {
        let now = Date.now();
        let elapsed = now - Game.then;
        animate(Game.loop);
        if(elapsed > Game.fps) {
          Game.then = now - (elapsed % Game.fps);
          Game.update();
          Game.draw();
        }
      }
    },
    ////RENDER MAIN AND SCORE MENU
    menu: function menu() {
      this.context.font = "2em Lobster";
      this.context.textAlign = "center";

      if(!this.isRunning) {
        this.context.fillText("Press arrow key to begin", this.canvas.width / 2, this.canvas.height / 2);
        this.context.fillText("or press W/S for 2P", this.canvas.width / 2, this.canvas.height / 1.6);
        this.context.font = "1.5em Lobster";
        this.context.fillText("Press P for Options", this.canvas.width / 2, this.canvas.height / 1.1);
      }
      this.context.font = "2.3em Comfortaa";
      this.context.fillText(this.playerOne.score, this.canvas.width / 3.5, this.canvas.height / 5);
      this.context.fillText(this.playerTwo.score, this.canvas.width / 1.4, this.canvas.height / 5);

      this.context.font = "1.8em Comfortaa";
      this.context.fillText(FINAL_SCORE, this.canvas.width / 2, this.canvas.height / 10);

      if(GAME_ROUND_END && (FINAL_SCORE !== this.playerOne.score && FINAL_SCORE !== this.playerTwo.score)) {
        this.nextTurn();
      }
    },
    ////RENDER NEXT TURN RESET
    nextTurn: function nextTurn() {
      this.context.font = "2.5em Lobster";
      this.context.textAlign = "center";
      this.context.fillText("Ready?", this.canvas.width / 2, this.canvas.height / 2.5);
    },
    ////RENDER GAME OBJECTS
    render: function render(gameObject) {
      this.context.fillRect(gameObject.x, gameObject.y, gameObject.width, gameObject.height);
    },
    ////UPDATE GAME LOGIC
    update: function update() {
      this.ball.x += this.ball.x_speed;
      this.ball.y += this.ball.y_speed;
      ////PLAYER ONE PADDLE COLLISIONS
      if((this.ball.x <= this.playerOne.x + this.playerOne.width) && 
          (this.ball.x >= this.playerOne.x) &&
          (this.ball.y <= this.playerOne.y + this.playerOne.height) &&
          (this.ball.y + this.ball.height >= this.playerOne.y)
        ) {
        this.ball.x_speed = BALL_SPEED_X >= 0 ? BALL_SPEED_X : -BALL_SPEED_X;
        this.ball.x += this.ball.x_speed;
        if((this.ball.y_speed - this.playerOne.y_speed / 2) <= 1 && (this.ball.y_speed - this.playerOne.y_speed / 2) >= -1) {
          this.ball.y_speed -= this.playerOne.y_speed;
        }
        else {
          this.ball.y_speed -= (this.playerOne.y_speed / 2);
        }
        if(HAS_SOUND) {
          pong_hit.play();
        }
      }
      ////PLAYER TWO PADDLE COLLISIONS
      if((this.ball.x + this.ball.width >= this.playerTwo.x) && 
          (this.ball.x <= this.playerTwo.x) &&
          (this.ball.y <= this.playerTwo.y + this.playerTwo.height) && 
          (this.ball.y + this.ball.height >= this.playerTwo.y)
        ) {
        this.ball.x_speed = BALL_SPEED_X >= 0 ? -BALL_SPEED_X : BALL_SPEED_X;
        this.ball.x += this.ball.x_speed;
        if((this.ball.y_speed - this.playerTwo.y_speed / 2) <= 1  && (this.ball.y_speed - this.playerTwo.y_speed / 2) >= -1) {
          this.ball.y_speed -= this.playerTwo.y_speed;
        }
        else {
          this.ball.y_speed -= (this.playerTwo.y_speed / 2);
        }
        if(HAS_SOUND) {
          pong_hit_two.play();
        }
      }
      ////BALL COLLISION WITH TOP WALL
      if(this.ball.y <= 0) {
        this.ball.y_speed = -(this.ball.y_speed  / BALL_DEACCELERATION);
        this.ball.y += this.ball.y_speed;
        if(HAS_SOUND) {
          pong_plop.play();
        }
      }
      ////BALL COLLISION WITH BOTTOM WALL
      if(this.ball.y + this.ball.height >= this.canvas.height) {
        this.ball.y_speed = -(this.ball.y_speed / BALL_DEACCELERATION);
        this.ball.y += this.ball.y_speed;
        if(HAS_SOUND) {
          pong_plop.play();
        }
      }
      ////IF BALL GOES ABOVE CANVAS HEIGHT
      if(this.ball.y <= -1) {
        this.ball.y = 0 + this.ball.height;
      }
      ////IF BALL GOES BELOW CANVAS HEIGHT
      if(this.ball.y >= this.canvas.height + 1) {
        this.ball.y = this.canvas.height - this.ball.height;
      }
      ////HANDLE PLAYER ONE SCORE
      if(this.ball.x >= this.canvas.width) {
        this.playerOne.score += 1;
        GAME_ROUND_END = true;
        window.setTimeout(() => {
          this.ball = this.playerOne.score === FINAL_SCORE ? this.ball : Ball.init.call(this);
          this.ball.x_speed = BALL_SPEED_X >= 0 ? BALL_SPEED_X : -BALL_SPEED_X;
          GAME_ROUND_END = false;
        }, 1000);
        if(HAS_SOUND) {
          pong_point.play();
        }
      }
      ////HANDLE PLAYER TWO SCORE
      if(this.ball.x <= 0) {
        this.playerTwo.score += 1;
        GAME_ROUND_END = true;
        window.setTimeout(() => {
          this.ball = this.playerOne.score === FINAL_SCORE ? this.ball : Ball.init.call(this);
          this.ball.x_speed = BALL_SPEED_X >= 0 ? -BALL_SPEED_X : BALL_SPEED_X;
          GAME_ROUND_END = false;
        }, 1000);
        if(HAS_SOUND) {
          pong_point.play();
        }
      }
      ////PLAYER ONE MOVEMENT
      if(isKeyDown || isPlayerOneKeyDown) {
        this.playerOne.y -= this.playerOne.y_speed;
      }
      ////PLAYER TWO MOVEMENT
      if(isKeyDown || isPlayerTwoKeyDown) {
        this.playerTwo.y -= this.playerTwo.y_speed;
      }
      ////COMPUTER AI MOVEMENT
      if(IS_COMP) {
        if(FINAL_SCORE / 2 <= this.playerOne.score && !COMP_CHALLENGE && COMP_CHALLENGE_ENABLED) {
          COMP_CHALLENGE = true;
          COMP_PADDLE_SPEED_Y_CHALLENGE = COMP_PADDLE_SPEED_Y * COMP_PADDLE_SPEED_Y_MULTIPLYER;
        }
        if((this.playerTwo.y + this.playerTwo.height / 2) < (this.ball.y + this.ball.height / 2)) {
          if(COMP_CHALLENGE && COMP_CHALLENGE_ENABLED) {
            this.playerTwo.y += COMP_PADDLE_SPEED_Y_CHALLENGE;
          }
          else {
            this.playerTwo.y += COMP_PADDLE_SPEED_Y;
          }
        }
        if((this.playerTwo.y + this.playerTwo.height / 2) > (this.ball.y + this.ball.height / 2)) {
          if(COMP_CHALLENGE && COMP_CHALLENGE_ENABLED) {
            this.playerTwo.y -= COMP_PADDLE_SPEED_Y_CHALLENGE;
          }
          else {
            this.playerTwo.y -= COMP_PADDLE_SPEED_Y;
          }
        }
      }
      ////PLAYER ONE COLLISION WITH TOP WALL
      if(this.playerOne.y <= 0) {
        this.playerOne.y = 0;
      }
      ////PLAYER ONE COLLISION WITH BOTTOM WALL
      if(this.playerOne.y + this.playerOne.height >= this.canvas.height) {
        this.playerOne.y = this.canvas.height - this.playerOne.height;
      }
      ////PLAYER TWO COLLISION WITH TOP WALL
      if(this.playerTwo.y <= 0) {
        this.playerTwo.y = 0;
      }
      ////PLAYER TWO COLLISION WITH BOTTOM WALL
      if(this.playerTwo.y + this.playerTwo.height >= this.canvas.height) {
        this.playerTwo.y = this.canvas.height - this.playerTwo.height;
      }
      ////RESET BALL WHEN POINT IS SCORED
      if(GAME_ROUND_END && (FINAL_SCORE !== this.playerOne.score && FINAL_SCORE !== this.playerTwo.score)) {
        this.ball.x = (this.canvas.width / 2) - 5;
        this.ball.y = (this.canvas.height / 2) -5;
        this.ball.x_speed = 0;
        this.ball.y_speed = 0;
      }
    },
    ////RENDER WIN MENU
    winMenu: function winMenu() {
      if(GAME_FINISH) {
        Game.isRunning = false;
        GAME_IN_PROGRESS = false;
        return;
      }
      let whoWon = null;
      if(this.playerOne.score === FINAL_SCORE) {
        whoWon = "ONE";
      }
      if(this.playerTwo.score === FINAL_SCORE) {
        whoWon = "Two";
      }
      if(whoWon) {
        this.context.font = "2.5em Lobster";
        this.context.textAlign = "center";
        this.context.fillText("Player " + whoWon + " Wins!", this.canvas.width / 2, this.canvas.height / 2);

        this.context.font = "1.5em Lobster";
        this.context.textAlign = "center";
        this.context.fillText("Press spacebar to play again!", this.canvas.width / 2, this.canvas.height / 1.5);
        if(COMP_CHALLENGE) {
          COMP_CHALLENGE = false;
        }
        Game.isRunning = false;
        GAME_IN_PROGRESS = false;
        GAME_FINISH = true;
      }
    }
  };

  ////INSTANTIATE GAME AND START
  Game.init();
  Game.draw();
  document.querySelector("body").removeChild(document.getElementById("font-preload"));

  ////LISTEN FOR PLAYER CONTROLS
  window.addEventListener("keydown", function(e) {
    ////TOGGLE PAUSE MENU
    if(e.keyCode === 80 || e.keyCode === 27) {
      gameMenu.classList.toggle("hidden");
      isMenuOpen = isMenuOpen ? false : true;
      if(GAME_IN_PROGRESS) {
        if(isMenuOpen) {
          Game.isRunning = false;
        }
        else {
          Game.isRunning = true;
          animate(Game.loop);
        }
      }
    }
    if(isMenuOpen) {
      return;
    }
    ////RESTART GAME WHEN FINISHED
    if(e.keyCode === 32 && GAME_FINISH) {
      GAME_FINISH = false;
      Game.init();
      Game.draw();
    }
    ////START GAME WITH ARROW KEYS OR WASD
    if((e.keyCode === 87 || e.keyCode === 38 || e.keyCode === 83 || e.keyCode === 40) && !Game.isRunning) {
      if(e.keyCode === 38 || e.keyCode === 40) {
        IS_COMP = true;
      }
      else {
        IS_COMP = false;
      }
      GAME_IN_PROGRESS = true;
      Game.isRunning = true;
      animate(Game.loop);
    }
    ////HANDLE UP ARROW AND W KEY
    if(e.keyCode === 87 || e.keyCode === 38) {
      ////PLAYER ONE VS COMP
      if(IS_COMP) {
        ////PREVENT HELD KEYDOWN SPAM
        if(keysDown.length && (keysDown[keysDown.length - 1].key === e.keyCode)) {
          return;
        }
        keysDown.push({key: e.keyCode, speed: PADDLE_SPEED_Y >= 0 ? PADDLE_SPEED_Y : -PADDLE_SPEED_Y});
        isKeyDown = true;
        Game.playerOne.y_speed = keysDown[keysDown.length - 1].speed;
      }
      ////PLAYER ONE W KEY
      else if(e.keyCode === 87) {
        if(playerOneKeysDown.length && (playerOneKeysDown[playerOneKeysDown.length - 1].key === e.keyCode)) {
          return;
        }
        playerOneKeysDown.push({key: e.keyCode, speed: PADDLE_SPEED_Y >= 0 ? PADDLE_SPEED_Y : -PADDLE_SPEED_Y});
        isPlayerOneKeyDown = true;
        Game.playerOne.y_speed = playerOneKeysDown[playerOneKeysDown.length - 1].speed;
      }
      ////PLAYER TWO UP ARROW KEY
      else if(e.keyCode === 38) {
        if(playerTwoKeysDown.length && (playerTwoKeysDown[playerTwoKeysDown.length - 1].key === e.keyCode)) {
          return;
        }
        playerTwoKeysDown.push({key: e.keyCode, speed: PADDLE_SPEED_Y >= 0 ? PADDLE_SPEED_Y : -PADDLE_SPEED_Y});
        isPlayerTwoKeyDown = true;
        Game.playerTwo.y_speed = playerTwoKeysDown[playerTwoKeysDown.length - 1].speed;
      }
    }
    ////HANDLE DOWN ARROW AND S KEY
    if(e.keyCode === 83 || e.keyCode === 40) {
      ////PLAYER VS COMP
      if(IS_COMP) {
        ////PREVENT HELD KEYDOWN SPAM
        if(keysDown.length && (keysDown[keysDown.length - 1].key === e.keyCode)) {
          return;
        }
        keysDown.push({key: e.keyCode, speed: PADDLE_SPEED_Y >= 0 ? -PADDLE_SPEED_Y : PADDLE_SPEED_Y});
        isKeyDown = true;
        Game.playerOne.y_speed = keysDown[keysDown.length - 1].speed;
      }
      ////PLAYER ONE S KEY
      else if(e.keyCode === 83) {
        if(playerOneKeysDown.length && (playerOneKeysDown[playerOneKeysDown.length - 1].key === e.keyCode)) {
          return;
        }
        playerOneKeysDown.push({key: e.keyCode, speed: PADDLE_SPEED_Y >= 0 ? -PADDLE_SPEED_Y : PADDLE_SPEED_Y});
        isPlayerOneKeyDown = true;
        Game.playerOne.y_speed = playerOneKeysDown[playerOneKeysDown.length - 1].speed;
      }
      ////PLAYER TWO DOWN ARROW KEY
      else if(e.keyCode === 40) {
        if(playerTwoKeysDown.length && (playerTwoKeysDown[playerTwoKeysDown.length - 1].key === e.keyCode)) {
          return;
        }
        playerTwoKeysDown.push({key: e.keyCode, speed: PADDLE_SPEED_Y >= 0 ? -PADDLE_SPEED_Y : PADDLE_SPEED_Y});
        isPlayerTwoKeyDown = true;
        Game.playerTwo.y_speed = playerTwoKeysDown[playerTwoKeysDown.length - 1].speed;
      }
    }
  });
  ////LISTEN FOR LET GO PLAYER CONTROLS
  window.addEventListener("keyup", function(e) {
    ////PLAYER VS COMP
    if(keysDown.length && (e.keyCode === 87 || e.keyCode === 38 || e.keyCode === 83 || e.keyCode === 40)) {
      keysDown = keysDown.filter(key => {
        return key.key !== e.keyCode;
      });
      if(keysDown.length) {
        Game.playerOne.y_speed = keysDown[keysDown.length - 1].speed;
        return;
      }
      isKeyDown = false;
      ////MAKE PADDLE PHYSICS MORE REALISTIC BY NOT HAVING Y MOMENTUM WHEN STAYING STILL
      if(REALISTIC_PADDLE) {
        Game.playerOne.y_speed = 0;
      }
    }
    ////PLAYER ONE
    if(playerOneKeysDown && (e.keyCode === 87 || e.keyCode === 83)) {
      playerOneKeysDown = playerOneKeysDown.filter(key => {
        return key.key !== e.keyCode;
      });
      if(playerOneKeysDown.length) {
        Game.playerOne.y_speed = playerOneKeysDown[playerOneKeysDown.length - 1].speed;
        return;
      }
      isPlayerOneKeyDown = false;
      ////MAKE PADDLE PHYSICS MORE REALISTIC BY NOT HAVING Y MOMENTUM WHEN STAYING STILL
      if(REALISTIC_PADDLE) {
        Game.playerOne.y_speed = 0;
      }
    }
    ////PLAYER TWO
    if(playerTwoKeysDown && (e.keyCode === 38 || e.keyCode === 40)) {
      playerTwoKeysDown = playerTwoKeysDown.filter(key => {
        return key.key !== e.keyCode;
      });
      if(playerTwoKeysDown.length) {
        Game.playerTwo.y_speed = playerTwoKeysDown[playerTwoKeysDown.length - 1].speed;
        return;
      }
      isPlayerTwoKeyDown = false;
      ////MAKE PADDLE PHYSICS MORE REALISTIC BY NOT HAVING Y MOMENTUM WHEN STAYING STILL
      if(REALISTIC_PADDLE) {
        Game.playerTwo.y_speed = 0;
      }
    }
  });
  ////HANDLE CLICK EVENTS IN GAME MENU
  gameMenu.addEventListener("click", function(e) {
    let gameOptionItem = e.target.closest(".game-menu-options-item");
    let gameOptionAdvancedItem = e.target.closest(".game-menu-advanced-options-item");
    let resetDefault = e.target.closest(".game-menu-reset-default");
    ////RESET TO DEFAULT MENU OPTIONS
    if(resetDefault) {
      resetToDefault();
      gameMenu.removeChild(gameOptions);
      gameMenu.removeChild(gameOptionsAdvanced);
      gameMenu.insertBefore(cloneTwo, gameMenuReset);
      gameOptionsAdvanced = document.querySelector(".game-menu-advanced-options");
      gameMenu.insertBefore(cloneOne, gameOptionsAdvanced);
      ////GRAB NEW DOM ELEMENTS
      gameOptions = document.querySelector(".game-menu-options");
      gameOptionsAdvanced = document.querySelector(".game-menu-advanced-options");
      gameMenuReset = document.querySelector(".game-menu-reset");
      cloneOne = gameOptions.cloneNode(true);
      cloneTwo = gameOptionsAdvanced.cloneNode(true);
      GAME_IN_PROGRESS = false;
      GAME_FINISH = false;
      Game.init();
    }
    ////GAME OPTIONS
    if(gameOptionItem) {
      let gameOption = gameOptionItem.children[1];
      let gameOptionID = gameOptionItem.children[1].id;
      gameOptionID = gameOptionID.split("-").pop();
      switch (gameOptionID) {
        case "sound":
          if(gameOption.classList.contains("game-menu-options-item-box__active")) {
            HAS_SOUND = false;
          }
          else {
            HAS_SOUND = true;
          }
          gameOption.classList.toggle("game-menu-options-item-box__active");
          break;
        case "physics":
          if(gameOption.classList.contains("game-menu-options-item-box__active")) {
            REALISTIC_PADDLE = false;
          }
          else {
            REALISTIC_PADDLE = true;
          }
          gameOption.classList.toggle("game-menu-options-item-box__active");
          break;
        case "challenge":
          if(gameOption.classList.contains("game-menu-options-item-box__active")) {
            COMP_CHALLENGE_ENABLED = false;
          }
          else {
            COMP_CHALLENGE_ENABLED = true;
          }
          gameOption.classList.toggle("game-menu-options-item-box__active");
          break;
        case "score":
          let userValue = parseInt(gameOption.children[0].value, 10);
          if(isNaN(userValue)) {
            return;
          }
          if(FINAL_SCORE !== userValue) {
            if(userValue <= 0) {
              FINAL_SCORE = 1;
            }
            else {
              FINAL_SCORE = userValue;
            }
            GAME_IN_PROGRESS = false;
            GAME_FINISH = false;
            Game.init();
          }
          break;
        default:
          break;
      }
    }
    ////ADVANCED GAME OPTIONS
    if(gameOptionAdvancedItem) {
      let gameOption = gameOptionAdvancedItem.children[1];
      let gameOptionID = gameOptionAdvancedItem.children[1].id;
      let userValue = parseInt(gameOption.children[0].value, 10);
      gameOptionID = gameOptionID.split("-").splice(4).join("-");
      if(isNaN(userValue)) {
        return;
      }
      switch (gameOptionID) {
        case "ball-speed-x":
          if(BALL_SPEED_X !== userValue) {
            BALL_SPEED_X = userValue;
            Game.ball.x_speed = BALL_SPEED_X;
          }
          break;
        case "ball-speed-y":
          if(BALL_SPEED_Y !== userValue) {
            BALL_SPEED_Y = userValue;
            Game.ball.y_speed = BALL_SPEED_Y;
          }
          break;
        case "ball-decel":
          if(BALL_DEACCELERATION !== userValue && userValue >= 0) {
            BALL_DEACCELERATION = userValue;
          }
          break;
        case "paddle-speed":
          if(PADDLE_SPEED_Y !== userValue) {
            PADDLE_SPEED_Y = userValue;
          }
          break;
        case "comp-paddle-speed":
          if(COMP_PADDLE_SPEED_Y !== userValue) {
            COMP_PADDLE_SPEED_Y = userValue;
            if(COMP_CHALLENGE) {
              COMP_PADDLE_SPEED_Y_CHALLENGE = COMP_PADDLE_SPEED_Y * COMP_PADDLE_SPEED_Y_MULTIPLYER;
            }
          }
          break;
        case "comp-paddle-multi":
          if(COMP_PADDLE_SPEED_Y_MULTIPLYER !== userValue) {
            COMP_PADDLE_SPEED_Y_MULTIPLYER = userValue;
            if(COMP_CHALLENGE) {
              COMP_PADDLE_SPEED_Y_CHALLENGE = COMP_PADDLE_SPEED_Y * COMP_PADDLE_SPEED_Y_MULTIPLYER;
            }
          }
          break;
        default:
          break;
      }
    }
  });
  ////HANDLE KEY EVENTS IN GAME MENU
  gameMenu.addEventListener("keyup", function(e) {
    let gameOptionItem = e.target.closest(".game-menu-options-item");
    let gameOptionAdvancedItem = e.target.closest(".game-menu-advanced-options-item");
    ////GAME OPTIONS
    if(gameOptionItem) {
      let gameOption = gameOptionItem.children[1];
      let gameOptionID = gameOptionItem.children[1].id;
      gameOptionID = gameOptionID.split("-").pop();
      switch (gameOptionID) {
        case "sound":
          if(e.keyCode === 13 || e.keyCode === 32) {
            if(gameOption.classList.contains("game-menu-options-item-box__active")) {
              HAS_SOUND = false;
            }
            else {
              HAS_SOUND = true;
            }
            gameOption.classList.toggle("game-menu-options-item-box__active");
          }
          break;
        case "physics":
          if(e.keyCode === 13 || e.keyCode === 32) {
            if(gameOption.classList.contains("game-menu-options-item-box__active")) {
              REALISTIC_PADDLE = false;
            }
            else {
              REALISTIC_PADDLE = true;
            }
            gameOption.classList.toggle("game-menu-options-item-box__active");
          }
          break;
        case "challenge":
          if(e.keyCode === 13 || e.keyCode === 32) {
            if(gameOption.classList.contains("game-menu-options-item-box__active")) {
              COMP_CHALLENGE_ENABLED = false;
            }
            else {
              COMP_CHALLENGE_ENABLED = true;
            }
            gameOption.classList.toggle("game-menu-options-item-box__active");
          }
          break;
        case "score":
          let userValue = parseInt(gameOption.children[0].value, 10);
          if(isNaN(userValue)) {
            return;
          }
          if(FINAL_SCORE !== userValue) {
            if(userValue <= 0) {
              FINAL_SCORE = 1;
            }
            else {
              FINAL_SCORE = userValue;
            }
            GAME_IN_PROGRESS = false;
            GAME_FINISH = false;
            Game.init();
          }
          break;
        default:
          break;
      }
    }
    ////ADVANCED GAME OPTIONS
    if(gameOptionAdvancedItem) {
      let gameOption = gameOptionAdvancedItem.children[1];
      let gameOptionID = gameOptionAdvancedItem.children[1].id;
      let userValue = parseInt(gameOption.children[0].value, 10);
      gameOptionID = gameOptionID.split("-").splice(4).join("-");
      if(isNaN(userValue)) {
        return;
      }
      switch (gameOptionID) {
        case "ball-speed-x":
          if(BALL_SPEED_X !== userValue) {
            BALL_SPEED_X = userValue;
            Game.ball.x_speed = BALL_SPEED_X;
          }
          break;
        case "ball-speed-y":
          if(BALL_SPEED_Y !== userValue) {
            BALL_SPEED_Y = userValue;
            Game.ball.y_speed = BALL_SPEED_Y;
          }
          break;
        case "ball-decel":
          if(BALL_DEACCELERATION !== userValue && userValue >= 0) {
            BALL_DEACCELERATION = userValue;
          }
          break;
        case "paddle-speed":
          if(PADDLE_SPEED_Y !== userValue) {
            PADDLE_SPEED_Y = userValue;
          }
          break;
        case "comp-paddle-speed":
          if(COMP_PADDLE_SPEED_Y !== userValue) {
            COMP_PADDLE_SPEED_Y = userValue;
            if(COMP_CHALLENGE) {
              COMP_PADDLE_SPEED_Y_CHALLENGE = COMP_PADDLE_SPEED_Y * COMP_PADDLE_SPEED_Y_MULTIPLYER;
            }
          }
          break;
        case "comp-paddle-multi":
          if(COMP_PADDLE_SPEED_Y_MULTIPLYER !== userValue) {
            COMP_PADDLE_SPEED_Y_MULTIPLYER = userValue;
            if(COMP_CHALLENGE) {
              COMP_PADDLE_SPEED_Y_CHALLENGE = COMP_PADDLE_SPEED_Y * COMP_PADDLE_SPEED_Y_MULTIPLYER;
            }
          }
          break;
        default:
          break;
      }
    }
  });
  ////RESIZE CANVAS IF VIEW CHANGES
  window.addEventListener("resize", function(e) {
    viewportHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    Game.canvas.width = windowWidth;
    Game.canvas.height = viewportHeight;
    Game.playerOne.x = 75;
    Game.playerTwo.x = Game.canvas.width - 75;
    if(!Game.isRunning) {
      Game.playerOne.y = (Game.canvas.height / 2) - 40;
      Game.playerTwo.y = (Game.canvas.height / 2) - 40;
      Game.ball = Ball.init.call(Game);
      Game.draw();
    }
  });
};