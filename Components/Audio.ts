export var Context: AudioContext = new AudioContext();
export var PlaySource: AudioBufferSourceNode;
export var LoopSource: AudioBufferSourceNode;

export function PlaySound(SourceFile: string, Callback: () => void): void {
    this.Context = this.Context || new AudioContext();
    var audioCtx = this.Context;
    this.PlaySource = audioCtx.createBufferSource();
    var source = this.PlaySource;
    source.loop = false;
    var request = new XMLHttpRequest();
    request.responseType = "arraybuffer";
    request.open("GET", SourceFile, true);
    request.onload = function () {
        audioCtx.decodeAudioData(request.response, function (buffer) {
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start(0);
            if (Callback) {
                Callback();
            }
        }, function () {
            // Error callback.
            if (Callback) {
                Callback();
            }
        })
    }
    request.onerror = function () {
        if (Callback) {
            Callback();
        }
    }
    request.ontimeout = function () {
        if (Callback) {
            Callback();
        }
    }
    request.send();
};
export function LoadSound(SourceFile: string, Callback: () => void) {
    this.Context = this.Context || new AudioContext();
    var audioCtx = this.Context;
    this.PlaySource = audioCtx.createBufferSource();
    var source = this.PlaySource;
    source.loop = false;
    var request = new XMLHttpRequest();
    request.responseType = "arraybuffer";
    request.open("GET", SourceFile, true);
    request.onload = function () {
        audioCtx.decodeAudioData(request.response, function (buffer) {
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            if (Callback) {
                Callback();
            }
        }, function () {
            // Error callback.
            if (Callback) {
                Callback();
            }
        })
    }
    request.onerror = function () {
        if (Callback) {
            Callback();
        }
    }
    request.ontimeout = function () {
        if (Callback) {
            Callback();
        }
    }
    request.send();
};
export function StopSound(): void {
    if (this.PlaySource.buffer != null) {
        this.PlaySource.stop();
        this.PlaySource.disconnect();
    }
}
export function PlayLoop(SourceFile: string, Callback: () => void): void {
    this.Context = this.Context || new AudioContext();
    var audioCtx = this.Context;
    this.LoopSource = audioCtx.createBufferSource();
    var source = this.LoopSource;
    source.loop = true;
    var request = new XMLHttpRequest();
    request.responseType = "arraybuffer";
    request.open("GET", SourceFile, true);
    request.onload = function () {
        audioCtx.decodeAudioData(request.response, function (buffer) {
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start(0);
            if (Callback) {
                Callback();
            }
        }, function () {
            // Error callback.
            if (Callback) {
                Callback();
            }
        })
    }
    request.onerror = function () {
        if (Callback) {
            Callback();
        }
    }
    request.ontimeout = function () {
        if (Callback) {
            Callback();
        }
    }
    request.send();
};
export function LoadLoop(SourceFile: string, Callback: () => void) {
    this.Context = this.Context || new AudioContext();
    var audioCtx = this.Context;
    this.LoopSource = audioCtx.createBufferSource();
    var source = this.LoopSource;
    source.loop = false;
    var request = new XMLHttpRequest();
    request.responseType = "arraybuffer";
    request.open("GET", SourceFile, true);
    request.onload = function () {
        audioCtx.decodeAudioData(request.response, function (buffer) {
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            if (Callback) {
                Callback();
            }
        }, function () {
            // Error callback.
            if (Callback) {
                Callback();
            }
        })
    }
    request.onerror = function () {
        if (Callback) {
            Callback();
        }
    }
    request.ontimeout = function () {
        if (Callback) {
            Callback();
        }
    }
    request.send();
};
export function StopLoop(): void {
    if (this.LoopSource.buffer != null) {
        this.LoopSource.stop();
        this.LoopSource.disconnect();
    }
}

export function StreamSound(SourceFile) {
    var audio = document.createElement("audio");
    audio.classList.add("audio-stream");
    audio.src = SourceFile;
    audio.onended = function (this, ev) {
        document.body.removeChild(this);
    }
    audio.play();
}
export function StreamLoop(SourceFile) {
    var audio = document.createElement("audio");
    audio.classList.add("audio-stream-loop");
    audio.src = SourceFile;
    audio.loop = true;
    audio.onended = function (this, ev) {
        document.body.removeChild(this);
    }
    document.body.appendChild(audio);
    audio.play();
}
export function StopStream() {
    $("audio.audio-stream").each(function (index, elem:HTMLAudioElement) {
        elem.pause();
        $(elem).remove();
    })
}
export function StopStreamLoop() {
    $("audio.audio-stream-loop").each(function (index, elem: HTMLAudioElement) {
        elem.pause();
        $(elem).remove();
    })
}