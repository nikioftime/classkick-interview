// var but = document.createElement("button");
// var count = 1;
// var name = "button-"+count.toString();
// but.setAttribute("id", name);
// var node = document.createTextNode("This is new.");
// but.appendChild(node);
// var element = document.getElementById("button-container");
// element.appendChild(but);
var myFirebaseRef = new Firebase("https://blinding-fire-3403.firebaseio.com/");
var connectedRef = new Firebase("https://blinding-fire-3403.firebaseio.com/.info/connected");
var buttonBase = myFirebaseRef.child('/buttons');

var n = 4;
var button_bool_array=[];
for (var i = 0; i < 2*n; i++)
{
	var row = document.createElement("div")
	row.classList.add("row");
	for (var j = 0; j < n; j++)
	{
		var but = document.createElement("button");
		var name = "button-"+(i*n + j);
		var thisButton = buttonBase.child('/'+name);
		// thisButton.set(
		// 	{
		// 		"toggle": true,
		// 		"number": (i*n + j)
		// 	}
		// );
		var funct = "change(this,'"+name+"',"+(i*n + j)+")";
		but.setAttribute("id", name);
		but.setAttribute("onclick", funct);
		but.classList.add("cycle");
		but.classList.add("on");
		var node = document.createTextNode(name);
		but.appendChild(node);
		// thisButton.once('value', function(data) {
 	// 		var isOn = data.val().toggle;
 	// 		console.log(isOn);
 	// 		button_bool_array.push(isOn);
 	// 		if (!isOn)
 	// 		{
 	// 			but.classList.remove("on");
 	// 		}
		// });
		row.appendChild(but);
	}
	var element = document.getElementById("button-container");
	element.appendChild(row);
};
buttonBase.orderByKey().on("child_added", function(snapshot) {
	var item = snapshot.val();
	button_bool_array[item.number] = item.toggle;
	if (!(item.toggle))
	{
		document.getElementById(snapshot.key()).classList.remove("on");
	}
});

buttonBase.on("child_changed", function(snapshot) {
	var isOn = snapshot.val().toggle;
	var elemID = snapshot.key();
	if (isOn)
	{
		document.getElementById(elemID).classList.add("on");
	}
	else
	{
		document.getElementById(elemID).classList.remove("on");
	}
});

function change (elem, name, num) {
	if (button_bool_array[num])
	{
		elem.classList.remove("on");
		var buttonRef = buttonBase.child(name);
		buttonRef.update({
			"toggle": false
		});
		button_bool_array[num] = false;
	}
	else
	{
		var buttonRef = buttonBase.child(name);
		buttonRef.update({
			"toggle": true
		});
		elem.classList.add("on");
		button_bool_array[num] = true;
	}
}

connectedRef.on("value", function(snap) {
  if (snap.val() === true) {
    document.getElementById("fire").style.display = 'block';
    document.getElementById("fire-extinguisher").style.display = 'none';
  } else {
    document.getElementById("fire").style.display = 'none';
    document.getElementById("fire-extinguisher").style.display = 'block';
  }
});