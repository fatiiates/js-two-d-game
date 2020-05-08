var myGamePiece = new Array(2);
var mySling = new Array(2);
var myWall = new Array(2);
var isDown = false;
var onMovePiece;
var tempData;
function startGame() {


  myGameArea.start();

  for (var i = 0; i < myGamePiece.length; i++){
    myGamePiece[i] = new rock(60, 60, "grey", 30, 150*(i+1), "blackRock");
    myGamePiece[i].setIndex(i);
  }
  for (var i = 0; i < myWall.length; i++){
    myWall[i] = new rect(i*(myGameArea.canvas.width/2 + 40), myGameArea.canvas.height/2-20, myGameArea.canvas.width/2 + (i == 0 ? -40 :40), 40, "green");
    myWall[i].setIndex(i);
  }
  onMovePiece = myGamePiece;
  for (var i = 0; i < mySling.length; i++){
    mySling[i] = new sling(
      0,
       +Math.ceil(myGameArea.canvas.height*(15+i*70)/100),
      "grey", myGameArea.canvas.width,
      Math.ceil(myGameArea.canvas.height*(15+i*70)/100));
    mySling[i].setArea(i);
  }
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

        myGameArea.canvas.addEventListener("mousemove", canvasMouseMove);

        myGameArea.canvas.addEventListener("mouseup", canvasOverMove);
        myGameArea.canvas.addEventListener("mouseout", canvasOverMove);
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
  tempData = temp(onMovePiece);
}

