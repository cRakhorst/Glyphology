document.addEventListener('DOMContentLoaded', function() {
    const ghostPicture = document.getElementById('ghost');
    let minutes = 5;

    setTimeout(() => {
        ghostPicture.style.transition = 'left 5s linear';
        ghostPicture.style.left = '0';
    }, minutes * 60 * 1000);

    // document.querySelector('.arrow').addEventListener('click', function() {
    //     window.location.href = 'login'; // Change to the actual next page URL
    // });

    document.querySelector('.glyphs').addEventListener('click', function() {
        window.location.href = 'login'; // Change to the actual notebook URL
    });

    document.querySelector('.combos').addEventListener('click', function() {
        window.location.href = 'login'; // Change to the actual glyphs URL
    });
});