const $ = id => document.getElementById(id);
let token = null;
function log(s){const el=document.createElement('p');el.className='entry';el.textContent=new Date().toLocaleTimeString()+'  '+s;$('logs').prepend(el);while($('logs').children.length>8)$('logs').lastChild.remove()}
function status(v){$('server-status').textContent=v.running?'Running':'Stopped';$('server-dot').classList.toggle('on',v.running);$('connections').textContent=`${v.connections||0} connected`;$('conn-dot').classList.toggle('on',(v.connections||0)>0)}
$('start').onclick=async()=>{try{const r=await window.moveCursor.start();token=r.token||token;$('pairing').textContent=token||'Server starting…';status(r);log('Server start requested.')}catch(e){log('Could not start server: '+e.message)}};
$('stop').onclick=async()=>{await window.moveCursor.stop();token=null;status({running:false,connections:0})};
$('restart').onclick=async()=>{try{const r=await window.moveCursor.restart();token=r.token;$('pairing').textContent=token;status(r);log('Server restarted.')}catch(e){log('Restart failed: '+e.message)}};
$('copy').onclick=async()=>{if(token)await navigator.clipboard.writeText(token)};
window.moveCursor.onStatus(status);window.moveCursor.onLog(log);window.moveCursor.onError(e=>log('Server error: '+e));window.moveCursor.onEngine(v=>{$('engine-status').textContent=v?'Moving':'Idle';$('engine-dot').classList.toggle('on',v)});
