<?php 
    require("header.php");
?>

<div class="title"><?php require("list_sketches.php") ?></div>
<div id="p5Sketch">
<?php require("setup-basic.php"); ?>

<div class="function" id="fn-draw"><span class="cm-p5-keyword">function</span> <span class="cm-p5-function">draw</span>(){
<p class="command"><span class="cm-p5-function">background</span>(<span class="param cm-number" data-name="grey">255</span>);</p>
<p class="command"><span class="cm-p5-function">strokeWeight</span>(<span class="param cm-number" data-name="v">5</span>);</p>
<p class="command"><span class="cm-p5-function">line</span>(<span class="param cm-number" data-name="x1">100</span>,<span class="param cm-number" data-name="y1">100</span>,<span class="param cm-number" data-name="x2">100</span>,<span class="param cm-number" data-name="y2">400</span>);</p>
<p class="command"><span class="cm-p5-function">line</span>(<span class="param cm-number" data-name="x1">200</span>,<span class="param cm-number" data-name="y1">150</span>,<span class="param cm-number" data-name="x2">200</span>,<span class="param cm-number" data-name="y2">350</span>);</p>
<p class="command"><span class="cm-p5-function">line</span>(<span class="param cm-number" data-name="x1">300</span>,<span class="param cm-number" data-name="y1">200</span>,<span class="param cm-number" data-name="x2">300</span>,<span class="param cm-number" data-name="y2">300</span>);</p>
<p class="command"><span class="cm-p5-function">line</span>(<span class="param cm-number" data-name="x1">100</span>,<span class="param cm-number" data-name="y1">100</span>,<span class="param cm-number" data-name="x2">400</span>,<span class="param cm-number" data-name="y2">250</span>);</p>
<p class="command"><span class="cm-p5-function">line</span>(<span class="param cm-number" data-name="x1">100</span>,<span class="param cm-number" data-name="y1">400</span>,<span class="param cm-number" data-name="x2">400</span>,<span class="param cm-number" data-name="y2">250</span>);</p>
}
</div>

</div>

<?php require("options_default.php") ?>
<?php require("footer.php") ?>
