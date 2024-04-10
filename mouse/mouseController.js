/*document.body.innerHTML += `
  <svg id="cursor" xmlns="http://www.w3.org/2000/svg" viewBox="-10003 -10003 20010 20010">
  <path d="M 0 0 L 0 10000 Z M 0 0 L 0 -10000 M 0 0 L -10000 0 M 0 0 L 10000 0 M 25 0 A 1 1 0 0 0 -25 0 A 1 1 0 0 0 25 0" stroke="black" stroke-width="3" fill="none"/>
  </svg>`;*/
$(document.body).append(`
  <svg id="cursor" xmlns="http://www.w3.org/2000/svg" viewBox="-10003 -10003 20010 20010">
  <path d="M 0 0 L 0 10000 Z M 0 0 L 0 -10000 M 0 0 L -10000 0 M 0 0 L 10000 0 M 25 0 A 1 1 0 0 0 -25 0 A 1 1 0 0 0 25 0" stroke="black" stroke-width="3" fill="none"/>
  </svg>`);

cursor = document.getElementById("cursor");
cursor.style.width = "100px";
cursor.style.height = "100px";

ActiveButtonBackgroundColor = "rgba(252, 242, 44, 0.3)";
InactiveButtonBackgroundColor = "rgba(100, 94, 94, 0.4)";

const FakeMouseHolderDiv = document.getElementById("FakeMouseHolder");
const holderHolder = document.getElementById("holderHolder");

const mouseObject = {
  leftMouseDown: false,
  rightMouseDown: false,
  absoluteX: 100,
  absoluteY: 100,
  deltaY: 0,
  shiftKey: false,
  pickListMode: true,
};

var lastTouchX = 0;
var lastTouchY = 0;

var speed = 0.6;

//const pointerTarget = document.getElementById("pointerTarget");

function sendNewEvent(eventType) {
  let obj = JSON.parse(JSON.stringify(mouseObject));
  obj.eventType = eventType;
  //console.log("sending this", obj);
  return window.postMessage(obj);
}

document.getElementById("touchpadArea").addEventListener("touchstart", function (event) {
  if (window.innerHeight !== screen.height) document.body.requestFullscreen();

  if (event.touches.length == 1){
    lastTouchX = event.touches[0].clientX;
    lastTouchY = event.touches[0].clientY;
  }

  if (event.touches.length ==2){
    lastScrollY = event.touches[0].clientY;
    zooming = true;
  }
  event.preventDefault();
  event.stopPropagation();
});


document.getElementById("touchpadArea").addEventListener("touchend", function (event) {
  if (event.touches.length ==2){
    zooming = false;
    mouseObject.deltaY = 0;
    lastScrollY = 0;
  }
  event.preventDefault();
  event.stopPropagation();
});

document.getElementById("touchpadArea").addEventListener("click", async function (event) {
  document.getElementById("leftMouseButton").click();
  event.preventDefault();
  event.stopPropagation();
});

document.getElementById("touchpadArea").addEventListener("dblclick", function (event) {
  event.preventDefault();
  event.stopPropagation();
  //document.getElementById("leftMouseButton").click();
  sendNewEvent("dblclick");
});

document.getElementById("touchpadArea").addEventListener("contextmenu", function (event) {
  event.preventDefault();
  event.stopPropagation();
  document.getElementById("leftMouseButton").dispatchEvent(new CustomEvent("contextmenu"));
});

document.getElementById("touchpadArea").addEventListener("touchmove", function (event) {
  event.preventDefault();
  event.stopPropagation();
  if (event.touches.length == 1){
    let x = event.touches[0].clientX;
    let y = event.touches[0].clientY;
  
    let difrenceX = x - lastTouchX;
    let difrenceY = y - lastTouchY;
  
    lastTouchX = x;
    lastTouchY = y;
  
    mouseObject.absoluteX = mouseObject.absoluteX + difrenceX * speed;
    mouseObject.absoluteY = mouseObject.absoluteY + difrenceY * speed;
  
    mouseObject.absoluteX = mouseObject.absoluteX > 0 ? mouseObject.absoluteX : 1;
    mouseObject.absoluteY = mouseObject.absoluteY > 0 ? mouseObject.absoluteY : 1;
  
    cursor.style.left = mouseObject.absoluteX + "px";
    cursor.style.top = mouseObject.absoluteY + "px";
  
    sendNewEvent("mousemove");
  }

  if (event.touches.length == 2){
    //zoom zoom zoom
    console.log("zoom zoom zoom")

    let y = event.touches[0].clientY;
    let difrenceY = y - lastScrollY;
    lastScrollY = y;
    mouseObject.deltaY = difrenceY / 10000;
    sendNewEvent("zoom");
  }
});

