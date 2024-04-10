//Allways keep page at propper position,
// prevents page scrolling acidentally due to html elements going out of view.
let mouseDebugger = true;

window.setInterval(function () {
  window.scrollTo(0, 0);
}, 200);

var mouseOverList = [];

var lastMouseOverObject;
var lastThingToDo = {
  leftMouseDown: false,
  rightMouseDown: false,
};
var shiftKey = false;

let scaleFactor = 2;
let absoluteX = 0;
let absoluteY = 0;
let deltaY;
let eventType;

window.addEventListener(
  "message",
  (event) => {
    const thingToDo = event.data;
    if (typeof thingToDo !== "object") return;

    absoluteX = thingToDo.absoluteX ? thingToDo.absoluteX : "";
    absoluteY = thingToDo.absoluteY ? thingToDo.absoluteY : "";

    if (mouseDebugger) console.log(absoluteX, absoluteY);

    deltaY = thingToDo.deltaY ? thingToDo.deltaY : "";
    eventType = thingToDo.eventType ? thingToDo.eventType : "";

    if (eventType == "shiftDown") {
      shiftKey = true;
      const itemsUnderMouse = elementsFromPointIgnoreMouse(absoluteX, absoluteY);
      itemsUnderMouse.forEach((item, key) => {
        item.dispatchEvent(new KeyboardEvent("keydown", { shiftKey: true }));
        item.dispatchEvent(new KeyboardEvent("keypress", { shiftKey: true }));
      });
      return;
    }

    if (eventType == "shiftUp") {
      shiftKey = false;
      const itemsUnderMouse = elementsFromPointIgnoreMouse(absoluteX, absoluteY);
      itemsUnderMouse.forEach((item, key) => {
        item.dispatchEvent(new KeyboardEvent("keyup", { shiftKey: false }));
      });
      return;
    }

    if (lastThingToDo.leftMouseDown !== thingToDo.leftMouseDown) {
      if (thingToDo.leftMouseDown == true) {
        eventType = "leftDragStart";
      } else {
        eventType = "leftDragEnd";
      }
    }

    if (lastThingToDo.rightMouseDown !== thingToDo.rightMouseDown) {
      if (thingToDo.rightMouseDown == true) {
        eventType = "rightDragStart";
      } else {
        eventType = "rightDragEnd";
      }
    }


    lastThingToDo = thingToDo;

    const itemsUnderMouse = elementsFromPointIgnoreMouse(absoluteX, absoluteY);

    doTheProperEvents(itemsUnderMouse[0]);

    let mouseOutObjects = [];

    let newMouseOverList = [];
    mouseOverList.forEach((item, key) => {
        console.log(itemsUnderMouse);
      if (!itemsUnderMouse.includes(item)) {
        mouseOutObjects.push(item);
      } else {
        newMouseOverList.push(item);
      }
    });

    mouseOverList = newMouseOverList;

    mouseOutObjects.forEach((item, key) => {
      exicuteEvents(item, [
        "mouseleave",
        "mouseout",
        "mouseexit",
        "pointerleave",
        "pointerout",
      ]);
    });
  },
  true
);

function elementsFromPointIgnoreMouse(absoluteX, absoluteY){
    const items = document.elementsFromPoint(absoluteX, absoluteY);
    return items.slice(2);
}

