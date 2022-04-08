class p5CommandVariableDef extends p5Command
{
    constructor(list, elmt)
    {
        super(list,elmt);
        this.name      = this.elmt.find(".cm-def").text();
        this.type      = "number";
        this.value     = parseFloat( this.elmt.find(".cm-number").text() );
    }

    copy()
    {
        return new p5CommandVariableDef(this.list, this.elmt);
    }
}