/**
 * p5CodeParser
 * 
 * Parses raw p5.js code (via esprima AST) into Command objects directly.
 * setup() is returned as static HTML for display.
 * draw() body is returned as a p5CommandList ready to render + execute.
 * 
 * Usage:
 *   let parser = new p5CodeParser();
 *   let result = parser.parse(sourceCode);
 *   // result.setupHtml  — static HTML string for setup display
 *   // result.drawCommands — p5CommandList of interactive commands
 */

class p5CodeParser
{
    constructor()
    {
        // Known p5.js constants — treated as literals, not variables
        this.p5Constants = new Set([
            "DEGREES", "RADIANS",
            "CLOSE", "OPEN",
            "PI", "HALF_PI", "QUARTER_PI", "TWO_PI",
            "CENTER", "CORNER", "CORNERS", "RADIUS"
        ]);
    }

    /**
     * Parse raw p5.js source code.
     * Returns { setupHtml: string, drawCommands: p5CommandList }
     */
    parse(code)
    {
        p5LoopFor._counter = 0;
        this._ecCounter = 0;  // unique IDs for embedded call placeholders
        let program = esprima.parseScript(code, { comment: true, range: true });
        this._comments = program.comments || [];
        this._parsedDrawW = null;
        this._parsedDrawH = null;
        this._setupHasCreateCanvas = false;
        let result = {
            setupCommands  : new p5CommandList(null),
            drawCommands   : new p5CommandList(null),
            globalCommands : [],
            userFunctions  : {},
            renderOrder    : []
        };

        // First pass: collect user-defined function names (not setup/draw)
        program.body.forEach(node =>
        {
            if (node.type === "FunctionDeclaration"
                && node.id.name !== "setup"
                && node.id.name !== "draw")
            {
                let funcName   = node.id.name;
                let paramNames = node.params.map(p => p.name);
                let bodyNodes  = node.body.body;
                let blockRange = node.body.range;
                let parser     = this;

                result.userFunctions[funcName] = {
                    paramNames : paramNames,
                    bodyNodes  : bodyNodes,
                    createCommands : function()
                    {
                        let cmdList = new p5CommandList(null);
                        parser._parseFunctionBody(cmdList, bodyNodes, blockRange);
                        return cmdList;
                    }
                };
            }
        });

        // Store user function names so _parseCallExpr can check
        this._userFunctionNames = new Set(Object.keys(result.userFunctions));

        // Build a mixed list of top-level nodes + comments, sorted by position
        let functionRanges = [];
        program.body.forEach(node =>
        {
            if (node.type === "FunctionDeclaration")
                functionRanges.push({ range: node.range });
        });

        let topLevelComments = this._comments.filter(c =>
            !functionRanges.some(f => c.range[0] >= f.range[0] && c.range[1] <= f.range[1])
        );

        let topItems = [];
        program.body.forEach(node =>
            topItems.push({ pos: node.range[0], isComment: false, node: node })
        );
        topLevelComments.forEach(c =>
            topItems.push({ pos: c.range[0], isComment: true, comment: c })
        );
        topItems.sort((a, b) => a.pos - b.pos);

        topItems.forEach(item =>
        {
            if (item.isComment)
            {
                let c = item.comment;
                result.renderOrder.push({ type: "comment", value: c.value, isBlock: c.type === "Block" });
            }
            else if (item.node.type === "FunctionDeclaration")
            {
                let name = item.node.id.name;
                if (name === "setup")
                {
                    this._parseFunctionBody(result.setupCommands, item.node.body.body, item.node.body.range);
                    this._extractCanvasSizeFromSetup(item.node.body.body);
                    result.renderOrder.push({ type: "setup" });
                }
                else if (name === "draw")
                {
                    this._parseFunctionBody(result.drawCommands, item.node.body.body, item.node.body.range);
                    result.renderOrder.push({ type: "draw" });
                }
                else
                {
                    result.renderOrder.push({ type: "userFunction", name: name });
                }
            }
            else if (item.node.type === "VariableDeclaration")
            {
                let cmd = this._parseVarDecl(null, item.node);
                result.globalCommands.push(cmd);
                result.renderOrder.push({ type: "globalVar", command: cmd });
            }
        });

        result.canvasSize = { w: this._parsedDrawW || 500, h: this._parsedDrawH || 500 };
        result.setupHasCreateCanvas = this._setupHasCreateCanvas;
        return result;
    }

