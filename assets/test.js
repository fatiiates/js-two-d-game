var myGamePiece = new Array(2);
var mySling = new Array(2);
var myWall = new Array(2);
var isDown = false;
var onMovePiece = false;
var tempData;
function startGame() {


  myGameArea.start();

  for (var i = 0; i < myGamePiece.length; i++){
    if(i >= 1){
      myGamePiece[i] = new rock(60, 60, "black", 30, 250*(i+1), "black");
      myGamePiece[i].setIndex(i);
      continue;
    }
    myGamePiece[i] = new rock(60, 60, "red", 30, 150*(i+1), "white");
    myGamePiece[i].setIndex(i);
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
  }autoLaunch();
}
var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 610;
        this.canvas.height = window.innerHeight;
        this.context = this.canvas.getContext("2d");

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

        this.interval = setInterval(updateGameArea, 20);

        },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
  if(eventControl){
    isDown = false;
    piece != false ? piece.comeBack(temp.area, temp.moveX, temp.moveY):'';
  }

  temp = "";

  piece.drag = false;
  mySling.forEach((item, i) => {
    if (item.point3Display) {

      let distF = item.point.p1.y - item.point.p3.y;
      let angle = item.betweenAngle();

      let xF = distF * 30 / item.maxDistance * Math.sin(angle);
      let yF = distF * 30 / item.maxDistance * Math.cos(angle);

      const vF = rotate({x:xF,y:yF}, angle);

      piece.velocity.x = -xF;
      piece.velocity.y = yF;
      item.point3Display = false;

    }
  });
  eventControl ? onMovePiece = false:'';

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
        item.collide(piece.real.x, piece.real.y, piece);

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
      this.drawArrow(onMovePiece.move.x, onMovePiece.move.y, this.betweenAngle());

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
  this.collide = (x, y, piece) => {

    if (!this.point3Display) {
      if (this.area == 0 ? y <= this.point.p2.y + 5 && !tempData.area : y + piece.radius*2 >= this.point.p2.y && tempData.area) {
        this.point.p3.x = x + piece.radius;
        this.point.p3.y = this.area == 0 ? y - 5 : y + piece.radius*2;
        this.point3Display = true;
      }
    }else
      if (this.area == 0 ? y <= this.point.p2.y + 5 && !tempData.area : y + piece.radius*2 >= this.point.p2.y && tempData.area) {
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
      /*this.velocity.x -= this.velocity.x > 0 ? 0.3:this.velocity.x;
      console.log(this.velocity.x);*/
      myGamePiece.forEach((item, i) => {
        if (i != this.index)
            this.collide(item,i);
      });
      /*if (this.real.x + this.radius*2 >= myGameArea.canvas.width || this.real.x <= 0){
        this.velocity.x = -this.velocity.x;
      }*/

      /*if (this.real.y + this.radius*2 - 5 >= myGameArea.canvas.height || this.real.y - 5 <= 0)
        this.velocity.y = -this.velocity.y;*/
      if (wallX(this)) {
        this.velocity.x = -this.velocity.x;
      }
      if (wallY(this)) {
        this.velocity.y = -this.velocity.y;
      }

      for (var i = 0; i < myWall.length; i++)
        rectangleCollision(this, myWall[i]);

          //let angle = Math.atan(myWall[i].point.p1.y - this.real.y, myWall[i].point.p1.x - this.real.x);

      this.move.x += this.velocity.x;
      this.move.y += this.velocity.y;

      this.velocity.x -= this.velocity.x <= 0.03 && this.velocity.x >= -0.03 ? this.velocity.x : this.velocity.x*0.03;
      this.velocity.y -= this.velocity.y <= 0.03 && this.velocity.y >= -0.03 ? this.velocity.y : this.velocity.y*0.03;

      this.newPos();


    }
    this.comeBack = (area, x, y) => {
      if(this.area != area){
        this.move.x = x;
        this.move.y = y;
        this.velocity.x = 0;
        this.velocity.y = 0;
      }


    }
    this.getArea = () => {
      return this.area;
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
      ctx.fillStyle = "white";
      ctx.fill();

      ctx.font = this.height+"px FontAwesome";
      ctx.fillStyle = this.color;
      ctx.fillText("\uf192",this.real.x,this.mid.y);
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
  const thisTime = 300 / updateInterval;

  var pieceRand;
  do{
    pieceRand = Math.floor(Math.random() * myGamePiece.length);

    // rastgele seçilen topun alanı 1 ise tekrarlıyor, 0 ise devam ediyor
    console.log(myGamePiece[pieceRand], pieceRand);
    console.log(myGamePiece[pieceRand].getArea() , thisArea, pieceRand);

  }while(myGamePiece[pieceRand].area != thisArea);

  var randPiece = myGamePiece[pieceRand];

  const points = [1/4 ,1/2, 3,4];

  var randPoint = Math.floor(Math.random() * points.length);

  var point = {
    x:myGameArea.canvas.width * points[randPoint],
    y:mySling[thisArea].point.p1.y
  };

  let vector = {
    x:1,
    y:1
  };

  if(randPiece.move.x > point.x)
    vector.x = -1;
  if(randPiece.real.y > point.y)
    vector.y = -1;

  let velocity = {
    x:Math.abs(randPiece.move.x - point.x) / thisTime * vector.x,
    y:Math.abs(randPiece.move.y - point.y) / thisTime * vector.y
  };
  console.log(22);
  //let interval = await autoMove(velocity, randPiece, point);

  console.log(11);

  /**/
  // top sürükleme
  /**/

  //Rastgele uzunlukta sapanı geriyor
  let sapanRand = Math.random() * myGamePiece.length;
}
const autoMove = (velocity, randPiece, point) => {
  //const rand = randPiece;
    return new Promise((resolve, reject) => {

        setInterval(function(){
        //  console.log(randPiece);
          if(randPiece.move.x != point.x)
            randPiece.move.x += velocity.x;
          if(randPiece.move.y != point.y)
            randPiece.move.y += velocity.y;
          if(randPiece.move.x == point.x && randPiece.move.y == point.y)
            resolve("");
        },20)
    });
};

function rectangleCollision(piece, wall){



    var pieceX = piece.move.x;
    var pieceY = piece.move.y;
    var pieceRadius = piece.radius;

    var wallPointX = wall.point.p1.x;
    var wallPointY = wall.point.p1.y;
    var wallPointW = wall.point.p2.x;
    var wallPointH = wall.point.p2.y;

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

      if (distance <= pieceRadius && !piece.crash) {
        piece.crash = true;

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
        //piece.crashTimeOut();
      }
      return false;
    }
    return circleRect();

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
  if (y + radius * 2 >= canvasHeight || y <= 0)
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


}
