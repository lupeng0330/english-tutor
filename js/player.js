// ============================================================
// player.js · 语音播放（浏览器 TTS + 有道双引擎 + 长文本分段）
// ------------------------------------------------------------
// 职责：
//   - speakBrowser(text, callbacks)：纯浏览器 TTS 朗读长文本（课文）
//   - speak(text, callbacks)：有道/浏览器双引擎，自动按长度/可用性降级
//   - stopSpeak()：立刻停止所有播放
// 依赖：
//   - 全局 DOM / SpeechSynthesis API
//   - 不依赖 state / textbook（纯 TTS 工具）
// 顶级变量（被 app.js 中的 playAudioText / speakSpellWord 共享读写）：
//   - _currentAudio   （当前 HTMLAudioElement）
//   - _currentCallbacks / _hasEmittedStart / _playQueue / _playingQueue
// 导出（以全局函数形式）：
//   - speakBrowser, speak, stopSpeak, splitText
//   - playYoudao, playYoudaoWith, playChain, fallbackWebSpeech
// ============================================================

// 纯浏览器 TTS 朗读（用于课文等长文本，无跨域问题）
// 注：Chrome/Edge/大多数移动浏览器的 speechSynthesis 对"单个长 utterance"有丢字 bug，
// 必须把长文本拆成多个短 utterance 依次入队，才能完整朗读。
function speakBrowser(text, callbacks) {
  callbacks = callbacks || {};
  if (!('speechSynthesis' in window)) {
    if (callbacks.onError) callbacks.onError('当前浏览器不支持语音朗读');
    return;
  }

  const ua = (navigator.userAgent || '').toLowerCase();
  const isHuawei = /huaweibrowser|hbpc/i.test(ua);

  // 🔧 预处理：把时间数字转成英文单词（手机 Chrome TTS 对 "7:00" 朗读不稳定）
  // 例：7:00 → seven o'clock；7:30 → seven thirty
  const numberWord = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];
  const normalized = text.replace(/(\d{1,2}):(\d{2})/g, (_, h, m) => {
    const hh = parseInt(h, 10);
    const mm = parseInt(m, 10);
    const hword = (hh >= 0 && hh <= 12) ? numberWord[hh] : h;
    if (mm === 0)  return hword + " o'clock";
    if (mm === 15) return 'quarter past ' + hword;
    if (mm === 30) return 'half past ' + hword;
    if (mm === 45) return 'quarter to ' + hword;
    if (mm < 10)   return hword + ' oh ' + (numberWord[mm] || mm);
    if (mm < 21)   return hword + ' ' + (numberWord[mm] || mm);
    // 21-59
    return hword + ' ' + m;
  });

  // 把课文按标点切成若干短句
  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s);
  if (sentences.length === 0) sentences.push(normalized);

  // 再把超长句子按逗号切
  const utteranceTexts = [];
  for (const sent of sentences) {
    if (sent.length <= 100) {
      utteranceTexts.push(sent);
    } else {
      const subs = sent.split(/,\s*/).map(s => s.trim()).filter(s => s);
      for (const sub of subs) utteranceTexts.push(sub);
    }
  }

  const doSpeak = () => {
    try {
      window.speechSynthesis.cancel();

      // 挑选英语语音（按音质优先级）
      const voices = window.speechSynthesis.getVoices();
      let chosenVoice = null;
      if (voices && voices.length) {
        const enUS = voices.filter(v => /en[-_]?US/i.test(v.lang));
        const en   = voices.filter(v => /^en/i.test(v.lang));
        const candidates = enUS.length ? enUS : (en.length ? en : voices);

        // 按音质排序优先级（高 → 低）
        const priority = [
          /Google.*US.*English/i,       // Chrome: Google US English (最自然)
          /Microsoft.*Aria.*Natural/i,  // Edge: 神经网络 TTS
          /Microsoft.*Jenny.*Natural/i,
          /Microsoft.*Guy.*Natural/i,
          /Samantha/i,                  // macOS/iOS 默认
          /Ava/i,                       // macOS 高质量
          /Allison/i,
          /Karen/i,
          /Microsoft.*Aria/i,
          /Microsoft.*Zira/i,           // Windows 默认（音质一般但稳定）
          /female/i,
          /en[-_]?US/i                  // 最后兜底任意 en-US
        ];

        for (const pattern of priority) {
          const match = candidates.find(v => pattern.test(v.name));
          if (match) { chosenVoice = match; break; }
        }
        if (!chosenVoice) chosenVoice = candidates[0];
        console.log('[课文 TTS] 选用语音:', chosenVoice && (chosenVoice.name + ' | ' + chosenVoice.lang));
      }

      let started = false;
      let hasErrored = false;
      let hasEnded = false;

      // keepAlive：防止 Chrome 长时间朗读时被浏览器暂停
      const keepAliveTimer = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          try {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          } catch(e) {}
        } else {
          clearInterval(keepAliveTimer);
        }
      }, 10000);

      const finish = (errMsg) => {
        clearInterval(keepAliveTimer);
        if (hasEnded || hasErrored) return;
        if (errMsg) {
          hasErrored = true;
          if (callbacks.onError) callbacks.onError(errMsg);
        } else {
          hasEnded = true;
          if (callbacks.onEnd) callbacks.onEnd();
        }
      };

      // 链式手动触发：一段完全结束后才 speak 下一段（解决手机 Chrome 队列重叠 bug）
      let idx = 0;
      const speakOne = () => {
        if (hasErrored || hasEnded) return;
        if (idx >= utteranceTexts.length) {
          finish();
          return;
        }
        const i = idx++;
        const t = utteranceTexts[i];
        const u = new SpeechSynthesisUtterance(t);
        u.lang = 'en-US';
        u.rate = 0.85;
        u.pitch = 1.0;
        u.volume = 1.0;
        if (chosenVoice) u.voice = chosenVoice;

        u.onstart = () => {
          if (!started) {
            started = true;
            if (callbacks.onStart) callbacks.onStart();
          }
        };
        u.onend = () => {
          // 关键：等 80ms 让手机 Chrome 真正把 speaking 置 false，再启动下一句
          setTimeout(speakOne, 80);
        };
        u.onerror = (e) => {
          console.error('[课文 TTS] utterance #' + i + ' error:', e && e.error);
          // 单句出错不终止整体，继续下一句
          setTimeout(speakOne, 80);
        };

        try {
          window.speechSynthesis.speak(u);
        } catch(e) {
          console.error('[课文 TTS] speak() 异常:', e);
          setTimeout(speakOne, 80);
        }
      };

      speakOne();

      // 4 秒兜底：如果第一段都没开始播
      setTimeout(() => {
        if (!started) {
          clearInterval(keepAliveTimer);
          try { window.speechSynthesis.cancel(); } catch(e){}
          if (!hasErrored) {
            hasErrored = true;
            if (callbacks.onError) callbacks.onError(
              isHuawei ? '华为浏览器不支持此功能，请用 Chrome 或微信打开' : '朗读启动超时，请重试'
            );
          }
        }
      }, 4000);
    } catch(e) {
      console.error('[课文 TTS] 异常:', e);
      if (callbacks.onError) callbacks.onError('朗读出错');
    }
  };

  // 安卓浏览器 voices 是异步加载的
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    doSpeak();
  } else {
    let triggered = false;
    const onReady = () => {
      if (triggered) return;
      triggered = true;
      try { window.speechSynthesis.onvoiceschanged = null; } catch(e){}
      doSpeak();
    };
    try { window.speechSynthesis.onvoiceschanged = onReady; } catch(e){}
    setTimeout(onReady, 1500);
  }
}

