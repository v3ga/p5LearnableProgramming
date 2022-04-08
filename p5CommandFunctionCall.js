class p5CommandFunctionCall extends p5Command
{
    constructor(list, elmt)
    {
        super(list,elmt);
    
        this.name      = this.elmt.find(".cm-p5-function").text();
        this.parameters = [];
        this.elmt.find(".param").each( (index,p) => this.addParameter(p) );
        this.gfx = null;
    }

    execute()
    {
        this.highlight();
        console.log("execute "+this.name);
        this.gfx = makeGraphic(this);
        if (this.gfx)
        {
          g.interpreter.graphics.push(this.gfx);
          return this.gfx.beginAnimation();
        }
        else
          return this.wait();
    }    

    addParameter(p)
    {
      let name = $(p).attr("data-name");
      this.parameters.push( new p5FunctionParameter(this,name,$(p)) );
    }
  
    getParameter(name)
    {
      let v = null;
      for (let i=0; i<this.parameters.length;i++)    
        if ( this.parameters[i].name == name )
        {
            v = this.parameters[i];
            break;
        }
      return v;
    }

    getParameterValue(p)
    {
        let param = this.getParameter(p);
        if (param)
            return param.getValue();
        return 0;
    }
    
    getParams()
    {
      let s = "";
      let sep="";
      this.parameters.forEach( v => {s += `${sep}${v.value}`; sep=","} );
      return s;
    }
  
    getString()
    {
      return `${this.name}(${this.getParams()});`;
    }
  
    evaluate()
    {
      eval( this.getString() );
    }

    highlightParameters(paramNames)
    {
      paramNames.forEach( name => {
        let param = this.getParameter(name);
        if (param)
          param.highlight();
      } )
    }

    unhighlightParameters(paramNames)
    {
      paramNames.forEach( name => {
        let param = this.getParameter(name);
        if (param)
          param.unhighlight();
      } )
    }

    unhighlight()
    {
      super.unhighlight();
      this.unhighlightParameters( this.parameters.map( p=>p.name ) );
    }
  
}