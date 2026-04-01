function setup(){
	createCanvas(500,500);
}

function draw(){
	background(220);
	let rnd = random();
	if (rnd < 0.5) {
		rect(250,250,200,200);
	} else 
	{
		let d = int(random(200,250));
		circle(250,250,d);
	}
}
