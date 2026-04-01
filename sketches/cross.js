function setup(){
	createCanvas(500,500);
}

function draw(){
	background(220);
    noStroke();
	fill(0);
	cross(250,250,300);
	fill(127);
	cross(250,250,200);
	fill(255);
	cross(250,250,100);
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
