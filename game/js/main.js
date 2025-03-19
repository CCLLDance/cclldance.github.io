/**
 * main.js - 贪吃蛇游戏主入口，集成到网站
 */

import SnakeGame from './game.js';

// 当DOM加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const snakeGameContainer = document.getElementById('snakeGameContainer');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoMessage = document.getElementById('videoMessage');
    const content = document.querySelector('.content');
    
    // 检查是否正在播放视频
    const isVideoPlaying = () => {
        // 检查是否存在视频iframe或其他视频播放元素
        const videoIframe = videoPlayer.querySelector('iframe');
        return videoIframe !== null;
    };
    
    // 切换贪吃蛇游戏的显示状态
    const toggleSnakeGame = () => {
        if (isVideoPlaying()) {
            // 如果正在播放视频，隐藏游戏
            snakeGameContainer.style.display = 'none';
            
            // 隐藏游戏说明
            if (document.getElementById('gameInstructions')) {
                document.getElementById('gameInstructions').style.display = 'none';
            }
        } else {
            // 如果没有播放视频，显示游戏
            snakeGameContainer.style.display = 'block'; // 使用block而不是flex以确保兼容性
            videoMessage.style.display = 'none';
            
            // 显示游戏说明
            if (document.getElementById('gameInstructions')) {
                document.getElementById('gameInstructions').style.display = 'block';
            }
            
            // 重置画布大小
            setTimeout(() => {
                resizeCanvas();
            }, 0);
        }
    };
    
    // 获取游戏相关DOM元素
    const startScreen = document.getElementById('startScreen');
    const startBtn = document.getElementById('startBtn');
    const muteBtn = document.getElementById('muteBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    
    // 确保所有游戏元素都已加载
    if (!startBtn || !startScreen || !snakeGameContainer) {
        console.error('游戏元素未找到，请检查HTML结构');
        return;
    }
    
    // 创建游戏实例
    const game = new SnakeGame('snakeCanvas', {
        // 游戏配置
        gridSize: 16, // 更高精度的网格
        initialSpeed: 85, // 初始速度
        speedIncrement: 2.5, // 平滑的加速度
        minSpeed: 45, // 最小速度（最快）
        initialSnakeLength: 3,
        enableAudio: true,
        audioVolume: 0.3,
        enableTouch: true,
        enableSwipe: true,
        drawGrid: true,
        scorePosition: { x: 10, y: 22 }, // 调整分数位置
        pixelFont: true, // 使用像素风格字体
        
        // 事件回调
        onGameStart: () => {
            startScreen.classList.add('hidden');
            pauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
        },
        onGameOver: (score, highScore) => {
            // 游戏结束后显示开始屏幕
            setTimeout(() => {
                startScreen.classList.remove('hidden');
            }, 1500);
        }
    });
    
    // 调整画布大小以适应窗口
    const resizeCanvas = () => {
        if (snakeGameContainer.style.display !== 'none') {
            game.resize();
        }
    };
    
    // 直接绑定开始按钮点击事件
    startBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        game.start();
        console.log('游戏开始按钮被点击');
    };
    
    // 备用的开始游戏方法
    window.startSnakeGame = function() {
        game.start();
    };
    
    // 绑定静音按钮点击事件
    muteBtn.addEventListener('click', () => {
        const muted = game.toggleAudio();
        muteBtn.innerHTML = muted 
            ? '<i class="bi bi-volume-mute-fill"></i>' 
            : '<i class="bi bi-volume-up-fill"></i>';
    });
    
    // 绑定暂停按钮点击事件
    pauseBtn.addEventListener('click', () => {
        game.togglePause();
        pauseBtn.innerHTML = pauseBtn.innerHTML.includes('pause') 
            ? '<i class="bi bi-play-fill"></i>' 
            : '<i class="bi bi-pause-fill"></i>';
    });
    
    // 确保开始屏幕一开始是可见的
    startScreen.classList.remove('hidden');
    
    // 绑定窗口大小改变事件
    window.addEventListener('resize', resizeCanvas);
    
    // 移除旧的说明 (如果有)
    const oldInstructions = document.getElementById('gameInstructions');
    if (oldInstructions) {
        oldInstructions.remove();
    }
    
    // 在页面上创建外部游戏说明
    const createGameInstructions = () => {
        const instructions = document.createElement('div');
        instructions.id = 'gameInstructions';
        instructions.className = 'game-instructions';
        
        instructions.innerHTML = `
            <div class="instruction-content">
                <div class="instruction-title">GAME INSTRUCTIONS</div>
                <div class="instruction-controls">
                    <div class="control-item">
                        <span class="key-group">
                            <span class="key">↑</span><span class="key">↓</span><span class="key">←</span><span class="key">→</span>
                        </span>
                        <span class="or">OR</span>
                        <span class="key-group">
                            <span class="key">W</span><span class="key">S</span><span class="key">A</span><span class="key">D</span>
                        </span>
                        <span class="desc">MOVE</span>
                    </div>
                    <div class="control-item">
                        <span class="key-group">
                            <span class="key">SPACE</span>
                        </span>
                        <span class="desc">RESTART</span>
                    </div>
                </div>
            </div>
        `;
        
        // 将说明直接插入到视频播放器后面
        videoPlayer.insertAdjacentElement('afterend', instructions);
        
        return instructions;
    };
    
    // 添加额外样式
    const addSnakeGameStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: 'Press Start 2P';
                font-style: normal;
                font-weight: 400;
                font-display: swap;
                src: url(https://fonts.gstatic.com/s/pressstart2p/v15/e3t4euO8T-267oIAQAu6jDQyK3nVivM.woff2) format('woff2');
                unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
            }
            
            #snakeGameContainer {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 460px;
                height: 460px;
                max-width: 90%;
                max-height: 90%;
                aspect-ratio: 1 / 1;
                z-index: 5;
                display: none;
                border-radius: 15px;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 
                            0 0 50px rgba(157, 25, 255, 0.3), 
                            0 0 25px rgba(255, 42, 106, 0.3);
            }
            
            .snake-game-start-screen {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: rgba(7, 7, 32, 0.85);
                color: #f0f8ff;
                z-index: 30;
                pointer-events: auto;
                opacity: 1;
                transition: opacity 0.5s ease;
                border-radius: 8px;
            }
            
            .snake-game-start-screen.hidden {
                opacity: 0;
                pointer-events: none;
            }
            
            .snake-game-title {
                font-family: 'Press Start 2P', monospace;
                font-size: 1.4rem;
                margin-bottom: 1.8rem;
                text-align: center;
                color: #f0f8ff;
                text-shadow: 0 0 10px rgba(157, 25, 255, 0.8), 
                             0 0 20px rgba(255, 42, 106, 0.5), 
                             0 0 30px rgba(0, 229, 255, 0.3);
                animation: glow 1.5s ease-in-out infinite alternate;
                letter-spacing: 1px;
                line-height: 1.5;
                image-rendering: pixelated;
            }
            
            .snake-game-start-btn {
                font-family: 'Press Start 2P', monospace;
                font-size: 0.9rem;
                padding: 0.8rem 1.5rem;
                background: linear-gradient(135deg, #9d19ff 0%, #ff2a6a 100%);
                border: none;
                border-radius: 50px;
                color: #f0f8ff;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
                box-shadow: 0 5px 15px rgba(157, 25, 255, 0.4);
                z-index: 100; /* 确保按钮在最上层 */
                pointer-events: auto; /* 确保按钮可点击 */
                letter-spacing: 1px;
                text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);
            }
            
            .snake-game-start-btn:hover,
            .snake-game-start-btn:active,
            .snake-game-start-btn:focus {
                transform: translateY(-5px);
                box-shadow: 0 10px 25px rgba(157, 25, 255, 0.6);
                outline: none;
            }
            
            .snake-game-start-btn::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: transparent;
                z-index: 99;
            }
            
            .game-instructions {
                position: relative;
                width: 90%;
                max-width: 460px;
                margin: 20px auto 0;
                padding: 15px;
                background: rgba(7, 7, 32, 0.8);
                border-radius: 12px;
                border: 1px solid rgba(157, 25, 255, 0.3);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                color: #f0f8ff;
                font-family: 'Press Start 2P', monospace;
                z-index: 4;
                display: block; /* 确保显示 */
                letter-spacing: 0.5px;
                text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);
            }
            
            .instruction-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 5px;
            }
            
            .instruction-title {
                font-size: 0.9rem;
                font-weight: normal;
                margin-bottom: 12px;
                color: #00e5ff;
                text-shadow: 0 0 5px rgba(0, 229, 255, 0.5);
                letter-spacing: 1px;
                text-align: center;
            }
            
            .instruction-controls {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                align-items: center;
                gap: 15px;
            }
            
            .control-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.7rem;
                margin-bottom: 8px;
                line-height: 1.5;
            }
            
            .key-group {
                display: flex;
                gap: 4px;
            }
            
            .key {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 24px;
                height: 24px;
                padding: 0 5px;
                background: rgba(157, 25, 255, 0.2);
                border: 1px solid rgba(157, 25, 255, 0.5);
                border-radius: 4px;
                font-size: 0.7rem;
                font-weight: normal;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                font-family: 'Press Start 2P', monospace; /* 保持键位为像素字体 */
            }
            
            .or {
                margin: 0 5px;
                opacity: 0.8;
                font-size: 0.65rem;
            }
            
            .desc {
                margin-left: 5px;
                font-size: 0.7rem;
            }
            
            .video-player {
                position: relative;
            }
            
            #snakeCanvas {
                width: 100% !important;
                height: 100% !important;
                image-rendering: pixelated;
                image-rendering: crisp-edges;
                background-color: #070720;
            }
            
            .snake-game-btn i {
                font-size: 16px;
            }
            
            /* 移动设备适配 */
            @media (max-width: 768px) {
                .snake-game-title {
                    font-size: 1.1rem;
                    margin-bottom: 1.5rem;
                }
                
                .snake-game-start-btn {
                    font-size: 0.75rem;
                    padding: 0.7rem 1.2rem;
                }
                
                .game-instructions {
                    padding: 10px;
                    margin: 15px auto 5px;
                }
                
                .instruction-title {
                    font-size: 0.75rem;
                    margin-bottom: 10px;
                }
                
                .key {
                    min-width: 20px;
                    height: 20px;
                    font-size: 0.6rem;
                }
                
                .control-item {
                    font-size: 0.65rem;
                    gap: 5px;
                }
                
                .desc {
                    font-size: 0.65rem;
                }
                
                .or {
                    font-size: 0.6rem;
                }
            }
            
            @keyframes glow {
                from {
                    text-shadow: 0 0 5px #9d19ff, 0 0 10px #ff2a6a;
                }
                to {
                    text-shadow: 0 0 10px #9d19ff, 0 0 20px #ff2a6a, 0 0 30px #00e5ff;
                }
            }
            
            @keyframes scanline {
                0% {
                    transform: translate3d(0, -100%, 0);
                }
                100% {
                    transform: translate3d(0, 100%, 0);
                }
            }
        `;
        document.head.appendChild(style);
    };
    
    // 添加样式
    addSnakeGameStyles();
    
    // 创建说明并确保立即显示
    const instructionsElement = createGameInstructions();
    instructionsElement.style.display = 'block';
    
    // 监听视频相关事件
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                toggleSnakeGame();
            }
        });
    });
    
    // 配置观察器选项
    const config = { childList: true, subtree: true };
    
    // 开始观察视频播放器元素
    observer.observe(videoPlayer, config);
    
    // 初始化
    toggleSnakeGame();
    
    // 确保画布正确加载
    window.setTimeout(() => {
        resizeCanvas();
        
        // 显示游戏说明
        if (instructionsElement) {
            instructionsElement.style.display = 'block';
        }
    }, 300);
}); 