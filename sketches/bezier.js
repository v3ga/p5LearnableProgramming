function setup(){
	createCanvas(500,500);
}

function draw(){
	background(220);
    stroke(0);
    strokeWeight(4);
    noFill();
    bezier(425, 100, 50, 50, 450, 450, 75, 400);
}
