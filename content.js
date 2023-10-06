const code = `<div id="looper-extension-bar">
    <div class="looper-extension-wrapper">
        <span>Loop from</span>
        <div title="Select loop start" id="looper-extension-start-button" class="looper-extension-button">Start</div>
        <span>to</span>
        <div title="Select loop end" id="looper-extension-end-button" class="looper-extension-button">End</div>
    </div>
    <div class="looper-extension-wrapper">
        <div id="looper-extension-apply-button" class="looper-extension-button">Apply</div>
        <div id="looper-extension-clear-button" class="looper-extension-button">Clear</div>
    </div>
</div>`;

document.body.insertAdjacentHTML('beforeend', code);

const bar = document.getElementById('looper-extension-bar');
const startBtn = document.getElementById('looper-extension-start-button');
const endBtn = document.getElementById('looper-extension-end-button');
const okBtn = document.getElementById('looper-extension-apply-button');
const clearBtn = document.getElementById('looper-extension-clear-button');

let target,
    start,
    end,
    dragging = false,
    barHeight;

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.id !== 'looop') return;
    bar.style.display = 'flex';
    barHeight = bar.getBoundingClientRect().height;
});

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

    startBtn.textContent = 'Start';
    endBtn.textContent = 'End';
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
    if (start >= end) return;

    if (target !== undefined) {
        target.loop = true;

        for (let medium of document.querySelectorAll(['video', 'audio'])) {
            medium.removeEventListener('timeupdate', seekStart);
            medium.removeEventListener('timeupdate', seekEnd);
        }

        target.addEventListener('timeupdate', onTime);
    } else {
        for (let medium of document.querySelectorAll(['video', 'audio'])) {
            medium.addEventListener('play', () => medium.loop = true);
        }
    }
}

bar.addEventListener('pointerdown', () => {
    dragging = true;
})

document.addEventListener('pointermove', e => {
    if (dragging === false) return;
    let offset = window.innerHeight - e.y - barHeight;

    if (offset <= 0) {
        offset = 0
    } else if (e.y <= 0) {
        offset = window.innerHeight - barHeight;
    }

    bar.style.bottom = `${offset}px`;
})

document.addEventListener('pointerup', () => {
    if (dragging === false) return;
    dragging = false;
})

function seekStart(e) {
    if (target === undefined) target = e.target;
    start = target.currentTime;
    let ct = new Date(start * 1000).toISOString().slice(11, 19);
    if (ct.startsWith('00:')) ct = ct.replace('00:', '');
    startBtn.textContent = `${ct}`;
}

function seekEnd(e) {
    if (target === undefined) target = e.target;
    end = target.currentTime;
    let ct = new Date(end * 1000).toISOString().slice(11, 19);
    if (ct.startsWith('00:')) ct = ct.replace('00:', '');
    endBtn.textContent = `${ct}`;
}

function onTime() {
    if (target === undefined) return;

    if (target.currentTime < start || target.currentTime >= end) {
        target.currentTime = start;
    }
}