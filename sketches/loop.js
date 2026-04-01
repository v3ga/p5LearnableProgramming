function setup(){
	createCanvas(500,500);
}

function draw(){
	background(220);
	strokeWeight(4);
	fill(255);
	for(let i=0; i<5; i++){
		square(100+i*25,100+i*25,200)
	}
}