document.getElementById("leftMouseButton").addEventListener("contextmenu", function (event) {
  event.preventDefault();
  event.stopPropagation();
  if (event.target.innerHTML == "🔒") {
    event.target.innerHTML = "🔓";
    mouseObject.leftMouseDown = false;
    event.target.style.backgroundColor = InactiveButtonBackgroundColor;
    sendNewEvent("mousemove");
  } else {
    event.target.innerHTML = "🔒";
    mouseObject.leftMouseDown = true;
    event.target.style.backgroundColor = ActiveButtonBackgroundColor;
    sendNewEvent("mousemove");
  }
});

document.getElementById("rightMouseButton").addEventListener("contextmenu", function (event) {
  event.preventDefault();
  event.stopPropagation();
  if (event.target.innerHTML == "🔒") {
    event.target.innerHTML = "🔓";
    mouseObject.rightMouseDown = false;
    event.target.style.backgroundColor = InactiveButtonBackgroundColor;
    sendNewEvent("mousemove");
  } else {
    event.target.innerHTML = "🔒";
    mouseObject.rightMouseDown = true;
    event.target.style.backgroundColor = ActiveButtonBackgroundColor;
    sendNewEvent("mousemove");
  }
});

document.getElementById("leftMouseButton").addEventListener("click", function (event) {
  event.preventDefault();
  event.stopPropagation();
  if (event.target.innerHTML == "🔒") {
    event.target.innerHTML = "🔓";
    mouseObject.leftMouseDown = false;
    event.target.style.backgroundColor = InactiveButtonBackgroundColor;
    sendNewEvent("mousemove");
  }
  doLeftClick();
});

document.getElementById("rightMouseButton").addEventListener("click", function (event) {
  event.preventDefault();
  event.stopPropagation();
  if (event.target.innerHTML == "🔒") {
    event.target.innerHTML = "🔓";
    mouseObject.rightMouseDown = false;
    event.target.style.backgroundColor = InactiveButtonBackgroundColor;
    sendNewEvent("mousemove");
  }else{
    doRightClick();
  }
});

document.getElementById("ScrollDown").addEventListener("click", function (event) {
  event.preventDefault();
  event.stopPropagation();
  sendNewEvent("scrollDown");
});

document.getElementById("ScrollUp").addEventListener("click", function (event) {
  event.preventDefault();
  event.stopPropagation();
  sendNewEvent("scrollUp");
});

//Listeners to stop propagation
$("#touchpadArea").on("pointerup pointerdown pointermove", function (e) {
  e.preventDefault();
  e.stopPropagation();
});
$("#leftMouseButton").on("pointerup pointerdown pointermove", function (e) {
  e.preventDefault();
  e.stopPropagation();
});
$("#rightMouseButton").on("pointerup pointerdown pointermove", function (e) {
  e.preventDefault();
  e.stopPropagation();
});

function toggleMousepad(showHide) {
  if (showHide) {
    if (showHide == "show") holderHolder.style.display = "block";
    if (showHide == "hide") holderHolder.style.display = "none";
    return;
  }

  if (holderHolder.style.display == "none") {
    sendNewEvent("toolsHide");
    holderHolder.style.display = "block";
  } else {
    holderHolder.style.display = "none";
  }
}

function doLeftClick() {
  sendNewEvent("click");
}

function doRightClick() {
  sendNewEvent("rightclick");
}

var lastScrollY = 0;
var zooming = false;

window.addEventListener("message", function (event) {
  console.log("Message received from the child: "); // Message received from child
  console.log(event.data);
  if (event.data == "showTouchpad") toggleMousepad("show");
});



/*pointerTarget.onload = function () {
  console.log("LOADING POINTER");
  const elem = document.createElement(`script`);
  elem.src = "modules/virtual-mouse/mouse/virtualMousePointer.js";
  elem.type="module";

  pointerTarget.contentDocument.body.appendChild(elem);

  console.log(window.location);
};*/

document.body.onload = function () {
  try {
    document.getElementById("mouseSpeed").value = localStorage.mouseSpeed;
  } catch {}
  //pointerTarget.src = "./" + window.location.search;
  //console.log("dats the window locations", window.location.search);
};

document.getElementById("saveSettings").onclick = function (event) {
  localStorage.mouseSpeed = document.getElementById("mouseSpeed").value;
  speed = localStorage.mouseSpeed;
  document.getElementById("mouse-settings").style.display = "none";
  document.getElementById("virtual-mouse-controls").style.width = "0px";
  document.getElementById("virtual-mouse-controls").style.heigth = "0px";
  document.getElementById("virtual-mouse-controls").style.top = "0px";
  document.getElementById("virtual-mouse-controls").style.left = "-100px";
};

/*document.getElementById("settingsButton").onclick = function (event) {
  document.getElementById("mouse-settings").style.display = "";
  //console.log("dats the window locations", window.location.search);
};*/

