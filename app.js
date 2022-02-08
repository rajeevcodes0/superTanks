//importing the classes
let classes = require('./server/classes')

//then unpacking them in local variable for use
let Tank = classes.Tank;
let staticObject = classes.StaticObject;
let objectList = classes.objectList;


//server variables
//-------------------------------------------------------------------//
//contains the list of all active players
let activePlayers = [];

//for firing the "bulletCollisionChecker" only once
let locker=1;

//list of all selected static objects
let staticObjects = [];

//frames per second
let fps = 30;

//FUNCTIONS

//function to create and log the player in activePlayer list
//it receives the information of the player and the array in which we have to log it
function createPlayer(playerInfo, activePlayersArray){

	console.log("creating player");
	//creating an a tank object, by passing the player info for the constructor function
	let newPlayer = new Tank(playerInfo);

	//a variable to check if the tank has been placed in the ground or not
	let tankPlaced = 0;

	//we will try to place the tank on the ground by giving it random numbers
	while(!tankPlaced){

		//we will check if the new coordinates make the tank collide with any of the static objects
		for(let i=0;i<staticObjects.length;i++){
			if(collisionDetection(newPlayer,staticObjects[i])){
				console.log('collision happening');
				//if collision occours we give the tank new coordinates
				newPlayer.setCoordinates();
				//and break out of this placing loop
				break;
			}
			//if we are able to loop all static objects and found no collision , that means our object has been placed
			if(i==staticObjects.length-1){
				tankPlaced=1;
			}

		}
	}

	//inserting the new player at his id, so that we can retrive him quickly in future,hashing
	//buggy: two players might by accident may have same id
	activePlayersArray[playerInfo.id]=newPlayer;
	return newPlayer;
}

//function to populate environment with five random objects
function populateEnvironment(staticObjectsArray){
	for(let i=0;i<5;i++){
		//we generate a random number , to select our static object from the list
		let objectId = Math.floor( Math.random()*11 ); //11 because there are 12 objects and array starts with 0 index

		//then we create a new static object by providing the objectId to the staticObject constructor 
		let newStaticObject = new staticObject(objectId);

		//must to avoid infinite loop
		if(staticObjectsArray.length==0){
			staticObjectsArray[i]=newStaticObject;

		}else{
			let placed=false;
			while(!placed){
				for(let j=0;j<staticObjectsArray.length;j++){
					if(collisionDetection(newStaticObject,staticObjectsArray[j])){
						newStaticObject.setCoordinates();
					}
					if(j==staticObjectsArray.length-1){
						placed=true;
						break;
					}
				}
			}
			//putting that staticObject inside staticObjectArray
			staticObjectsArray[i]=newStaticObject;
		}
	}
}

//function to check collision 
function collisionDetection(objectA, objectB){

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

		return true;
	}else{

		return false;

	}
}


