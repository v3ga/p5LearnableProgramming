<?php 
    require("header.php");
?>

<div class="title"><?php require("list_sketches.php") ?></div>
<div id="p5Sketch">
<?php require("setup-basic.php"); ?>

<div class="function" id="fn-draw"><span class="cm-p5-keyword">function</span> <span class="cm-p5-function">draw</span>(){


<p class="command"><span class="cm-p5-function">background</span>(<span class="param cm-number" data-name="grey">0</span>);</p>
<p class="command"><span class="cm-p5-function">noStroke</span>();</p>
<p class="command"><span class="cm-p5-function">fill</span>(<span class="param cm-number" data-name="grey">255</span>);</p>

<p class="command loop-for" id="loop-1">
  <span class="cm-p5-loop"><span class="cm-p5-keyword">for</span>(<span class="var-def"><span class="cm-p5-keyword">let</span> <span class="cm-def" data-name="i">i</span>=<span class="cm-number">0</span></span>; i&lt;<span class="cm-number nb-loop">5</span>; <span class="update">i++</span>){
  <div class="command block" data-parent="loop-1">
    <p class="command" id="circle1">&nbsp;<span class="cm-p5-function">circle</span>(<span class="param cm-variable" data-name="x" data-expression="50+i*100"><span class="cm-number">50</span>+i*<span class="cm-number">100</span></span>,<span class="param cm-number" data-name="y">250</span>,<span class="param cm-number" data-name="d">100</span>);</p>
    <p class="block-end">}</p>
  </div>
</p>
}
</div>

</div>
<script>
    var options = 
    {
        drawOrigin        : false,
        drawAxes          : false,
        drawCrossPosition : false,
        colorGrid         : [255,255,255],
        showVariables     : true 
    }
</script>
<?php require("footer.php") ?>
