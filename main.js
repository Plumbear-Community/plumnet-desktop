const { app, BrowserWindow, shell, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1240,
    minHeight: 860,
    frame: false,                   // ← Убираем рамку Windows
    titleBarStyle: 'hiddenInset',    // ← Современный стиль
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false
    }
  });

  mainWindow.loadURL('https://plumnet.ru');

  // ВНЕШНИЕ ССЫЛКИ (t.me и прочее)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const isExternal = !url.startsWith('https://plumnet.ru');
    if (isExternal) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // ОБНОВЛЯЕМ ЗАГОЛОВОК ПАНЕЛИ при смене страницы
  mainWindow.webContents.on('did-navigate', (event, url) => {
    mainWindow.webContents.executeJavaScript('document.title').then(title => {
      document.title = title || 'PlumNet';
    });
  });

  // Защита от изменения размера
  mainWindow.on('resize', () => {
    const { width, height } = mainWindow.getBounds();
    if (width < 1240) mainWindow.setSize(1240, height);
    if (height < 860) mainWindow.setSize(width, 860);
  });

  mainWindow.setMenuBarVisibility(false);

  autoUpdater.checkForUpdatesAndNotify();
}

// IPC для кнопок управления окном
ipcMain.handle('minimize', () => mainWindow.minimize());
ipcMain.handle('close', () => mainWindow.close());
ipcMain.handle('maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

// Логирование обновлений
autoUpdater.on('checking-for-update', () => {
  console.log('Проверка обновлений...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Доступно обновление:', info.version);
  mainWindow.webContents.send('update-available', info);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Обновление скачано:', info.version);
  mainWindow.webContents.send('update-downloaded', info);
  
  // Показать диалог пользователю
  const { dialog } = require('electron');
  dialog.showMessageBox({
    type: 'info',
    title: 'Обновление готово',
    message: `Версия ${info.version} скачана. Перезапустить сейчас?`,
    buttons: ['Перезапустить', 'Позже']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
