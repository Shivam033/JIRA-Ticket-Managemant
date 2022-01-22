let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modalCont = document.querySelector(".modal-cont")
let mainCont = document.querySelector(".main-cont");
let textAreaCont = document.querySelector(".textarea-cont")
let allPriorityColors = document.querySelectorAll(".priority-color");
let toolBoxColors = document.querySelectorAll(".color");

let colors = ["lightpink", "lightblue", "lightgreen", "black"];
let modalPriorityColor = colors[colors.length-1];

let addFlag = false;
let removeFlag = false;

let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let ticketArr = [];

if(localStorage.getItem("jira_tickets")){
    // Retrieve & display
    ticketArr = JSON.parse(localStorage.getItem("jira_tickets"))
    ticketArr.forEach((ticketObj)=>{
        createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
    })
}

for(let i=0; i<toolBoxColors.length; i++){
    toolBoxColors[i].addEventListener("click", (e)=>{
        let currentToolBoxColor = toolBoxColors[i].classList[0];

        let filteredTickets = ticketArr.filter((ticketObj, idx)=>{
            return currentToolBoxColor === ticketObj.ticketColor;
        })
        // Remove previous ticket
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for(let i=0; i<allTicketsCont.length; i++){
            allTicketsCont[i].remove();
        }

        //Display new filtered tickets
        filteredTickets.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID);
        })
    })
    toolBoxColors[i].addEventListener("dblclick", (e)=>{
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for(let i=0; i<allTicketsCont.length; i++){
            allTicketsCont[i].remove();
        }
        ticketArr.forEach((ticketObj, idx)=>{
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketID)
        })
    })
}

//listener for modal priority coloring
allPriorityColors.forEach((colorElem, idx)=>{
    colorElem.addEventListener("click", (e)=>{
        allPriorityColors.forEach((priorityColorElem, idx)=>{
            priorityColorElem.classList.remove("border");
        }) //Border changing onClick
        colorElem.classList.add("border");

        modalPriorityColor = colorElem.classList[0];
    })
})

addBtn.addEventListener("click", (e)=>{
    // display modal
    // generate ticket

    // Add flag, true --> modal desplay
    // Add flag false --> modal none
    addFlag = !addFlag;
    if(addFlag){
        modalCont.style.display = "flex";
    }else{
        modalCont.style.display = "none";
    }
})

removeBtn.addEventListener("click", (e)=>{
    removeFlag = !removeFlag;
})

modalCont.addEventListener("keydown", (e)=>{
    let key = e.key;
    if(key == "Enter"){
        createTicket(modalPriorityColor, textAreaCont.value);
        setModalToDefault();
        addFlag = false;
    }
})

function createTicket(ticketColor, ticketTask, ticketID){

    let id = ticketID || shortid();

    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-cont");
    ticketCont.innerHTML = `
        <div class="ticket-color ${ticketColor}"></div>
        <div class="ticket-id">#${id}</div>
        <div spellcheck="false" class="task-area">${ticketTask}</div>
        <div class="ticket-lock">
            <i class="fas fa-lock"></i>
        </div>

    `;
    mainCont.appendChild(ticketCont);

    //Create obj of tickets and add to array
    //push ticketID only if it is undefined--> to remove duplicacy
    if(!ticketID) {
        ticketArr.push({ticketColor, ticketTask, ticketID: id});
        localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));
    }

    handleRemoval(ticketCont, id);
    handleLock(ticketCont, id);
    handleColor(ticketCont, id);
}

function handleRemoval(ticket, id){
    // removeFlag --> true --> remove
    ticket.addEventListener("click", (e)=>{

        if(!removeFlag) return;
        let idx = getTicketIdx(id);
        ticketArr.splice(idx, 1);
        // DB removal
        let strTicketArr = JSON.stringify(ticketArr);
        localStorage.setItem("jira_tickets", strTicketArr);
        // UI removal
        ticket.remove();
    })
}

function handleLock(ticket, id){
    let ticketLockElem = ticket.querySelector(".ticket-lock");
    let ticketLock = ticketLockElem.children[0];
    let ticketTaskArea = ticket.querySelector(".task-area");


    ticketLock.addEventListener("click", (e)=>{
        let ticketIdx = getTicketIdx(id);
        if(ticketLock.classList.contains(lockClass)){
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable", "true");
        }else{
            ticketLock.classList.add(lockClass);
            ticketLock.classList.remove(unlockClass);
            ticketTaskArea.setAttribute("contenteditable", "false");
        }

        // Modify data in localStorage (Ticket task)
        ticketArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketArr))
    })
}

function handleColor(ticket, id){
    let ticketColor = ticket.querySelector(".ticket-color");
    ticketColor.addEventListener("click", (e)=>{
        // get ticket index from tickets array
        let ticketIdx = getTicketIdx(id);
        let currentTicketColor = ticketColor.classList[1];
        //Get ticket color idx
        let currentTicketColorIdx = colors.findIndex((color)=>{
            return currentTicketColor === color;
        })
        currentTicketColorIdx++;
        let newTicketColorIdx = currentTicketColorIdx % colors.length;
        let newTicketColor = colors[newTicketColorIdx];
        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newTicketColor);

        // Modify data in localstorage(priority color change)
        ticketArr[ticketIdx].ticketColor = newTicketColor;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketArr));
    })
}

function getTicketIdx(id){
    let ticketIdx = ticketArr.findIndex((ticketObj)=>{
        return  ticketObj.ticketID === id;
    })
    return ticketIdx
}

function setModalToDefault(){
    modalCont.style.display = "none";
    textAreaCont.value = "";
    modalPriorityColor = colors[colors.length-1];
    allPriorityColors.forEach((priorityColorElem, idx)=>{
        priorityColorElem.classList.remove("border");
    })
    allPriorityColors[allPriorityColors.length-1].classList.add("border");
}