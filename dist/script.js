document.addEventListener("DOMContentLoaded", function() {
    const catButton = document.querySelector('.cat-button');
    const catImage = document.getElementById('cat-image');
    const meowSound = new Audio('./assets/meow.mp3'); // Create an audio object for the meow sound
    const localClicksNumber = document.getElementById('local-count-header');
    const globalClicksNumber = document.getElementById('global-count-header');

    let isPlaying = false;

    const socket = io();

    function changeCatImage() {
        catImage.src = "./assets/cat2.png";
    }

    function restoreCatImage() {
        catImage.src = "./assets/cat1.png";
    }

    function playMeowSound() {
        if (!isPlaying) {
            meowSound.play();
            isPlaying = true;
            meowSound.addEventListener('ended', function() {
                isPlaying = false;
            });
        } else {
            meowSound.currentTime = 0;
        }
    }

    function incrementLocalCount() {
        let currentNumber = parseInt(localClicksNumber.textContent);
        currentNumber += 1;
        localClicksNumber.textContent = currentNumber;

        socket.emit('update-global-count', currentNumber);
    }

    function handleMouseDown() {
        changeCatImage();
        playMeowSound(); 
        incrementLocalCount();
    }

    function handleMouseUp() {
        restoreCatImage();
    }

    // Add event listeners for both mouse and touch events
    catButton.addEventListener('mousedown', handleMouseDown);
    catButton.addEventListener('mouseup', handleMouseUp);
    catButton.addEventListener('mouseleave', handleMouseUp);
    
    catButton.addEventListener('touchstart', function(event) {
        handleMouseDown();
        event.preventDefault(); // Prevent default behavior like image drag
    });
    catButton.addEventListener('touchend', function(event) {
        handleMouseUp();
        event.preventDefault(); // Prevent default behavior like image drag
    });
    catButton.addEventListener('touchcancel', handleMouseUp);
    
    socket.on('global-count-updated', (data) => {
        globalClicksNumber.textContent = data;
        console.log('UPDATING RN ', data);
    });
});
