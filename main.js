const soundsList = {
    drum_kit_1: ['boom', 'clap', 'hihat', 'kick', 'openhat', 'ride', 'snare', 'tink', 'tom'],
    drum_kit_2: ['kick', 'snare', 'openHat', 'closedHat'],
    piano: [';', 'a', 'd', 'e', 'f', 'g', 'h', 'j', 'k', 'l', 'o', 'p', 's', 't', 'u', 'w', 'y'],
};

class Sequencer {
    $sequencer = document.querySelector('.sequencer');

    interval = null;
    stepsCount = 16;
    currentStep = 1;
    tempo = 100;
    isPlaying = false;
    sounds = [];

    constructor() {
        this.init();
    }

    init() {
        this.$sequencer.addEventListener('click', e => {
            if (e.target.matches('.step')) {
                const row = e.target.closest('.row');
                const index = row.dataset.index;
                e.target.classList.toggle('active');
                this.sounds[index].states = [...row.querySelectorAll('.step')].map(el => {
                    return el.classList.contains('active');
                });
            }
            if (e.target.matches('.state-led')) {
                const row = e.target.closest('.row');
                const index = row.dataset.index;
                row.classList.toggle('inactive');
                this.sounds[index].active = !row.classList.contains('inactive');
                console.log(this.sounds);
            }
        });
        document.querySelector('.samples select').addEventListener('change', e => {
            const value = e.target.value;
            e.target.parentNode.querySelectorAll('.list-tones .tunes-set').forEach(el => el.style.display = 'none');
            e.target.parentNode.querySelector(`.list-tones .tunes-set[data-set-name="${value}"]`).style.removeProperty('display');
        });
        document.querySelector('.samples .list-tones').addEventListener('click', e => {
            if (e.target.matches('.btn-note') || e.target.matches('.add-note')) {
                const tonesSet = e.target.dataset.tuneset;
                const note = e.target.dataset.note;
                if (e.target.matches('.btn-note')) {
                    this.getAudio(tonesSet, note).play();
                } else {
                    this.addNote(tonesSet, note);
                }
            }
        });
        const playButton = document.querySelector('button.play');
        const stopButton = document.querySelector('button.stop');
        playButton.addEventListener('click', this.playSequence.bind(this));
        stopButton.addEventListener('click', this.stopSequence.bind(this));
        document.querySelector('.tempo').addEventListener('change', e => {
            this.tempo = e.target.value;
            if (this.isPlaying) {
                this.stopSequence();
                this.playSequence();
            }
        });
        this.generateSequencer();
        this.renderSamples();
    }

    playSound(audio) {
        audio.currentTime = 0;
        audio.play();
    }

    playSequence() {
        if (this.isPlaying) {
            return;
        }
        this.isPlaying = true;
        this.interval = setInterval(() => {
            if (this.currentStep > this.stepsCount) {
                this.currentStep = 1;
            }
            this.unFocusAll();
            this.$sequencer.querySelectorAll('.row')
                .forEach((row, rowIndex) => {
                    const s = row.querySelector('.step:nth-child(' + this.currentStep + ')');
                    s.classList.add('focused');
                    if (!row.classList.contains('inactive')
                        && s.classList.contains('active')) {
                        this.playSound(this.sounds[Object.keys(this.sounds)[rowIndex]].audio);
                    }
                });
            this.currentStep++;
        }, (60 / this.tempo) * 1000);
    }

    stopSequence() {
        clearInterval(this.interval);
        this.interval = null;
        this.currentStep = 1;
        this.unFocusAll();
        this.isPlaying = false;
    }

    generateSequencer() {
        this.stopSequence();
    }

    renderSequencer() {
        this.$sequencer.innerHTML = this.sounds.map(this.getRow.bind(this)).join('');
    }

    addNote(tunesSet, noteName) {
        const audio = this.getAudio(tunesSet, noteName);

        this.sounds.push({
            noteName,
            tunesSet,
            audio,
            active: true,
            states: Array(this.stepsCount).fill(false),
        });
        this.renderSequencer();
    }

    removeNote(index) {

        this.renderSequencer();
    }

    unFocusAll() {
        this.$sequencer.querySelectorAll('.step')
            .forEach(el => el.classList.remove('focused'));
    }

    getRow(sound, index) {
        const led = `<div class="state-led ${sound.active ? '' : 'inactive'}"></div>`;
        const btns = sound.states.map(val =>
             `<button class="step ${val ? 'active' : ''}"></button>`
        ).join('');
        const stepsDiv = `<div class="steps">${btns}</div>`;
        const soundName = `<div class="sound-name">${sound.tunesSet}-${sound.noteName}</div>`;
        const del = `<div class="delete" data-index="${index}">&times;</div>`
        const control = `<div class="note-control">${del}${led}${soundName}</div>`;
        return `<div class="row" data-index="${index}" 
                    data-tuneset="${sound.tunesSet}" 
                    data-note="${sound.noteName}">
                    ${control}${stepsDiv}
                </div>`;
    }

    renderSamples() {
        document.querySelector('.samples .list-tones').innerHTML = Object.keys(soundsList).map(tuneSet => {
            return `<div class="tunes-set" style="display:none" data-set-name="${tuneSet}">
                    <div class="notes">
                    ${soundsList[tuneSet].map(note => this.getNoteSample(tuneSet, note)).join('')}
                    </div>
                </div>`;
        }).join('');
        document.querySelector(`.list-tones .tunes-set:first-child`).style.removeProperty('display');
    }

    getNoteSample(tuneSet, note) {
        return `<div class="note">
                    <div class="btn-note" data-tuneset="${tuneSet}" data-note="${note}">${note}</div>
                    <div class="add-note" data-tuneset="${tuneSet}" data-note="${note}">Add</div>
                </div>`;
    }

    getAudio(tunesSet, noteName) {
        return new Audio('tunes/' + tunesSet + '/' + noteName + '.wav');
    }
}

const sequencer = new Sequencer();
sequencer.addNote('drum_kit_1', 'kick');