    // ── Command creation from AST ──────────────────────────────────

    _parseFunctionBody(commandList, bodyNodes, blockRange)
    {
        if (bodyNodes.length === 0 && !blockRange) return;

        // Use the BlockStatement range if available, otherwise approximate from nodes
        let bodyStart = blockRange ? blockRange[0] : (bodyNodes[0] && bodyNodes[0].range ? bodyNodes[0].range[0] : 0);
        let bodyEnd   = blockRange ? blockRange[1] : (bodyNodes.length > 0 && bodyNodes[bodyNodes.length - 1].range
            ? bodyNodes[bodyNodes.length - 1].range[1] : Infinity);

        // Collect comments within this body's range
        let relevantComments = this._comments.filter(
            c => c.range[0] >= bodyStart && c.range[1] <= bodyEnd
        );

        // Build a mixed list of nodes + comments, sorted by position
        let items = [];
        bodyNodes.forEach(node =>
            items.push({ range: node.range, isComment: false, node: node })
        );
        relevantComments.forEach(c =>
            items.push({ range: c.range, isComment: true, comment: c })
        );
        items.sort((a, b) => a.range[0] - b.range[0]);

        items.forEach(item =>
        {
            if (item.isComment)
            {
                let c = item.comment;
                let cmd = new p5CommandComment(commandList, c.value, c.type === "Block");
                commandList.addCommand(cmd);
            }
            else
            {
                let cmd = this._parseNode(commandList, item.node);
                if (cmd) commandList.addCommand(cmd);
            }
        });
    }

    _parseNode(parent, node)
    {
        switch (node.type)
        {
            case "ExpressionStatement":
                if (node.expression.type === "CallExpression")
                    return this._parseCallExpr(parent, node.expression);
                if (node.expression.type === "AssignmentExpression")
                    return this._parseAssignment(parent, node.expression);
                if (node.expression.type === "UpdateExpression")
                    return this._parseUpdateExpr(parent, node.expression);
                break;
            case "VariableDeclaration":
                return this._parseVarDecl(parent, node);
            case "ForStatement":
                return this._parseForStmt(parent, node);
            case "IfStatement":
                return this._parseIfStmt(parent, node);
            case "WhileStatement":
                return this._parseWhileStmt(parent, node);
            case "ReturnStatement":
                return this._parseReturnStmt(parent, node);
        }
        return null;
    }

    _parseCallExpr(parent, expr)
    {
        // Method call: obj.method(args)
        if (expr.callee.type === "MemberExpression" && !expr.callee.computed)
        {
            let objectName = this._exprToText(expr.callee.object);
            let methodName = expr.callee.property.name;
            let args = expr.arguments.map(arg => ({
                exprText    : this._exprToText(arg),
                displayHtml : this._containsVariable(arg)
                    ? this._exprToColorHtml(arg)
                    : this._escapeHtml(this._exprToText(arg))
            }));
            return new p5CommandMethodCall(parent, objectName, methodName, args);
        }

        let name = expr.callee.name;
        let isUserFunction = this._userFunctionNames && this._userFunctionNames.has(name);
        let paramNames = isUserFunction
            ? null  // user functions don't use registry param names
            : p5Reg.getParamNames(name);
        let params = [];

        expr.arguments.forEach((arg, i) =>
        {
            let paramName   = paramNames ? paramNames[i] : null;
            let isVar       = this._containsVariable(arg);
            let displayHtml = isVar
                ? this._exprToColorHtml(arg)
                : this._escapeHtml(this._exprToText(arg));

            // Extract embedded steppable calls (random, user functions)
            let ec = this._exprWithEmbeddedCalls(arg);

            params.push(new p5FunctionParameter(null, paramName, {
                isVariable    : isVar,
                exprText      : ec.exprText,
                displayHtml   : displayHtml,
                embeddedCalls : ec.embeddedCalls
            }));
        });

        let cmd = new p5CommandFunctionCall(parent, name, params);
        cmd.isUserFunction = isUserFunction;
        // Wire command reference and index on each parameter
        params.forEach((p, i) => { p.command = cmd; p.index = i; });
        return cmd;
    }

