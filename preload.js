const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
  // КАСТОМНАЯ ПАНЕЛЬ НАВИГАЦИИ
  const navPanel = document.createElement('div');
  navPanel.id = 'custom-nav-panel';
  navPanel.style.cssText = `
    height: 32px;
    background: #444;
    display: flex;
    align-items: center;
    padding: 0 15px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    -webkit-app-region: drag;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999999;
  `;

  navPanel.innerHTML = `
    <!-- НАЗАД -->
    <button id="back-btn" style="
      width: 25px; height: 20px;
      border: none;
      background: rgba(255,255,255,0.2);
      border-radius: 5px;
      color: white;
      font-size: 15px;
      cursor: pointer;
      margin-right: 8px;
      -webkit-app-region: no-drag;
      opacity: 0.7;
      transition: opacity 0.2s;
    " title="Назад">‹</button>

    <!-- ВПЕРЁД -->
    <button id="forward-btn" style="
      width: 25px; height: 20px;
      border: none;
      background: rgba(255,255,255,0.2);
      border-radius: 5px;
      color: white;
      font-size: 15px;
      cursor: pointer;
      margin-right: 15px;
      -webkit-app-region: no-drag;
      opacity: 0.7;
      transition: opacity 0.2s;
    " title="Вперёд">›</button>

    <!-- ЗАГОЛОВОК СТРАНИЦЫ -->
    <div id="page-title" style="
      flex: 1;
      font-weight: 600;
      font-size: 15px;
      text-align: center;
      color: white;
      -webkit-app-region: drag;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    ">PlumNet</div>

    <!-- МИНИМИЗАЦИЯ -->
    <button id="minimize-btn" style="
      width: 42px; height: 42px;
      border: none;
      background: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      margin-right: 5px;
      -webkit-app-region: no-drag;
      opacity: 0.8;
      transition: opacity 0.2s;
    " title="Свернуть">−</button>

    <!-- ЗАКРЫТИЕ -->
    <button id="close-btn" style="
      width: 42px; height: 42px;
      border: none;
      background: none;
      color: #ff5f5f;
      font-size: 18px;
      cursor: pointer;
      -webkit-app-region: no-drag;
      opacity: 0.9;
      transition: background 0.2s;
    " title="Закрыть">✕</button>
  `;

  document.body.prepend(navPanel);

  // ОБРАБОТЧИКИ КНОПОК
  document.getElementById('back-btn').onclick = () => window.history.back();
  document.getElementById('forward-btn').onclick = () => window.history.forward();
  
  document.getElementById('minimize-btn').onclick = () => ipcRenderer.invoke('minimize');
  document.getElementById('close-btn').onclick = () => ipcRenderer.invoke('close');

  // Hover эффекты
  document.querySelectorAll('#back-btn, #forward-btn, #minimize-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => btn.style.opacity = '1');
    btn.addEventListener('mouseleave', () => btn.style.opacity = '0.7');
  });

  document.getElementById('close-btn').addEventListener('mouseenter', () => {
    document.getElementById('close-btn').style.background = 'rgba(255,95,95,0.3)';
  });
  document.getElementById('close-btn').addEventListener('mouseleave', () => {
    document.getElementById('close-btn').style.background = 'none';
  });

  // Обновляем заголовок
  const observer = new MutationObserver(() => {
    document.getElementById('page-title').textContent = document.title || 'PlumNet';
  });
  observer.observe(document.querySelector('title'), { childList: true, subtree: true });
});
