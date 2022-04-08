class Variables
{
    constructor(elmt)
    {
        this.elmt = elmt;
        this.table = this.elmt.find("table");
        this.vars = new Map();
    }

    addVariable(name, value)
    {
        if (this.vars.has(name) == false)
        {
            this.vars.set(name, value);
            this.table.append($(`<tr id="${name}"><td>${name}</td><td id="${name}-value">${value}</td></tr>`));
        }

        this.update();
    }

    removeVariable(name)
    {
        this.table.find(`tr[id=${name}]`).remove();
        this.vars.delete(name);
        this.update();
    }

    updateValue(name, value)
    {
        console.log(`updateValue(${name},${value})`);
        let td = this.elmt.find(`#${name}-value`);
        td.text(value);
    }

    update()
    {
        if (this.vars.size == 0)
            this.elmt.hide();
        else
        {
            this.elmt.show();
        }            
    }

}