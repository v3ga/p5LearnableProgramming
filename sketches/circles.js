// Circles
function setup(){
	createCanvas(500,500);
}

// Test
function draw(){
	// Dessin
	background(220);
	let x = 250;
	let y = 250;
	circle(x,y,50+computeDiam());
	circle(x,y,300);
	circle(x,y,200);
}

function computeDiam()
{
	let a = random(100,200);
	let b = 250;
	return a+b;
}
