const text = "ANA-SITE:~$sudo apt install anakennedy";
const target = document.getElementById("typewriter");
let idx = 0;
let typing = true;

function typeLoop() {
    if (typing) {
        if (idx <= text.length) {
            target.textContent = text.slice(0, idx);
            idx++;
            setTimeout(typeLoop, 150);
        } else {
            typing = false;
            setTimeout(typeLoop, 2000); 
        }
    } else {
        if (idx > 1) { 
            target.textContent = text.slice(0, idx);
            idx--;
            setTimeout(typeLoop, 50);
        } else {
            typing = true;
            setTimeout(typeLoop, 500);
        }
    }
}

typeLoop();

function enableTouchToggle(sectionSelector, toggleClass) {
    const section = document.querySelector(sectionSelector);
    if (!section) return;
    section.addEventListener('click', function (e) {
        
        if (window.matchMedia('(hover: none)').matches) {
            section.classList.toggle(toggleClass);
        }
    });
}

enableTouchToggle('.projects', 'show-content');
enableTouchToggle('.about', 'show-content');


const hoverAudio = new Audio('assets/audio/UIHoverFX.wav');
hoverAudio.volume = 1; 

function playHoverAudio() {
    const audioClone = hoverAudio.cloneNode();
    document.addEventListener('click', () => {
        audioClone.play();
    }, { once: true });
}


document.querySelectorAll('.project-link').forEach(el => {
    el.addEventListener('mouseenter', playHoverAudio);
});


const aboutSection = document.querySelector('.about');
if (aboutSection) {
    aboutSection.querySelectorAll('h2, p, ul').forEach(el => {
        el.addEventListener('mouseenter', playHoverAudio);
    });
}
