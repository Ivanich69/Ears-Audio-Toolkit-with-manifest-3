/* MV3 offscreen bridge */
(function(){
  if (typeof chrome === 'undefined' || !chrome.runtime) { return; }
  function bridge(type, payload, cb) {
    try {
      chrome.runtime.sendMessage({__earsBridge: true, type: type, payload: payload}, function(response) {
        if (cb) cb(response || {});
      });
    } catch (err) {
      console.error(err);
      if (cb) cb({ error: err && err.message });
    }
  }

  var tabCaptureListeners = [];
  var storageListeners = [];

  chrome.runtime.onMessage.addListener(function(msg) {
    if (!msg || typeof msg !== 'object') return;
    if (msg.__earsBridgeEvent === 'tabCapture.onStatusChanged') {
      tabCaptureListeners.forEach(function(fn) {
        try { fn(msg.payload); } catch (e) { console.error(e); }
      });
    }
    if (msg.__earsBridgeEvent === 'storage.onChanged') {
      storageListeners.forEach(function(fn) {
        try { fn(msg.payload, msg.area || 'sync'); } catch (e) { console.error(e); }
      });
    }
  });

  chrome.storage = chrome.storage || {};
  if (!chrome.storage.sync) {
    chrome.storage.sync = {
      get: function(keys, cb) { bridge('storage.sync.get', { keys: keys }, function(res) { if (cb) cb(res.data || {}); }); },
      set: function(items, cb) { bridge('storage.sync.set', { items: items }, function() { if (cb) cb(); }); },
      remove: function(keys, cb) { bridge('storage.sync.remove', { keys: keys }, function() { if (cb) cb(); }); }
    };
  }
  if (!chrome.storage.onChanged) {
    chrome.storage.onChanged = { addListener: function(fn) { storageListeners.push(fn); } };
  }

  chrome.tabs = chrome.tabs || {};
  if (!chrome.tabs.query) {
    chrome.tabs.query = function(queryInfo, cb) { bridge('tabs.query', { queryInfo: queryInfo }, function(res) { if (cb) cb(res.data || []); }); };
  }
  if (!chrome.tabs.getSelected) {
    chrome.tabs.getSelected = function(windowId, cb) { bridge('tabs.getSelected', { windowId: windowId }, function(res) { if (cb) cb(res.data || null); }); };
  }

  chrome.windows = chrome.windows || {};
  if (typeof chrome.windows.WINDOW_ID_CURRENT === 'undefined') {
    chrome.windows.WINDOW_ID_CURRENT = -2;
  }
  if (!chrome.windows.get) {
    chrome.windows.get = function(windowId, getInfo, cb) { bridge('windows.get', { windowId: windowId, getInfo: getInfo }, function(res) { if (cb) cb(res.data || null); }); };
  }
  if (!chrome.windows.update) {
    chrome.windows.update = function(windowId, updateInfo, cb) { bridge('windows.update', { windowId: windowId, updateInfo: updateInfo }, function(res) { if (cb) cb(res.data || null); }); };
  }

  chrome.tabCapture = chrome.tabCapture || {};
  if (!chrome.tabCapture.capture) {
    chrome.tabCapture.capture = function(options, cb) {
      bridge('tabCapture.getMediaStreamId', { options: options || {} }, async function(res) {
        try {
          var streamId = res && res.data && res.data.streamId;
          if (!streamId) { if (cb) cb(null); return; }
          var audio = (options && options.audio === false) ? false : {
            mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: streamId }
          };
          var video = (options && options.video) ? {
            mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: streamId }
          } : false;
          var stream = await navigator.mediaDevices.getUserMedia({ audio: audio, video: video });
          if (cb) cb(stream);
        } catch (err) {
          console.error(err);
          if (cb) cb(null);
        }
      });
    };
  }
  if (!chrome.tabCapture.onStatusChanged) {
    chrome.tabCapture.onStatusChanged = { addListener: function(fn) { tabCaptureListeners.push(fn); } };
  }
})();
// MV3/Brave fallback: offscreen runtime may lack getManifest/id
if (typeof chrome !== 'undefined' && chrome.runtime) {
  if (typeof chrome.runtime.getManifest !== 'function') {
    chrome.runtime.getManifest = function() { return { version: '0.0.0' }; };
  }
  if (!chrome.runtime.id) {
    try { chrome.runtime.id = location.host; } catch (e) {}
  }
}
var _gaq={push:function(){}};function scope(){var J=chrome.runtime.getManifest().version;var e="11/22/2017";_gaq.push(["_setAccount","UA-64913318-2"]);_gaq.push(["_trackPageview"]);_gaq.push(["_trackEvent","backgroundOpen",J]);var U="VERSION";var i="PRESETS";var a="PRESETS.";var s={get:function(e,t){t({})},set:function(e,t){t()},remove:function(e,t){t()}};var W=null;var t="ears_pro";var n="ears_pro_1";var r="ACTIVE";localStorage[" "]=" ";s=chrome.storage.sync;W=null;var o=false;function D(e){if(o){console.log(e)}}/* GA removed for MV3 CSP */var M=null;var B=null;var G=null;var Q=null;var L=null;var V=[];var z=[20,40,80,160,320,640,1280,2560,5120,10240,20480];var H=[.7071,.7071,.7071,.7071,.7071,.7071,.7071,.7071,.7071,.7071,.7071];var K=11;var X=function(){};var Y={};var Z=false;var $;function l(e){return a+e}function ee(n){if(!localStorage[i]){localStorage[i]=JSON.stringify({})}var r=JSON.parse(localStorage[i]);if(r==null||typeof r!="object"){r={}}s.get(null,function(e){if(chrome.runtime.lastError){console.log(chrome.runtime.lastError)}for(var t in e){if(t.startsWith(a)){r[t.slice(a.length)]=e[t]}}n(r)})}function te(e,t,n){var r=JSON.parse(localStorage[i]);if(r==null||typeof r!="object"){r={}}var a=Object.keys(r).length;r[e]=t;var o=Object.keys(r).length;if(W&&Object.keys(r)>W&&o>=a){n();return}localStorage[i]=JSON.stringify(r);syncPresets={};syncPresets[l(e)]=t;s.set(syncPresets,function(){if(chrome.runtime.lastError){console.log(chrome.runtime.lastError)}n()})}function ne(e,t){_gaq.push(["_trackEvent","deletePreset",e.preset]);var n=JSON.parse(localStorage[i]);if(n==null||typeof n!="object"){n={}}delete n[e.preset];localStorage[i]=JSON.stringify(n);s.remove(l(e.preset),t)}chrome.storage.onChanged.addListener(function(e,t){});function c(){if(Z){M.close();M=null;Z=false;chrome.runtime.onMessage.removeListener($);var e=Object.keys(Y);for(var t=0;t<e.length;t++){var n=e[t];Y[n].stream.getTracks()[0].stop();delete Y[n]}}}function re(){return new AudioContext({latencyHint:"playback"})}function ae(){if(Z){M.close();M=null;Z=false;Q=null;L=null;var e=Object.values(Y);Y={};for(var t=0;t<e.length;t++){var n=e[t].audioSource;n.disconnect(B)}u(e)}}function u(e){var t=null;if(Z){return}Z=true;M=re();M.suspend();console.log("starting sampleRate: "+M.sampleRate);var n=false;X=function(){if(n){return}var e=re();var t=M.sampleRate&&e.sampleRate&&M.sampleRate!=e.sampleRate;if(t){console.log(e);console.log(M);n=true}e.close();if(t){console.log("sampleRate changed... reloading AudioContext");ae()}};B=M.createGain();B.gain.value=1;G=M.createGain();G.gain.value=m();if(t){var r=M.createScriptProcessor(t);r.onaudioprocess=function(e){var t=e.inputBuffer;var n=e.outputBuffer;for(var r=0;r<n.numberOfChannels;r++){n.copyToChannel(t.getChannelData(r),r)}};G.connect(r);r.connect(M.destination)}else{G.connect(M.destination)}if(!localStorage[U]){localStorage[U]="0.0.0"}if(localStorage[" "]==" "){if(localStorage["sync"]!=" "){ee(function(e){var t=Object.keys(e);for(var n=0;n<t.length;n++){var r=t[n];te(r,e[r],function(){})}});localStorage["sync"]=" "}}localStorage[U]=J;V=[];var a={};function o(){var e=G;var t=false;for(var n=V.length-1;n>=0;n--){if(V[n].gain.value!=0){if(!a[n]){t=true}if(t){D(n+" -> "+e.idx);V[n].disconnect();V[n].connect(e)}if(a[n]){t=false}a[n]=true;e=V[n];e.idx=n}else{if(a[n]){a[n]=false;t=true}}}if(t){D("preGain -> "+e.idx);B.disconnect();B.connect(e)}}for(var i=0;i<K;i++){var s=M.createBiquadFilter();if(i==0){s.type="lowshelf"}else if(i==K-1){s.type="highshelf"}else{s.type="peaking"}var l="filter"+i;var c=localStorage[l];if(c){c=JSON.parse(c);s.frequency.value=c.f;s.gain.value=c.g;s.Q.value=c.q}else{s.frequency.value=z[i];s.gain.value=0;s.Q.value=H[i]}V.push(s);localStorage[l]=JSON.stringify({f:s.frequency.value,g:s.gain.value,q:s.Q.value})}B.connect(G);function u(e){f=V[e.index];f.gain.value=v(e.gain);f.frequency.value=p(e.frequency);f.Q.value=d(e.q);var t="filter"+e.index;localStorage[t]=JSON.stringify({f:f.frequency.value,g:f.gain.value,q:f.Q.value});o()}function g(e){if(e>10){return 10}if(e<.00316){return.00316}return e}function v(e){if(e<-30){return-30}if(e>30){return 30}return e}function p(e){if(e<5){return 5}if(e>2e4){return 2e4}return e}function d(e){if(e<.2){e=.2}if(e>11){e=11}return e}function y(e){var t=g(e.gain);G.gain.value=g(t);h(t)}function m(){if(!localStorage["GAIN"]){localStorage["GAIN"]=JSON.stringify(1)}return JSON.parse(localStorage["GAIN"])}function h(e){localStorage["GAIN"]=JSON.stringify(e)}function S(e){_gaq.push(["_trackEvent","preset","save"]);var t=[];var n=[];var r=[];for(var a=0;a<V.length;a++){var o=V[a];t.push(o.frequency.value);n.push(o.gain.value);r.push(o.Q.value)}var i={frequencies:t,gains:n,qs:r};te(e.preset,i,E)}function q(i){ee(function(e){var t=[];var n=[];var r=[];if(i.preset=="bassBoost"){for(var a=0;a<z.length;a++){t.push(z[a]);n.push(0);r.push(H[a])}t[0]=340;n[0]=5}else{var o=e[i.preset];if(o){t=o.frequencies;n=o.gains;r=o.qs}else{return}}_gaq.push(["_trackEvent","preset","set"]);for(var a=0;a<t.length;a++){u({index:a,frequency:t[a],gain:n[a],q:r[a]})}E()})}function b(t){N(function(e){T(t,e,true);o();E()})}function _(){var e={type:"sendWorkspaceStatus",eqFilters:[],streams:[],gain:G.gain.value};for(var t=0;t<V.length;t++){var n=V[t];e.eqFilters.push({frequency:n.frequency.value,gain:n.gain.value,type:n.type,q:n.Q.value})}for(var r in Y){var a=Y[r].tab;e.streams.push(Y[r].tab)}chrome.runtime.sendMessage(e)}function k(){chrome.runtime.sendMessage({type:"sendSampleRate",Fs:M.sampleRate})}function O(){ee(function(e){chrome.runtime.sendMessage({type:"sendPresets",presets:e})})}function E(){w();_();k();O()}function N(t){chrome.tabs.query({currentWindow:true,active:true},function(e){if(e.length!=1){console.error("num active tabs != 1")}else{t(e[0])}})}function w(){N(function(e){chrome.runtime.sendMessage({type:"sendCurrentTabStatus",streaming:e.id in Y})})}function T(e,t,n){if(!e){console.log("null stream, aborting");return}if(n){_gaq.push(["_trackEvent","tabStream","added"])}if(Object.keys(Y).length==0){M.resume()}if(t.id in Y){console.log("had stream, stopping");_gaq.push(["_trackEvent","tabStream","hadDuplicate"]);Y[t.id].stream.getTracks()[0].stop();delete Y[t.id]}var r=M.createMediaStreamSource(e);r.connect(B);Y[t.id]={stream:e,tab:t,audioSource:r}}var R={};var C={};function x(t){console.log(t);chrome.windows.get(chrome.windows.WINDOW_ID_CURRENT,null,function(e){if(e.state!="fullscreen"){C[e.id]=e.state}if(t.fullscreen){chrome.windows.update(chrome.windows.WINDOW_ID_CURRENT,{state:"fullscreen"},null)}else{chrome.windows.update(chrome.windows.WINDOW_ID_CURRENT,{state:C[e.id]||"fullscreen"},null)}});if(t.status=="active"){R[t.tabId]=t}else if(t.status=="stopped"||t.status=="error"){delete R[t.tabId]}}function j(){_gaq.push(["_trackEvent","currentTab","removed"]);N(I)}function I(e){console.log("disconnectedTab id "+e.id);if(e.id in Y){_gaq.push(["_trackEvent","tabStream","removed"]);var t=Y[e.id].stream;t.getTracks()[0].stop();delete Y[e.id]}if(Object.keys(Y).length==0){M.suspend()}E()}function P(){for(var e=0;e<K;e++){u({index:e,gain:0,frequency:z[e],q:H[e]})}y({gain:1});_gaq.push(["_trackEvent","filterUpdated","resetAll"]);E()}function A(e){u({index:e.index,gain:0,frequency:z[e.index],q:H[e.index]});_gaq.push(["_trackEvent","filterUpdated","reset"])}function F(){function t(e,t){var n=document.createElement("a");var r=new Blob([t],{type:"text/plain;charset=UTF-8"});n.href=window.URL.createObjectURL(r);n.download=e;n.style.display="none";document.body.appendChild(n);n.click();delete n}ee(function(e){t("EarsAudioToolkitPresets.json",JSON.stringify(e,null,2))})}$=function(e,t,n){if(e.type=="eqTab"){if(e.on){chrome.tabs.getSelected(null,function(e){if(e.url.startsWith("chrome-extension://"+chrome.runtime.id)){return}chrome.tabCapture.capture({audio:true,video:false,targetTabId:e.id},b)})}else{j()}}if(e.type=="getCurrentTabStatus"){w()}if(e.type=="getWorkspaceStatus"){_()}if(e.type=="getFullRefresh"){E()}if(e.type=="onPopupOpen"){X()}if(e.type=="modifyFilter"){u(e)}if(e.type=="modifyGain"){y(e)}if(e.type=="gainUpdated"){_gaq.push(["_trackEvent","gainUpdated","gain"])}if(e.type=="filterUpdated"){_gaq.push(["_trackEvent","filterUpdated",e.filterType])}if(e.type=="disconnectTab"){I(e.tab)}if(e.type=="resetFilters"){P()}if(e.type=="resetFilter"){A(e)}if(e.type=="preset"){q(e)}if(e.type=="savePreset"){S(e)}if(e.type=="importPresets"){var r=e.presets;var a=Object.keys(r);for(var o=0;o<a.length;o++){te(a[o],r[a[o]],E)}}if(e.type=="deletePreset"){ne(e,E)}if(e.type=="exportPresets"){F()}if(e.type=="getFFT"){if(W){chrome.runtime.sendMessage({type:"fft",fft:[]});return}if(Q){L=performance.now();var i=new Float32Array(Q.frequencyBinCount);Q.getFloatFrequencyData(i);n({type:"fft",fft:Array.from(i)})}else{Q=M.createAnalyser();Q.fftSize=4096*2;Q.smoothingTimeConstant=.5;console.log("created analyser");console.log(Q);G.connect(Q);n({type:"fft",fft:[]})}}};if(e){for(var i=0;i<e.length;i++){T(e[i].stream,e[i].tab,false)}o();E()}else{chrome.runtime.onMessage.addListener($);chrome.tabCapture.onStatusChanged.addListener(x)}}u();setInterval(function(){if(L){if(performance.now()-L>1e3){if(G&&Q){G.disconnect(Q);Q=null;console.log("disconnected analyser")}}}},1e3)}scope();
