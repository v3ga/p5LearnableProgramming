function setup(){
	createCanvas(500,500);
	angleMode(DEGREES);
}

function draw(){
	background(220);
    noStroke();
	fill(255);
	cross(150,250,150);
	push();
	translate(350,250)
	rotate(frameCount);
	fill(0,255,0);
	cross(0,0,150);
	pop();
}

function cross(x,y,s)
{
	push();
	translate(x,y);
	rectMode(CENTER);
	rect(0,0,s,s/4);
	rect(0,0,s/4,s);
	pop();
}
