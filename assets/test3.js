var myGamePiece = new Array(10);
var mySling = new Array(2);
var myWall = new Array(2);
var isDown = false;
var onMovePiece = false;
var tempData;
function startGame() {


  myGameArea.start();

  for (var i = 0; i < myGamePiece.length; i++){
    if(i >= myGamePiece.length/2){
      myGamePiece[i] = new rock(60, 60, "black", 60*(i - myGamePiece.length/2 +1 ), myGameArea.canvas.height*3/4, "black");
      myGamePiece[i].setIndex(i);
      myGamePiece[i].setArea(1);
      continue;
    }
    myGamePiece[i] = new rock(60, 60, "red", 60*(i+1), myGameArea.canvas.height*1/4, "white");
    myGamePiece[i].setIndex(i);
    myGamePiece[i].setArea(0);
  }
  for (var i = 0; i < myWall.length; i++){
    myWall[i] = new rect(i*(myGameArea.canvas.width/2 + 40), myGameArea.canvas.height/2-20, myGameArea.canvas.width/2 + (i == 0 ? -40 :40), 40, "green");
    myWall[i].setIndex(i);
  }
  //onMovePiece = myGamePiece;
  for (var i = 0; i < mySling.length; i++){
    mySling[i] = new sling(
      0,
       +Math.ceil(myGameArea.canvas.height*(15+i*70)/100),
      "grey", myGameArea.canvas.width,
      Math.ceil(myGameArea.canvas.height*(15+i*70)/100));
    mySling[i].setArea(i);
  }

//  myGameArea.autoLaunchInterval = setInterval(autoLaunch,3000);

}
var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 610;
        this.canvas.height = window.innerHeight;
        this.context = this.canvas.getContext("2d");
        this.autoLaunchInterval = false;
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        myGameArea.canvas.width = myGameArea.canvas.offsetWidth;

        window.addEventListener('resize', windowResize);
        myGameArea.canvas.addEventListener("mousedown", canvasStartMove);
        myGameArea.canvas.addEventListener("touchstart", canvasStartMove);

        myGameArea.canvas.addEventListener("mousemove", function(e){
          pieceOnDrag(isDown, e, onMovePiece);
        });

        myGameArea.canvas.addEventListener("mouseup", function(e){
          pieceOverDrag(isDown, onMovePiece, tempData, true);
        });
        myGameArea.canvas.addEventListener("mouseout", function(e){
          pieceOverDrag(isDown, onMovePiece, tempData, true);
        });
        //myGameArea.canvas.addEventListener("touchdown", canvasOverMove);

        this.interval = setInterval(updateGameArea, 10);

        },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function(){
      clearInterval(this.interval);
      clearInterval(this.autoLaunchInterval);
    }
}
function windowResize(){
  if(window.innerWidth > 1000)
    myGameArea.canvas.width = 610;
  else
    myGameArea.canvas.width = myGameArea.canvas.offsetWidth;

}
function canvasStartMove(e){
  isDown = true;

  onMovePiece = findRock(myGamePiece, e.layerX, e.layerY);
  if(onMovePiece != false && !onMovePiece.area)
    isDown = false;
  tempData = onMovePiece != false ? temp(onMovePiece):'';
}

function pieceOverDrag(down, piece, temp, eventControl){
  if(eventControl)
    isDown = false;



  let pieceCollisionControl = false;
  piece.drag = false;
  mySling.forEach((item, i) => {
    if (item.point3Display) {
      pieceCollisionControl = true;
      let distF = item.point.p1.y - item.point.p3.y;
      let angle = item.betweenAngle();

      let xF = distF * 30 / item.maxDistance * Math.sin(angle);
      let yF = distF * 30 / item.maxDistance * Math.cos(angle);

      const vF = rotate({x:xF,y:yF}, angle);

      piece.velocity.x != undefined ? piece.velocity.x = -xF:'';
      piece.velocity.y != undefined ? piece.velocity.y = yF:'';

      item.point3Display = false;

    }
  });
  if(eventControl){
     piece != false ? !pieceCollisionControl ? piece.comeBack(temp.moveX, temp.moveY):'':'';
      temp = "";
    onMovePiece = false;
  }

}
function pieceOnDrag(down ,target ,piece){

  if (down && piece != false) {

    piece.drag = true;
    piece.velocity.x = 0;
    piece.velocity.y = 0;

    var currentTime = (Date.now() - tempData.time);
    var drag = false;

    if (target.layerX + piece.radius + 1 <= myGameArea.canvas.width && target.layerX - piece.radius - 1 >= 0){
      piece.move.x = target.layerX;
      drag = true;
    }
    if (target.layerY + piece.radius + 3 <= myGameArea.canvas.height && target.layerY - piece.radius - 5 >= 0){
      piece.move.y = target.layerY;
      drag = true;
    }

    if (piece.drag) {

      mySling.forEach((item, i) => {
        item.collide(piece.real.x, piece.real.y, piece, tempData.area);

      });
    }
  }
}
function touchMove(e){
  if (isDown) {

    onMovePiece.drag = true;
    var currentTime = (Date.now() - tempData.time);

    onMovePiece.move.x = e.touches[0].pageX - this.offsetLeft;
    onMovePiece.move.y = e.touches[0].pageY - this.offsetTop;

  }
}

