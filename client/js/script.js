
var socket =io();

//loggin to the server
function logToServer(playerSelectionInfo){

    //taking cookies
    document.cookie = `name=${playerSelectionInfo.name}, tank =${playerSelectionInfo.tank}, id=${playerSelectionInfo.id}`;

    //sending to the server
    console.log(playerSelectionInfo);
    socket.emit("newPlayerEnters",playerSelectionInfo);

    //redireting to game page
    window.location.href="http://localhost:5000/game";
}

//to hide the animation after 2 secs, mimicing the laoding screen
let animationDiv = document.getElementById("loadingAnimation");
setTimeout(()=>{
    animationDiv.style.display="none";
},2000);

//for real world
//window.onload=()=>{animationDiv.style.display="none"};


//-------------------------------------------------------------------------------//


//grabbing each and every selectable tank
let allTank = document.getElementsByClassName("tank-select");

//a JSON object which will hold the name and tank selected by the player
let JSONToSend = {};
//adding event listener to each and every event
for(let i=0;i<allTank.length;i++){

    allTank[i].addEventListener("click",(event)=>{

        let tankId = event.target.id;

        //the input element
        let input = document.getElementsByTagName("input")[0];

        if(input.value==""){
            alert("Please Enter Your Name");
            input.focus();
        }else{
            //if name is provided, add both the JSON object
            JSONToSend.name = input.value;
            JSONToSend.tank = tankId;
            JSONToSend.id = Math.floor(Math.random()*100);
            //reset name value so that someone cant enter repeatedly
            input.value="";
            //finally send to the server
            //because callbacks are anync, and to deal with them, we call the dependent functions in the end    
            logToServer(JSONToSend);
        }


    })
}