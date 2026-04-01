let d=100;

function setup(){
	createCanvas(500,500);
}

function draw(){
	background(220);
	noFill();
	for(let j=0; j<4; j++){
		for(let i=0; i<4; i++){
			circle(50 + d*(0.5+i),50 + d*(0.5+j), d);
		}
	}
}
