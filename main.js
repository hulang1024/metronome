

window.addEventListener('load', function() {
  var bpm = 60;
  var memterBeats = 4; // 节拍拍子数
  var memterValue = 4; // 拍子音符时值
  var timer;
  var isPlaying = false;
  
  function setBPM(b) {
    bpm = b;
  }
  
  function getBPM() { return bpm }
  
  function setMemter(beats, value) {
    memterBeats = beats;
    memterValue = value;
  }
  
  function getMemter() { return {beats: memterBeats, value: memterValue} }
  
  function playOrStop() {
    isPlaying ? stop() : play();
  }
  
  function play() {
    resetBeats();
    var beatDivs = document.getElementById('beatShowPanel').children;
    var beatDuration = 60 * 1000 / bpm / (memterValue / 4);
    var curBeatIndex = memterBeats - 1;
    var lastTime = new Date();
    timer = setInterval(function(){
      if (new Date() - lastTime >= beatDuration) {
        beatDivs[curBeatIndex % memterBeats].style.backgroundColor = '';
        curBeatIndex = ++curBeatIndex % memterBeats;
        beatDivs[curBeatIndex].style.backgroundColor = 'blue';
        lastTime = new Date();
      }
    }, 1);
    isPlaying = true;
  }
  
  function stop() {
    clearInterval(timer);
    isPlaying = false;
  }
  
  initBeatShowPanel();
  initBPMPanel();
  initMemterPanel();

  var playButton = document.getElementById('play');
  playButton.innerHTML = '开始';
  playButton.onclick = function() {
    playOrStop();
    playButton.innerHTML = !isPlaying ? '开始' : '停止';
  };

  function initBeatShowPanel() {
    resetBeats();
  }

  function initBPMPanel() {
    var input = document.getElementById('bpm');
    input.value = getBPM();
    input.addEventListener('change', function() {
      var b = isPlaying;
      stop();
      setBPM(this.value);
      if (b) {
        play();
      }
    });
  }

  function initMemterPanel() {
    var memterSelect = document.getElementById('memterSelect');
    
    var memters = [
      '1/4', '2/4', '3/4', '4/4',
      '5/4', '3/8', '6/8', '9/8',
      '12/8', '2/2', '3/2', '4/2'
    ];
    
    memters.forEach(function(memter) {
      var opt = new Option();
      opt.text = memter;
      opt.value = memter;
      memterSelect.options.add(opt);
    });
    
    memterSelect.addEventListener('change', function() {
      var memter = this.value;
      var m = memter.split('/');
      setMemter(+m[0], +m[1]);
      resetBeats();
    });
    
    var m = getMemter();
    memterSelect.value = m.beats + '/' + m.value;
  }
  
  function resetBeats() {
    var beats = getMemter().beats;
    
    var div = document.getElementById('beatShowPanel');
    div.innerHTML = '';
    var collWidth = div.scrollWidth;
    var beatDivWidth = 50;
    var gap = 6;
    var centerLeft = (collWidth - beats * (beatDivWidth + gap) - gap) / 2;
    for (var n = 0; n < beats; n++) {
      var beatDiv = document.createElement('div');
      beatDiv.style.position = 'absolute';
      beatDiv.style.left = centerLeft + (n * (beatDivWidth + gap)) + 'px';
      beatDiv.style.width = beatDivWidth + 'px';
      beatDiv.style.height = beatDivWidth + 'px';
      beatDiv.style.border = '1px solid black';
      beatDiv.style.borderRadius = beatDivWidth + 'px';
      div.appendChild(beatDiv);
    }
  }
});