function temp(param){
    return {
      midX:param.mid.x,
      midY:param.mid.y,
      moveX:param.move.x,
      moveY:param.move.y,
      area:param.area,
      time:Date.now()
    };
}

function findRock(pieces, x, y) {
    var isCollision = false;
    for (var i = 0, len = 1; i < pieces.length; i++) {
        if(Math.pow(x-pieces[i].move.x,2)+Math.pow(y-pieces[i].move.y,2) < Math.pow(pieces[i].radius,2)){
          isCollision = pieces[i];
          break;
        }
    }
    return isCollision;
}
function rect(x1, y1, x2, y2, color){
  this.point = {
    p1:{
      x:Math.ceil(x1),
      y:y1
    },
    p2:{
      x:Math.ceil(x2),
      y:y2
    }
  }
  this.index = 0;
  this.velocity = {
    x:0,
    y:0
  };
  this.color = color;
  this.setIndex = (i) => {
    this.index = i;
  }
  this.setVelocity = () => {
    this.velocity.x = -this.velocity.x;

  }
  this.update = () => {
    this.draw();
    this.newPos();
  }
  this.newPos = () => {

    if (this.index) {

      if(this.point.p1.x == 80 || this.point.p1.x == myGameArea.canvas.width)
       this.setVelocity();

      this.point.p1.x += this.velocity.x;
      this.point.p2.x -= this.velocity.x;
    }
    else {

      if(this.point.p2.x == 0 || this.point.p2.x == (myGameArea.canvas.width - 80))
        this.setVelocity();

      this.point.p2.x += this.velocity.x;
    }
  }
  this.draw = () => {

    ctx = myGameArea.context;
    ctx.fillStyle = color;
    ctx.fillRect(this.point.p1.x, this.point.p1.y, this.point.p2.x, this.point.p2.y);

  }

}
function sling(x1, y1, color, x2, y2){

  this.point = {
    p1:{
      x:x1,
      y:y1
    },
    p2:{
      x:x2,
      y:y2
    },
    p3:{
      x:0,
      y:0
    }
  };
  this.area = 0;
  this.point3Display = false;
  this.piece = false;
  this.temp = {
    x:0,
    y:0
  }

  this.update = () => {
    this.draw(this.point3Display);
  }
  this.setArea = (param) => {
    this.area = param;
    this.maxDistance = Math.abs((this.area == 1 ? myGameArea.canvas.height:0) - this.point.p1.y);
  }

  this.draw = (param) => {
    ctx = myGameArea.context;
    ctx.beginPath();
    ctx.moveTo(this.point.p1.x, this.point.p1.y);
    if (param)
      ctx.lineTo(this.point.p3.x, this.point.p3.y);

    ctx.lineTo(this.point.p2.x, this.point.p2.y);
    ctx.stroke();
    if (param)
      this.drawArrow(this.piece.move.x, this.piece.move.y, this.betweenAngle());

  }
  this.drawArrow = (x, y, angle) => {
    ctx = myGameArea.context;
    let arrowAngle = angle +(this.area == 0 ? -3.14:0);
    ctx.strokeStyle = 'grey';
    ctx.beginPath();
    ctx.moveTo(x + 150*Math.sin(arrowAngle), y - 150*Math.cos(arrowAngle));
    ctx.lineTo(x,y);
    ctx.stroke();
    // right
    /*ctx.beginPath();
    ctx.rotate(angle*Math.PI/180);
    ctx.moveTo(100,120);
    ctx.lineTo(120,100);
    ctx.lineTo(140,120);
    ctx.stroke();

    ctx.moveTo(120,100);
    ctx.lineTo(120,150);
    ctx.stroke();*/
  }
  this.betweenAngle = () => {

    let m1 = (this.point.p3.y - this.point.p1.y) / (this.point.p3.x - this.point.p1.x);
    let m2 = (this.point.p3.y - this.point.p2.y) / (this.point.p2.x - this.point.p3.x);
    let angle = Math.atan2(m1 - m2 , 1 + m1 * m2);

    return angle;
  }
  this.collide = (x, y, piece, area) => {
    this.piece = piece;
    if (!this.point3Display) {
      if (this.area == 0 ? y <= this.point.p2.y + 5 && !area : y + piece.radius*2 >= this.point.p2.y && area) {
        this.point.p3.x = x + piece.radius;
        this.point.p3.y = this.area == 0 ? y - 5 : y + piece.radius*2;
        this.point3Display = true;
      }
    }else
      if (this.area == 0 ? y <= this.point.p2.y + 5 && !area : y + piece.radius*2 >= this.point.p2.y && area) {
        this.point.p3.x = x + piece.radius;
        this.point.p3.y = this.area == 0 ? y - 5 : y + piece.radius*2;
        this.temp.y = this.point.p3.y;

        //console.log();
      }else
        this.point3Display = false;

  }

}

