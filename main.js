window.addEventListener('load', function() {
  var audio = document.getElementsByTagName('audio')[0];
  var loadAudioButton = document.getElementById('loadAudio');
  var audioUrlInput = document.getElementById('audioUrl');
  loadAudioButton.onclick = function() {
    audio.src = audioUrlInput.value;
  };

  audio.addEventListener('play', function() {
    play();
  });

  audio.addEventListener('ended', stop);

  var offset = 0;
  var bpm = 60;
  var memterBeats = 4; // 节拍拍子数
  //var memterValue = 4; // 拍子时值
  var beatSnapDivisor = 1;
  var timer;
  var isPlaying = false;

  function playOrStop() {
    isPlaying ? stop() : play();
  }

  function play() {
    var beatDivs = document.getElementById('beatShowPanel').children;
    var beatDuration = 60 * 1000 / bpm / beatSnapDivisor;
    var currBeatIndex = 0, prevBeatIndex = 0;
    var beats = memterBeats * beatSnapDivisor;

    startAnimation();

    function startAnimation() {
      timer = requestAnimationFrame(function() {
        if (Math.round(audio.currentTime * 1000) >= offset) {
          currBeatIndex = Math.floor((audio.currentTime * 1000 - offset) / beatDuration) % beats;
          beatDivs[prevBeatIndex].style.backgroundColor = '';
          beatDivs[currBeatIndex].style.backgroundColor = 'blue';
          prevBeatIndex = currBeatIndex;
        }
        timer = requestAnimationFrame(arguments.callee);
      });
    }

    isPlaying = true;
  }

  function stop() {
    cancelAnimationFrame(timer);
    isPlaying = false;
  }

  var beatSnapDivisorRange = document.getElementById('beatSnapDivisorRange');
  var beatSnapDivisorRangeOnChange;
  beatSnapDivisorRange.addEventListener('change', beatSnapDivisorRangeOnChange = function() {
    beatSnapDivisor = +this.value;
    document.getElementById('beatSnapDivisorText').innerHTML = '1/' + beatSnapDivisor;
    var continePlay = isPlaying;
    stop();
    resetBeats();
    if (continePlay) {
      play();
    }
  });
  beatSnapDivisorRangeOnChange.call({value: beatSnapDivisor});

  initBeatShowPanel();
  initTimingPanel();
  initMemterPanel();

  function initBeatShowPanel() {
    resetBeats();
  }

  function initTimingPanel() {
    var input = document.getElementById('bpm');
    input.value = bpm;
    input.addEventListener('change', function() {
      var continePlay = isPlaying;
      stop();
      bpm = +this.value;
      if (continePlay) {
        play();
      }
    });

    document.getElementById('offset').addEventListener('change', function() {
      offset = +this.value;
    });
  }

  function initMemterPanel() {
    var memterSelect = document.getElementById('memterSelect');

    for (var beats = 1; beats <= 16; beats++) {
      var memter = beats + '/' + 4;
      var opt = new Option();
      opt.text = memter;
      opt.value = beats;
      memterSelect.options.add(opt);
    }

    memterSelect.addEventListener('change', function() {
      var continePlay = isPlaying;
      stop();
      memterBeats = +this.value;
      resetBeats();
      if (continePlay) {
        play();
      }
    });

    memterSelect.value = memterBeats;
  }

  function resetBeats() {
    var div = document.getElementById('beatShowPanel');
    div.innerHTML = '';
    var beatDivSize = div.scrollHeight / beatSnapDivisor;
    var gap = 10;
    var beats = memterBeats * beatSnapDivisor;
    var centerLeft = (div.scrollWidth - beats * (beatDivSize + gap) - gap) / 2;
    for (var n = 0; n < beats; n++) {
      var beatDiv = document.createElement('div');
      beatDiv.style.position = 'absolute';
      beatDiv.style.left = centerLeft + (n * (beatDivSize + gap)) + 'px';
      beatDiv.style.width = beatDivSize + 'px';
      beatDiv.style.height = beatDivSize + 'px';
      beatDiv.style.border = '1px solid black';
      beatDiv.style.borderRadius = beatDivSize + 'px';
      div.appendChild(beatDiv);
    }
  }
});
