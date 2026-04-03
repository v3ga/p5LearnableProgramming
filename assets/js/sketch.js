var g = 
{
    interpreter          : null,
    myCanvas             : null,
    font                 : null,
    controller           : null,
    panelSlider          : null,
    callStack            : null,
    illustratedFunctions : {},
    userFunctions        : {}
}

function setup() 
{
    if (typeof sketchFile !== "undefined")
    {
        noLoop();

        // Build list of files to fetch
        let fetches = [fetch(sketchFile).then(r => r.text())];

        // Additional scripts? (set by layout from front matter)
        let scriptFiles = (typeof sketchScripts !== "undefined") ? sketchScripts : [];
        scriptFiles.forEach(sf => fetches.push(fetch(sf).then(r => r.text())));

        Promise.all(fetches).then(results =>
        {
            let mainCode     = results[0];
            let scriptCodes  = results.slice(1);

            let parser = new p5CodeParser();

            // Parse illustrated functions from all scripts + main
            let illustrateList = (typeof sketchIllustrate !== "undefined") ? sketchIllustrate : [];
            // Remove "draw" from illustrate list — it's handled separately
            illustrateList = illustrateList.filter(name => name !== "draw");

            if (illustrateList.length > 0)
            {
                // Parse from all source files
                let allCode = scriptCodes.concat([mainCode]);
                allCode.forEach(code =>
                {
                    let defs = parser.parseIllustrated(code, illustrateList);
                    Object.assign(g.illustratedFunctions, defs);
                });
            }

            // Parse main sketch
            let result = parser.parse(mainCode);
            let container = $("#p5Sketch");

            // Store user-defined functions
            g.userFunctions = result.userFunctions || {};
            for (let fname in g.userFunctions)
            {
                let fnDef = g.userFunctions[fname];
                fnDef.commands = fnDef.createCommands();
            }

            // Render everything in source order
            result.renderOrder.forEach(item =>
            {
                switch (item.type)
                {
                    case "comment":
                        let commentCmd = new p5CommandComment(null, item.value, item.isBlock);
                        commentCmd.render(container);
                        break;
                    case "globalVar":
                        item.command.render(container);
                        break;
                    case "setup":
                        result.setupCommands.renderAsFunction(container, "setup");
                        break;
                    case "draw":
                        result.drawCommands.renderAsFunction(container, "draw");
                        break;
                    case "userFunction":
                        let fnDef = g.userFunctions[item.name];
                        if (fnDef) fnDef.commands.renderAsFunction(container, item.name, fnDef.paramNames);
                        break;
                }
            });

            // Initialize call stack (always visible)
            g.callStack = new p5CallStack("#call-stack");

            // Initialize panel slider if we have illustrated functions
            if (Object.keys(g.illustratedFunctions).length > 0)
            {
                g.panelSlider = new p5PanelSlider("#p5Sketch");
            }

            g.controller   = new ExecutionController();
            if (typeof options !== "undefined" && options.runMode)
                g.controller.runMode = true;
            g.interpreter  = new p5Interpreter("p5Canvas-container", result.canvasSize.w, result.canvasSize.h);
            g.font         = new FontMonoLine("p5Canvas");

            positionContainer();
            initPlaybackButtons();

            if (g.controller.runMode)
                $(".playback-controls").hide();

            loop();

            g.interpreter.compile(result.setupCommands, result.drawCommands, g.controller, result.setupHasCreateCanvas, result.globalCommands);
        });
    }
}

function draw() 
{
    if (g.interpreter)
        g.interpreter.draw();
}

function windowResized()
{
    positionContainer();
}

function positionContainer()
{
    let c = $(".container");
    c.css("top", `${(windowHeight - c.height()) / 2}px`);
}

function isOptions()
{
    return typeof options !== undefined;
}

function initPlaybackButtons()
{
    let btnPlay    = $("#btn-play");
    let btnPause   = $("#btn-pause");
    let btnStep    = $("#btn-step");
    let btnRun     = $("#btn-run");
    let btnRestart = $("#btn-restart");

    function updateButtons()
    {
        btnPlay.toggleClass("active", !g.controller.paused);
        btnPause.toggleClass("active", g.controller.paused);
    }

    btnPlay.on("click", function()
    {
        g.controller.play();
        updateButtons();
    });

    btnPause.on("click", function()
    {
        g.controller.pause();
        updateButtons();
    });

    btnStep.on("click", function()
    {
        g.controller.step();
        updateButtons();
    });

    btnRun.on("click", function()
    {
        g.controller.runMode = true;
        g.controller.paused  = false;
        if (g.controller._resolve) { g.controller._resolve(); g.controller._resolve = null; }
        updateButtons();
    });

    btnRestart.on("click", function()
    {
        g.controller.abort();
        setTimeout(function()
        {
            g.controller.reset();
            g.interpreter.reset();
            if (g.panelSlider) g.panelSlider.reset();
            if (g.callStack) g.callStack.clear();
            $(".command").removeClass("current");
            $(".mark").hide();
            $(".update_check").hide();
            g.interpreter.compile(
                g.interpreter.fnSetup,
                g.interpreter.fnDraw,
                g.controller,
                g.interpreter.setupHasCreateCanvas
            );
            updateButtons();
        }, 100);
    });

    updateButtons();
}