function rock(width, height, color, x, y, type) {
    this.index = 0;
    this.drag = false;
    this.width = width;
    this.height = height;
    this.radius = 25;
    this.crash = false;
    this.timeOut = false;
/*this.crashTimeOut = () => {
      // timeoutu silemiyorsun
      this.timeOut = window.setTimeout(function(){this.crash = false;this.clearTime(this.timeOut);}, 1000);
    }*/
    this.clearTime = (param) => {
        clearTimeout(param);
    }
    this.mass = 1;
    this.color = color;
    this.area = type == "white" ? 1 : 0;
    this.real = {
      x:x,
      y:y
    };
    this.mid = {
      x:x + this.radius,
      y:y + this.radius
    };
    this.move = {
      x:this.real.x,
      y:this.real.y
    };
    this.velocity = {
      x:0,
      y:0
    };
    this.update = () => {
      this.draw();
      this.setArea();

      myGamePiece.forEach((item, i) => {
        if (i != this.index)
            this.collide(item,i);
      });
      if (wallX(this)) {
        this.velocity.x = -this.velocity.x;
      }
      if (wallY(this)) {
        this.velocity.y = -this.velocity.y;
      }

      for (var i = 0; i < myWall.length; i++)
        rectangleCollision(this, myWall[i]);

      this.move.x += this.velocity.x;
      this.move.y += this.velocity.y;

      this.velocity.x -= this.velocity.x <= 0.03 && this.velocity.x >= -0.03 ? this.velocity.x : this.velocity.x*0.03;
      this.velocity.y -= this.velocity.y <= 0.03 && this.velocity.y >= -0.03 ? this.velocity.y : this.velocity.y*0.03;

      this.newPos();

    }
    this.comeBack = (x, y) => {
        this.move.x = x;
        this.move.y = y;
        this.velocity.x = 0;
        this.velocity.y = 0;
    }
    this.setArea = () => {
      if (this.mid.y > myGameArea.canvas.height/2)
        this.area = 1;
      else if (this.mid.y < myGameArea.canvas.height/2)
        this.area = 0;
      else
        this.area = this.area ? 0 : 1;

    }
    this.setIndex = (i) => {
      this.index = i;
    }
    this.draw = () => {
      ctx = myGameArea.context;

      ctx.beginPath();
      ctx.arc(this.real.x + this.radius+.75,this.mid.y - this.radius+3.5, this.radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();

    }
    this.newPos = () => {

      this.mid.x = this.move.x + this.radius;
      this.real.x = this.move.x - this.radius;
      this.mid.y = this.move.y + this.radius - 5;
      this.real.y = this.move.y - this.radius+2;

    }
    this.collide = (rock,i) => {

      var xDist = rock.real.x - this.real.x;
      var yDist = rock.real.y - this.real.y;
      var dist = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
      var minDist = this.radius + rock.radius;

      if(dist < minDist){

        resolveCollision(this, rock);

      }
    }
}

async function autoLaunch(){

  const updateInterval = 20;
  const thisArea = 0; // RENKLİ DUVARLARDAN YUKARISI(0 NOLU ALAN) BİLGİSAYARIN ALANI
  const thisTime = 500 / updateInterval;
  var areaControl = false;
  for (var i = 0; i < myGamePiece.length; i++) {
    if(myGamePiece[i].area == thisArea){
      areaControl=true;
      break;
    }
  }

  if (areaControl) {

    var pieceRand;
    do{
      pieceRand = Math.floor(Math.random() * myGamePiece.length);

    }while(myGamePiece[pieceRand].area != thisArea);

    var randPiece = myGamePiece[pieceRand];

    randPiece.velocity.x = 0;
    randPiece.velocity.y = 0;

    const points = [1/4 ,1/2, 3/4];

    var randPoint = Math.floor(Math.random() * points.length);

    var point = {
      x:Math.floor(myGameArea.canvas.width * points[randPoint]),
      y:Math.floor(mySling[thisArea].point.p1.y),
    };

    let vector = {
      x:1,
      y:1
    };

    let slingRand = Math.floor(Math.random() * point.y-20)+20;
    var point3Y = Math.abs(randPiece.real.y - (point.y - randPiece.radius -2 - slingRand)) % point.y + 2;

    if(randPiece.move.x > point.x)
      vector.x = -1;
    if(randPiece.real.y > point3Y)
      vector.y = -1;

      let data ={
        a:randPiece.move.x,
        b:vector,
        c:slingRand,
      };
    let velocity = {
      x:Math.floor(Math.abs(randPiece.move.x - point.x) / thisTime * vector.x),
      y:Math.floor(Math.abs(randPiece.real.y - (point.y - randPiece.radius -2 - slingRand)) / thisTime * vector.y),
      pixelX:Math.floor(Math.abs(randPiece.move.x - point.x) / thisTime)+1,
      pixelY:Math.floor(Math.abs(randPiece.real.y - (point.y - randPiece.radius -2 - slingRand)) / thisTime)+1
    };
    if(velocity.x == 0)
      velocity.x = vector.x;
    if(velocity.y == 0)
      velocity.y = vector.y;
    let interval = await autoMove(velocity, randPiece, point, point3Y,data);

  }
}
const autoMove = (velocity, randPiece, point, point3Y,data) => {
  //const rand = randPiece;
    return new Promise((resolve, reject) => {

        var intertest = setInterval(function(){

          if(randPiece.move.x != point.x)
            randPiece.move.x += velocity.x;
          if(randPiece.real.y != point3Y)
            randPiece.move.y += velocity.y;
          if(Math.abs(randPiece.move.x - point.x) < velocity.pixelX)
            randPiece.move.x = point.x;
          if(Math.abs(randPiece.real.y - point3Y) < velocity.pixelY)
            randPiece.move.y = point3Y + randPiece.radius -2;
          if(randPiece.real.y < point.y){

            mySling[0].collide(randPiece.real.x, randPiece.real.y, randPiece , false);
            console.log(randPiece.move.x , point.x , randPiece.real.y , point3Y , velocity, data);
          }
          if(randPiece.move.x == point.x && randPiece.real.y == point3Y){

            console.log("girdi");
            pieceOverDrag(false, randPiece, temp(randPiece), false);
            mySling[0].piece = false;
            resolve("");
            window.clearInterval(intertest);

          }

        },20);
    });
};

function rectangleCollision(piece, wall){



    var pieceX = piece.move.x;
    var pieceY = piece.move.y;
    var pieceRadius = piece.radius+1;

    var wallPointX = wall.point.p1.x -2;
    var wallPointY = wall.point.p1.y;
    var wallPointW = wall.point.p2.x;
    var wallPointH = wall.point.p2.y+2;

    function circleRect() {


      var testX = pieceX;
      var testY = pieceY;


      if (pieceX < wallPointX)
        testX = wallPointX;
      else if (pieceX > wallPointX+wallPointW)
        testX = wallPointX+wallPointW;

      if (pieceY < wallPointY)
        testY = wallPointY;
      else if (pieceY > wallPointY+wallPointH)
        testY = wallPointY+wallPointH;

      var distX = pieceX-testX;
      var distY = pieceY-testY;
      var distance = Math.sqrt( (distX*distX) + (distY*distY) );

      if (distance <= pieceRadius) {

        let vector = wall.velocity.x;
        let angle = Math.atan2(distY,distX);

        console.log(angle*180/Math.PI);

        if (wall.index == 0) {

          if(Math.abs(Math.floor(angle*180/Math.PI)) <= 45)
            piece.velocity.x = -piece.velocity.x - (Math.abs(piece.velocity.x) < 5 ? 1:0);
          else if(Math.abs(Math.floor(angle*180/Math.PI)) > 45)
            piece.velocity.y = -piece.velocity.y  - (Math.abs(piece.velocity.x) < 5 ? 1:0);


        }
        else if (wall.index == 1) {

          if(Math.abs(Math.floor(angle*180/Math.PI)) >= 135)
            piece.velocity.x = -piece.velocity.x;
          else if(Math.abs(Math.floor(angle*180/Math.PI)) < 135)
            piece.velocity.y = -piece.velocity.y;

        }
        return true;
      }
      return false;
    }
    return circleRect();

  }
async function winner(){
  for (var i = 0; i < 2; i++) {

    var winner = true;

    for (var j = myGamePiece.length/2*i; j < myGamePiece.length; j++)
      if(myGamePiece[j].area == i){
        winner = false;
        break;
      }

    if(winner)
      return i;
  }

}
function wallX(piece){

  let x = piece.real.x;
  let y = piece.real.y;
  let radius = piece.radius;
  let canvasWidth = myGameArea.canvas.width;
  // canvas wall
  if (x + radius*2 >= canvasWidth || x <= 0)
    return true;

}
function wallY(piece){

  let x = piece.real.x;
  let y = piece.real.y;
  let radius = piece.radius;
  let canvasHeight = myGameArea.canvas.height;

  // canvas wall
  if (y + radius * 2  >= canvasHeight || y <= 2)
    return true;

  // rectangle wall
}

function rotate(velocity, angle){
  const rotatedVelocitites = {
    x:velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y:velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
  };
  return rotatedVelocitites;
}

function resolveCollision(obj, otherObj){
  var velocityDistX = obj.velocity.x - otherObj.velocity.x;
  var velocityDistY = obj.velocity.y - otherObj.velocity.y;

  var xDist = otherObj.real.x - obj.real.x;
  var yDist = otherObj.real.y - obj.real.y;

  if (velocityDistX * xDist + velocityDistY * yDist >= 0) {

    const angle = -Math.atan2(otherObj.real.y - obj.real.y, otherObj.real.x - obj.real.x);

    const m1 = obj.mass;
    const m2 = otherObj.mass;

    const u1 = rotate(obj.velocity, angle);
    const u2 = rotate(otherObj.velocity, angle);

    const v1 = {x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y:u1.y}
    const v2 = {x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y:u2.y}
    const vF1 = rotate(v1, -angle);
    const vF2 = rotate(v2, -angle);


    obj.velocity.x = vF1.x;
    obj.velocity.y = vF1.y;

    otherObj.velocity.x = vF2.x;
    otherObj.velocity.y = vF2.y;

  }

}


function updateGameArea() {

  myGameArea.clear();
  mySling.forEach((item, i) => {
    item.update();
  });
  myGamePiece.forEach((item, i) => {
    item.update();

  });
  myWall.forEach((item, i) => {
    item.update();
  });

  /*winner()
  .then(function(winner){
    var div = document.createElement('div');
    div.innerHTML = "KAZANAN " + (winner == 1 ? "SİZSİNİZ":"BİLGİSAYAR") + "<br> Yeni oyuna başlamak için tıklayın"  ;
    // set style
    div.style.background = 'blue';
    div.style.color = 'white';
    div.style.zIndex = 10;
    div.style.position = "absolute";
    div.style.width = "100%";
    div.style.height = "100%";
    div.style.opacity = .6;
    div.style.justifyContent = "center";
    div.style.textAlign = "center";
    div.style.fontSize = "36px";
    div.style.alignItems = "center";
    div.style.display = "flex";
    // better to use CSS though - just set class
    div.addEventListener('click', function(){
      startGame();
      div.parentNode.removeChild(div);
    });
    if(winner){
      myGameArea.stop();
      document.body.appendChild(div);
    }
    else if(winner == 0){
      myGameArea.stop();
      document.body.appendChild(div);
    }

  });*/


}
