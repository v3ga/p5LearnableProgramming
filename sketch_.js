let b;

function setup() {
  //createCanvas(400, 400);
  b = new B();
  b.execute().then( result => {
    
    console.log("done");
    
  } )
}

function draw() 
{
  background(220);
}



class B
{
  constructor(){
    
    this.i = 0;
    this.nb = 10;
  }
  execute()
  {
    return this.init()
    .then( result => this.compare() )
    .then( result => this.executeBlock() )
    .then( result => this.update() )
  }
  
  init()
  {
    console.log("init");
    return new Promise ( (resolve,reject) => setTimeout(resolve,1000 ) )
    
  }
  
  compare()
  {
    console.log("compare");
    return new Promise ( (resolve,reject) => setTimeout(resolve,1000 ) )
  }
  
  executeCommand(resolve)
  {
    if (this.i < this.nb)
    {
      console.log(`executeCommand ${this.i}`); 
      setTimeout( this.executeCommand.bind(this, resolve), 500 )
      this.i++;
    }
    else resolve();
  }
  
  executeBlock()
  {
    return new Promise ( (resolve,reject) => 
    {
      this.executeCommand(resolve);
    });
  }  
  
  update()
  {
    console.log("update");
  }
  
}
  



