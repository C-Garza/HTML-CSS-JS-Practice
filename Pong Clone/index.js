window.onload = function() {
  let animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) {window.setTimeout(callback, 1000/60)};
  ////GAME VARIABLES
  let BALL_SPEED_X = 0;
  let BALL_SPEED_Y = -3;

  ////PADDLE OBJECT
  let Paddle = {
    init: function init(whichSide) {
      return {
        width: 10,
        height: 80,
        x: whichSide === "left" ? 75 : this.canvas.width - 75,
        y: (this.canvas.height / 2) - 40,
        x_speed: 0,
        y_speed: 0
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
      this.canvas = document.getElementById("gameBoard");
      this.context = this.canvas.getContext("2d");

      this.canvas.width = 600;
      this.canvas.height = 500;

      this.playerOne = Paddle.init.call(this, "left");
      this.playerTwo = Paddle.init.call(this);
      this.ball = Ball.init.call(this);
      animate(Game.loop);
    },
    ////DRAW NEW FRAME
    draw: function draw() {
      this.context.clearRect(0 , 0, this.canvas.width, this.canvas.height);

      this.context.fillStyle = "black";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.context.fillStyle = "white";
      this.render(this.playerOne);
      this.render(this.playerTwo);
      this.render(this.ball);
    },
    ////GAME LOOP
    loop: function loop() {
      Game.update();
      Game.draw();
      animate(Game.loop);
    },
    ////RENDER GAME OBJECTS
    render: function render(gameObject) {
      this.context.fillRect(gameObject.x, gameObject.y, gameObject.width, gameObject.height);
    },
    update: function update() {
      this.ball.x += this.ball.x_speed;
      this.ball.y += this.ball.y_speed;
      ////PLAYER ONE PADDLE COLLISIONS
      if((this.ball.x <= this.playerOne.x + this.playerOne.width) && 
          (this.ball.x >= this.playerOne.x + this.playerOne.width) &&
          (this.ball.y <= this.playerOne.y + this.playerOne.height) &&
          (this.ball.y + this.ball.height >= this.playerOne.y)
        ) {
        this.ball.x_speed = BALL_SPEED_X >= 0 ? BALL_SPEED_X : -BALL_SPEED_X;
        this.ball.x += this.ball.x_speed;
      }
      ////PLAYER TWO PADDLE COLLISIONS
      if((this.ball.x + this.ball.width >= this.playerTwo.x) && 
          (this.ball.x <= this.playerTwo.x) &&
          (this.ball.y <= this.playerTwo.y + this.playerTwo.height) && 
          (this.ball.y + this.ball.height >= this.playerTwo.y)
        ) {
        this.ball.x_speed = BALL_SPEED_X >= 0 ? -BALL_SPEED_X : BALL_SPEED_X;
        this.ball.x += this.ball.x_speed;
      }
      ////COLLISION WITH TOP WALL
      if(this.ball.y <= 0) {
        this.ball.y_speed = BALL_SPEED_Y >= 0 ? BALL_SPEED_Y : -BALL_SPEED_Y;
        this.ball.y += this.ball.y_speed;
      }
      ////COLLISION WITH BOTTOM WALL
      if(this.ball.y + this.ball.height >= this.canvas.height) {
        this.ball.y_speed = BALL_SPEED_Y >= 0 ? -BALL_SPEED_Y : BALL_SPEED_Y;
        this.ball.y += this.ball.y_speed;
      }
    }
  };

  ////INSTANTIATE GAME AND START
  Game.init();
  Game.draw();
};