function setup(){
	createCanvas(500,500);
	angleMode(DEGREES);
}

function draw(){
	background(255);
	stroke(0);
	strokeWeight(4);
    noFill();
	for(let i=0; i<19; i++){
		arc(250,250,400-i*20,400-i*20,i*10-90,i*10+90);
	}
}
