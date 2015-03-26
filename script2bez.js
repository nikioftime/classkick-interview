var myFirebaseRef = new Firebase("https://blinding-fire-3403.firebaseio.com/");
var connectedRef = new Firebase("https://blinding-fire-3403.firebaseio.com/.info/connected");
var drawRef = myFirebaseRef.child('/draw');
var linesRef = drawRef.child('/lines');
var pixelRef = drawRef.child('/pixels');

document.getElementById('pentool').setAttribute("onclick", "changeeraser(0)");
document.getElementById('erasertool').setAttribute("onclick", "changeeraser(1)");
// drawRef.remove();

var myCanvas = document.getElementById('drawing-canvas');
console.log(myCanvas);
var context = myCanvas.getContext ? myCanvas.getContext('2d') : null;
var mouseDown = 0, lastPoint = null;
var currLine = 0, eraser = 0;

var changeeraser = function (value) {
	eraser = value;
	// console.log(eraser);
}

function preventBehavior(e) {
    e.preventDefault(); 
};

document.addEventListener("touchmove", preventBehavior, false);

myCanvas.ontouchstart = myCanvas.onmousedown = function (e) { 
	mouseDown = 1;
	if (!eraser)
	{
		// var offset = myCanvas.offset();
		var x1 = Math.round(e.pageX - myCanvas.offsetLeft),
		y1 = Math.round(e.pageY - myCanvas.offsetTop);
		var px = x1 + ":" + y1;
		var line = linesRef.push({
			// "initial-pixel" : {
			// 	"px" : px
			// }
		});
		currLine = line.key();
	}
}
myCanvas.ontouchend = myCanvas.onmouseout = myCanvas.onmouseup = function () {
	mouseDown = 0; 
	lastPoint = null;
	currLine = 0;
};

context.lineWidth = 3;


var drawLineOnMouseMove = function(e) {
	if (!mouseDown) return;

	e.preventDefault();
	var line = linesRef.child(currLine);

	// Bresenham's line algorithm. We use this to ensure smooth lines are drawn
	var x1 = Math.round(e.pageX - myCanvas.offsetLeft),
	y1 = Math.round(e.pageY - myCanvas.offsetTop);

	if (eraser)
	{

		pixelRef.child(x1 + ":" + y1).remove();		
	}
	else
	{
		context.lineWidth = 3;
		context.strokeStyle = "#000";
		pixelRef.child(x1 + ":" + y1).set({
			line: currLine
		});
		var px = x1 + ":" + y1;
		line.push({
			'px' : px
		});

		if (lastPoint !== null && lastPoint.length < 8)
		{
			lastPoint.push(x1);
			lastPoint.push(y1);
		}

		if ( lastPoint !== null && lastPoint.length === 8)
		{
			context.bezierCurveTo(lastPoint[0], lastPoint[1], lastPoint[2], lastPoint[3], lastPoint[4], lastPoint[5]);
			context.stroke();
			context.beginPath();
			context.moveTo(lastPoint[4], lastPoint[5]);
			lastPoint = [x1, y1];
		}
		else if (lastPoint === null)
		{
			context.moveTo(x1, y1);
			context.beginPath();
			lastPoint = [];
		}
	}
};
$(myCanvas).mousemove(drawLineOnMouseMove);
$(myCanvas).mousedown(drawLineOnMouseMove);
myCanvas.addEventListener("touchmove", drawLineOnMouseMove, false);

var drawPixel = function(snapshot) {
	// var coords = snapshot.key().split(":");
	// context.fillStyle = "#000000";
	// context.fillRect(parseInt(coords[0]), parseInt(coords[1]), 1, 1);
};
var drawLine = function(snapshot) {
	context.lineWidth = 3;
 	context.strokeStyle = "#000";
	var drawPath = [];
	snapshot.forEach(function(childSnapshot)
	{
		var coords = childSnapshot.val().px;
		coords = coords.split(":");
		drawPath.push(coords[0]);
		drawPath.push(coords[1]);
	});
	context.beginPath();
	context.moveTo(drawPath[0], [1]);
	console.log(drawPath);

	for (var i = 5; i < drawPath.length; i++) {
		if ((i + 1) % 6 === 0)
		{
			context.bezierCurveTo(drawPath[i-5], drawPath[i-4], drawPath[i-3], drawPath[i-2], drawPath[i-1], drawPath[i]);
			context.stroke();
			console.log("stroked");
			context.beginPath();
			context.moveTo(drawPath[i-1], drawPath[i]);
		}
	};
	context.stroke();
}
var clearPixel = function(snapshot) {
	var coords = snapshot.key().split(":");
	var toDelete = snapshot.val().line;
	console.log(toDelete);
	linesRef.child(toDelete).remove();

	context.clearRect(parseInt(coords[0]), parseInt(coords[1]), 1, 1);
};
var clearLine = function(snapshot) {
	var erasePath = [];
	context.lineWidth = 5;
	context.strokeStyle = "#fff";
	snapshot.forEach(function(childSnapshot)
	{
		var coords = childSnapshot.val().px;
		pixelRef.child(coords).remove();
		var coords = coords.split(":");
		erasePath.push(coords[0]);
		erasePath.push(coords[1]);
	});
	context.beginPath();
	context.moveTo(erasePath[0], [1]);
	console.log(erasePath);

	for (var i = 5; i < erasePath.length; i++) {
		if ((i+1) % 6 === 0)
		{
			context.bezierCurveTo(erasePath[i-5], erasePath[i-4], erasePath[i-3], erasePath[i-2], erasePath[i-1], erasePath[i]);
			context.stroke();
			console.log("stroked");
			context.beginPath();
			context.moveTo(erasePath[i-1], erasePath[i]);
		}
	};
	context.stroke();
	context.lineWidth = 3;
	context.strokeStyle = "#000";
};

// linesRef.on('child_added', drawLine);
// linesRef.on('child_changed', drawLine);
pixelRef.on('child_removed', clearPixel);
linesRef.on('child_removed', clearLine);

connectedRef.on("value", function(snap) {
  if (snap.val() === true) {
    document.getElementById("fire").style.display = 'block';
    document.getElementById("fire-extinguisher").style.display = 'none';
  } else {
    document.getElementById("fire").style.display = 'none';
    document.getElementById("fire-extinguisher").style.display = 'block';
  }
});