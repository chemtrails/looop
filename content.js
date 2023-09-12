const bar = document.createElement('div');
const startBtn = document.createElement('div');
const endBtn = document.createElement('div');
const okBtn = document.createElement('div');
const clearBtn = document.createElement('div');
const wrapper1 = document.createElement('div');
const wrapper2 = document.createElement('div');


let target,
    start,
    end,
    dragging = false;

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.id !== 'looop') return;
    bar.style.display = 'flex';
});

document.body.append(bar);
bar.append(wrapper1);
bar.append(wrapper2);
wrapper1.append(startBtn);
wrapper1.append(endBtn);
wrapper2.append(okBtn);
wrapper2.append(clearBtn);

bar.id = 'looper-extension-bar';
wrapper1.classList.add('looper-extension-wrapper')
wrapper2.classList.add('looper-extension-wrapper')
startBtn.classList.add('looper-extension-button');
endBtn.classList.add('looper-extension-button');
okBtn.classList.add('looper-extension-button');
clearBtn.classList.add('looper-extension-button');

startBtn.textContent = 'Loop start: 0';
endBtn.textContent = 'Loop end: MAX';
okBtn.textContent = 'Apply';
clearBtn.textContent = 'Clear';

clearBtn.onclick = () => {
    if (target !== undefined) {
        target.loop = false;
        target.removeEventListener('timeupdate', onTime);

        for (let medium of document.querySelectorAll(['video', 'audio'])) {
            medium.removeEventListener('timeupdate', seekEnd);
            medium.removeEventListener('timeupdate', seekStart);
            medium.addEventListener('play', () => medium.loop = false);
        }

        target = undefined;
    }

    startBtn.textContent = 'Loop start: 0';
    endBtn.textContent = 'Loop end: MAX';
    endBtn.classList.remove('looper-extension-selected');
    startBtn.classList.remove('looper-extension-selected');
    bar.style.display = 'none';
}

startBtn.onclick = () => {
    endBtn.classList.remove('looper-extension-selected');
    startBtn.classList.add('looper-extension-selected');

    if (target !== undefined) {
        target.removeEventListener('timeupdate', seekEnd);
        target.addEventListener('timeupdate', seekStart);
        return;
    }

    for (let medium of document.querySelectorAll(['video', 'audio'])) {
        medium.addEventListener('timeupdate', seekStart);
    }
}

endBtn.onclick = () => {
    endBtn.classList.add('looper-extension-selected');
    startBtn.classList.remove('looper-extension-selected');

    if (target !== undefined) {
        target.removeEventListener('timeupdate', seekStart);
        target.addEventListener('timeupdate', seekEnd);
        return;
    }

    for (let medium of document.querySelectorAll(['video', 'audio'])) {
        medium.addEventListener('timeupdate', seekEnd);
    }
}

okBtn.onclick = () => {
    endBtn.classList.remove('looper-extension-selected');
    startBtn.classList.remove('looper-extension-selected');
    bar.style.display = 'none';

    if (target !== undefined) {
        target.loop = true;

        for (let medium of document.querySelectorAll(['video', 'audio'])) {
            medium.removeEventListener('timeupdate', seekStart);
            medium.removeEventListener('timeupdate', seekEnd);
        }

        target.addEventListener('timeupdate', onTime);
    } else {
        for (let medium of document.querySelectorAll(['video', 'audio'])) {
            medium.addEventListener('play', medium.loop = true);
        }
    }
}

bar.addEventListener('mousedown', () => {
    dragging = true;
})

document.addEventListener('mousemove', e => {
    if (dragging === false) return;
    bar.style.bottom = `${window.innerHeight - e.y}px`;
})

document.addEventListener('mouseup', () => {
    if (dragging === false) return;
    dragging = false;
})

function seekStart(e) {
    if (target === undefined) target = e.target;
    start = target.currentTime;
    startBtn.textContent = `Loop start: ${parseInt(start)}s`;
}

function seekEnd(e) {
    if (target === undefined) target = e.target;
    end = target.currentTime;
    endBtn.textContent = `Loop end: ${parseInt(end)}s`;
}

function onTime() {
    if (target === undefined) return;

    if (target.currentTime < start || target.currentTime >= end) {
        target.currentTime = start;
    }
}