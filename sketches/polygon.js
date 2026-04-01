function setup(){
	createCanvas(500,500);
}

function draw(){
	background(220);
    strokeWeight(5);
    noFill();
	beginShape();
	vertex(100,50);
	vertex(400,100);
	vertex(450,300);
	vertex(200,450);
	vertex(150,200);
	endShape(CLOSE);
}
