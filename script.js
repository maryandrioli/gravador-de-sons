// script.js
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const recorders = [];
    const audioElements = [];
    let pressTimer;
    const pressDelay = 1000; // Tempo necessário para iniciar a gravação (1 segundo)
    let currentRecordingIndex = -1;

    // Inicializa as bolinhas e seus gravadores
    for (let i = 0; i < 6; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        grid.appendChild(cell);

        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const mediaRecorder = new MediaRecorder(stream);
            recorders[i] = { recorder: mediaRecorder, chunks: [], isReady: false };

            mediaRecorder.ondataavailable = e => recorders[i].chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(recorders[i].chunks, { 'type' : 'audio/ogg; codecs=opus' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audioElements[i] = new Audio(audioUrl);
                audioElements[i].onended = () => cell.style.backgroundColor = 'yellow';
                cell.style.backgroundColor = 'yellow';
                recorders[i].isReady = true;
            };
        });

        cell.addEventListener('mousedown', () => handlePress(i));
        cell.addEventListener('mouseup', () => handleRelease(i));
        cell.addEventListener('mouseleave', () => handleRelease(i)); // Para gravação se o mouse sair da célula
    }

    // Mapeia teclas para bolinhas e adiciona listeners
    const keyMap = {
        'ArrowLeft': 0,
        'ArrowRight': 1,
        'ArrowUp': 2,
        'ArrowDown': 3,
        ' ': 4,
        'Enter': 5
    };

    document.addEventListener('keydown', (event) => {
        if (keyMap[event.key] !== undefined && !event.repeat) {
            handlePress(keyMap[event.key]);
        }
    });

    document.addEventListener('keyup', (event) => {
        if (keyMap[event.key] !== undefined) {
            handleRelease(keyMap[event.key]);
        }
    });

    function handlePress(index) {
        clearTimeout(pressTimer);
        pressTimer = setTimeout(() => {
            if (!recorders[index].isReady || (recorders[index].isReady && index === currentRecordingIndex)) {
                startRecording(index);
            }
        }, pressDelay);
        currentRecordingIndex = index;
    }

    function handleRelease(index) {
        clearTimeout(pressTimer);
        if (recorders[index].recorder.state === 'recording') {
            stopRecording(index);
        } else if (recorders[index].isReady && index === currentRecordingIndex) {
            playRecording(index);
        }
    }

    function startRecording(index) {
        const cell = grid.children[index];
        cell.style.backgroundColor = 'red';
        recorders[index].chunks = [];
        recorders[index].recorder.start();
        recorders[index].isReady = false; // Resetar o estado de prontidão
    }

    function stopRecording(index) {
        const recorder = recorders[index].recorder;
        if (recorder.state === 'recording') {
            recorder.stop();
        }
    }

    function playRecording(index) {
        audioElements[index].play();
        grid.children[index].style.backgroundColor = 'green';
    }
});
