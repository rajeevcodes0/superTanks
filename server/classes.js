//List of all objects with there properties, we need these for collision detection
let objectList =[
    {
        name: "barrelGreen_side",
        width:44 ,
        height: 62 
    },
    {
        name: "barrelGreen_side_damaged",
        width: 44 ,
        height: 62 
    },
    {
        name: "barrelGreen_up",
        width: 48 ,
        height: 48 
    },
    {
        name: "barrelGrey_sde_rust",
        width: 44 ,
        height: 62 
    },
    {
        name: "barrelGrey_side",
        width: 44 ,
        height: 62 
    },
    {
        name: "barrelGrey_up",
        width: 48 ,
        height: 48 
    },
    {
        name: "treeSmall",
        width: 87 ,
        height: 87 
    },
    {
        name: "barrelRed_up",
        width: 48 ,
        height: 48 
    },
    {
        name: "oil",
        width: 96 ,
        height: 96 
    },
    {
        name: "sandbagBeige",
        width: 66 ,
        height: 44 
    },
    {
        name: "sandbagBrown",
        width: 66 ,
        height: 44 
    },
    {
        name:  "barrelRed_side",
        width: 44 ,
        height: 62 
    }
    ];

class Tank{
    constructor(playerInfo){

        //information of the tank
        this.playerName = playerInfo.name;
        this.tankName = playerInfo.tank;
        this.id = playerInfo.id;
        this.height = 41 ;
        this.health =5;
        this.width = 41 ;

        //coordinate properties of the tank
        this.x=0;
        this.y=0;
        this.setCoordinates();
        this.angle = 0;
        this.speed = 2;
        this.imagePath = `../client/images/${this.tankName}.png`;

        //an array of all the bullets fried from this laptop
        this.bulletsFired=[];
    }
    controller(keyPressed,staticObjects,activePlayers){

        if(keyPressed=="ArrowLeft"){
            this.angle = (this.angle-1)%360;
        }else if(keyPressed=="ArrowRight"){
            this.angle = (this.angle+1)%360;
        }else if(keyPressed=="W" || keyPressed=="w"){

            let toDegree =Math.PI/180;
            let xIncrement = -1*( Math.sin(this.angle*toDegree) )*this.speed;
            let yIncrement = Math.cos(this.angle*toDegree)*this.speed;
            this.x = this.x+xIncrement;
            this.y = this.y+yIncrement;

            //collision checking
            if(this.checkCollision(staticObjects,activePlayers)){
                this.x = this.x - xIncrement;
                this.y = this.y - yIncrement;
            }
            this.checkBoundary();


        }else if(keyPressed=" "){
            let newBullet = new Bullet(this);
            this.bulletsFired.push(newBullet);
        }
    }
    //to check if the tank has gone out of the boundary
    checkBoundary(){
        if(this.x>800-100){
            this.x=800-100;
        }
        if(this.x<0){
            this.x=0;
        }
        if(this.y>600-100){
            this.y=600-100;
        }
        if(this.y<0){
            this.y=0;
        }
    }
    //function for collision detection, takes two objects and checks if there is some collision or not
    collisionDetection(objectA, objectB){
        // by 2, because origin is at the center
        let objectAXMin = objectA.x-(objectA.width/2);
        let objectAXMax = objectA.x+(objectA.width/2);
    
        let objectAYMin = objectA.y-(objectA.height/2);
        let objectAYMax = objectA.y+(objectA.height/2);
    
        let objectBXMin = objectB.x-(objectB.width/2);
        let objectBXMax = objectB.x+(objectB.width/2);
    
        let objectBYMin = objectB.y-(objectB.height/2);
        let objectBYMax = objectB.y+(objectB.height/2);
    
    
        if(
            (objectAXMax>=objectBXMin && objectAXMin <= objectBXMax) && 
            (objectAYMax>=objectBYMin && objectAYMin<= objectBYMax)    ){
    
    
            /* console.log(objectA);
            console.log(objectB);
            console.log(`objectAXMin ${objectAXMin}`);
            console.log(`objectAXMax ${objectAXMax}`);
            console.log(`objectAYMin ${objectAYMin}`);
            console.log(`objectAYMax ${objectAYMax}`);
            console.log(`objectBXMin ${objectBXMin}`);
            console.log(`objectBXMax ${objectBXMax}`);
            console.log(`objectBYMin ${objectBYMin}`);
            console.log(`objectBYMax ${objectBYMax}`); */
            return true;
        }else{
            return false;
        }
    }
    
    //the tank checks collision with all static objects and other tanks
    checkCollision(staticObjects,activePlayers){
        //with static objects
        for(let i=0;i<staticObjects.length;i++){
            let value = this.collisionDetection(this, staticObjects[i]);
            if(value){
                return value;
            }
        }
        //with tanks
        let filteredActivePlayers = activePlayers.filter((player)=>{
            return player && this.id!=player.id;
        })

        for(let i=0;i<filteredActivePlayers.length;i++){
            let value = this.collisionDetection(this, filteredActivePlayers[i]);
            if(value){
                return value;
            }
        }
    }
    setCoordinates(){
        this.x = Math.floor(Math.random()*600);
        this.y = Math.floor(Math.random()*400);
    }
    
}

class Bullet{
    constructor(firedFromTank){
        //would have change it in future, to make it more accurate
        this.bulletName =  `${firedFromTank.tankName}Bullet`;
        this.tankId = firedFromTank.id; 
        this.height = 20 ;
        this.width = 34 ;
        this.x = firedFromTank.x;
        this.y = firedFromTank.y;
        this.angle = firedFromTank.angle;
        this.speed = 20;
        this.imagePath = `../client/images${firedFromTank.tankName}Bullet.png`;
        this.move();
        this.lock = 0;
    }
    move(){
        setInterval(()=>{
            let toDegree =Math.PI/180;
            let xIncrement = -1*( Math.sin(this.angle*toDegree) )*this.speed;
            let yIncrement = Math.cos(this.angle*toDegree)*this.speed;
            this.x = this.x+xIncrement;
            this.y = this.y+yIncrement;
        },1000/30);
    }
    collisionLock(){
        this.lock=1;
        setTimeout(()=>{
            this.lock = 0;
        },200);
    }
}


class StaticObject{
    constructor(objectId){
        this.objectName = objectList[objectId].name;
        this.height = objectList[objectId].height;
        this.width = objectList[objectId].width;
        this.x=0;
        this.y=0;
        this.setCoordinates();
        this.imagePath = `../client/images/Environment/${this.objectName}.png`;
    }
    setCoordinates(){
        this.x = Math.floor(Math.random()*700);
        this.y = Math.floor(Math.random()*500);
    }
}


exports.Tank = Tank;
exports.Bullet = Bullet;
exports.StaticObject = StaticObject;
exports.objectList = objectList;