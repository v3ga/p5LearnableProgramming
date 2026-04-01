function setup(){
	createCanvas(500,500);
}

function draw(){
	background(255);
	strokeWeight(4);
	fill(255);
	for(let j=0; j<8; j++){
    	for(let i=0; i<8; i++)
        {
            let rnd = int(random(0,4));
            push();
            translate(50+i*50,50+j*50)
            if (rnd==0)
            {
                line(0,0,50,50);
            }
            else if (rnd==1)
            {
                line(50,0,0,50);
            }
            else if (rnd==2)
            {
                line(25,0,25,50);
            }
            else if (rnd==3)
            {
                line(0,25,50,25);
            }
            pop();
	    }
    }
}