// ==================== 语音播放：双引擎 + 长文本分段 ====================
// 有道API对文本长度有限制（约200字符），所以长文本要分段

let _currentAudio = null;
let _playQueue = [];    // 待播放的片段队列
let _playingQueue = false;
let _currentCallbacks = null;  // 当前播放的回调（onStart/onEnd/onError）
let _hasEmittedStart = false;

function stopSpeak() {
  if (_currentAudio) {
    try { _currentAudio.pause(); _currentAudio.src = ''; } catch(e){}
    _currentAudio = null;
  }
  // 清理预加载队列里剩余的 Audio 对象
  if (Array.isArray(_playQueue)) {
    for (const item of _playQueue) {
      if (item && typeof item.pause === 'function') {
        try { item.pause(); item.src = ''; } catch(e){}
      }
    }
  }
  _playQueue = [];
  _playingQueue = false;
  _currentCallbacks = null;
  _hasEmittedStart = false;
  try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch(e){}
  // 多 cancel 几次增加清空队列概率（某些手机浏览器 cancel 只清当前一个）
  try { if ('speechSynthesis' in window) { setTimeout(() => window.speechSynthesis.cancel(), 50); } } catch(e){}
}

// 把长文本按"短语"切分（每段 <= SEG_MAX 字符，按空格切词组合）
// 重要：有道 API 对长 URL/复杂文本有反爬拦截，经测试 "hello" 能响 "Look at my bag..." 不响
// 所以这里把每段严格压到 15 字符以内，每段只包含 1-3 个单词，URL 形态和单个单词几乎一致
function splitText(text) {
  const SEG_MAX = 15;
  // 先按句末标点分句
  const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s);
  const segs = [];

  for (const sent of sentences) {
    // 再按逗号/分号切短语
    const phrases = sent.split(/[,;]\s*/).map(p => p.trim()).filter(p => p);
    for (const phrase of phrases) {
      if (phrase.length <= SEG_MAX) {
        segs.push(phrase);
      } else {
        // 还是太长，按空格切词并累积到 SEG_MAX
        const words = phrase.split(/\s+/).filter(w => w);
        let buf = '';
        for (const w of words) {
          const next = buf ? buf + ' ' + w : w;
          if (next.length > SEG_MAX && buf) {
            segs.push(buf);
            buf = w;
          } else {
            buf = next;
          }
        }
        if (buf) segs.push(buf);
      }
    }
  }
  return segs.length ? segs : [text];
}

