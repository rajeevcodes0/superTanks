//environment variables
let activePlayers = [];
let bullets = [];
let staticObjects = [];

let fps = 30;

//connecting to the socket
var socket =io();


//to hide the animation after 2 secs, mimicing the laoding screen
//plus we need to get whole thing loaded before performing operations

function createAlert(message){
    let alertBox = document.createElement('div');
    let alertText = document.createElement('p');

    alertBox.className = "alertBox";
    alertText.className = "alertText";
    alertText.innerText=`${message}`;
    alertBox.appendChild(alertText);
    document.body.appendChild(alertBox);

    setTimeout((alertBox)=>{
        alertBox.style.display = "none";
    },3000,alertBox);
}

function generateCard(data){
    //grabbing the status bar

    let filteredActivePlayers = data.activePlayers.filter((player)=>{return player});
    console.log("generating card")
    let statusBar = document.getElementById("statusBar");
    //creating the card

    statusBar.innerHTML="";

    console.log(data);
    for(let i=0;i<filteredActivePlayers.length;i++){
        let newCard = document.createElement('div');

        newCard.className="statusBarCard";

        let newCardName = document.createElement('p');
        newCardName.innerText=`${filteredActivePlayers[i].playerName}`;
        newCard.appendChild(newCardName);
        statusBar.appendChild(newCard);
    }
}

function deleteCard(player){
    let statusBar = document.getElementById("statusBar");
    let allDivs = document.getElementsByClassName("statusBarCard");

    for(let i=0;i<allDivs.length;i++){
        let name = allDivs[i].getElementsByTagName('p')[0].innerText;
        if(name == player.playerName){
            allDivs[i].style.display="none";
        }
    }
}

