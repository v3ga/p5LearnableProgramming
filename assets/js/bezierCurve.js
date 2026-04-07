// https://en.wikipedia.org/wiki/B%C3%A9zier_curve
class BezierCurve
{
    constructor(points,opts={})
    {
        this.precision = opts.precision??50;
        this.build(points);
    }
    
    scaleV(s)
    {
      return this.scale(s.x,s.y);
    }
  
    scale(sx,sy)
    {
      this.P.forEach( v => v.mult(sx,sy) );
      this.vertices.forEach( v => v.mult(sx,sy) );
      return this;
    }
  
    translateV(t)
    {
      return this.translate(t.x,t.y);    
    }
  
    translate(tx,ty)
    {
      this.P.forEach( v => v.add(tx,ty) );
      this.vertices.forEach( v => v.add(tx,ty) );
      return this;
    }

    getVectorAt(t)
    {
        let _t  = 1.0-t;
        return createVector( _t*this.P[0].x+t*this.P[1].x, _t*this.P[0].y+t*this.P[1].y );
    }

    build(points)
    {
        if (points.length==2)
            this.precision = 2; // line

        this.P = points.map( p => p.copy() );
        this.length = 0.0;
        this.vertices = [];
        this.verticesLength = [];
        let t,v;
        for (let i=0; i<this.precision; i++)
        {
            t   = map(i,0,this.precision-1,0,1);
            v   = this.getVectorAt(t);
            if (i>=1)
                this.length += distV(v,this.vertices[i-1]);
            this.vertices.push(v);
            this.verticesLength.push(this.length);
        }

        this.verticesUniform = this.getUniformVertices(60);
        // [this.length,this.verticesLength] = getVerticesLength(this.vertices);
    }

    getUniformVertices(nbUniform,opts={})
    {
        let uniform = [];
        if (this.length>0)
        {
            let arcLen = this.length;
            let delta = 1.0 / (nbUniform-1);
            let currIdx = 0;
            for(let t =0; t<1.0; t+= delta)
            {
                let currT = t * arcLen;
                while(currT >= this.verticesLength[currIdx]){
                    currIdx++;
                }

                let p = this.vertices[currIdx - 1];
                let q = this.vertices[currIdx];
                let frac = ((currT - this.verticesLength[currIdx - 1]) / (this.verticesLength[currIdx] - this.verticesLength[currIdx - 1]));
                let i = mapV(p,q,frac);
                uniform.push(i);
            }

            if (opts.removeLast == undefined || opts.removeLast == false)
                uniform.push( this.vertices[this.vertices.length-1] );
        }
        //console.log(uniform.length)
        return uniform;
    }    

    draw(opts={})
    {
      beginShape();
      if ('t' in opts)
      {
          if (this.verticesUniform.length>=2)
          {
            let l = constrain(opts.t,0.0,1.0) * this.length;
            let stepLength =  this.length / (this.verticesUniform.length-1);
            let l_ = 0.0;
            for (let i=0; i<this.verticesUniform.length; i++)
            {
              l_ = stepLength*i;
              if (l_<=l)
              {
                vertex(this.verticesUniform[i].x,this.verticesUniform[i].y);
              }
              else
              {
                let lprev = stepLength*(i-1);
                let t = (l-lprev) / (l_-lprev);               
                vertex( 
                  lerp(this.verticesUniform[i-1].x,this.verticesUniform[i].x,t),
                  lerp(this.verticesUniform[i-1].y,this.verticesUniform[i].y,t)
                );
                break;
              }
            }
            
          }
      }
      else
      {
        this.vertices.forEach( v=>vertex(v.x,v.y) );
      }
      endShape();
    }

}

class BezierLine extends BezierCurve
{
    constructor(points,opts={})
    {
        super(points,opts);
    }
}

class BezierQuadratic extends BezierCurve
{
    constructor(points,opts={})
    {
        super(points,opts);
    }

    getVectorAt(t)
    {
        let _t  = 1.0-t;
        return createVector(
            _t*_t*this.P[0].x + 2*_t*t*this.P[1].x + t*t*this.P[2].x,
            _t*_t*this.P[0].y + 2*_t*t*this.P[1].y + t*t*this.P[2].y
        )
    }
}

class BezierCubic extends BezierCurve
{
    constructor(points,opts={})
    {
        super(points,opts);
    }

    getVectorAt(t)
    {
        let _t  = 1.0-t;
        return createVector(
            _t*_t*_t*this.P[0].x + 3*_t*_t*t*this.P[1].x + 3*_t*t*t*this.P[2].x + t*t*t*this.P[3].x,
            _t*_t*_t*this.P[0].y + 3*_t*_t*t*this.P[1].y + 3*_t*t*t*this.P[2].y + t*t*t*this.P[3].y
        )
    }
}

