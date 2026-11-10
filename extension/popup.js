const $=id=>document.getElementById(id);let tabId;
chrome.tabs.query({active:true,currentWindow:true},tabs=>{tabId=tabs[0]?.id;refresh()});
function refresh(){chrome.runtime.sendMessage({kind:'getState'},s=>{if(chrome.runtime.lastError)return;const c=$('connection');c.textContent=s?.connected?'Connected to MoveCursor Desktop.':s?.connecting?'Connecting to MoveCursor Desktop…':'MoveCursor Desktop is not running. Open MoveCursor Desktop and press START.';c.classList.toggle('on',!!s?.connected)})}
const settings=()=>({min:Math.max(100,+$('min').value||400),max:Math.max(150,+$('max').value||1800),pmin:Math.max(0,+$('pmin').value||100),pmax:Math.max(0,+$('pmax').value||600),size:Math.max(10,Math.min(48,+$('size').value||18)),clicks:$('clicks').checked,clickMs:800});
function command(type){chrome.runtime.sendMessage({kind:'command',type,tabId,settings:settings()})}
$('draw').onclick=()=>command('DRAW_BOX');$('start').onclick=()=>command('START_ENGINE');$('stop').onclick=()=>command('STOP_ENGINE');$('clear').onclick=()=>command('CLEAR_SELECTION');
$('pairButton').onclick=()=>{const token=$('token').value.trim();if(token)chrome.runtime.sendMessage({kind:'setToken',token},()=>{refresh();$('token').value='';$('connection').textContent='Pairing code saved. Connecting…'})};
setInterval(refresh,1000);
