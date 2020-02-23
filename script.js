var Poligon = Array();
var Punct = null;
var radios;
var main_canvas;
const STATES = Object.freeze({"SELECT_POLIGON": 1, "SELECT_PUNCTE": 2, "RUNNING": 3});
var prog_state;
var frame_shower;
var frame_selector;
var pause_button;
var mesaj_selector;
var reset_button;
var script_info;

var DEFAULT_DRAW_BACKGROUND = '#e5e5e5';

var draw_info = Array(Object());

window.onload = function (){
	
    var run_button = this.document.getElementById("run_button");
	run_button.addEventListener("click", onRunClick);

	script_info = this.document.getElementById("scriptinfo");

	radios = this.document.getElementsByName("selector");
	this.radios[0].checked = true;
	this.radios[0].onclick = function(){
		mesaj_selector.innerHTML = "punctele poligonului";
	}
	this.radios[1].onclick = function(){
		mesaj_selector.innerHTML = "punctul de test";
	}

	this.mesaj_selector = this.document.getElementById("mesaj_selector");

	main_canvas = this.document.getElementById('desen');
	this.main_canvas.addEventListener("click", onCanvasClicked);

	this.reset_button = this.document.getElementById('reset_button');
	this.reset_button.onclick = function(){
		prog_state = STATES.SELECT_POLIGON;
		radios[0].checked = true;
		background(DEFAULT_DRAW_BACKGROUND);
		Punct = null;
		Poligon = new Array();
		mesaj_selector.innerHTML = "punctele poligonului";
	}

	this.prog_state = STATES.SELECT_POLIGON; //Select poligon
}

function onCanvasClicked(e){
	
	if(prog_state != STATES.RUNNING) //programul nu este in rulare
	{
		if(radios[0].checked == true)
		{
			prog_state = STATES.SELECT_POLIGON;//poligon
		}
		else prog_state = STATES.SELECT_PUNCTE;//puncte

		var x = e.pageX - this.offsetLeft; 
		var y = e.pageY - this.offsetTop;
	
		if(prog_state == STATES.SELECT_POLIGON) //poligon
		{
			console.log("poligon");
			//console.log("x: " + x + " y: " + y);
			Poligon.push({x: x, y: y});
			//console.log("OLD: " + Poligon);
			Poligon = graham_scan(Poligon);
			//console.log("NEW: " + Poligon);
			console.log(Poligon);
		}
		else{ //puncte test
			
			//Puncte.push({x: x, y: y});
			Punct = new Object();
			Punct.x = x;
			Punct.y = y;
			console.log(Punct);
		}
		redraw();
	}
}

/*function parsePoints(vector, text)
{
    var lines = text.split("\n");
    for(var i = 0; i < lines.length; i++)
    {
        var points = lines[i].split(" ");
        var p_x = points[0];
        var p_y = points[1];
        vector.push({x: p_x, y:p_y});
	}
	return lines.length;
}*/

function setup(){
	var height =  main_canvas.getBoundingClientRect().height;
	var width = main_canvas.getBoundingClientRect().width;
	console.log(height, width);
	var canvas = createCanvas(width, height);
	canvas.parent('desen');
	noLoop();
}

function draw(){
	
	background(DEFAULT_DRAW_BACKGROUND);

	console.log("draw");
	var n_Poligon = Poligon.length;
	console.log(n_Poligon);

	//Desenare puncte Poligon
	if(n_Poligon > 0)
	{
		for(var i = 0; i < n_Poligon; i++){

			stroke('purple');
			strokeWeight(5);
			point(Poligon[i].x, Poligon[i].y);
		}
	}
		
	//Desenare poligon
	stroke('black');
	strokeWeight(3);
	beginShape();
	for(var i = 0; i < n_Poligon; i++){
		vertex(Poligon[i].x, Poligon[i].y);
	}
	endShape(CLOSE);

	//Desenare punct de test
	stroke('red');
	strokeWeight(10);
	if(Punct != null)
		point(Punct.x, Punct.y);

	//algoritmul ruleaza si a adus informatii
	if(prog_state == STATES.RUNNING && draw_info.point_start != null)
	{	
		strokeWeight(1);
		line(draw_info.point_start.x, draw_info.point_start.y,
			draw_info.point_end.x, draw_info.point_end.y);
		if(draw_info.inters_points != null)
		{
			for(var p of draw_info.inters_points)
			{
				console.log("punct: ", p);
				strokeWeight(10);
				stroke("green");
				point(p.x, p.y);
			}
		}
	}

}

//n,Poligon,p zic sa fie citite din browser
	/*if(isInside(Poligon,n,p) == 1)
		alert("Da");
	else if(isInside(Poligon,n,p)== 0)
		alert("Nu");
	else alert("E pe segment")
	*/
function onRunClick()
{
	if(Poligon.length < 3 || Punct == null)
	{
		alert("Setati mai intai cel putin 3 puncte ale poligonului si punctul de test!");
		return;
	}

	prog_state = STATES.RUNNING;
	//loop(); //redraw automat in functie de FPS setat

	//loop();
	var res = isInside(Poligon, Poligon.length, Punct)
	script_info.innerHTML += "<br><br>";
	if(res == 1)
	{
		if(draw_info.inters_points.length == 1 && verif_varf()== 1)
			script_info.innerHTML +="Punctul nu se afla in interiorul poligonului si nici pe o latura a sa.";
		else 
			script_info.innerHTML += "Punctul se afla in interiorul poligonului.";
	}
	else if(res == 2)
	{
		script_info.innerHTML += "Punctul se afla pe o latura a poligonului.";
	}
	else {
		script_info.innerHTML += "Punctul nu se afla in interiorul poligonului si nici pe o latura a sa.";
	}

	//finish
	prog_state = STATES.SELECT_PUNCTE;
	radios[1].checked = true;
	mesaj_selector.innerHTML = "punctul de test";
}

