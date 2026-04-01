let ball;

function setup() {
	createCanvas(500, 500);
	ball = new Ball(250, 250, 20);
}

function draw() {
	background(220);
	ball.update();
	ball.display();
}
