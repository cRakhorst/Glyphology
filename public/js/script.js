document.addEventListener('DOMContentLoaded', function() {
    const ghostPicture = document.getElementById('ghost');
    let minutes = 0.01; // Set the number of minutes after which the ghost appears

    setTimeout(() => {
        ghostPicture.style.transition = 'left 5s linear';
        ghostPicture.style.left = '0';
    }, minutes * 60 * 1000); // Convert minutes to milliseconds
});