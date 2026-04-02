function setup(){
	createCanvas(500,500);
    angleMode(DEGREES);
}

function draw(){
	background(220);
    translate(250,250);
    rotate(45);
    rectMode(CENTER);
    square(0,0,200);
}