    _parseVarDecl(parent, node)
    {
        let decl = node.declarations[0];
        let name = decl.id.name;

        if (decl.init && decl.init.type === "Literal")
        {
            return new p5CommandVariableDef(parent, name, parseFloat(decl.init.raw), node.kind);
        }
        else
        {
            // Expression init (e.g. random(), x+1) — evaluated at runtime
            let displayHtml = decl.init ? this._exprToColorHtml(decl.init) : "0";
            let ec = decl.init ? this._exprWithEmbeddedCalls(decl.init) : { exprText: "0", embeddedCalls: null };
            return new p5CommandVariableDef(parent, name, null, node.kind, ec.exprText, displayHtml, ec.embeddedCalls);
        }
    }

    _parseReturnStmt(parent, node)
    {
        if (!node.argument)
            return new p5CommandReturn(parent, null, null, null);

        let displayHtml = this._exprToColorHtml(node.argument);
        let ec = this._exprWithEmbeddedCalls(node.argument);
        return new p5CommandReturn(parent, ec.exprText, displayHtml, ec.embeddedCalls);
    }

    _parseForStmt(parent, node)
    {
        let initDecl   = node.init.declarations[0];
        let varName    = initDecl.id.name;
        let initVal    = parseFloat(initDecl.init.raw);
        let nbLoopMax  = parseInt(node.test.right.raw || String(node.test.right.value));
        let updateText = this._updateToText(node.update);

        let loop = new p5LoopFor(parent, {
            varName    : varName,
            varKind    : node.init.kind || "let",
            initVal    : initVal,
            nbLoopMax  : nbLoopMax,
            updateText : updateText
        });

        let bodyNodes = node.body.type === "BlockStatement"
            ? node.body.body
            : [node.body];

        this._parseFunctionBody(loop.commandList, bodyNodes);
        return loop;
    }

    _parseIfStmt(parent, node)
    {
        // Flatten if / else-if / else chain into an array of branches
        let branches = [];
        let current = node;

        while (current)
        {
            let condText  = this._exprToText(current.test);
            let thenNodes = current.consequent.type === "BlockStatement"
                ? current.consequent.body
                : [current.consequent];

            branches.push({ conditionText: condText, conditionNode: current.test,
                            bodyNodes: thenNodes, commands: new p5CommandList(null) });

            if (current.alternate)
            {
                if (current.alternate.type === "IfStatement")
                {
                    current = current.alternate;   // continue chain
                }
                else
                {
                    // Pure else block — last branch with no condition
                    let elseNodes = current.alternate.type === "BlockStatement"
                        ? current.alternate.body
                        : [current.alternate];
                    branches.push({ conditionText: null, conditionNode: null,
                                    bodyNodes: elseNodes, commands: new p5CommandList(null) });
                    current = null;
                }
            }
            else
            {
                current = null;
            }
        }

        let cmd = new p5IfElse(parent, branches);

        // Now set parent and parse bodies
        branches.forEach(b => {
            b.commands.parent = cmd;
            this._parseFunctionBody(b.commands, b.bodyNodes);
        });

        return cmd;
    }

    _parseWhileStmt(parent, node)
    {
        let condText = this._exprToText(node.test);

        let cmd = new p5WhileLoop(parent, {
            conditionText : condText,
            conditionNode : node.test
        });

        let bodyNodes = node.body.type === "BlockStatement"
            ? node.body.body
            : [node.body];
        this._parseFunctionBody(cmd.commandList, bodyNodes);

        return cmd;
    }

