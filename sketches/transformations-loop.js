function setup(){
	createCanvas(500,500);
    angleMode(DEGREES);
}

function draw(){
	background(220);
    translate(250,250);
    rectMode(CENTER);
    noFill();
    strokeWeight(4);
    for (let i=0;i<7;i++)
    {
        square(0,0,400-i*56);
        rotate(10);
    }
}
