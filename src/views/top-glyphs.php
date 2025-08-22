<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Glypholagy</title>
    <link rel="stylesheet" href="/css/top-glyphs.css">
</head>

<body>
    <div class="table">
        <p id="error-message"></p>
        <div class="table-top">
            <div class="left">
                <div class="top-left">
                    <img src="/assets/pictures/grom-polaroid.jpg" alt="grom" id="grom-polaroid">
                    <img src="/assets/pictures/glyph-polaroid.jpg" alt="glyph" id="glyph-polaroid">
                    <img src="/assets/pictures/milkshake-polaroid.jpg" alt="milkshake" id="milkshake-polaroid">
                    <img src="/assets/pictures/oops-polaroid.jpg" alt="oops" id="oops-polaroid">
                    <img src="/assets/pictures/amity-note.png" alt="amity-note" id="amity-note">
                    <img src="/assets/pictures/glyph-note.png" alt="glyph-note" id="glyph-note">
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
                    <div class="sticky-notes">
                        <img src="/assets/pictures/pink-sticky-note-front.png" alt="pink sticky note front" id="pink-sticky-note-front">
                        <p id="top-glyphs-text">Popular</p>
                        <!-- <img src="/assets/pictures/pink-sticky-note-back.png" alt="pink sticky note back" id="pink-sticky-note-back">
                        <img src="/assets/pictures/green-sticky-note-front.png" alt="green sticky note front" id="green-sticky-note-front">
                        <img src="/assets/pictures/green-sticky-note-back.png" alt="green sticky note back" id="green-sticky-note-back">
                        <img src="/assets/pictures/tan-sticky-note-front.png" alt="tan sticky note front" id="tan-sticky-note-front">
                        <img src="/assets/pictures/tan-sticky-note-back.png" alt="tan sticky note back" id="tan-sticky-note-back"> -->
                    </div>
                    <div class="header">
                        <h1 id="glyph-title"></h1>
                        <p id="inventor"></p>
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
                        <p id="description"></p>
                        <img src="/assets/pictures/heart-icon.png" alt="heart icon" id="heart-icon">
                        <p id="like-count"></p>
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

                </div>
            </div>
            <div class="right">
                <img src="/assets/pictures/Pencil.png" alt="Pencil" id="pencil">
                <img src="/assets/pictures/hexsquad.jpg" alt="hexsquad" id="hexsquad">
                <img src="/assets/pictures/luz-vee.jpg" alt="luz-vee" id="luz-vee">
                <img src="/assets/pictures/giraffes.png" alt="giraffes" id="giraffes">
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

    <script src="/js/top-glyphs.js"></script>
</body>

</html>