    _parseAssignment(parent, expr)
    {
        let varName  = this._exprToText(expr.left);
        let operator = expr.operator;
        let exprText = this._exprToText(expr.right);
        return new p5CommandAssignment(parent, varName, operator, exprText);
    }

    _parseUpdateExpr(parent, expr)
    {
        // i++ or ++i → treated as assignment i = i + 1
        let varName = expr.argument.name;
        let op      = expr.operator === "++" ? "+" : "-";
        return new p5CommandAssignment(parent, varName, "=", `${varName} ${op} 1`);
    }

    // ── Static HTML for setup() display ────────────────────────────

    _htmlizeFunction(node)
    {
        let name = node.id.name;
        let s = `<div class="function" id="fn-${name}">`;
        s += `<span class="cm-p5-keyword">function</span> `;
        s += `<span class="cm-p5-function">${name}</span>(){\n`;
        if (node.body.type === "BlockStatement")
        {
            node.body.body.forEach(child =>
            {
                s += this._htmlizeStatement(child);
            });
        }
        s += `}\n</div>\n<br>\n`;
        return s;
    }

    /**
     * Extract executable JS from setup() body statements.
     * Returns a string of JS code that can be eval'd.
     */
    _extractExecCode(bodyNodes)
    {
        let lines = [];
        bodyNodes.forEach(node =>
        {
            let code = this._nodeToCode(node);
            if (code) lines.push(code);
        });
        return lines.join("\n");
    }

    _nodeToCode(node)
    {
        if (node.type === "ExpressionStatement")
        {
            // createCanvas is handled by p5Interpreter (with margin) — extract size and skip
            if (node.expression.type === "CallExpression")
            {
                let callee = node.expression.callee;
                if (callee.type === "Identifier" && callee.name === "createCanvas")
                {
                    let args = node.expression.arguments;
                    if (args.length >= 2)
                    {
                        this._parsedDrawW = parseFloat(args[0].value);
                        this._parsedDrawH = parseFloat(args[1].value);
                    }
                    return null;
                }
            }
            return this._exprToCode(node.expression) + ";";
        }
        if (node.type === "VariableDeclaration")
        {
            // Use window[] assignment so variables are globally accessible
            let decl = node.declarations[0];
            if (decl.init)
                return `window["${decl.id.name}"] = ${this._exprToCode(decl.init)};`;
            else
                return `window["${decl.id.name}"] = undefined;`;
        }
        return null;
    }

    _extractCanvasSizeFromSetup(bodyNodes)
    {
        bodyNodes.forEach(node =>
        {
            if (node.type !== "ExpressionStatement") return;
            if (!node.expression || node.expression.type !== "CallExpression") return;

            let callee = node.expression.callee;
            if (callee.type === "Identifier" && callee.name === "createCanvas")
            {
                this._setupHasCreateCanvas = true;
                let args = node.expression.arguments;
                if (args.length >= 2 && args[0].type === "Literal" && args[1].type === "Literal")
                {
                    this._parsedDrawW = parseFloat(args[0].value);
                    this._parsedDrawH = parseFloat(args[1].value);
                }
            }
        });
    }

    // ── Embedded call extraction ───────────────────────────────────

    /**
     * Analyze an expression AST node and extract "steppable" embedded calls
     * (user functions, random). Returns { exprText, embeddedCalls }.
     * exprText has __ecN placeholders, embeddedCalls has the call descriptors.
     */
    _exprWithEmbeddedCalls(node)
    {
        let calls = [];
        let text = this._exprToTextEC(node, calls);
        return { exprText: text, embeddedCalls: calls.length > 0 ? calls : null };
    }

