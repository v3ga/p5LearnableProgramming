<?php 
    require("header.php");
?>

<div class="title"><?php require("list_sketches.php") ?></div>
<div id="p5Sketch">
<?php require("setup-basic.php"); ?>

<div class="function" id="fn-draw"><span class="cm-p5-keyword">function</span> <span class="cm-p5-function">draw</span>(){
<p class="command"><span class="cm-p5-function">background</span>(<span class="param cm-number" data-name="grey">220</span>);</p>
<p class="command"><span class="cm-p5-function">rect</span>(<span class="param cm-number" data-name="x">150</span>,<span class="param cm-number" data-name="y">150</span>,<span class="param cm-number" data-name="w">200</span>,<span class="param cm-number" data-name="h">200</span>);</p>
<p class="command"><span class="cm-p5-function">rect</span>(<span class="param cm-number" data-name="x">200</span>,<span class="param cm-number" data-name="y">200</span>,<span class="param cm-number" data-name="w">200</span>,<span class="param cm-number" data-name="h">200</span>);</p>
<p class="command"><span class="cm-p5-function">rect</span>(<span class="param cm-number" data-name="x">150</span>,<span class="param cm-number" data-name="y">50</span>,<span class="param cm-number" data-name="w">200</span>,<span class="param cm-number" data-name="h">100</span>);</p>
}
</div>

</div>

<?php require("options_default.php") ?>
<?php require("footer.php") ?>
