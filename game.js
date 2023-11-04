
let config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
      default: 'arcade',
      arcade: {
          gravity: { y: 300 },
          debug: false
      }
  },
  scene: {
      preload: preload,
      create: create,
      update: update
  }
};

let player;
let churus;
let water;
let platforms;
let cursors;
let score = 0;
let gameOver = false;
let scoreText;

let game = new Phaser.Game(config);

function preload ()
{
  this.load.image('sky', 'assets/sky.png');
  this.load.image('ground', 'assets/platform.png');
  this.load.image('churu', 'assets/churu.png');
  this.load.image('water', 'assets/enemy_ball.png');
  // this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
  this.load.spritesheet('catIdle', 'assets/cat-idle.png', { frameWidth: 32, frameHeight: 30 });
  this.load.spritesheet('catRun', 'assets/cat-run.png', { frameWidth: 50, frameHeight: 30 });
}

function create ()
{
  //  A simple background for our game
  this.add.image(400, 300, 'sky');

  //  The platforms group contains the ground and the 2 ledges we can jump on
  platforms = this.physics.add.staticGroup();

  //  Here we create the ground.
  //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
  platforms.create(400, 568, 'ground').setScale(2).refreshBody();

  //  Now let's create some ledges
  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');

  // The player and its settings
  player = this.physics.add.sprite(100, 450, 'cat').setScale(1.6);

  //  Player physics properties. Give the little guy a slight bounce.
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  this.anims.create({
      key: 'turn',
      frames: [ { key: 'catIdle', frame: 0 } ],
      frameRate: 20
  });

  this.anims.create({
  key: 'walk', // facing left
  frames: this.anims.generateFrameNumbers('catRun', { start: 0, end: 7 }),
  frameRate: 20,
  repeat: -1
  });

  //  Input Events
  cursors = this.input.keyboard.createCursorKeys();

  //  Some churus to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
  churus = this.physics.add.group({
      key: 'churu',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
  });



  churus.children.iterate(function (child) {

      //  Give each star a slightly different bounce
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      child.setScale(0.2)

  });

  water = this.physics.add.group();

  //  The score
  scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

  //  Collide the player and the churus with the platforms
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(churus, platforms);
  this.physics.add.collider(water, platforms);

  //  Checks to see if the player overlaps with any of the churus, if he does call the collectChuru function
  this.physics.add.overlap(player, churus, collectChuru, null, this);

  this.physics.add.collider(player, water, hitWater, null, this);
}

function update ()
{
  if (gameOver)
  {
      return;
  }

  if (cursors.left.isDown)
  {
      player.setFlipX(true);
      player.setVelocityX(-160);
      player.anims.play('walk', true);
  }
  else if (cursors.right.isDown)
  {
      player.setFlipX(false);
      player.setVelocityX(160);
      player.anims.play('walk', true);
  }
  else
  {
      player.setVelocityX(0);

      player.anims.play('turn');
  }

  if (cursors.up.isDown && player.body.touching.down)
  {
      player.setVelocityY(-330);
  }
}

function collectChuru (player, churu)
{
  churu.disableBody(true, true);

  //  Add and update the score
  score += 10;
  scoreText.setText('Score: ' + score);

  if (churus.countActive(true) === 0)
  {
      //  A new batch of churus to collect
      churus.children.iterate(function (child) {

          child.enableBody(true, child.x, 0, true, true);

      });

      let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

      let waterBall = water.create(x, 16, 'water').setSize(3,3).setScale(0.2);
      waterBall.setBounce(1);
      waterBall.setCollideWorldBounds(true);
      waterBall.setVelocity(Phaser.Math.Between(-200, 200), 20);
      waterBall.allowGravity = false;

  }
}

function hitWater (player, waterBall)
{
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play('turn');

  gameOver = true;
}
