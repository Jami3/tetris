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


    rowCount ++;

    let speed = 1000 / dropInterval;
    player.score += Math.floor(Math.pow(rowCount,speed) * 1000);
    //console.log("rowCount: " + rowCount);
  }
  if(rowCount === 5){
    document.getElementById("remove4").play();
  }else if(rowCount === 3){
    document.getElementById("remove2").play();
  }else if (rowCount == 2){
    document.getElementById("remove").play();
  }
  if(player.score >= 1500000){
    dropInterval = 50;
  }else if(player.score >= 800000){
    dropInterval = 100;
  }else if(player.score >= 300000){
    dropInterval = 200;
  }else if(player.score >= 100000){
    dropInterval = 300;
  }else if(player.score >= 50000){
    dropInterval = 500;
  }else if(player.score >= 10000){
    dropInterval = 800;
  }else{
    dropInterval = 1000;
  }
}


const matrix = [
  [0,0,0],
  [1,1,1],
  [0,1,0]
];

let heldPiece;

function holdPiece(){
let temp;
  if(typeof(heldPiece) == "undefined"){
    heldPiece = JSON.parse(JSON.stringify(player.matrix));
    player.matrix = nextPieces.shift();

  }else{
    temp = JSON.parse(JSON.stringify(player.matrix));
    player.matrix = JSON.parse(JSON.stringify(heldPiece));
    heldPiece = temp;
  }

}

function draw() {
  context.fillStyle = "black";
  context.fillRect(0,0,canvas.width,canvas.height);
  drawMatrix(arena,{x:0,y:0});
  context.globalAlpha = 0.4;
  drawGhost(player);
  context.globalAlpha = 1;
  drawMatrix(player.matrix, player.pos);
  drawNext();
  drawHold();

}
function drawHold(){
  context.fillStyle = "white";
  context.font = "1px serif"
  context.fillText("Hold",16.2,2);
    context.fillStyle = "black";
  context.fillRect(16,3,3,4);
  if(typeof(heldPiece) !== "undefined"){
    //console.log("DRAWING HELD");
    drawMatrix(heldPiece,{x:16,y:3});
  }
}
function drawNext(){
  context.fillStyle = "grey";
  context.fillRect(12,0,10,20);
  context.fillStyle = "white";
  context.font = "1px serif"
  context.fillText("Next",12.8,2);
  for(let i = 0; i < nextPieces.length;i++){
    let width = nextPieces[i].length;
    //console.log(width);
    drawMatrix(nextPieces[i],{x: 12.4,y:i*4 + 4});
  }

}

function drawGhost(player){
  let ghost = JSON.parse(JSON.stringify(player));

  while(!collide(arena,ghost)){
    ghost.pos.y++;
  }
  ghost.pos.y--;


  drawMatrix(ghost.matrix,ghost.pos);
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
//console.log("TYPE: " + type);
}


function drawMatrix(matrix, offset){

  matrix.forEach((row,y)=>{
    row.forEach((value,x)=>{
      if(value !== 0){
        context.fillStyle = colors[value];
        /*
        let img = imgs[value % imgs.length];
        context.drawImage(
          img,
          x + offset.x,
          y + offset.y,
          0.9, 0.9);
        */
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

function playerHardDrop(){
  while(!collide(arena,player)){
    player.pos.y++;
  }
  player.pos.y--;
  playerDrop();

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
  'grey'
]
let jamie = document.getElementById("imgJamie");
let koi = document.getElementById("imgKoi");
let josh = document.getElementById("imgJosh");
const imgs = [
  jamie,
  koi,
  josh
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
let nextPieces = [];
const pieces = "ILJOTSZ";
for(let i = 0; i < 5; i++){
  nextPieces.push(createPiece(pieces[Math.floor(pieces.length * Math.random())]));
}

function playerReset(){
  let random = Math.floor(pieces.length * Math.random());
  nextPieces.push(createPiece(pieces[random]));
  player.matrix = nextPieces.shift();
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
  if(event.keyCode === 39){
    playerMove(1);
  }else if(event.keyCode === 37){
    playerMove(-1);
  }else if(event.keyCode === 40){
    playerDrop();
  }else if(event.keyCode === 81){
    playerRotate(-1);
  }else if(event.keyCode === 87){
    playerRotate(1);
  }else if(event.keyCode === 32){
    playerHardDrop();
  }else if(event.keyCode === 16){
    holdPiece();
  }
});

document.addEventListener("DOMContentLoaded", function() {
  setTimeout(()=>{
    document.getElementById("theme").volume = 0.2;
  },3000);

});



updateScore();
playerReset();
update();
