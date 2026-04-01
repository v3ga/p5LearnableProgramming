class Ball {
	constructor(x, y, r) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.vx = 3;
		this.vy = 2;
	}

	update() {
		this.x = this.x + this.vx;
		this.y = this.y + this.vy;
		if (this.x > 500 - this.r || this.x < this.r) {
			this.vx = -this.vx;
		}
		if (this.y > 500 - this.r || this.y < this.r) {
			this.vy = -this.vy;
		}
	}

	display() {
		circle(this.x, this.y, this.r * 2);
	}
}
