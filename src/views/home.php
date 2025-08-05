<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Glypholagy</title>
    <link rel="stylesheet" href="/css/style.css">
</head>

<body>
    <div class="table">
        <div class="table-top">
            <div class="left">
                <div class="top-left">
                    <img src="/assets/pictures/grom-polaroid.jpg" alt="grom" id="grom-polaroid">
                    <img src="/assets/pictures/glyph-polaroid.jpg" alt="glyph" id="glyph-polaroid">
                    <img src="/assets/pictures/milkshake-polaroid.jpg" alt="milkshake" id="milkshake-polaroid">
                    <img src="/assets/pictures/oops-polaroid.jpg" alt="oops" id="oops-polaroid">
                    <img src="/assets/pictures/amity-note.png" alt="amity-note" id="amity-note">
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
                            <h1 id="small-page-text">Glyphs</h1>
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
                <div class="left-page" id="page"></div>
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
                        <h1>Glyphology</h1>
                    </div>
                    <div class="arrow">
                        <div class="line-1"></div>
                        <div class="line-2"></div>
                    </div>
                    <div class="footer">
                        <div class="footer-content">
                            <p id="footer-text">Your username:</p>
                            <p id="username"></p> <!-- This will be filled by PHP -->
                            <div class="lines">
                                <div id="line"></div>
                                <div id="line"></div>
                                <div id="line"></div>
                                <div id="line"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="right">
                <img src="/assets/pictures/Pencil.png" alt="Pencil" id="pencil">
                <img src="/assets/pictures/hexsquad.jpg" alt="hexsquad" id="hexsquad">
                <img src="assets/pictures/luz-vee.jpg" alt="luz-vee" id="luz-vee">
                <img src="assets/pictures/giraffes.png" alt="giraffes" id="giraffes">
                <img src="/assets/pictures/king-note.png" alt="king-note" id="king-note">
                <img src="/assets/pictures/stringbean.png" alt="stringbean" id="stringbean">
                <div class="plant-glyph-note">
                    <img src="/assets/pictures/Plant-glyph.png" alt="Plant Glyph" id="plant-glyph">
                    <img src="/assets/pictures/Flower.png" alt="Flower" id="flower">
                </div>
                <img src="/assets/pictures/eda-note.png" alt="eda-note" id="eda-note">
            </div>
        </div>
        <div class="table-bottom"></div>
    </div>
    <div class="floor">
        <img src="/assets/pictures/Failed-glyph.png" alt="Failed Glyph" id="failed-glyph">
        <?= '<img src="/assets/pictures/ghost.png" alt="Ghost" id="ghost">' ?>
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

    <script src="/js/script.js"></script>
</body>

</html>