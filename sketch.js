var g = 
{
    interpreter : null,
    myCanvas : null,
    font : null
}

function setup() 
{
    g.interpreter = new p5Interpreter("p5Canvas-container", "p5Sketch");
    g.interpreter.compile();
    g.font = new FontMonoLine("p5Canvas");
    positionContainer();
}

function draw() 
{
    g.interpreter.draw();
}

function windowResized()
{
    positionContainer();
}

function positionContainer()
{
    let c = $(".container");
    c.css("top", `${(windowHeight-c.height())/2}px`);
}

function isOptions()
{
    return typeof options !== undefined;
}