function speak(text, callbacks) {
  if (!text) return;
  stopSpeak();
  _currentCallbacks = callbacks || null;
  _hasEmittedStart = false;

  const segs = splitText(text);

  // 单个短片段（通常是单词 / 短词组）：直接走单次请求路径
  if (segs.length === 1 && segs[0].length <= 15) {
    playYoudao(segs[0],
      () => fallbackWebSpeech(segs[0], _currentCallbacks),
      () => { if (_currentCallbacks && _currentCallbacks.onEnd) _currentCallbacks.onEnd(); }
    );
    return;
  }

  // 多段：串行播放，每一段都在前一段 onended 的回调里紧接着 play
  // 这是 Android/华为浏览器接受的合法链式播放，不会触发"非用户手势"拦截
  playChain(segs, 0);
}

function playChain(segs, idx, preloadedAudio) {
  if (idx >= segs.length) {
    if (_currentCallbacks && _currentCallbacks.onEnd) _currentCallbacks.onEnd();
    return;
  }
  const seg = segs[idx];

  // 同步预加载下一段（在当前 audio 事件栈里，避免 Android 自动播放策略拦截）
  let nextAudio = null;
  if (idx + 1 < segs.length) {
    const nextSeg = segs[idx + 1];
    const nextUrl = 'https://dict.youdao.com/dictvoice?audio=' + encodeURIComponent(nextSeg) + '&type=1';
    nextAudio = new Audio(nextUrl);
    nextAudio.preload = 'auto';
    try { nextAudio.load(); } catch(e) {}
  }

  // 如果有预加载好的 audio，直接用；否则新建
  playYoudaoWith(seg, preloadedAudio,
    // onFail
    () => {
      if (idx === 0) {
        fallbackWebSpeech(segs.join(' '), _currentCallbacks);
      } else {
        console.warn('[有道-链] 跳过失败段 #' + idx);
        // 跳过失败段，用预加载的下一段继续
        setTimeout(() => playChain(segs, idx + 1, nextAudio), 150);
      }
    },
    // onEnd: 150ms 后播下一段（给浏览器缓冲时间）
    () => {
      setTimeout(() => playChain(segs, idx + 1, nextAudio), 150);
    }
  );
}

