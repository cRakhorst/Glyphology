<?php 
if (!isset($_SESSION['username']) || $_SESSION['username'] !== 'admin') {
    echo "<script> window.location.href = 'glyphs'</script>";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <?php
    
    ?>
</body>
</html>