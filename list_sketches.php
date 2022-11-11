<select id="select-scripts">
    <option value="index_U2_L2_lines.php">Lines</option>
    <option value="index_U2_L2_circles.php">Circles</option>
    <option value="index_U2_L2_rects.php">Rects</option>
    <option value="index_U2_L2_triangle.php">Triangle</option>
    <option value="index_U2_L2_arcs.php">Arcs</option>
    <option value="index_U2_L2_loop.php">Loop with circles</option>
    <option value="index_U2_L2_loop_arcs.php">Loop with arcs</option>
    <option value="index_U3_L1_grid.php">Grid</option>
</select>
<script>
let filename = location.pathname.substr(location.pathname.lastIndexOf("/")+1);
$("#select-scripts")
.val( filename )
.change( function(){ window.location = $(this).val() }  )
</script>
