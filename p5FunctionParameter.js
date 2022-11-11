class p5FunctionParameter
{
  constructor(command, name, elmt)
  {
    this.command   = command;
    this.name      = name;
    this.elmt      = elmt;
    this.type      = elmt.hasClass("cm-variable") ? "variable" : "number";
    this.value     = this.type  == "variable" ? this.elmt.text() : parseFloat(this.elmt.text());
    if (this.type == "variable")
    {
      this.mark_value = $(`<div class="mark mark-value"></div>`);
      $("body").append(this.mark_value);
    }
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
    if (this.mark_value)
    {
      this.mark_value.text( this.getValue() );
      this.mark_value.show().offset( {left : this.elmt.offset().left, top : this.elmt.offset().top+25}  )
    }
  }

  unhighlight()
  {
    this.elmt.removeClass("highlight"); 
    if (this.mark_value) 
      this.mark_value.hide();
  }
}

/*
        this.mark_ok            = $(`<div class="mark mark-ok">👌</div>`)


            begin :     _=> mark.show().offset( {left : this.elmtNbLoop.offset().left-15, top : this.elmtNbLoop.offset().top-25}  ),

*/