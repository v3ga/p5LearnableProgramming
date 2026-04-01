function setup(){
	createCanvas(500,500);
}

function draw(){
	background(220);
	let x = 50;
	while (x < 500) {
		circle(x,250,40);
		x = x + 100;
	}
}
