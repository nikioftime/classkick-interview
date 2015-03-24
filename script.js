// var but = document.createElement("button");
// var count = 1;
// var name = "button-"+count.toString();
// but.setAttribute("id", name);
// var node = document.createTextNode("This is new.");
// but.appendChild(node);
// var element = document.getElementById("button-container");
// element.appendChild(but);
var myFirebaseRef = new Firebase("https://blinding-fire-3403.firebaseio.com/");
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
		// var thisButton = buttonBase.child('/'+name);
		// thisButton.set(
		// 	{
		// 		"toggle": true
		// 	}
		// );
		var funct = "change(this,'"+name+"',"+(i*n + j)+")";
		but.setAttribute("id", name);
		but.setAttribute("onclick", funct);
		but.classList.add("cycle");
		//but.classList.add("on");
		var node = document.createTextNode(name);
		but.appendChild(node);
		button_bool_array.push(true);
		row.appendChild(but);
	}
	var element = document.getElementById("button-container");
	element.appendChild(row);
};
console.log(buttonBase);

buttonBase.on("child_changed", function(snapshot) {
  var changedPost = snapshot.val();
  console.log("The updated post title is " + changedPost.toggle);
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
		elem.classList.add("on");
		button_bool_array[num] = true;
	}
	// body...
}
