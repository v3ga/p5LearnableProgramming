<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <script src="jquery.min.js"></script>
    <script src="esprima.js"></script>
    <script src="anime.min.js"></script>
    <script src="fontMonoline.js"></script>
    <script src="variables.js"></script>
    <script src="p5.js"></script>
    <script src="p5Command.js"></script>
    <script src="p5CommandVariableDef.js"></script>
    <script src="p5CommandFunctionCall.js"></script>
    <script src="p5FunctionParameter.js"></script>
    <script src="p5CommandList.js"></script>
    <script src="p5LoopFor.js"></script>
    <script src="p5Program.js"></script>
    <script src="p5CommandFactory.js"></script>
    <script src="p5GraphicElement.js"></script>
    <script src="p5Interpreter.js"></script>
    <script src="myCanvas.js"></script>
    <link rel="stylesheet" type="text/css" href="data/css/style.css">
  </head>

    <body>
        <div class="container">
            <div class="column sketch">
            <pre id="raw-text">
let y = 200;

function setup(){
    createCanvas(500,500);
}

function draw(){
    background(255);
    strokeWeight(5);
    line(100,100,100,400);
    line(200,150,200,350);
    line(300,200,300,300);
    line(100,100,400,250);
    line(100,400,400,250);
}            
            </pre>
            </div>
            <div class="column sketch formatted"></div>
        </div>
        <script>
            $(document).ready( _=> 
            {
                let result = htmlizeProgram( $("#raw-text").text() );
                console.log(result);
                $(".column.sketch.formatted").html( result );
            });            

            var p5FunctionArgsDef = new Map();
            p5FunctionArgsDef.set("line",            ["x1","y1","x2","y2"]);
            p5FunctionArgsDef.set("strokeWeight",   ["v"]);

            function htmlizeFuncArguments(funcName, args)
            {
                let s = "";
                args.forEach( (arg,index) => s+=htmlizeObj(arg, {funcName : funcName, index : index, isLast : index == args.length-1}) )
                return s;
            }

            function getAttrParamName(options)
            {
                let s="";
                if (options !== undefined)
                {
                    let def = p5FunctionArgsDef.get(options.funcName)
                    if (def)
                        s=`data-name=${def[options.index]}`;
                }
                return s;
            }            

            function htmlizeObj(obj,options)
            {
                let s="";
                if (obj.type == 'VariableDeclaration')
                {
                    s = `<p class="command"><span class="cm-p5-keyword">${obj.kind}</span> <span class="cm-def" data-name="${obj.declarations[0].id.name}">${obj.declarations[0].id.name}</span> = <span class="cm-number">${obj.declarations[0].init.raw}</span>;</p>`;
                }
                else if (obj.type == 'FunctionDeclaration')
                {
                    s = `<div class="function" id="fn-${obj.id.name}"><span class="cm-p5-keyword">function</span> <span class="cm-p5-function">${obj.id.name}</span>(){`;
                    s += htmlizeObj(obj.body);
                    s += `}`;
                }
                else if (obj.type == 'BlockStatement')
                {
                    obj.body.forEach( expression => s+=htmlizeObj(expression) )                    
                }
                else if (obj.type == 'ExpressionStatement')
                {
                     s += `<p class="command"><span class="cm-p5-function">${obj.expression.callee.name}</span>(${htmlizeFuncArguments(obj.expression.callee.name, obj.expression.arguments)});</p>`;
                }
                else if (obj.type == 'Literal')
                {
                    s+=`<span class="param cm-number" ${getAttrParamName(options)}>${obj.raw}</span>${options.isLast ? "" : ","}`;
                }

                return s;
            }

            function htmlizeProgram(programText)
            {
                let s = "";
                let program = esprima.parseScript(programText); console.log(program)
                program.body.forEach( obj => 
                {
                    s += htmlizeObj(obj)
                });

                return s;
            }
        </script>
    </body>
</html>