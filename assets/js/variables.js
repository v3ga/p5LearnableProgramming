class Variables
{
    constructor(elmt)
    {
        this.elmt = elmt;
        this.userVars = new Map();
        this.p5Vars = new Map();
        this.activeTab = "user";
        this.minSlots = 7;
        this._buildUi();
    }

    _buildUi()
    {
        let host = this.elmt.find(".table-variables");
        host.empty();

        this.tabs = $(
            '<div class="variables-tabs"><span class="title">Variables</span>' +
            '  <button type="button" class="variables-tab" data-tab="p5">p5</button>' +
            '  <button type="button" class="variables-tab active" data-tab="user">user</button>' +
            '</div>'
        );

        this.userTable = $('<table class="variables-table-user"></table>');
        this.p5Table = $('<table class="variables-table-p5"></table>');

        this._fillEmptySlots(this.userTable);
        this._fillEmptySlots(this.p5Table);

        this.userWrap = $('<div class="variables-table"></div>').append(this.userTable);
        this.p5Wrap = $('<div class="variables-table"></div>').append(this.p5Table);

        host.append(this.tabs);
        host.append(this.userWrap);
        host.append(this.p5Wrap);

        this.tabs.find('.variables-tab[data-tab="user"]').on("click", () => this.setActiveTab("user"));
        this.tabs.find('.variables-tab[data-tab="p5"]').on("click", () => this.setActiveTab("p5"));

        this.setActiveTab("user");
    }

    _safeId(name)
    {
        return String(name).replace(/[^a-zA-Z0-9_-]/g, '_');
    }

    _fillEmptySlots(table)
    {
        let dataRows = table.find("tr:not(.empty-slot)").length;
        table.find("tr.empty-slot").remove();
        for (let i = dataRows; i < this.minSlots; i++)
            table.append('<tr class="empty-slot"><td>&nbsp;</td><td>&nbsp;</td></tr>');
    }

    _formatValue(value)
    {
        if (value === undefined) return "undefined";
        if (value === null) return "null";
        if (typeof value === "number" && Number.isFinite(value))
            return Number(value.toFixed(3)).toString();
        if (typeof value === "object")
        {
            try { return JSON.stringify(value); }
            catch (e) { return String(value); }
        }
        return String(value);
    }

    setActiveTab(tabName)
    {
        this.activeTab = tabName;
        this.tabs.find(".variables-tab").removeClass("active");
        this.tabs.find(`.variables-tab[data-tab=${tabName}]`).addClass("active");

        this.userTable.toggle(tabName === "user");
        this.userWrap.toggle(tabName === "user");
        this.p5Table.toggle(tabName === "p5");
        this.p5Wrap.toggle(tabName === "p5");
    }

    addVariable(name, value)
    {
        if (this.userVars.has(name) == false)
        {
            let id = this._safeId(name);
            this.userVars.set(name, value);
            this.userTable.append($(`<tr id="u-${id}"><td>${name}</td><td id="u-${id}-value">${this._formatValue(value)}</td></tr>`));
            this._fillEmptySlots(this.userTable);
        }

        this.update();
    }

    removeVariable(name)
    {
        let id = this._safeId(name);
        this.userTable.find(`tr[id=u-${id}]`).remove();
        this.userVars.delete(name);
        this._fillEmptySlots(this.userTable);
        this.update();
    }

    updateValue(name, value)
    {
        let id = this._safeId(name);
        let td = this.elmt.find(`#u-${id}-value`);
        if (td.length === 0)
        {
            this.addVariable(name, value);
            return;
        }
        this.userVars.set(name, value);
        td.text(this._formatValue(value));
    }

    addP5Variable(name, value)
    {
        if (this.p5Vars.has(name) == false)
        {
            let id = this._safeId(name);
            this.p5Vars.set(name, value);
            this.p5Table.append($(`<tr id="p5-${id}"><td>${name}</td><td id="p5-${id}-value">${this._formatValue(value)}</td></tr>`));
            this._fillEmptySlots(this.p5Table);
        }
        this.update();
    }

    updateP5Value(name, value)
    {
        let id = this._safeId(name);
        let tr = this.elmt.find(`#p5-${id}`);
        let td = this.elmt.find(`#p5-${id}-value`);
        if (td.length === 0)
        {
            this.addP5Variable(name, value);
            tr = this.elmt.find(`#p5-${id}`);
        }
        this.p5Vars.set(name, value);
        
        // Manage strikethrough class for stroke/fill when disabled
        if ((name === "stroke" || name === "fill") && value === "off")
            tr.addClass("strikethrough");
        else
            tr.removeClass("strikethrough");
        
        td.html(this._formatP5Value(name, value));
    }

    _formatP5Value(name, value)
    {
        if (name === "stroke" || name === "fill")
            return this._formatColorValue(name, value);
        return this._formatValue(value);
    }

    _formatColorValue(name, value)
    {
        if (value === "off")
            return "";
        
        let rgba = this._parseColorArray(value);
        if (!rgba) return this._formatValue(value);
        
        let [r, g, b, a] = rgba;
        let rgbStr = a !== undefined ? `rgba(${r},${g},${b},${(a/255).toFixed(2)})` : `rgb(${r},${g},${b})`;
        let displayText = a !== undefined ? `(${r},${g},${b},${a})` : `(${r},${g},${b})`;
        
        return `<span class="color-swatch" style="background-color:${rgbStr};"></span> <span class="color-text">${displayText}</span>`;
    }

    _parseColorArray(value)
    {
        if (Array.isArray(value)) return value;
        if (typeof value === "number") return [value, value, value];
        return null;
    }

    update()
    {
        if (this.userVars.size == 0 && this.p5Vars.size == 0)
            this.elmt.hide();
        else
            this.elmt.show();
    }

    /**
     * Dim all current user variable rows (out-of-scope visual).
     * Returns the set of dimmed variable names for later undim.
     */
    dimUserVariables()
    {
        let dimmed = new Set(this.userVars.keys());
        this.userTable.find("tr:not(.empty-slot)").addClass("out-of-scope");
        return dimmed;
    }

    /**
     * Undim previously dimmed variable rows.
     */
    undimUserVariables(dimmedNames)
    {
        for (let name of dimmedNames)
        {
            let id = this._safeId(name);
            this.userTable.find(`tr[id=u-${id}]`).removeClass("out-of-scope");
        }
    }

}