const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

context.scale(32,32);

function arenaSweep(){
  let rowCount = 1;
  let sound4 = false;
  let sound = false;

  outer: for(let y = arena.length - 1; y > 0;--y){
    for(let x = 0; x < arena[y].length; ++x){
      if(arena[y][x] === 0){
        continue outer;
      }
    }

    const row = arena.splice(y,1)[0].fill(0);
    arena.unshift(row);
    ++y;

    player.score += rowCount * 10;
    rowCount *= 2;
    sound = true;
    //console.log("rowCount: " + rowCount);
  }
  if(rowCount === 16){
    document.getElementById("remove4").play();
  }else if(sound){
    document.getElementById("remove").play();
  }
}


const matrix = [
  [0,0,0],
  [1,1,1],
  [0,1,0]
];

function draw() {
  context.fillStyle = "#000";
  context.fillRect(0,0,canvas.width,canvas.height);
  drawMatrix(arena,{x:0,y:0});
  drawMatrix(player.matrix, player.pos);
}

function createMatrix(w,h){
  const matrix = [];
  while (h--){
    matrix.push(new Array(w).fill(0))
  }
  return matrix;
}

function createPiece(type){
  if(type == 'T'){
    return [
      [0,0,0],
      [1,1,1],
      [0,1,0]
    ];
  }else if(type == 'O'){
    return [
      [2,2],
      [2,2],
    ];
}else if(type == 'L'){
  return [
    [0,3,0],
    [0,3,0],
    [0,3,3]
  ];
}else if(type == 'J'){
  return [
    [0,4,0],
    [0,4,0],
    [4,4,0]
  ];
}else if(type == 'I'){
  return [
    [0,5,0,0],
    [0,5,0,0],
    [0,5,0,0],
    [0,5,0,0]
  ];
}else if(type == 'S'){
  return [
    [0,6,6],
    [6,6,0],
    [0,0,0]
  ];
}else if(type == 'Z'){
  return [
    [7,7,0],
    [0,7,7],
    [0,0,0]
  ];
}
console.log("TYPE: " + type);
}


function drawMatrix(matrix, offset){
  matrix.forEach((row,y)=>{
    row.forEach((value,x)=>{
      if(value !== 0){
        context.fillStyle = colors[value];
        context.fillRect(
          x + offset.x,
          y + offset.y,
          0.9, 0.9);
      }
    })
  });
}

function playerDrop(){
  player.pos.y++;
  if(collide(arena,player)){
    player.pos.y--;
    merge(arena,player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}


let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0){
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if(dropCounter > dropInterval){
    playerDrop();
  }


  draw();
  requestAnimationFrame(update);
}
let highscore = 0;
function updateScore(){
  document.getElementById("score").innerText = "Current Score: " + player.score;
  if(highscore <= player.score){
    document.getElementById("highscore").innerText = "High Score: " + player.score;
    highscore = player.score;
  }

}

const colors = [
  null,
  'purple',
  'yellow',
  'orange',
  'blue',
  'cyan',
  'green',
  'red',
]


const arena = createMatrix(12,20);



function merge(arena,player){
  player.matrix.forEach((row,y)=>{
    row.forEach((value,x)=>{
      if(value !== 0){
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    })
  })
  document.getElementById("hit").play();
}

function collide(arena,player){
  const [m, o] = [player.matrix, player.pos];
  for(let y = 0; y < m.length;++y){
    for(let x = 0; x < m[y].length; ++x){
      if(m[y][x] !== 0 &&
        (arena[y + o.y] &&
      arena[y + o.y][x + o.x]) !== 0)
      return true;
    }
  }
  return false;
}

function playerMove(dir) {
  player.pos.x += dir;
  if(collide(arena, player)){
    player.pos.x -= dir;
  }
}

function playerRotate(dir){
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix,dir);
  while (collide(arena,player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1: -1));
    if(offset > player.matrix[0].length){
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function playerReset(){
  const pieces = "ILJOTSZ";
  let random = Math.floor(pieces.length * Math.random());
  player.matrix = createPiece(pieces[random]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) -
                 (player.matrix[0].length / 2 | 0);

  if(collide(arena,player)){
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

function rotate(matrix, dir){
  for(let y = 0; y < matrix.length;++y){
    for(let x = 0; x < y; ++x){
      [
        matrix[x][y],
        matrix[y][x],
      ] = [
        matrix[y][x],
        matrix[x][y],
      ];
    }
  }

  if(dir > 0){
    matrix.forEach(row=> row.reverse());
  }else{
    matrix.reverse();
  }
  document.getElementById("rotate").play();
}

const player = {
  pos: {x:0,y:0},
  matrix: null,
  score: 0,
}
let musicOn = false;
function musicToggle(){
  let theme = document.getElementById("theme");
  let button = document.getElementById("play");
  if(musicOn){
    theme.pause();
    button.innerText = "Play"
  }else{
    theme.play();
    button.innerText = "Pause"
  }
  musicOn = !musicOn;
}


document.addEventListener("keydown",event=>{
  //console.log(event);
  if(event.keyCode === 39){
    playerMove(1);
    //player.pos.x++;
  }else if(event.keyCode === 37){
    //player.pos.x--;
    playerMove(-1);
  }else if(event.keyCode === 40){
    playerDrop();
  }else if(event.keyCode === 81){
    playerRotate(-1);
  }else if(event.keyCode === 87){
    playerRotate(1);
  }
});

document.addEventListener("DOMContentLoaded", function() {
  setTimeout(()=>{
    document.getElementById("theme").volume = 0.2;
    //document.getElementById("theme").play();
    //console.log("play song");
  },3000);

});



updateScore();
playerReset();
update();
