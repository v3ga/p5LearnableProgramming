function setup(){
	createCanvas(500,500);
    angleMode(DEGREES);
}

function draw(){
	background(220);
    rectMode(CENTER);
    translate(250,250);
    rotate(15);
    scale(1.5);
    square(0,0,200);
}
