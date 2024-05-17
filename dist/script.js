// Add this line in your script.js to check if Socket.IO is defined
console.log("Socket.IO:", typeof io);

// Rest of your script
document.addEventListener("DOMContentLoaded", function() {
    const catButton = document.querySelector('.cat-button');
    const catImage = document.getElementById('cat-image');
    const meowSound = new Audio('./assets/meow.mp3'); // Create an audio object for the meow sound
    const localClicksNumber = document.getElementById('local-count-header');
    const globalClicksNumber = document.getElementById('global-count-header');

    let isPlaying = false;

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

    catButton.addEventListener('mousedown', () => {
        changeCatImage();
        playMeowSound(); 
        incrementLocalCount();
    });

    catButton.addEventListener('mouseup', () => {
        restoreCatImage();
    });

    catButton.addEventListener('mouseleave', () => {
        restoreCatImage();
    });
    
    socket.on('global-count-updated', (data) => {
        globalClicksNumber.textContent = data;
        console.log('UPDATING RN ',data)
    });
});
