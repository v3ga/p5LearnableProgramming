

<?php 
    require("header.php");
?>

<div class="title">U2_L2_circles / sketch.js</div>
<div id="p5Sketch">
<?php require("setup-basic.php"); ?>

<div class="function" id="fn-draw"><span class="cm-p5-keyword">function</span> <span class="cm-p5-function">draw</span>(){
<p class="command"><span class="cm-p5-function">background</span>(<span class="param cm-number" data-name="grey">220</span>);</p>
<p class="command"><span class="cm-p5-function">beginShape</span>();</p>
<p class="command"><span class="cm-p5-function">vertex</span>(<span class="param cm-number" data-name="x">100</span>,<span class="param cm-number" data-name="y">50</span>);</p>
<p class="command"><span class="cm-p5-function">vertex</span>(<span class="param cm-number" data-name="x">400</span>,<span class="param cm-number" data-name="y">100</span>);</p>
<p class="command"><span class="cm-p5-function">vertex</span>(<span class="param cm-number" data-name="x">450</span>,<span class="param cm-number" data-name="y">300</span>);</p>
<p class="command"><span class="cm-p5-function">vertex</span>(<span class="param cm-number" data-name="x">200</span>,<span class="param cm-number" data-name="y">450</span>);</p>
<p class="command"><span class="cm-p5-function">vertex</span>(<span class="param cm-number" data-name="x">150</span>,<span class="param cm-number" data-name="y">200</span>);</p>
<p class="command"><span class="cm-p5-function">endShape</span>(CLOSE);</p>
}
</div>

</div>

<?php require("footer.php") ?>



beginShape();
  vertex(100,50);
  vertex(400,100);
  vertex(450,300);
  vertex(200,450);
  vertex(50,350);
  vertex(150,200);
  endShape(CLOSE);