function doTheProperEvents(item) {
    console.log(eventType);
  if (eventType == "mousemove") {
    exicuteEvents(item, ["pointermove", "mousemove"]);

    if (!mouseOverList.includes(item)) {
      mouseOverList.push(item);
      exicuteEvents(item, ["mouseenter", "pointerenter"]);
    }
  }

  if (eventType == "leftDragStart") {
    exicuteEvents(item, ["pointerdown", "mousedown"]);
  }

  if (eventType == "leftDragEnd") {
    exicuteEvents(item, ["pointerup", "mouseup", "click"]);
  }

  if (eventType == "rightDragStart") {
    exicuteEvents(
      item,
      ["pointerdown", "mousedown"],
      { button: 2 }
    );
  }

  if (eventType == "rightDragEnd") {
    exicuteEvents(item, ["pointerup", "mouseup", "auxclick"], { button: 2 });
  }

  if (eventType == "click") {
    exicuteEvents(item, ["pointerdown", "mousedown", "pointerup", "mouseup", "click"]);
    if (item.nodeName == "INPUT") item.focus();
  }
  if (eventType == "dblclick") {
    if (item.nodeName == "INPUT") item.focus();

    exicuteEvents(item, ["mousedown", "mouseup", "click", "dblclick"]);
  }
  if (eventType == "rightclick") {
    exicuteEvents(
      item,
      ["pointerdown", "mousedown"],
      { button: 2 });
    exicuteEvents(
      item,
      ["pointerup"],
      { button: -1 }
    );
    exicuteEvents(
      item,
      ["mouseup", "auxclick", "contextmenu"],
      { button: 2 }
    );
  }
  if(eventType == "scrollUp") {
      exicuteEvents(item, ["wheel"],
      { which: 1, deltaMode: 0, delta: -100, deltaX: 0, deltaY: -100, deltaZ: 0, wheelDelta: 120, wheelDeltaX: 0, wheelDeltaY: 120 });
  }
  if(eventType == "scrollDown") {
      exicuteEvents(item, ["wheel"],
      { which: 0, deltaMode: 0, delta: 100, deltaX: 0, deltaY: 100, deltaZ: 0, wheelDelta: -120, wheelDeltaX: 0, wheelDeltaY: -120 });
  }
}

function exicuteEvent(TargetElement, eventToSend = {}) {
  eventToSend.clientX = absoluteX;
  eventToSend.clientY = absoluteY;
  eventToSend.x = absoluteX;
  eventToSend.y = absoluteY;
  eventToSend.pageX = absoluteX;
  eventToSend.pageY = absoluteY;
  eventToSend.view = window;
  eventToSend.bubbles = true;
  eventToSend.cancelable = true;
  eventToSend.shiftKey = shiftKey;
  if(eventToSend.type == "wheel"){
      return handleMouseWheel(TargetElement, eventToSend);
  }
  return handleMouseEvent(TargetElement, eventToSend);
}
function handleMouseWheel(TargetElement, eventToSend = {}){
    let delta = eventToSend.delta;
    eventToSend.screenX = absoluteX;
    eventToSend.screenY = absoluteY;
    eventToSend = new WheelEvent(eventToSend.type, eventToSend);
    eventToSend.delta = delta;
    canvas._onMouseWheel(eventToSend);
    return "Sending MouseWheel";
}

function handleMouseEvent(TargetElement, eventToSend = {}){
  eventToSend = new MouseEvent(eventToSend.type, eventToSend);
  try {
    testResult = TargetElement.dispatchEvent(eventToSend);
    if (mouseDebugger)
      if (!testResult)
        console.log(
          "event trigger failed",
          testResult,
          TargetElement,
          eventToSend
        );
    return testResult;
  } catch(e) {
    console.log(e);
    if (mouseDebugger)
      console.log("event trigger failed", TargetElement, eventToSend);
    return "failed";
  }
}

function exicuteEvents(TargetElement, eventTypes, eventToSend = {}) {
  const eventTemplate = JSON.parse(JSON.stringify(eventToSend));
  eventTypes.forEach((enenvtToFire, key) => {
    eventTemplate.type = enenvtToFire;
    exicuteEvent(TargetElement, eventTemplate);
  });
}

// Override mapEvent to ignore all touch events in the canvas
canvas.app.renderer.events.rootBoundary.mapEvent = function(e) {
    if (!this.rootTarget) {
      return;
    }
    if(e.pointerType == "touch"){
        return;
    }
    const mappers = this.mappingTable[e.type];
    if (mappers) {
      for (let i = 0, j = mappers.length; i < j; i++) {
        mappers[i].fn(e);
      }
    } else {
      console.warn(`[EventBoundary]: Event mapping not defined for ${e.type}`);
    }
};

// Testing block to catch all events sent to the board and print them
/*$("#board").on("mouseup mousedown mouseover mouseout mousemove click dblclick contextmenu auxclick pointerover pointerenter pointerdown pointermove pointerup pointercancel pointerout pointerleave wheel scroll mousewheel", function (e) {
    console.log(e.type);
    console.log(e);
});*/