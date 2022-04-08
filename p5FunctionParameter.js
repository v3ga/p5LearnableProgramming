class p5FunctionParameter
{
  constructor(command, name, elmt)
  {
    this.command   = command;
    this.name      = name;
    this.elmt      = elmt;
    this.type      = elmt.hasClass("cm-variable") ? "variable" : "number";
    this.value     = this.type  == "variable" ? this.elmt.text() : parseFloat(this.elmt.text());
  }

  getValue()
  {
    if (this.type == "number")
      return this.value;
    else if (this.type == "variable")
      return eval( this.value ); // can be for example "i*10" or "i"
  }
  
  highlight()
  {
    this.elmt.addClass("highlight"); 
  }

  unhighlight()
  {
    this.elmt.removeClass("highlight"); 
  }
}