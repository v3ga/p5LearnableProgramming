<?php 
    require("header.php");
?>

<div class="title"><?php require("list_sketches.php") ?></div>
<div id="p5Sketch">
<?php require("setup-basic.php"); ?>

<div class="function" id="fn-draw"><span class="cm-p5-keyword">function</span> <span class="cm-p5-function">draw</span>(){


<p class="command"><span class="cm-p5-function">background</span>(<span class="param cm-number" data-name="grey">255</span>);</p>
<p class="command"><span class="cm-p5-function">noStroke</span>();</p>
<p class="command"><span class="cm-p5-function">stroke</span>(<span class="param cm-number" data-name="grey">0</span>);</p>
<p class="command"><span class="cm-p5-function">strokeWeight</span>(<span class="param cm-number" data-name="v">5</span>);</p>

<p class="command loop-for" id="loop-1">
  <span class="cm-p5-loop"><span class="cm-p5-keyword">for</span>(<span class="var-def"><span class="cm-p5-keyword">let</span> <span class="cm-def" data-name="i">i</span>=<span class="cm-number">0</span></span>; i&lt;<span class="cm-number nb-loop">19</span>; <span class="update">i++</span>){
  <div class="command block" data-parent="loop-1">
    <p class="command"><span class="cm-p5-function">arc</span>(<span class="param cm-number" data-name="x">250</span>,<span class="param cm-number" data-name="y">250</span>,<span class="param cm-variable" data-name="w" data-expression="400-i*20"><span class="cm-number">400</span>-i*<span class="cm-number">20</span></span>,<span class="param cm-variable" data-name="h" data-expression="400-i*20"><span class="cm-number">400</span>-i*<span class="cm-number">20</span></span>,<span class="param cm-variable" data-name="astart" data-expression="i*10-90">i*<span class="cm-number">10</span>-<span class="cm-number">90</span></span>,<span class="param cm-variable" data-name="aend" data-expression="i*10+90">i*<span class="cm-number">10</span></span>);</p>
    <p class="block-end">}</p>
  </div>
</p>
}
</div>

</div>
<script>
    var options = 
    {
        drawOrigin        : true,
        drawAxes          : true,
        drawCrossPosition : true,
        colorGrid         : [0,0,0],
        showVariables     : true 
    }
</script>
<?php require("footer.php") ?>