    /**
     * Like _exprToText but replaces steppable calls with __ecN placeholders.
     * Deepest calls get lower indices (natural post-order from recursion).
     */
    _exprToTextEC(node, calls)
    {
        switch (node.type)
        {
            case "Literal":
                return node.raw;
            case "Identifier":
                return node.name;
            case "ThisExpression":
                return "this";
            case "BinaryExpression":
            {
                let l = this._exprToTextEC(node.left, calls);
                let r = this._exprToTextEC(node.right, calls);
                if (this._needsParens(node.left, node.operator)) l = `(${l})`;
                if (this._needsParens(node.right, node.operator)) r = `(${r})`;
                return l + node.operator + r;
            }
            case "LogicalExpression":
                return this._exprToTextEC(node.left, calls) + " " + node.operator + " " + this._exprToTextEC(node.right, calls);
            case "UnaryExpression":
                return node.prefix
                    ? node.operator + this._exprToTextEC(node.argument, calls)
                    : this._exprToTextEC(node.argument, calls) + node.operator;
            case "MemberExpression":
                return this._exprToTextEC(node.object, calls) + "." + this._exprToTextEC(node.property, calls);
            case "CallExpression":
            {
                let callee = node.callee.name || this._exprToText(node.callee);
                let isSteppable = callee === "random" ||
                    (this._userFunctionNames && this._userFunctionNames.has(callee));

                // Recurse into arguments (handles nested steppable calls)
                let argTexts = node.arguments.map(a => this._exprToTextEC(a, calls));

                if (isSteppable)
                {
                    let id = this._ecCounter++;
                    calls.push({
                        id             : id,
                        funcName       : callee,
                        argTexts       : argTexts,
                        isUserFunction : this._userFunctionNames && this._userFunctionNames.has(callee)
                    });
                    return `__ec${id}`;
                }
                return `${callee}(${argTexts.join(",")})`;
            }
            case "NewExpression":
            {
                let callee = node.callee.name || this._exprToText(node.callee);
                let args = node.arguments.map(a => this._exprToTextEC(a, calls)).join(",");
                return `new ${callee}(${args})`;
            }
            default:
                return "";
        }
    }

    _exprToCode(node)
    {
        switch (node.type)
        {
            case "CallExpression":
            {
                let callee = this._exprToCode(node.callee);
                let args = node.arguments.map(a => this._exprToCode(a)).join(",");
                return `${callee}(${args})`;
            }
            case "NewExpression":
            {
                let callee = this._exprToCode(node.callee);
                let args = node.arguments.map(a => this._exprToCode(a)).join(",");
                return `new ${callee}(${args})`;
            }
            case "AssignmentExpression":
                return `${this._exprToCode(node.left)} ${node.operator} ${this._exprToCode(node.right)}`;
            case "MemberExpression":
                return `${this._exprToCode(node.object)}.${this._exprToCode(node.property)}`;
            case "Identifier":
                return node.name;
            case "Literal":
                return node.raw;
            case "BinaryExpression":
            {
                let l = this._exprToCode(node.left);
                let r = this._exprToCode(node.right);
                if (this._needsParens(node.left, node.operator)) l = `(${l})`;
                if (this._needsParens(node.right, node.operator)) r = `(${r})`;
                return `${l}${node.operator}${r}`;
            }
            case "LogicalExpression":
                return `${this._exprToCode(node.left)} ${node.operator} ${this._exprToCode(node.right)}`;
            case "UnaryExpression":
                return node.prefix
                    ? `${node.operator}${this._exprToCode(node.argument)}`
                    : `${this._exprToCode(node.argument)}${node.operator}`;
            case "ThisExpression":
                return "this";
            default:
                return "";
        }
    }

