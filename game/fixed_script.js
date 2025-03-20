// 强制游戏容器为完美正方形的函数
function ensureSquareContainer() {
    const container = document.querySelector('.snake-game-container');
    const gameArea = document.querySelector('.game-area');
    
    // 计算可用空间的方式取决于页面当前布局
    let availableSize;
    
    // 获取视窗宽度来判断是否为移动设备布局
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isLandscape = viewportWidth > viewportHeight;
    
    // 检测是否是移动设备
    const isMobile = window.innerWidth <= 1024;
    
    if (isMobile) {
        if (isLandscape) {
            // 横屏移动设备：游戏区域设置为视窗高度的90%
            availableSize = viewportHeight * 0.90;
        } else {
            // 竖屏移动设备：考虑游戏区域的实际高度
            const gameAreaHeight = gameArea.clientHeight;
            availableSize = Math.min(gameArea.clientWidth, gameAreaHeight) * 0.92;
        }
    } else {
        // 桌面布局：游戏区域的可用空间
        availableSize = Math.min(gameArea.clientWidth, gameArea.clientHeight) * 0.9;
    }
    
    // 设置容器为正方形
    container.style.width = `${availableSize}px`;
    container.style.height = `${availableSize}px`;
    
    // 确保游戏容器居中
    container.style.position = 'absolute';
    container.style.left = '50%';
    container.style.top = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    
    console.log(`Container resized: ${availableSize}x${availableSize} pixels, Viewport: ${viewportWidth}x${viewportHeight}, Layout: ${isLandscape ? 'landscape' : 'portrait'}`);
} 