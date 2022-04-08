<select id="select-scripts">
    <option value="index_U2_L2_lines.php">U2_L2_lines</option>
    <option value="index_U2_L2_circles.php">U2_L2_circles</option>
    <option value="index_U2_L2_rects.php">U2_L2_rects</option>
    <option value="index_U2_L2_triangle.php">U2_L2_triangle</option>
    <option value="index_U2_L2_arcs.php">U2_L2_arcs</option>
    <option value="index_U2_L2_loop.php">U2_L2_loop</option>
    <option value="index_U3_L1_grid.php">U3_L1_grid</option>
</select>
<script>
let filename = location.pathname.substr(location.pathname.lastIndexOf("/")+1);
$("#select-scripts")
.val( filename )
.change( function(){ window.location = $(this).val() }  )
</script>
