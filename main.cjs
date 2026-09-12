const { app, BrowserWindow, Menu, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const smoke = process.argv.find(a => a.startsWith('--smoke-output='));
app.setPath('userData', path.join(app.getPath('appData'), 'Outbound Atlas'));
if (smoke) app.setPath('userData', path.join(path.dirname(smoke.split('=')[1]), 'test-profile'));
app.setName('Outbound Atlas');
if (!app.requestSingleInstanceLock()) app.quit();
let window;
app.on('second-instance', () => { if(window) { window.restore(); window.focus(); } });
app.whenReady().then(async () => {
  session.defaultSession.setPermissionRequestHandler((_wc, _p, callback) => callback(false));
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => callback({cancel: !/^(file:|blob:|data:)/.test(details.url)}));
  Menu.setApplicationMenu(null);
  window = new BrowserWindow({width:1400,height:900,minWidth:390,minHeight:600,show:!smoke,backgroundColor:'#142623',title:'Outbound Atlas',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
  window.webContents.setWindowOpenHandler(() => ({action:'deny'}));
  window.webContents.on('will-navigate', event => event.preventDefault());
  await window.loadFile(path.join(__dirname,'ui','index.html'));
  if(smoke) {
    try {
      const result = await window.webContents.executeJavaScript(`(() => {
        const regions = [...document.querySelector('#region').options].map(o=>o.textContent);
        const images = [...document.querySelectorAll('image')].map(i=>i.getAttribute('href'));
        const key='atlas-desktop-smoke'; const previous=localStorage.getItem(key); localStorage.setItem(key,'ok');
        return {title:document.title,regions,images,markers:document.querySelectorAll('#markers > *').length,storage:localStorage.getItem(key)==='ok',persisted:previous==='ok',body:document.body.innerText.slice(0,350)};
      })()`);
      await session.defaultSession.flushStorageData();
      fs.writeFileSync(smoke.split('=')[1],JSON.stringify(result,null,2));
      app.quit();
    } catch(error) { fs.writeFileSync(smoke.split('=')[1],JSON.stringify({error:String(error)})); app.exit(1); }
  }
});
app.on('window-all-closed', () => app.quit());