    _htmlizeStatement(node)
    {
        if (node.type === "ExpressionStatement" && node.expression.type === "CallExpression")
        {
            let callee = node.expression.callee;
            let name = callee.name || this._exprToText(callee);
            let args = node.expression.arguments.map(a => this._exprToText(a)).join(",");
            return `<p class="command"><span class="cm-p5-function">${this._escapeHtml(name)}</span>(${this._escapeHtml(args)});</p>\n`;
        }
        if (node.type === "ExpressionStatement" && node.expression.type === "AssignmentExpression")
        {
            let expr = node.expression;
            let left = this._exprToText(expr.left);
            let right = this._exprToColorHtml(expr.right);
            return `<p class="command"><span class="cm-def">${this._escapeHtml(left)}</span> ${expr.operator} ${right};</p>\n`;
        }
        if (node.type === "VariableDeclaration")
        {
            let decl = node.declarations[0];
            if (decl.init)
            {
                let initHtml = this._exprToColorHtml(decl.init);
                return `<p class="command"><span class="cm-p5-keyword">${node.kind}</span> ` +
                       `<span class="cm-def">${decl.id.name}</span> = ` +
                       `${initHtml};</p>\n`;
            }
            else
            {
                return `<p class="command"><span class="cm-p5-keyword">${node.kind}</span> ` +
                       `<span class="cm-def">${decl.id.name}</span>;</p>\n`;
            }
        }
        return "";
    }

    // ── AST utility methods ────────────────────────────────────────

    _opPrecedence(op)
    {
        switch (op)
        {
            case "||":                          return 1;
            case "&&":                          return 2;
            case "==": case "!=":
            case "===": case "!==":              return 3;
            case "<": case ">": case "<=":
            case ">=":                          return 4;
            case "+": case "-":                 return 5;
            case "*": case "/": case "%":       return 6;
            case "**":                          return 7;
            default:                            return 0;
        }
    }

    _needsParens(child, parentOp)
    {
        if (child.type !== "BinaryExpression") return false;
        return this._opPrecedence(child.operator) < this._opPrecedence(parentOp);
    }

    _updateToText(node)
    {
        if (node.type === "UpdateExpression")
        {
            return node.prefix
                ? `${node.operator}${node.argument.name}`
                : `${node.argument.name}${node.operator}`;
        }
        if (node.type === "AssignmentExpression")
        {
            return `${this._exprToText(node.left)} ${node.operator} ${this._exprToText(node.right)}`;
        }
        return "";
    }

    _exprToText(node)
    {
        switch (node.type)
        {
            case "Literal":
                return node.raw;
            case "Identifier":
                return node.name;
            case "ThisExpression":
                return "this";
            case "BinaryExpression":
            {
                let l = this._exprToText(node.left);
                let r = this._exprToText(node.right);
                if (this._needsParens(node.left, node.operator)) l = `(${l})`;
                if (this._needsParens(node.right, node.operator)) r = `(${r})`;
                return l + node.operator + r;
            }
            case "LogicalExpression":
                return this._exprToText(node.left) + " " + node.operator + " " + this._exprToText(node.right);
            case "UnaryExpression":
                return node.prefix
                    ? node.operator + this._exprToText(node.argument)
                    : this._exprToText(node.argument) + node.operator;
            case "MemberExpression":
                return this._exprToText(node.object) + "." + this._exprToText(node.property);
            case "CallExpression":
            {
                let callee = node.callee.name || this._exprToText(node.callee);
                let args = node.arguments.map(a => this._exprToText(a)).join(",");
                return `${callee}(${args})`;
            }
            case "NewExpression":
            {
                let callee = node.callee.name || this._exprToText(node.callee);
                let args = node.arguments.map(a => this._exprToText(a)).join(",");
                return `new ${callee}(${args})`;
            }
            default:
                return "";
        }
    }

