function setup(){
	createCanvas(500,500);
	angleMode(DEGREES);
}

function draw(){
	background(220);
    noFill();
	strokeWeight(4);
	stroke(0);
	arc(250,250,400,400,-45,45);
	arc(250,250,300,300,0,90);
	arc(250,250,200,200,45,135);
	arc(250,250,100,100,90,180);
}