function verif_varf()
{
	for(var p of Poligon)
		if(p.x == draw_info.inters_points[0].x && p.y == draw_info.inters_points[0].y) return 1;
	return 0;
}
function onSegment(p,q,r)
{
	if(q.x <= Math.max(p.x,r.x) && q.x >= Math.min(p.x,r.x) && q.y <= Math.max(p.y,r.y) && q.y >= Math.min(p.y,r.y))
		return true;
	return false;
}

function collinear(A,B,C)
{
	if(A.x*B.y + B.x*C.y + C.x*A.y - B.y*C.x - C.y*A.x - A.y*B.x == 0)
		return true;
	return false;
}

function first(a,b)
{
	if(a.x != b.x)
		if(a.x <= b.x)
			return a;
		return b;
	if(a.y <= b.y)
		return a;
	return b;
}

function second(a,b)
{
	if (a.x != b.x) {
		if (a.x >= b.x)
			return a;
		return b;
	}
	if (a.y >= b.y)
		return a;
	return b;
}

function intersect(A1,A2,A3,A4,intersect_object)
{
	var a1 = A1.y - A2.y;
	var a2 = A3.y - A4.y;
	var b1 = A2.x - A1.x;
	var b2 = A4.x - A3.x;
	var c1 = A2.x * A1.y - A1.x * A2.y;
	var c2 = A4.x * A3.y - A3.x * A4.y;
	var det=a1*b2 - b1*a2;
	var x=0;
	var y=0;
	intersect_object.x = 0;
	intersect_object.y = 0;
	if(det != 0)
	{
		x = (c1 * b2 - c2 * b1) / det;
		y = (a1 * c2 - a2 * c1) / det;
		intersect_object.x = Math.floor(x);
		intersect_object.y = Math.floor(y);
		if((x < A1.x && x < A2.x) || (x < A3.x && x < A4.x))
			return false;
		if((x > A1.x && x > A2.x) || (x > A3.x && x > A4.x))
			return false;
		return true;
	}
	if(b1*c2 - b2*c1 != 0)
		return false;
	if(a1*c2 - a2*c1 != 0)
		return false;
	var min1 = first(A1,A2);
	var min2 = first(A3,A4);
	var max1 = second(A1,A2);
	var max2 = second(A3,A4);
	if(min1.x == min2.x && min1.y == min2.y && max1.x == max2.x && max1.y == max2.y)
		return true;
	if((min1.x > max2.x || min1.y > max2.y)||(min2.x > max1.x || min2.y > max1.y))
		return false;
	return true;
}

function isInside(poligon,n,p)
{
	if(n < 3)
		return false;
	var INF = 10000;
	var extreme = {x:INF, y:p.y};
	var count = 0;
	var i = 0;

	draw_info.point_start = p;
	draw_info.point_end = extreme;
	//draw_info.poli_points = new Array();

	var text;
	text = "Segmentul care incepe din punctul (" + Punct.x + ", " + Punct.y + ") si se continua spre dreapta la infinit,\n intersecteaza " + 
		"poligonul in punctele: \n"; 

	draw_info.inters_points = new Array();
	do{
		var next = (i+1) % n;
		var inters_object = new Object();
		if(intersect(poligon[i],poligon[next],p,extreme, inters_object))
		{
			if(inters_exist(inters_object) == 0)
			{	
				draw_info.inters_points.push(inters_object);
				text += "(" + inters_object.x + ", " + inters_object.y + ") ";
				count ++;
				if(collinear(poligon[i],p,poligon[next]) == true)
					if(onSegment(poligon[i],p,poligon[next]) == true)
						return 2;
					else 
						return 0;
			}		
		}
		i = next;
	}while(i != 0)
	redraw();
	script_info.innerHTML = text;
	if(count == 0)
	{
		draw_info.inters_points = null;
	}
	console.log("count: " + count);
	console.log(draw_info.inters_points);
	if(count % 2)
		return 1;
	return 0;
}

function inters_exist(p)
{
	for(var i of draw_info.inters_points)
		if(p.x == i.x && p.y == i.y) return 1;
	return 0;
}

function graham_scan(points) {
	// The enveloppe is the points themselves
	if (points.length <= 3) return points;
	
	// Find the pivot
	var pivot = points[0];
	for (var i=0; i<points.length; i++) {
	  if (points[i].y < pivot.y || (points[i].y === pivot.y && points[i].x < pivot.x))
		pivot = points[i];
	}
  
	// Attribute an angle to the points
	for (var i=0; i<points.length; i++) {
	  points[i]._graham_angle = Math.atan2(points[i].y - pivot.y, points[i].x - pivot.x);
	}
	points.sort(function(a, b){return a._graham_angle === b._graham_angle
										  ? a.x - b.x
										  : a._graham_angle - b._graham_angle});
  
	// Adding points to the result if they "turn left"
	var result = [points[0]], len=1;
	for(var i=1; i<points.length; i++){
	  var a = result[len-2],
		  b = result[len-1],
		  c = points[i];
	  while (
		  (len === 1 && b.x === c.x && b.y === c.y) ||
		  (len > 1 && (b.x-a.x) * (c.y-a.y) <= (b.y-a.y) * (c.x-a.x))) {
		  len--;
		  b = a;
		  a = result[len-2];
	  }
	  result[len++] = c;
	}
	result.length = len;
	return result;
  }