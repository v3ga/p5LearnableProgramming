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
    for (let i=0;i<10;i++)
    {
        square(0,0,300-i*32);
        rotate(9);
    }
}
