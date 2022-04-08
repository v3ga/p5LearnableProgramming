<?php 
    require("header.php");
?>

<div class="title"><?php require("list_sketches.php") ?></div>
<div id="p5Sketch">
<?php require("setup-angleMode.php"); ?>

<div class="function" id="fn-draw"><span class="cm-p5-keyword">function</span> <span class="cm-p5-function">draw</span>(){
<p class="command"><span class="cm-p5-function">background</span>(<span class="param cm-number" data-name="grey">220</span>);</p>
<p class="command"><span class="cm-p5-function">arc</span>(<span class="param cm-number" data-name="x">250</span>,<span class="param cm-number" data-name="y">250</span>,<span class="param cm-number" data-name="w">400</span>,<span class="param cm-number" data-name="h">400</span>,<span class="param cm-number" data-name="astart">-45</span>,<span class="param cm-number" data-name="aend">45</span>);</p>
<p class="command"><span class="cm-p5-function">arc</span>(<span class="param cm-number" data-name="x">250</span>,<span class="param cm-number" data-name="y">250</span>,<span class="param cm-number" data-name="w">300</span>,<span class="param cm-number" data-name="h">300</span>,<span class="param cm-number" data-name="astart">0</span>,<span class="param cm-number" data-name="aend">90</span>);</p>
<p class="command"><span class="cm-p5-function">arc</span>(<span class="param cm-number" data-name="x">250</span>,<span class="param cm-number" data-name="y">250</span>,<span class="param cm-number" data-name="w">200</span>,<span class="param cm-number" data-name="h">200</span>,<span class="param cm-number" data-name="astart">45</span>,<span class="param cm-number" data-name="aend">135</span>);</p>
<p class="command"><span class="cm-p5-function">arc</span>(<span class="param cm-number" data-name="x">250</span>,<span class="param cm-number" data-name="y">250</span>,<span class="param cm-number" data-name="w">100</span>,<span class="param cm-number" data-name="h">100</span>,<span class="param cm-number" data-name="astart">90</span>,<span class="param cm-number" data-name="aend">180</span>);</p>
}
</div>

</div>

<?php require("options_default.php") ?>
<?php require("footer.php") ?>
