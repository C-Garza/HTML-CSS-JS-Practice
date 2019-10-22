window.onload = function() {
  let animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) {window.setTimeout(callback, 1000/60)};


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
  let Ball = {
    init: function init() {
      return {
        width: 10,
        height: 10,
        x: (this.canvas.width / 2) - 5,
        y: (this.canvas.height / 2) - 5,
        x_speed: -3,
        y_speed: 0
      };
    }
  };
  let Game = {
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
    draw: function draw() {
      this.context.clearRect(0 , 0, this.canvas.width, this.canvas.height);

      this.context.fillStyle = "black";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.context.fillStyle = "white";
      this.render(this.playerOne);
      this.render(this.playerTwo);
      this.render(this.ball);
    },
    loop: function loop() {
      // Game.update();
      Game.draw();
      animate(Game.loop);
    },
    render: function render(gameObject) {
      this.context.fillRect(gameObject.x, gameObject.y, gameObject.width, gameObject.height);
    },
    update: function update() {
      this.ball.x += this.ball.x_speed;
      this.ball.y += this.ball.y_speed;
    }
  };

  Game.init();
  Game.draw();
};