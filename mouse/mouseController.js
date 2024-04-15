if (
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/iPod/i))
{
    // If IOS, load png for cursor
    $(document.body).append(`<img id="cursor" src="/modules/virtual-mouse/mouse/darkX.png" width="20000" height="20000">`);
} else {
    // Load svg for cursor
    $(document.body).append(`
    <svg id="cursor" xmlns="http://www.w3.org/2000/svg" viewBox="-10003 -10003 20010 20010">
    <path d="M 0 0 L 0 10000 Z M 0 0 L 0 -10000 M 0 0 L -10000 0 M 0 0 L 10000 0 M 25 0 A 1 1 0 0 0 -25 0 A 1 1 0 0 0 25 0" stroke="black" stroke-width="3" fill="none"/>
    </svg>`);
}


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
var lastTouchStartTime = 0;
var lastTouchStartTimeLeftButton = 0;
var lastTouchStartTimeRightButton = 0;
var lastTouchStartTimeScrollUpButton = 0;
var lastTouchStartTimeScrollDownButton = 0;

var timer1;
var timer2;
var timerLeftButton;
var timerRightButton;
var timerScrollUpButton;
var timerScrollDownButton;
var repetitiveScrollUp;
var repetitiveScrollDown;

var longTouchDuration = 400;
var shortTouchDuration = 200;
var shortTouchDurationButton = 300;
var touchPadLongPress1 = false;
var touchPadLongPress2 = false;
var ignoreSinglePress = false;
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

  let numTouches = event.touches.length;
  lastTouchStartTime = Date.now();
  lastTouchX = event.touches[0].clientX;
  lastTouchY = event.touches[0].clientY;
  if (numTouches == 1){
    timer1 = setTimeout(function() {
        touchPadLongPress1 = true;
        longPressLeftMouseButton();
    }, longTouchDuration); 
  }else if(numTouches == 2){
    ignoreSinglePress = true;
    setTimeout(function() {
        ignoreSinglePress = false;
    }, shortTouchDuration);
    timer2 = setTimeout(function() {
        touchPadLongPress2 = true;
        longPressRightMouseButton();
    }, longTouchDuration); 
  }
  //Set timeout for long touch detection
  

  event.preventDefault();
  event.stopPropagation();
});


document.getElementById("touchpadArea").addEventListener("touchend", function (event) {
  let numTouches = event.touches.length;
  if(lastTouchStartTime + shortTouchDuration > Date.now()){
    // short tap for click
    if(numTouches == 0 && !ignoreSinglePress){
        clickLeftMouseButton();
    }else if(numTouches > 0){
        clickRightMouseButton();
    }
  }
  if (timer1 && numTouches == 0){
    // Touch not long enough for timer
    clearTimeout(timer1);
  }
  
  if (timer2 && numTouches > 0){
    // Touch not long enough for timer
    clearTimeout(timer2);
  }
  if(touchPadLongPress1){
    touchPadLongPress1 = false;
    clickLeftMouseButton();
  }
  if(touchPadLongPress2){
    touchPadLongPress2 = false;
    releaseRightButton();
  }
  event.preventDefault();
  event.stopPropagation();
});

document.getElementById("touchpadArea").addEventListener("click", async function (event) {
  clickLeftMouseButton();
  event.preventDefault();
  event.stopPropagation();
});

document.getElementById("touchpadArea").addEventListener("dblclick", function (event) {
  event.preventDefault();
  event.stopPropagation();
  //sendNewEvent("dblclick");
});


