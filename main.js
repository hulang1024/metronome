window.addEventListener('load', function() {
  var currentTimeElem = document.getElementById('currentTime');
  var audio = document.getElementsByTagName('audio')[0];
  var loadAudioButton = document.getElementById('loadAudio');
  var audioUrlInput = document.getElementById('audioUrl');
  var beatShowPanel = document.getElementById('beatShowPanel');

  loadAudioButton.onclick = function() {
    audio.src = audioUrlInput.value;
  };

  audio.addEventListener('play', function() {
    play();
  });

  audio.addEventListener('pause', stop);
  audio.addEventListener('ended', stop);

  var offset = 0;
  var bpm = 60;
  var memterBeats = 4; // 节拍拍子数
  //var memterValue = 4; // 拍子时值
  var beatSnapDivisor = 1;
  var timer;
  var isPlaying = false;

  parseUrl();

  function playOrStop() {
    isPlaying ? stop() : play();
  }

  function play() {
    resetBeats();
    var beatDivs = Array.prototype.slice.call(document.getElementById('beatShowPanel').children, 0);
    var circle = document.getElementById('memterPanel').children[0];

    var beatDuration = 60 * 1000 / bpm;
    var currIndex = 0, prevIndex = 0;
    var beatCount = -1, snapBeatCount;
    var time, count;

    cancelAnimationFrame(timer);
    startAnimation();

    function startAnimation() {
      timer = requestAnimationFrame(function() {
        time = audio.currentTime * 1000;

        if (Math.round(time) >= offset) {
          count = Math.floor((time - offset) / (beatDuration / beatSnapDivisor));
          if (count != snapBeatCount) {
            snapBeatCount = count;
            currIndex = snapBeatCount % (memterBeats * beatSnapDivisor);
            beatDivs[prevIndex].style.backgroundColor = 'SkyBlue';
            beatDivs[currIndex].style.backgroundColor = 'DodgerBlue';
            prevIndex = currIndex;
          }

          count = Math.floor((time - offset) / beatDuration);
          if (count != beatCount) {
            beatCount = count;
            delay = time + 120;
            circle.style.backgroundColor = 'DodgerBlue';
          } else if (time >= delay) {
            circle.style.backgroundColor = '';
          }
        }

        currentTimeElem.innerHTML = Math.round(audio.currentTime * 1000);

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
  beatSnapDivisorRange.value = beatSnapDivisor;
  beatSnapDivisorRangeOnChange.call({value: beatSnapDivisor});


  document.getElementById('setCurrentTime').onclick = function() {
    document.getElementById('offset').value = Math.round(audio.currentTime * 1000);
  };

  document.getElementById('playbackRateRange').onchange = function(){
    audio.playbackRate = this.value / 100;
    document.getElementById('playbackRateText').innerHTML = (this.value + '%');
  };

  document.addEventListener('mousewheel', function(event) {
    var duration = (60 * 1000 / bpm / beatSnapDivisor / (beatSnapDivisor * 4));
    audio.currentTime = audio.currentTime + Math.sign(-event.deltaY) * (duration / 1000);
    currentTimeElem.innerHTML = Math.round(audio.currentTime * 1000);
  });

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

    var offsetInput = document.getElementById('offset');
    offsetInput.value = offset;
    offsetInput.addEventListener('change', function() {
      offset = +this.value;
    });
  }

  function initMemterPanel() {
    var memterSelect = document.getElementById('memterSelect');

    for (var beats = 1; beats <= 8; beats++) {
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
    beatShowPanel.innerHTML = '';
    var circleSize = beatShowPanel.scrollHeight / beatSnapDivisor;
    var gap = circleSize;
    var beats = memterBeats * beatSnapDivisor;
    var centerLeft = (beatShowPanel.scrollWidth - beats * (circleSize + gap) + gap) / 2;
    var centerTop = (beatShowPanel.scrollHeight - circleSize) / 2;

    for (var n = 0; n < beats; n++) {
      var div = document.createElement('beatShowPanel');
      div.style.position = 'absolute';
      div.style.left = centerLeft + (n * (circleSize + gap)) + 'px';
      div.style.top = centerTop + 'px';
      div.style.width = circleSize + 'px';
      div.style.height = circleSize + 'px';
      div.style.border = '1px solid SkyBlue';
      div.style.borderRadius = circleSize + 'px';
      div.style.backgroundColor = 'SkyBlue';
      beatShowPanel.appendChild(div);
    }
  }

  function parseUrl() {
    if (!location.search) {
      return;
    }
    var eqs = location.search.substr(1).split('&');
    for (var i in eqs) {
      var kvp = eqs[i].split('=');
      var value = kvp[1];
      switch (kvp[0].toLowerCase()) {
      case "beatsnapdivisor":
        beatSnapDivisor = +value;
        break;
      case "memterbeats":
        memterBeats = +value;
        break;
      case "offset":
        offset = +value;
        break;
      case "bpm":
        bpm = +value;
        break;
      case "url":
        audioUrlInput.value = decodeURI(value);
        loadAudioButton.click();
        break;
      }
    }
  }

});
