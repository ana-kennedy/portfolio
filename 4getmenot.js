document.addEventListener('DOMContentLoaded', function () {
    var desc = document.querySelector('.description');
    var h2 = desc && desc.querySelector('h2');
    if (!desc || !h2) return;

    h2.addEventListener('click', function () {
        // Only toggle on touch devices
        if (window.matchMedia('(hover: none)').matches) {
            desc.classList.toggle('show-content');
        }
    });

    // Add for .gameplay
    var gameplay = document.querySelector('.gameplay');
    var gameplayH2 = gameplay && gameplay.querySelector('h2');
    if (gameplay && gameplayH2) {
        gameplayH2.addEventListener('click', function () {
            if (window.matchMedia('(hover: none)').matches) {
                gameplay.classList.toggle('show-content');
            }
        });
    }
});
