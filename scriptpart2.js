var myFirebaseRef = new Firebase("https://blinding-fire-3403.firebaseio.com/");
var connectedRef = new Firebase("https://blinding-fire-3403.firebaseio.com/.info/connected");
var drawRef = myFirebaseRef.child('/draw');
var linesRef = drawRef.child('/lines');
var pixelRef = drawRef.child('/pixels');

document.getElementById('pentool').setAttribute("onclick", "changeeraser(0)");
document.getElementById('erasertool').setAttribute("onclick", "changeeraser(1)");
// drawRef.remove();

var myCanvas = document.getElementById('drawing-canvas');
var context = myCanvas.getContext ? myCanvas.getContext('2d') : null;
var mouseDown = 0, lastPoint = null;
var currLine = 0, eraser = 0;

var changeeraser = function (value) {
	eraser = value;
}

function preventBehavior(e) {
    e.preventDefault(); 
};

document.addEventListener("touchmove", preventBehavior, false);

myCanvas.ontouchstart = myCanvas.onmousedown = function (e) { 
	mouseDown = 1;
	if (!eraser)
	{
		var offset = $('canvas').offset();
		var x1 = Math.round(e.pageX - offset.left),
		y1 = Math.round(e.pageY - offset.top);
		var px = x1 + ":" + y1;
		var line = linesRef.push({
			"initial-pixel" : {
				"px" : px
			}
		});
		currLine = line.key();
	}
}
myCanvas.ontouchend = myCanvas.onmouseout = myCanvas.onmouseup = function () {
	mouseDown = 0; 
	lastPoint = null;
	currLine = 0;
};


var drawLineOnMouseMove = function(e) {
	if (!mouseDown) return;

	e.preventDefault();
	var line = linesRef.child(currLine);

	// Bresenham's line algorithm. We use this to ensure smooth lines are drawn
	var offset = $('canvas').offset();
	var x1 = Math.round(e.pageX - offset.left),
	y1 = Math.round(e.pageY - offset.top);
	var x0 = (lastPoint == null) ? x1 : lastPoint[0];
	var y0 = (lastPoint == null) ? y1 : lastPoint[1];
	var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
	var sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1, err = dx - dy;
	while (true) {
		//write the pixel into Firebase, or if we are drawing white, remove the pixel
		if (eraser)
		{
			pixelRef.child(x1 + ":" + y1).remove();
			break;
		}
		else
		{
			pixelRef.child(x0 + ":" + y0).set({
				line: currLine
			});

			var px = x0 + ":" + y0;
			line.push({
				'px' : px
			});

			if (x0 == x1 && y0 == y1) break;
			var e2 = 2 * err;
			if (e2 > -dy) {
				err = err - dy;
				x0 = x0 + sx;
			}
			if (e2 < dx) {
				err = err + dx;
				y0 = y0 + sy;
			}
		}
	}
	lastPoint = [x1, y1];
};
$(myCanvas).mousemove(drawLineOnMouseMove);
$(myCanvas).mousedown(drawLineOnMouseMove);
myCanvas.addEventListener("touchmove", drawLineOnMouseMove, false);

var drawPixel = function(snapshot) {
	var coords = snapshot.key().split(":");
	context.fillStyle = "#000000";
	context.fillRect(parseInt(coords[0]), parseInt(coords[1]), 1, 1);
};
var clearPixel = function(snapshot) {
	var coords = snapshot.key().split(":");
	var toDelete = snapshot.val().line;
	linesRef.child(toDelete).remove();

	context.clearRect(parseInt(coords[0]), parseInt(coords[1]), 1, 1);

};
var clearLine = function(snapshot) {
	snapshot.forEach(function(childSnapshot)
	{
		var coords = childSnapshot.val().px;
		pixelRef.child(coords).remove();
	});

};

pixelRef.on('child_added', drawPixel);
pixelRef.on('child_changed', drawPixel);
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