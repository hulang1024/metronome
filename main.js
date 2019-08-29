
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
  var beatSnapDivisor = 1;
  var timer;
  var isPlaying = false;

  parseUrl();
  
  var activeManager = new ActiveManager();

  function playOrStop() {
    isPlaying ? stop() : play();
  }

  function play() {
    resetBeats();
    var beatDivs = Array.prototype.slice.call(document.getElementById('beatShowPanel').children, 0);
    var barCountLabel = document.getElementById('barCount');
    var countCountLabel = document.getElementById('beatCount');
    
    var beatDuration = 60 * 1000 / bpm;
    var currIndex = 0, prevIndex = 0;
    var beatCount = -1, snapBeatCount;
    var time, count;

    cancelAnimationFrame(timer);
    startAnimation();
    
    activeManager.start();
    
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
            barCountLabel.innerHTML = (1 + Math.floor(beatCount / memterBeats));
            countCountLabel.innerHTML = (1 + (beatCount % memterBeats));
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
    activeManager.pause();
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
    console.log(this.value / 100)
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
      var memter = beats;
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
      var div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = centerLeft + (n * (circleSize + gap)) + 'px';
      div.style.top = centerTop + 'px';
      div.style.width = circleSize + 'px';
      div.style.height = circleSize + 'px';
      div.style.border = '1px solid SkyBlue';
      div.style.borderRadius = circleSize + 'px';
      div.style.backgroundColor = 'SkyBlue';
      div.style.boxShadow = 'rgba(0, 20, 40, 0.1) 0px 0px 8px 4px';
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

/* 1.在指定间隔时间内没有活动操作就表现‘睡眠’.
   2.活动操作时醒来  */
function ActiveManager() {
  var me = this;
  var timer = null;
  var isSleeping = true;
  var lastActiveTime = 0;
  var lastMousePageX = 0;
  var intervalTime = 2000;
  
  var panels = Array.prototype.slice.call(
    document.querySelectorAll('#beatSnapPanel, #memterPanel, #timingPanel, #playerPanel'), 0);
  var showPanels = Array.prototype.slice.call(
    document.querySelectorAll('#beatShowPanel, #beatCountPanel'), 0);
    
  document.addEventListener('mousemove', function(event) {
    if (new Date().getTime(), Math.abs(lastMousePageX - event.pageX) > 10) {
      lastActiveTime = +new Date;
      lastMousePageX = event.pageX;
      wakeup();
    }
  });
  
  this.start = function() {
    if (timer) return;
    timer = setInterval(function(){
      if ((+new Date - lastActiveTime) > intervalTime) {
        sleep();
      }
    }, intervalTime);
  }
  
  this.pause = function() {
    clearInterval(timer);
    timer = null;
  }
  
  function wakeup() {
    if (!isSleeping)
      return;
    isSleeping = false;
    
    $(showPanels).animate(
      {top: 0},
      'fast',
      function() {
        panels.forEach(function(panel) {
          panel.style.display = 'block';
        });
      });
  }
  
  function sleep() {
    if (isSleeping)
      return;
    isSleeping = true;
    
    panels.forEach(function(panel) {
      panel.style.display = 'none';
    });
    $(showPanels).animate({
      top: 100,
    }, 'slow');
  }
  
}
