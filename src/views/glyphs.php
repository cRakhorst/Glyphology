<?php
if (!isset($_SESSION['user_id'])) {
    echo "<script>window.location.href = 'login';</script>";
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Glypholagy</title>
    <link rel="stylesheet" href="css/glyphs.css">
</head>

<body>
    <div class="table">
        <p id="error-message"></p>
        <div class="table-top">
            <div class="left">
                <div class="top-left">
                    <img src="assets/pictures/grom-polaroid.jpg" alt="grom" id="grom-polaroid">
                    <img src="assets/pictures/glyph-polaroid.jpg" alt="glyph" id="glyph-polaroid">
                    <img src="assets/pictures/milkshake-polaroid.jpg" alt="milkshake" id="milkshake-polaroid">
                    <img src="assets/pictures/oops-polaroid.jpg" alt="oops" id="oops-polaroid">
                    <img src="assets/pictures/amity-note.png" alt="amity-note" id="amity-note">
                    <img src="assets/pictures/glyph-note.png" alt="glyph-note" id="glyph-note">
                </div>
                <div class="bottom-left">
                    <div class="glyphs notebook">
                        <div class="small-rings">
                            <div id="small-ring"></div>
                            <div id="small-ring"></div>
                            <div id="small-ring"></div>
                            <div id="small-ring"></div>
                            <div id="small-ring"></div>
                            <div id="small-ring"></div>
                            <div id="small-ring"></div>
                            <div id="small-ring"></div>
                        </div>
                        <div id="small-page">
                            <h1 id="small-page-text">Create</h1>
                        </div>
                    </div>
                    <div class="combos notebook">
                        <div class="small-rings">
                            <div id="small-ring"></div>
                            <div id="small-ring"></div>
                            <div id="small-ring"></div>
                            <div id="small-ring"></div>
                            <div id="small-ring"></div>
                            <div id="small-ring"></div>
                            <div id="small-ring"></div>
                            <div id="small-ring"></div>
                        </div>
                        <div id="small-page">
                            <h1 id="small-page-text">Glyph combos</h1>
                        </div>
                    </div>
                </div>
            </div>
            <div class="middle">
                <div class="left-page" id="page">
                    <div class="header">
                        <?php
                        $glyph = $db->getLatestGlyph();
                        echo "<h1 id='glyph-title'>" . htmlspecialchars($glyph['title']) . "</h1>"; ?>
                        <p id="inventor">Created by: <?php echo htmlspecialchars($glyph['username']); ?></p>
                    </div>
                    <div class="back-arrow">
                        <div class="line-1"></div>
                        <div class="line-2"></div>
                    </div>
                    <div class="content">
                        <canvas id="display-canvas"></canvas>
                    </div>
                    <div class="footer">
                        <p id="info">Description:</p>
                        <p id="description"><?php $glyph = $db->getLatestGlyph();
                                            echo htmlspecialchars($glyph['description']); ?></p>
                    </div>
                </div>
                <div class="rings">
                    <div id="ring"></div>
                    <div id="ring"></div>
                    <div id="ring"></div>
                    <div id="ring"></div>
                    <div id="ring"></div>
                    <div id="ring"></div>
                    <div id="ring"></div>
                    <div id="ring"></div>
                    <div id="ring"></div>
                    <div id="ring"></div>
                </div>
                <div class="right-page" id="page">
                    <div class="header">
                        <div class="top">
                            <p id="header-text">Title: </p>
                            <p id="characters">0/30</p>
                        </div>
                        <input type="text" id="title">
                    </div>

                    <div class="content">
                        <canvas id="combo-canvas"></canvas>
                        <div class="choose">
                            <img src="assets/pictures/pin.png" alt="pin" id="pin">
                            <div class="top-choose">
                                <p id="choose-text">Add a node:</p>
                                <p id="cross">X</p>
                            </div>
                            <p id="line">Straight line</p>
                            <p id="curved-line">Curved line</p>
                            <!-- <p id="glyph">Glyph</p> -->
                            <p id="circle">Circle</p>
                        </div>
                    </div>
                    <div class="forward-arrow">
                        <div class="line-1"></div>
                        <div class="line-2"></div>
                    </div>
                    <div class="done-creating">
                        <img src="assets/pictures/pin.png" id="pin-creating" alt="pin">
                        <p id="done-text">Are you done creating?</p>
                        <div class="buttons">
                            <button id="done">Yes!</button>
                            <button id="not-done">Keep thinking</button>
                        </div>
                    </div>
                    <div class="footer">
                        <div class="top">
                            <p id="header-text">Description: </p>
                            <p id="characters-description">0/150</p>
                        </div>
                        <textarea id="description-custom"></textarea>
                        <div class="images">
                            <img src="assets/pictures/Signature.png" alt="signature" id="signature">
                            <div class="right">
                                <div class="delete-confirmation">
                                    <img src="assets/pictures/pin.png" alt="pin" id="pin-delete">
                                    <p id="delete-text">Are you sure you want to delete your creation?</p>
                                    <div class="checkmark">
                                        <div class="check-line1"></div>
                                        <div class="check-line2"></div>
                                    </div>
                                </div>
                                <img src="assets/pictures/magnifying-glass.png" alt="magnifying glass" id="magnifying-glass">
                                <img src="assets/pictures/eraser.png" alt="eraser" id="eraser">
                                <img src="assets/pictures/trash_can.png" alt="trash can" id="trash-can">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="right">
                <img src="assets/pictures/Pencil.png" alt="Pencil" id="pencil">
                <img src="assets/pictures/hexsquad.jpg" alt="hexsquad" id="hexsquad">
                <img src="assets/pictures/luz-vee.jpg" alt="luz-vee" id="luz-vee">
                <img src="assets/pictures/giraffes.png" alt="giraffes" id="giraffes">
                <img src="assets/pictures/king-note.png" alt="king-note" id="king-note">
                <img src="assets/pictures/stringbean.png" alt="stringbean" id="stringbean">
                <div class="plant-glyph-note">
                    <img src="assets/pictures/Plant-glyph.png" alt="Plant Glyph" id="plant-glyph">
                    <img src="assets/pictures/Flower.png" alt="Flower" id="flower">
                </div>
                <img src="assets/pictures/eda-note.png" alt="eda-note" id="eda-note">
                <div class="hamburger-menu">
                    <div class="bar1"></div>
                    <div class="bar2"></div>
                    <div class="bar3"></div>
                </div>
                <div class="dropdown-content">
                    <div class="top-dropdown">
                        <a href="home">Home</a>
                        <a href="login">Login</a>
                        <a href="login">Register</a>
                        <a href="glyphs">Create Glyph</a>
                        <a href="#" class="disabled-feature">Create Combo</a>
                        <a href="glyph">Popular Glyphs</a>
                        <a href="#" class="disabled-feature">Popular Combos</a>
                        <a href="favorite-glyphs">Favorite Glyphs</a>
                        <a href="#" class="disabled-feature">Favorite Combos</a>
                        <a href="#" class="disabled-feature">My Glyphs</a>
                        <a href="#" class="disabled-feature">My Combos</a>
                        <?php if (isAdmin()): ?>
                            <a href="admin">Admin Panel</a>
                        <?php endif; ?>
                    </div>
                    <div class="bottom-dropdown">
                        <a href="https://discord.gg/Fc5hQ2MMeJ" target="_blank">Discord</a>
                        <a href="https://www.paypal.com/ncp/payment/88MRBHCDVM8Q2" target="_blank">Donate</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="table-bottom"></div>
    </div>
    <div class="floor">
        <img src="assets/pictures/Failed-glyph.png" alt="Failed Glyph" id="failed-glyph">
        <?php
        ghostPicture();
        ?>
        <div class="dark-part"></div>
        <div class="chair">
            <div class="ball" id="ball-1"></div>
            <div class="ball" id="ball-2"></div>
            <div id="chair-1">
                <div class="seated-line"></div>
                <div class="seated-part"></div>
                <div class="leg-1"></div>
                <div class="leg-2"></div>
            </div>
        </div>
        <div class="pattern">
            <div class="break"></div>
            <div class="plank"></div>
            <div class="break"></div>
            <div class="plank"></div>
            <div class="break"></div>
            <div class="plank"></div>
            <div class="break"></div>
            <div class="plank"></div>
        </div>
    </div>

    <script src="js/glyphs.js"></script>
</body>

</html>