<?php require("header.php") ?>

<!-- RECTS -->
<p class="command"><span class="cm-p5-function">rect</span>(<span class="param cm-number" data-name="x">20</span>,<span class="param cm-number" data-name="y">20</span>,<span class="param cm-number" data-name="w">90</span>,<span class="param cm-number" data-name="h">90</span>);<p class="command"></p>
<p class="command"><span class="cm-p5-function">rect</span>(<span class="param cm-number" data-name="x">90</span>,<span class="param cm-number" data-name="y">90</span>,<span class="param cm-number" data-name="w">90</span>,<span class="param cm-number" data-name="h">90</span>);<p class="command"></p>

<!-- CIRCLES : LOOP -->
<p class="command loop-for" id="loop-1"><span class="cm-p5-loop">for(<span class="var-def"> <span class="cm-keyword">let</span> <span class="cm-def" data-name="i">i</span>=<span class="cm-number">0</span></span>; i&lt;<span class="cm-number nb-loop">3</span>; <span class="update">i++</span>){</p>
  <div class="command block" data-parent="loop-1">
    <p class="command" id="circle1">&nbsp;<span class="cm-p5-function">circle</span>(<span class="param cm-variable" data-name="x">280+i*20</span>,<span class="param cm-variable" data-name="y">120-i*20</span>,<span class="param cm-number" data-name="d">120</span>);</p>
  <p class="block-end">}</p>

<!-- SHAPES -->
<p class="command"><span class="cm-p5-function">noFill</span>();</p>
<p class="command"><span class="cm-p5-function">beginShape</span>();</p>
<p class="command"><span class="cm-p5-function">vertex</span>(<span class="param cm-number" data-name="x">20</span>,<span class="param cm-number" data-name="y">220</span>);</p>
<p class="command"><span class="cm-p5-function">vertex</span>(<span class="param cm-number" data-name="x">180</span>,<span class="param cm-number" data-name="y">260</span>);</p>
<p class="command"><span class="cm-p5-function">vertex</span>(<span class="param cm-number" data-name="x">140</span>,<span class="param cm-number" data-name="y">380</span>);</p>
<p class="command"><span class="cm-p5-function">vertex</span>(<span class="param cm-number" data-name="x">40</span>,<span class="param cm-number" data-name="y">360</span>);</p>
<p class="command"><span class="cm-p5-function">endShape</span>(CLOSE);</p>      

<!-- LINES -->
<p class="command"><span class="cm-p5-function">line</span>(<span class="param cm-number" data-name="x1">220</span>,<span class="param cm-number" data-name="y1">220</span>,<span class="param cm-number" data-name="x2">220</span>,<span class="param cm-number" data-name="y2">380</span>);</p>
<p class="command"><span class="cm-p5-function">line</span>(<span class="param cm-number" data-name="x1">260</span>,<span class="param cm-number" data-name="y1">220</span>,<span class="param cm-number" data-name="x2">260</span>,<span class="param cm-number" data-name="y2">380</span>);</p>
<p class="command"><span class="cm-p5-function">line</span>(<span class="param cm-number" data-name="x1">300</span>,<span class="param cm-number" data-name="y1">220</span>,<span class="param cm-number" data-name="x2">300</span>,<span class="param cm-number" data-name="y2">380</span>);</p>
<p class="command"><span class="cm-p5-function">line</span>(<span class="param cm-number" data-name="x1">340</span>,<span class="param cm-number" data-name="y1">220</span>,<span class="param cm-number" data-name="x2">340</span>,<span class="param cm-number" data-name="y2">380</span>);</p>
<p class="command"><span class="cm-p5-function">line</span>(<span class="param cm-number" data-name="x1">380</span>,<span class="param cm-number" data-name="y1">220</span>,<span class="param cm-number" data-name="x2">380</span>,<span class="param cm-number" data-name="y2">380</span>);</p>

<?php require("footer.php") ?>