function afterLoad(){
    //for hiding animation
    let animationDiv = document.getElementById("loadingAnimation");
    setTimeout(()=>{
        animationDiv.style.display="none";
    },2000);


    let statusBar = document.getElementById("statusBar");
    //binding keys to document
    document.addEventListener("keydown",(event)=>{

        socket.emit('keyPressed',{key:event.key,cookie:document.cookie});
    })

    //adding event listener to resetEnvironment div
    let resetEnvironment = document.getElementById("environmentChanger");
    resetEnvironment.addEventListener("click",()=>{
        socket.emit("resetEnvironment",5);
    });

    socket.on("newPositions",(data)=>{
        //we update active players and bullet data as soon as it arives
        //a prefix 'all' is used for server side variables
        activePlayers = data.allPlayers;
        staticObjects = data.allStaticObjects;
        //console.log(staticObjects);

    })

    socket.on('newPlayerAlert',(data)=>{

        //generating an alertBox, to notify about new players

        console.log("gettig new palyer alert");
        createAlert(`${data.newPlayer.playerName} Joined`);
        console.log('generating card');
        generateCard(data);

        

    })
    socket.on('playerDied',(data)=>{
        createAlert(`${data.playerName} Died`);
        deleteCard(data);
    })

    //for drawing image on the canvas
    let canvas = document.getElementById("ctx");
    let ctx = canvas.getContext('2d');
    

    //images to use
    var backgroundImage = document.getElementById("canvasBackground");

    var greenTank = document.getElementById("greenTank");
    var orangeTank = document.getElementById("orangeTank");
    var blueTank = document.getElementById("blueTank");

    var barrelGreen_side  = document.getElementById("barrelGreen_side");
    var barrelGreen_side_damaged = document.getElementById("barrelGreen_side_damaged");
    var barrelGreen_up = document.getElementById("barrelGreen_up");
    var barrelGrey_sde_rust = document.getElementById("barrelGrey_sde_rust");
    var barrelGrey_side= document.getElementById("barrelGrey_side");
    var barrelGrey_up = document.getElementById("barrelGrey_up");
    var barrelRed_side = document.getElementById("barrelRed_side");
    var barrelRed_up = document.getElementById("barrelRed_up");
    var oil = document.getElementById("oil");
    var sandbagBeige = document.getElementById("sandbagBeige");
    var sandbagBrown = document.getElementById("sandbagBrown");
    var treeSmall = document.getElementById("treeSmall");

    var dot = document.getElementById("dot");

    var blueTankBullet = document.getElementById("blueTankBullet");
    var greenTankBullet = document.getElementById("greenTankBullet");
    var redTankBullet = document.getElementById("redTankBullet");

    var smokeGrey4 = document.getElementById("smokeGrey4");

    


    //this is our update function
    setInterval(()=>{
        //for clearing the canvas each time
        ctx.clearRect(0,0,800,600);
        //first we must draw backgound, because for drawing
        //moving objects, we have to rotate canvas
        ctx.drawImage(backgroundImage,0,0);

        //then we draw static objects
        for(let i=0;i<staticObjects.length;i++){
            let currentObject = null;
            if(staticObjects[i].objectName == "barrelGreen_side"){

                currentObject = barrelGreen_side;

            }else if(staticObjects[i].objectName == "barrelGreen_side_damaged"){

                currentObject = barrelGreen_side_damaged;

            }else if(staticObjects[i].objectName == "barrelGreen_up"){

                currentObject = barrelGreen_up;

            }
            else if(staticObjects[i].objectName == "barrelGrey_sde_rust"){

                currentObject = barrelGrey_sde_rust;

            }
            else if(staticObjects[i].objectName == "barrelGrey_side"){

                currentObject = barrelGrey_side;

            }else if(staticObjects[i].objectName == "barrelGrey_up"){

                currentObject = barrelGrey_up;

            }else if(staticObjects[i].objectName == "barrelRed_side"){

                currentObject = barrelRed_side;

            }else if(staticObjects[i].objectName == "barrelRed_up"){

                currentObject = barrelRed_up;

            }else if(staticObjects[i].objectName == "oil"){
                currentObject = oil;
            }else if(staticObjects[i].objectName == "sandbagBeige"){

                currentObject = sandbagBeige;

            }else if(staticObjects[i].objectName == "sandbagBrown"){

                currentObject = sandbagBrown;

            }else if(staticObjects[i].objectName == "treeSmall"){

                currentObject = treeSmall;
            }
            ctx.save();
            ctx.translate(staticObjects[i].x,staticObjects[i].y);

            ctx.drawImage(currentObject,-staticObjects[i].width/2,-staticObjects[i].height/2);
            ctx.restore();
            ctx.drawImage(dot,staticObjects[i].x,staticObjects[i].y);

        }
        //then we draw tanks , because to draw them, we have to rotate the canvas
        for(let i = 0;i<activePlayers.length;i++){
            let currentTank=null;

            if(activePlayers[i]){
                if(activePlayers[i].tankName == "blueTank"){
                    currentTank=blueTank;
                }else if(activePlayers[i].tankName == "orangeTank"){
                    currentTank=orangeTank;
                }else if(activePlayers[i].tankName == "greenTank"){
                    currentTank=greenTank;
                }

                ctx.save();
                ctx.translate(activePlayers[i].x,activePlayers[i].y);
                ctx.rotate(
                    (activePlayers[i].angle)*(Math.PI/180)   );

                
                ctx.drawImage(currentTank,-25,-25);
                ctx.drawImage(dot,-activePlayers[i].width/2,-activePlayers[i].height/2);
                ctx.restore();
                ctx.drawImage(dot,activePlayers[i].x,activePlayers[i].y);
            }
        }

        //Rendering bullets
        for(let i=0;i<activePlayers.length;i++){
            if(activePlayers[i]){
                for(let j=0;j<activePlayers[i].bulletsFired.length;j++){
                    let currentBullet  = null;
                    if(activePlayers[i].bulletsFired[j].bulletName=="greenTankBullet"){
                        currentBullet = greenTankBullet;
                    }else if(activePlayers[i].bulletsFired[j].bulletName=="blueTankBullet"){
                        currentBullet = blueTankBullet;
                    }else if(activePlayers[i].bulletsFired[j].bulletName=="redTankBullet"){
                        currentBullet = redTankBullet;
                    }
                    ctx.save();
                    ctx.translate(activePlayers[i].bulletsFired[j].x, activePlayers[i].bulletsFired[j].y);
                    ctx.rotate(
                    (activePlayers[i].bulletsFired[j].angle)*(Math.PI/180)   );

                
                    ctx.drawImage(currentBullet,
                        -(activePlayers[i].bulletsFired[j].width)/2,
                        -(activePlayers[i].bulletsFired[j].height)/2);
                    ctx.restore();
                }
            }
        }


        
    },1000/fps); //1000 means 1 sec, 1000/fps means fps no. of frames per sec



}

window.onload=afterLoad;