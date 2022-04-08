<?php 
    require("header.php");
?>

<div class="title"><?php require("list_sketches.php") ?></div>
<div id="p5Sketch">
<?php require("setup-basic.php"); ?>

<div class="function" id="fn-draw"><span class="cm-p5-keyword">function</span> <span class="cm-p5-function">draw</span>(){
<p class="command"><span class="cm-p5-function">background</span>(<span class="param cm-number" data-name="grey">220</span>);</p>
<p class="command"><span class="cm-p5-function">circle</span>(<span class="param cm-number" data-name="x">250</span>,<span class="param cm-number" data-name="y">250</span>,<span class="param cm-number" data-name="d">400</span>);</p>
<p class="command"><span class="cm-p5-function">circle</span>(<span class="param cm-number" data-name="x">250</span>,<span class="param cm-number" data-name="y">250</span>,<span class="param cm-number" data-name="d">300</span>);</p>
<p class="command"><span class="cm-p5-function">circle</span>(<span class="param cm-number" data-name="x">250</span>,<span class="param cm-number" data-name="y">250</span>,<span class="param cm-number" data-name="d">200</span>);</p>
}
</div>

</div>
<?php require("options_default.php") ?>
<?php require("footer.php") ?>
