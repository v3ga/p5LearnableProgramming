function makeCommand(parent,c)
{
    if ( $(c).hasClass("var-def") )
        return new p5CommandVariableDef(parent,$(c));
    else if ( $(c).hasClass("loop-for") )
        return new p5LoopFor(parent,$(c));        
    return new p5CommandFunctionCall(parent,$(c))    
}

function makeGraphic(command)
{
    if (command.name == "background")
        return new p5Background(command);
    else if (command.name == "strokeWeight")
        return new p5StrokeWeight(command);
    else if (command.name == "noStroke")
        return new p5NoStroke(command);
    else if (command.name == "fill")
        return new p5Fill(command);
    else if (command.name == "line")
        return new p5Line(command);
    else if (command.name == "circle")
        return new p5Circle(command);
    else if (command.name == "rect")
        return new p5Rect(command);
    else if (command.name == "triangle")
        return new p5Triangle(command);
    else if (command.name == "arc")
        return new p5Arc(command);
    else if (command.name == "beginShape")
        return new p5BeginShape(command);
    else if (command.name == "endShape")
        return new p5EndShape(command);
    else if (command.name == "vertex")
        return new p5Vertex(command);
    return null;
}
