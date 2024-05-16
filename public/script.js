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
            meowSound.currentTime = 0; // Reset the playback to the beginning
        }
    }

    function incrementLocalCount() {
        let currentNumber = parseInt(localClicksNumber.textContent);
        currentNumber += 1;
        localClicksNumber.textContent = currentNumber;

        // Send the updated local count to the server via Socket.IO
        socket.emit('update-global-count', currentNumber);
    }

    function fetchJSONData() {
        fetch('../backend/globalCount.json')
            .then((response) => response.json())
            .then((json) => console.log(json));
    }

    catButton.addEventListener('mousedown', () => {
        changeCatImage();
        playMeowSound(); // Play the meow sound when mouse is released
        incrementLocalCount();
    });

    catButton.addEventListener('mouseup', () => {
        restoreCatImage();
    });

    catButton.addEventListener('mouseleave', () => {
        restoreCatImage();
    });

    // Establish Socket.IO connection with the server
    const socket = io();
    
    // Handle message from the server
    socket.on('global-count-updated', (data) => {
        // Update the global count displayed on the client
        globalClicksNumber.textContent = data;
        console.log('UPDATING RN ',data)
    });

    // fetchJSONData()
});

//FIX THE GLOBAL COUNT NOT SHOWING AT START!