document.getElementById("touchpadArea").addEventListener("touchmove", function (event) {
  event.preventDefault();
  event.stopPropagation();
  if (timer1){
    // Touch moved cancel long press
    clearTimeout(timer1);
  }
  if (event.touches.length == 1 || event.touches.length == 2){
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
});

document.getElementById("leftMouseButton").addEventListener("touchstart", function (event) {
  lastTouchStartTimeLeftButton = Date.now();
  //Set timeout for long touch detection
  timerLeftButton = setTimeout(longPressLeftMouseButton, longTouchDuration); 
  event.preventDefault();
  event.stopPropagation();
});


document.getElementById("leftMouseButton").addEventListener("touchend", function (event) {
  if (timerLeftButton){
    // Touch not long enough for timer
    clearTimeout(timerLeftButton);
  }
  
  if(lastTouchStartTimeLeftButton + shortTouchDurationButton > Date.now()){
    // short tap for click
    clickLeftMouseButton();
  }
  
  event.preventDefault();
  event.stopPropagation();
});

document.getElementById("rightMouseButton").addEventListener("touchstart", function (event) {
  lastTouchStartTimeRightButton = Date.now();
  //Set timeout for long touch detection
  timerRightButton = setTimeout(longPressRightMouseButton, longTouchDuration); 
  event.preventDefault();
  event.stopPropagation();
});


document.getElementById("rightMouseButton").addEventListener("touchend", function (event) {
  if (timerRightButton){
    // Touch not long enough for timer
    clearTimeout(timerRightButton);
  }
  
  if(lastTouchStartTimeRightButton + shortTouchDurationButton > Date.now()){
    // short tap for click
    clickRightMouseButton();
  }
  
  event.preventDefault();
  event.stopPropagation();
});

document.getElementById("ScrollDown").addEventListener("touchstart", function (event) {
  lastTouchStartTimeScrollDownButton = Date.now();
  //Set timeout for long touch detection
  timerScrollDownButton = setTimeout(holdPressScrollDownButton, longTouchDuration);
  event.preventDefault();
  event.stopPropagation();
});

document.getElementById("ScrollDown").addEventListener("touchend", function (event) {
    if (timerScrollDownButton) {
        // Touch not long enough for timer
        clearTimeout(timerScrollDownButton);
    }
    if (repetitiveScrollDown) {
        // Stopped holding press
        clearInterval(repetitiveScrollDown);
        holdReleaseButton(document.getElementById("ScrollDown"));
    }
    if (lastTouchStartTimeScrollDownButton + shortTouchDurationButton > Date.now()) {
        // short tap for click
        sendNewEvent("scrollDown");
    }
    event.preventDefault();
    event.stopPropagation();
});

document.getElementById("ScrollUp").addEventListener("touchstart", function (event) {
  lastTouchStartTimeScrollUpButton = Date.now();
  //Set timeout for long touch detection
  timerScrollUpButton = setTimeout(holdPressScrollUpButton, longTouchDuration);
  event.preventDefault();
  event.stopPropagation();
});

document.getElementById("ScrollUp").addEventListener("touchend", function (event) {
  if (timerScrollUpButton) {
      // Touch not long enough for timer
      clearTimeout(timerScrollUpButton);
  }
  if (repetitiveScrollUp) {
      // Stopped holding press
      clearInterval(repetitiveScrollUp);
      holdReleaseButton(document.getElementById("ScrollUp"));
  }
  if (lastTouchStartTimeScrollUpButton + shortTouchDurationButton > Date.now()) {
      // short tap for click
      sendNewEvent("scrollUp");
  }
  event.preventDefault();
  event.stopPropagation();
});

//Listeners to stop propagation
$("#touchpadArea").on("pointerup pointerdown pointermove", function (e) {
  e.preventDefault();
  e.stopPropagation();
});
$("#leftMouseButton").on("pointerup pointerdown pointermove contextmenu", function (e) {
  e.preventDefault();
  e.stopPropagation();
});
$("#rightMouseButton").on("pointerup pointerdown pointermove contextmenu", function (e) {
  e.preventDefault();
  e.stopPropagation();
});

function clickLeftMouseButton() {
    releaseLeftButton()
    doLeftClick();
}

function clickRightMouseButton() {
  if (!releaseRightButton()) {
    doRightClick();
  }
}

function releaseLeftButton(){
    let leftButton = document.getElementById("leftMouseButton");
    if(releaseButton(leftButton)) {
        mouseObject.leftMouseDown = false;
        return true;
    }
    return false;
}

function releaseRightButton(){
    let rightButton = document.getElementById("rightMouseButton");
    if(releaseButton(rightButton)) {
        mouseObject.rightMouseDown = false;
        return true;
    }
    return false;
}

function releaseButton(buttonToRelease) {
  if (buttonToRelease.innerHTML == "🔒") {
    buttonToRelease.innerHTML = "🔓";
    buttonToRelease.style.backgroundColor = InactiveButtonBackgroundColor;
    sendNewEvent("mousemove");
    return true;
  }
  // Nothing to release
  return false;
}

function longPressLeftMouseButton() {
  let leftButton = document.getElementById("leftMouseButton");
  if (leftButton.innerHTML == "🔒") {
    leftButton.innerHTML = "🔓";
    mouseObject.leftMouseDown = false;
    leftButton.style.backgroundColor = InactiveButtonBackgroundColor;
    sendNewEvent("mousemove");
  } else {
    leftButton.innerHTML = "🔒";
    mouseObject.leftMouseDown = true;
    leftButton.style.backgroundColor = ActiveButtonBackgroundColor;
    sendNewEvent("mousemove");
  }
}

function longPressRightMouseButton() {
  let rightButton = document.getElementById("rightMouseButton");
  if (rightButton.innerHTML == "🔒") {
    rightButton.innerHTML = "🔓";
    mouseObject.rightMouseDown = false;
    rightButton.style.backgroundColor = InactiveButtonBackgroundColor;
    sendNewEvent("mousemove");
  } else {
    rightButton.innerHTML = "🔒";
    mouseObject.rightMouseDown = true;
    rightButton.style.backgroundColor = ActiveButtonBackgroundColor;
    sendNewEvent("mousemove");
  }
}
function holdPressScrollUpButton() {
    let scrollUpButton = document.getElementById("ScrollUp");
    holdPressButton(scrollUpButton);
    repetitiveScrollUp = window.setInterval(function () {
        sendNewEvent("scrollUp");
    }, 150);
}

function holdPressScrollDownButton() {
    let scrollDownButton = document.getElementById("ScrollDown");
    holdPressButton(scrollDownButton);
    repetitiveScrollDown = window.setInterval(function () {
        sendNewEvent("scrollDown");
    }, 150);
}

function holdPressButton(heldButton) {
    heldButton.style.backgroundColor = ActiveButtonBackgroundColor;
}

function holdReleaseButton(heldButton) {
    heldButton.style.backgroundColor = InactiveButtonBackgroundColor;
}


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

window.addEventListener("message", function (event) {
  //console.log("Message received from the child: "); // Message received from child
  if (event.data == "showTouchpad") toggleMousepad("show");
});

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
  document.getElementById("virtual-mouse-controls").style.height = "0px";
  document.getElementById("virtual-mouse-controls").style.margin = "0px";
  document.getElementById("virtual-mouse-controls").style.padding = "0px";
  document.getElementById("virtual-mouse-controls").getElementsByClassName("window-content")[0].style.background = "unset";
  document.getElementById("virtual-mouse-controls").getElementsByClassName("window-header")[0].style.display = "none";
  document.getElementById("virtual-mouse-controls").style.top = "0px";
  document.getElementById("virtual-mouse-controls").style.left = "0px";
};