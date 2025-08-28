<?php 

function ghostPicture() {
    $number = rand(1, 23062228);
    if ($number !== 23062228) {
        return;
    } else {
        echo '<img src="assets/pictures/ghost.png" alt="Ghost" id="ghost">';
    }
}

function isAdmin() {
    return isset($_SESSION['username']) && $_SESSION['username'] === 'Synthi';
}