// playYoudao 的变体：支持传入已预加载的 Audio 对象
function playYoudaoWith(text, existingAudio, onFail, onEnd) {
  let audio;
  if (existingAudio) {
    audio = existingAudio;
  } else {
    const url = 'https://dict.youdao.com/dictvoice?audio=' + encodeURIComponent(text) + '&type=1';
    audio = new Audio(url);
  }
  _currentAudio = audio;

  let failed = false;
  const handleFail = () => {
    if (failed) return;
    failed = true;
    _currentAudio = null;
    console.warn('[有道] 播放失败，文本:', text.substring(0, 40));
    if (onFail) onFail();
  };

  audio.onerror = handleFail;
  audio.onplaying = () => {
    if (!_hasEmittedStart && _currentCallbacks && _currentCallbacks.onStart) {
      _hasEmittedStart = true;
      _currentCallbacks.onStart();
    }
  };
  audio.onended = () => {
    _currentAudio = null;
    if (onEnd) onEnd();
  };

  audio.play().catch(handleFail);

  // 5秒还没开始播就判定失败
  setTimeout(() => {
    if (_currentAudio === audio && audio.paused && audio.currentTime === 0) {
      handleFail();
    }
  }, 5000);
}

function playYoudao(text, onFail, onEnd) {
  const url = 'https://dict.youdao.com/dictvoice?audio=' + encodeURIComponent(text) + '&type=1';
  const audio = new Audio(url);
  _currentAudio = audio;

  let failed = false;
  const handleFail = () => {
    if (failed) return;
    failed = true;
    _currentAudio = null;
    console.warn('[有道] 播放失败，文本:', text.substring(0, 40));
    if (onFail) onFail();
  };

  audio.onerror = handleFail;
  audio.onplaying = () => {
    if (!_hasEmittedStart && _currentCallbacks && _currentCallbacks.onStart) {
      _hasEmittedStart = true;
      _currentCallbacks.onStart();
    }
  };
  audio.onended = () => {
    _currentAudio = null;
    if (onEnd) onEnd();
  };

  audio.play().catch(handleFail);

  // 5秒还没开始播就判定失败
  setTimeout(() => {
    if (_currentAudio === audio && audio.paused && audio.currentTime === 0) {
      handleFail();
    }
  }, 5000);
}

function fallbackWebSpeech(text, callbacks) {
  callbacks = callbacks || _currentCallbacks;

  // 检测是否华为浏览器（针对性提示）
  const ua = (navigator.userAgent || '').toLowerCase();
  const isHuaweiBrowser = /huaweibrowser|hbpc|version\/[\d.]+ .*huawei/i.test(navigator.userAgent || '');
  const hintMsg = isHuaweiBrowser
    ? '华为浏览器不支持此功能，请复制链接用 Chrome 或微信浏览器打开'
    : '语音加载失败，建议换 Chrome/微信浏览器';

  if (!('speechSynthesis' in window)) {
    console.warn('[浏览器TTS] 不支持 speechSynthesis');
    if (callbacks && callbacks.onError) callbacks.onError(hintMsg);
    return;
  }

  const doSpeak = () => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(v => /en[-_]?US/i.test(v.lang)) ||
                      voices.find(v => /^en/i.test(v.lang));
      if (enVoice) u.voice = enVoice;
      u.onstart = () => {
        if (!_hasEmittedStart && callbacks && callbacks.onStart) {
          _hasEmittedStart = true;
          callbacks.onStart();
        }
      };
      u.onend = () => { if (callbacks && callbacks.onEnd) callbacks.onEnd(); };
      u.onerror = (e) => {
        console.error('[浏览器TTS] utterance error:', e);
        if (callbacks && callbacks.onError) callbacks.onError(hintMsg);
      };
      window.speechSynthesis.speak(u);

      // 华为浏览器兜底：2秒没触发 onstart 就认为失败
      setTimeout(() => {
        if (!_hasEmittedStart && callbacks && callbacks.onError) {
          callbacks.onError(hintMsg);
        }
      }, 2500);
    } catch(e) {
      console.error('[浏览器TTS] 失败:', e);
      if (callbacks && callbacks.onError) callbacks.onError(hintMsg);
    }
  };

  // 华为/部分安卓浏览器 voices 是异步加载的，首次调用 getVoices() 可能为空
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    doSpeak();
  } else {
    // 等 voices 加载完成再播放
    let triggered = false;
    const onReady = () => {
      if (triggered) return;
      triggered = true;
      window.speechSynthesis.onvoiceschanged = null;
      doSpeak();
    };
    window.speechSynthesis.onvoiceschanged = onReady;
    // 1秒兜底，即使没有 voices 也强制尝试（某些浏览器根本不触发 voiceschanged）
    setTimeout(onReady, 1000);
  }
}