function canvasOverMove(){

  isDown = false;
  tempData = "";

  onMovePiece.drag = false;
  mySling.forEach((item, i) => {
    if (item.point3Display) {

      let distF = item.point.p1.y - item.point.p3.y;
      let angle = item.betweenAngle();

      let xF = distF * 20 / item.maxDistance * Math.sin(angle);
      let yF = distF * 20 / item.maxDistance * Math.cos(angle);

      const vF = rotate({x:xF,y:yF}, angle);


      onMovePiece.velocity.x = -xF;
      onMovePiece.velocity.y = yF;
      item.point3Display = false;

    }
  });

}
function canvasMouseMove(e){

  if (isDown) {

    onMovePiece.drag = true;
    onMovePiece.velocity.x = 0;
    onMovePiece.velocity.y = 0;
    var currentTime = (Date.now() - tempData.time);
    var drag = false;
    if (e.layerX + onMovePiece.radius <= myGameArea.canvas.width && e.layerX - onMovePiece.radius >= 0){
      onMovePiece.move.x = e.layerX;
      drag = true;
    }
    if (e.layerY + onMovePiece.radius - 1 <= myGameArea.canvas.height && e.layerY - onMovePiece.radius - 3 >= 0){
      onMovePiece.move.y = e.layerY;
      drag = true;
    }

    if (onMovePiece.drag) {

      /*mySling.forEach((item, i) => {*/
        mySling[1].collide(onMovePiece.real.x, onMovePiece.real.y, onMovePiece);

      /*});*/
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
    x:2,
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
  this.maxDistance = Math.abs(myGameArea.canvas.height - this.point.p1.y);
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

    ctx.strokeStyle = 'grey';
    ctx.beginPath();
    ctx.moveTo(x + 150*Math.sin(angle), y - 150*Math.cos(angle));
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

    /*ctx = myGameArea.context;
    ctx.beginPath();
    console.log(angle > 0 ? onMovePiece.real.x+100:onMovePiece.x-100 , 100*Math.cos(angle));
    ctx.lineWidth = 5;

    ctx.arc(angle > 0 ? onMovePiece.real.x+100:onMovePiece.real.x-100, onMovePiece.real.y-100*Math.cos(angle), 1, 0, 2 * Math.PI, true);
    ctx.stroke();*/
    //console.log(angle*180/Math.PI);
    return angle;
  }
  this.collide = (x, y, piece) => {

    if (!this.point3Display) {
      if (this.area == 0 ? y <= this.point.p2.y + 5 && !piece.area : y + piece.radius*2 >= this.point.p2.y && piece.area) {
        this.point.p3.x = x + piece.radius;
        this.point.p3.y = this.area == 0 ? y - 5 : y + piece.radius*2;
        this.point3Display = true;
      }
    }else
      if (this.area == 0 ? y <= this.point.p2.y + 5 && !piece.area : y + piece.radius*2 >= this.point.p2.y && piece.area) {
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
    this.mass = 1;
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
        if(rectangleCollision(this.real.x, this.real.y, this.radius, myWall[i])){
          /*let angle = Math.atan2(myWall[i].point.p1.y - this.real.y, myWall[i].point.p1.x - this.real.x);
          let vector = myWall[i].velocity.x;
          if((i == 0 && vector < 0) || (i == 1 && vector  > 0))
            vector = -vector;
          //let vF = rotate({x:vector,y:vector*Math.cos(angle)}, angle);
          console.log(angle*180/Math.PI);
          /*console.log(vector * Math.sin(angle), vector * Math.cos(angle));*/
          /*this.velocity.x = vector;
          this.velocity.y = vector*Math.sin(angle);*/
          //this.velocity.y += vector;
        }


      this.move.x += this.velocity.x;
      this.move.y += this.velocity.y;

      this.velocity.x -= this.velocity.x <= 0.03 && this.velocity.x >= -0.03 ? this.velocity.x : this.velocity.x*0.03;
      this.velocity.y -= this.velocity.y <= 0.03 && this.velocity.y >= -0.03 ? this.velocity.y : this.velocity.y*0.03;

      this.newPos();


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
      ctx.fillStyle = color;
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

function rectangleCollision(x, y, radius, wall){



  // xte çarpması lazım dikdörtgenin içini değil çarpmayı hesaplamalısın


  var xDist = rock.real.x - this.real.x;
  var yDist = rock.real.y - this.real.y;
  var dist = Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
  var minDist = this.radius + rock.radius;

  if(dist < minDist){

  if(x + (wall.index == 1 ? radius*2+3:0) <= wall.point.p2.x + wall.point.p1.x &&
     x + (wall.index == 1 ? radius*2+3:0) >= wall.point.p1.x &&
     wall.point.p1.y - radius * 2 <= y - 2 &&
     wall.point.p1.y+wall.point.p2.y >= y - 5)
      return true;

  /*if(x <= myWall[0].point.p2.x &&
     x >= myWall[0].point.p1.x &&
     ((y - 5 <= myWall[0].point.p1.y + myWall[0].point.p2.y &&
     y - 5 >= myWall[0].point.p1.y) ||
     (y + radius * 2 - 5 <= myWall[0].point.p1.y + myWall[0].point.p2.y &&
     y + radius * 2 - 5 >= myWall[0].point.p1.y)))
      return true;*/

  /*if(x + radius * 2 <= myWall[1].point.p1.x + myWall[1].point.p2.x &&
     x + radius * 2 >= myWall[1].point.p1.x &&
     ((y - 5 <= myWall[0].point.p1.y + myWall[0].point.p2.y &&
     y - 5 >= myWall[0].point.p1.y) ||
     (y + radius * 2 - 5 <= myWall[0].point.p1.y + myWall[0].point.p2.y &&
     y + radius * 2 - 5 >= myWall[0].point.p1.y)))
      return true;*/

  /*if(x <= myWall[0].point.p2.x &&
     x >= myWall[0].point.p1.x &&
     y + radius <= myWall[0].point.p1.y + myWall[0].point.p2.y &&
     y + radius >= myWall[0].point.p1.y)
      return true;

  if(x + radius * 2 <= myWall[1].point.p1.x + myWall[1].point.p2.x &&
     x + radius * 2 >= myWall[1].point.p1.x &&
     y + radius <= myWall[1].point.p1.y + myWall[1].point.p2.y &&
     y + radius >= myWall[1].point.p1.y)
      return true;*/


}

function wallX(piece){

  let x = piece.real.x;
  let y = piece.real.y;
  let radius = piece.radius;
  let canvasWidth = myGameArea.canvas.width;
  // canvas wall
  if (x + radius*2 >= canvasWidth || x <= 0)
    return true;

  /*for (var i = 0; i < myWall.length; i++)
    if(rectangleCollision(piece.real.x, piece.real.y, radius, myWall[i]))
      return true;*/

  // rectangle wall

}
function wallY(piece){

  let x = piece.real.x;
  let y = piece.real.y;
  let radius = piece.radius;
  let canvasHeight = myGameArea.canvas.height;

  // canvas wall
  if (y + radius * 2 - 5 >= canvasHeight || y - 5 <= 0)
    return true;

  // rectangle wall
  if(x <= myWall[0].point.p2.x &&
     x >= myWall[0].point.p1.x &&
     ((y - 5 <= myWall[0].point.p1.y + myWall[0].point.p2.y &&
     y - 5 >= myWall[0].point.p1.y) ||
     (y + radius * 2 - 5 <= myWall[0].point.p1.y + myWall[0].point.p2.y &&
     y + radius * 2 - 5 >= myWall[0].point.p1.y)))
      return true;

  if(x + radius * 2 <= myWall[1].point.p1.x + myWall[1].point.p2.x &&
     x + radius * 2 >= myWall[1].point.p1.x &&
     ((y - 5 <= myWall[0].point.p1.y + myWall[0].point.p2.y &&
     y - 5 >= myWall[0].point.p1.y) ||
     (y + radius * 2 - 5 <= myWall[0].point.p1.y + myWall[0].point.p2.y &&
     y + radius * 2 - 5 >= myWall[0].point.p1.y)))
      return true;
}

/*
function wallX(piece){

  let x = piece.real.x;
  let y = piece.real.y;
  let radius = piece.radius;
  let canvas = myGameArea.canvas;
  // canvas wall
  if (x + radius*2 >= canvas.width || x <= 0)
    return true;
  if (y + radius*2 - 5 >= canvas.height || y - 5 <= 0)
    return true;

  // rectangle wall
  myWall.forEach((item, i) => {
    if(x <= item.point.p2.x &&
       x >= item.point.p1.x &&
       y <= item.point.p2.y &&
       y >= item.point.p1.y)
       return true;
  });

}
*/

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
