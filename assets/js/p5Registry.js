/**
 * p5Registry — central registry for p5 function definitions.
 * 
 * Each function declares its parameter names, type, and how to
 * create a graphic element + animate it.
 * 
 * Usage:
 *   p5Reg.register("circle", { params: ["x","y","d"], type: "graphic", ... });
 *   let def = p5Reg.get("circle");
 */

class p5Registry
{
    constructor()
    {
        this._defs = new Map();
    }

    register(name, def)
    {
        def.name = name;
        if (!def.type) def.type = "graphic";
        if (!def.params) def.params = [];
        this._defs.set(name, def);
    }

    get(name)
    {
        return this._defs.get(name) || null;
    }

    has(name)
    {
        return this._defs.has(name);
    }

    getParamNames(name)
    {
        let def = this.get(name);
        return def ? def.params : null;
    }
}

// Global singleton
var p5Reg = new p5Registry();