    _exprToColorHtml(node)
    {
        switch (node.type)
        {
            case "Literal":
                return `<span class="cm-number">${this._escapeHtml(node.raw)}</span>`;
            case "Identifier":
                return this._escapeHtml(node.name);
            case "ThisExpression":
                return '<span class="cm-p5-keyword">this</span>';
            case "BinaryExpression":
            {
                let l = this._exprToColorHtml(node.left);
                let r = this._exprToColorHtml(node.right);
                if (this._needsParens(node.left, node.operator)) l = `(${l})`;
                if (this._needsParens(node.right, node.operator)) r = `(${r})`;
                return l + node.operator + r;
            }
            case "LogicalExpression":
                return this._exprToColorHtml(node.left) + " " + node.operator + " " + this._exprToColorHtml(node.right);
            case "UnaryExpression":
                return node.prefix
                    ? node.operator + this._exprToColorHtml(node.argument)
                    : this._exprToColorHtml(node.argument) + node.operator;
            case "MemberExpression":
                return this._exprToColorHtml(node.object) + "." + this._exprToColorHtml(node.property);
            case "CallExpression":
            {
                let callee = node.callee.name || this._exprToText(node.callee);
                let args = node.arguments.map(a => this._exprToColorHtml(a)).join(",");
                return `<span class="cm-p5-function">${this._escapeHtml(callee)}</span>(${args})`;
            }
            case "NewExpression":
            {
                let callee = node.callee.name || this._exprToText(node.callee);
                let args = node.arguments.map(a => this._exprToColorHtml(a)).join(",");
                return `<span class="cm-p5-keyword">new</span> <span class="cm-p5-function">${this._escapeHtml(callee)}</span>(${args})`;
            }
            default:
                return "";
        }
    }

    _containsVariable(node)
    {
        switch (node.type)
        {
            case "Literal":
                return false;
            case "Identifier":
                return !this.p5Constants.has(node.name);
            case "ThisExpression":
                return true;
            case "BinaryExpression":
                return this._containsVariable(node.left) || this._containsVariable(node.right);
            case "LogicalExpression":
                return this._containsVariable(node.left) || this._containsVariable(node.right);
            case "UnaryExpression":
                return this._containsVariable(node.argument);
            case "MemberExpression":
                return this._containsVariable(node.object) || this._containsVariable(node.property);
            case "CallExpression":
                return true;
            default:
                return false;
        }
    }

    // ── HTML escaping helpers ──────────────────────────────────────

    _escapeHtml(str)
    {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    _escapeAttr(str)
    {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    // ── Illustrated functions: parse classes + functions ────────────

    /**
     * Parse source code of a script file and extract method/function bodies
     * for the given illustrated names.
     * 
     * @param {string} code — source code of the script
     * @param {string[]} illustrateList — e.g. ["Ball.update", "Ball.display"]
     * @returns {Object} map of key → { paramNames, bodyNodes, createCommands }
     */
    parseIllustrated(code, illustrateList)
    {
        let program = esprima.parseScript(code, { comment: true, range: true });
        this._comments = program.comments || [];
        let result = {};
        let parser = this;

        program.body.forEach(node =>
        {
            if (node.type === "ClassDeclaration")
            {
                let className = node.id.name;
                node.body.body.forEach(member =>
                {
                    if (member.type === "MethodDefinition" && member.kind === "method")
                    {
                        let methodName = member.key.name;
                        let key = `${className}.${methodName}`;

                        if (illustrateList.includes(key))
                        {
                            let paramNames = member.value.params.map(p => p.name);
                            let bodyNodes  = member.value.body.body;
                            let blockRange = member.value.body.range;

                            result[key] = {
                                paramNames : paramNames,
                                bodyNodes  : bodyNodes,
                                createCommands : function()
                                {
                                    let cmdList = new p5CommandList(null);
                                    parser._parseFunctionBody(cmdList, bodyNodes, blockRange);
                                    return cmdList;
                                }
                            };
                        }
                    }
                });
            }

            if (node.type === "FunctionDeclaration")
            {
                let funcName = node.id.name;
                if (illustrateList.includes(funcName))
                {
                    let paramNames = node.params.map(p => p.name);
                    let bodyNodes  = node.body.body;
                    let blockRange = node.body.range;

                    result[funcName] = {
                        paramNames : paramNames,
                        bodyNodes  : bodyNodes,
                        createCommands : function()
                        {
                            let cmdList = new p5CommandList(null);
                            parser._parseFunctionBody(cmdList, bodyNodes, blockRange);
                            return cmdList;
                        }
                    };
                }
            }
        });

        return result;
    }
}