function bulletCollisionChecker(){

	setInterval(()=>{
		//checking for static objects
		let filteredActivePlayers = activePlayers.filter((player)=>{
			return player;
		});
		//console.log(filteredActivePlayers);
		for(let i=0;i<filteredActivePlayers.length;i++){

			for(let j=0;j<filteredActivePlayers[i].bulletsFired.length;j++){
				//checking with static objects

				//we must check if the bullet exists or not
				if(filteredActivePlayers[i].bulletsFired[j]){

					for(let k=0;k<staticObjects.length;k++){
						let returnValue = collisionDetection(filteredActivePlayers[i].bulletsFired[j],staticObjects[k]);

						if(returnValue && !filteredActivePlayers[i].bulletsFired[j].lock){
							//console.log(filteredActivePlayers[i].bulletsFired[j]);

							filteredActivePlayers[i].bulletsFired[j].collisionLock();
							filteredActivePlayers[i].bulletsFired[j].angle = -(filteredActivePlayers[i].bulletsFired[j].angle);
							//console.log(filteredActivePlayers[i].bulletsFired[j]);
							
						}
					}
				}
				
			}
		}

		//checking for activePlayers
		for(let i=0;i<filteredActivePlayers.length;i++){

			let bulletDeleted=false; //for breaking out of the loop when bullet is deleted after collision
			for(let j=0;j<filteredActivePlayers[i].bulletsFired.length;j++){
				//checking with static objects

				//so for this bullet we will check all the tanks
				for(let k=0;k<filteredActivePlayers.length;k++){
					
					//but for this bullet we will exclude the tank from which it was fired
					if(filteredActivePlayers[k].id!=filteredActivePlayers[i].bulletsFired[j].tankId){

						/*console.log("from tank");
						console.log(filteredActivePlayers[i]);

						console.log('the bullet')
						console.log(filteredActivePlayers[i].bulletsFired[j]);

						console.log('target tank');
						console.log(filteredActivePlayers[k]);*/
						let returnValue = collisionDetection(filteredActivePlayers[i].bulletsFired[j],filteredActivePlayers[k]);

						if(returnValue && !filteredActivePlayers[i].bulletsFired[j].lock){

							/*console.log("collision with ");
							console.log(filteredActivePlayers[k]);*/
							
							//upon collision decrease health
							filteredActivePlayers[k].health--;

							//once collision occurs , lock it for few milisecs, because of high frame rate
							filteredActivePlayers[i].bulletsFired[j].collisionLock();

							//if health is zero
							if(filteredActivePlayers[k].health==0){
								//let everyone know who died
								io.emit("playerDied",filteredActivePlayers[k]);

								activePlayers[filteredActivePlayers[k].id]=null;

								let inLineFilteredActivePlayers = activePlayers.filter((player)=>{return player});
								for(let z=0;z<inLineFilteredActivePlayers.length;z++){
									activePlayers[inLineFilteredActivePlayers[z].id]=inLineFilteredActivePlayers[z];
								}

							}
							//now deleting the bullet
							let parentTank = filteredActivePlayers[i];
							console.log('parent');
							console.log(parentTank);
							let thisBullet = parentTank.bulletsFired[j];
							console.log('this bullet');
							console.log(thisBullet);

							for(let m =0;m<parentTank.bulletsFired.length;m++){
								if(parentTank.bulletsFired[m] && parentTank.bulletsFired[m].tankId==thisBullet.tankId){
									parentTank.bulletsFired[m]=null;
									bulletDeleted=true;
									parentTank.bulletsFired = parentTank.bulletsFired.filter((bullet)=>{return bullet});
									break;
								}
							}
						
						}
					}
					if(bulletDeleted){
						break;
					}
				}
			}
		}

	},1000/fps)
}

//taking express
let express = require("express");

//will return an object on which we can call functions 
//like get, use etc;
let app = express();

//for joining paths
let path = require("path");

//server is our server. the Server() is lower level of createServer();
//we pass app in Server(); to give it capibilites of dealing with server
let server = require("http").Server(app);


//if someone visits the root directory, send him index.html
app.get('/',(req,res)=>{
	res.sendFile(__dirname+'/client/index.html');
});

app.get('/game',(req,res)=>{
	console.log('beeter hun');
	res.sendFile(__dirname+'/client/game.html');
})

//use the client folder as public folder, anyone can read it
app.use(express.static(path.join(__dirname,'client')));

//listen on port 5000, hence go to localhost:5000
server.listen(5000);
console.log(`server started`);

//creating a socket on server side
var io = require("socket.io")(server);


//once everything is setup , pick five random objects
//objectList is the list of all available objects
//staticObjects is the list of five picked up objects
populateEnvironment(staticObjects);

//whenever a new connection is made, it emmits 'connection' by default
io.on("connection",socket=>{
	console.log('new connection');
	socket.on("newPlayerEnters",(data)=>{
		//to let everyone know about the new player
		console.log('emitting new player alert');
		console.log("new player joined");
		let newPlayer = createPlayer(data,activePlayers);
		console.log("sending...")
		io.emit('newPlayerAlert',{activePlayers:activePlayers, newPlayer:newPlayer});
		
		if(locker){
			locker=0;
			console.log("fired ");
			bulletCollisionChecker();
			console.log('fired');
		}
		
	});


	//just like 'connection' , 'disconnected', is default too
	socket.on("disconnect",(data)=>{
		console.log("user disconnected");
	});

	socket.on("keyPressed",(data)=>{
		//getting the id
		let id = parseInt(data.cookie.split(",")[2].split("=")[1]);
		//thisPlayer is player which pressed the key most recently
		let thisPlayer = activePlayers[id];
		//console.log(activePlayers);

		console.log("this key is pressed");
		console.log(data);
		//calling the controller function of the respective tank
		thisPlayer.controller(data.key,staticObjects,activePlayers);

		//let everyone know the newpositions, upon getting this array, they will
		//draw in their respective canvases.
	});
	//to reset the environment
	socket.on('resetEnvironment',(data)=>{
		populateEnvironment(staticObjects);
	});
	setInterval(()=>{
		io.emit("newPositions",{allPlayers:activePlayers,allStaticObjects:staticObjects});
	},1000/fps);
});



