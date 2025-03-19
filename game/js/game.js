/**
 * game.js - 贪吃蛇游戏主控制器
 */

import Snake from './snake.js';
import SnakeRenderer from './renderer.js';
import InputController from './input.js';
import AudioController from './audio.js';

class SnakeGame {
    constructor(canvasId, options = {}) {
        this.options = Object.assign({
            gridSize: 20,
            initialSpeed: 150,
            speedIncrement: 2,
            initialSnakeLength: 3,
            enableAudio: true,
            audioVolume: 0.5,
            enableTouch: true,
            enableSwipe: true,
            drawGrid: true,
            backgroundColor: '#070720',
            gridColor: '#131342',
            snakeHeadColor: '#9d19ff',
            snakeBodyColor: '#ff2a6a',
            foodColor: '#00e5ff',
            textColor: '#f0f8ff',
            onScoreUpdate: null,
            onGameStart: null,
            onGameOver: null
        }, options);
        
        // 初始化游戏状态
        this.canvas = document.getElementById(canvasId);
        this.gameActive = false;
        this.gamePaused = false;
        this.highScore = this.getHighScore();
        
        // 初始化各个模块
        this.initModules();
    }
    
    initModules() {
        // 初始化游戏渲染器
        this.renderer = new SnakeRenderer(this.canvas.id, {
            gridSize: this.options.gridSize,
            backgroundColor: this.options.backgroundColor,
            gridColor: this.options.gridColor,
            snakeHeadColor: this.options.snakeHeadColor,
            snakeBodyColor: this.options.snakeBodyColor,
            foodColor: this.options.foodColor,
            textColor: this.options.textColor,
            drawGrid: this.options.drawGrid
        });
        
        // 获取游戏区域尺寸（格子数量）
        const boardSize = this.renderer.getBoardSize();
        
        // 初始化蛇逻辑
        this.snake = new Snake({
            gridSize: this.options.gridSize,
            initialSpeed: this.options.initialSpeed,
            speedIncrement: this.options.speedIncrement,
            initialSnakeLength: this.options.initialSnakeLength,
            boardWidth: boardSize.width,
            boardHeight: boardSize.height,
            onScore: this.handleScore.bind(this),
            onGameOver: this.handleGameOver.bind(this)
        });
        
        // 初始化音频控制器
        this.audio = new AudioController({
            enabled: this.options.enableAudio,
            volume: this.options.audioVolume
        });
        
        // 初始化输入控制器
        this.input = new InputController({
            enableTouch: this.options.enableTouch,
            enableSwipe: this.options.enableSwipe,
            touchContainer: this.canvas,
            onDirectionChange: this.handleDirectionChange.bind(this),
            onRestart: this.start.bind(this),
            onPause: this.togglePause.bind(this)
        });
        
        // 设置渲染循环
        this.setupRenderLoop();
    }
    
    setupRenderLoop() {
        // 游戏主循环使用 requestAnimationFrame
        const renderLoop = () => {
            if (this.gameActive) {
                // 获取当前游戏状态
                const gameState = this.snake.getState();
                
                // 渲染游戏状态
                this.renderer.render(gameState);
            }
            
            // 继续循环
            requestAnimationFrame(renderLoop);
        };
        
        // 启动渲染循环
        renderLoop();
    }
    
    start() {
        // 如果游戏已经在运行，先重置
        if (this.gameActive) {
            this.reset();
        }
        
        // 开始游戏
        this.gameActive = true;
        this.gamePaused = false;
        this.snake.start();
        
        // 背景音乐
        this.audio.playBackgroundMusic();
        
        // 触发游戏开始回调
        if (typeof this.options.onGameStart === 'function') {
            this.options.onGameStart();
        }
    }
    
    reset() {
        // 停止当前游戏
        this.snake.pause();
        this.audio.stopBackgroundMusic();
        
        // 重置状态
        this.gameActive = false;
        this.gamePaused = false;
    }
    
    togglePause() {
        if (!this.gameActive) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            this.snake.pause();
            this.audio.stopBackgroundMusic();
        } else {
            this.snake.resume();
            this.audio.playBackgroundMusic();
        }
    }
    
    handleDirectionChange(direction) {
        if (!this.gameActive || this.gamePaused) return;
        
        this.snake.setDirection(direction);
        this.audio.playMoveSound();
    }
    
    handleScore(score) {
        // 播放得分音效
        this.audio.playEatSound();
        
        // 更新高分
        if (score > this.highScore) {
            this.highScore = score;
            this.saveHighScore(this.highScore);
        }
        
        // 触发分数更新回调
        if (typeof this.options.onScoreUpdate === 'function') {
            this.options.onScoreUpdate(score, this.highScore);
        }
    }
    
    handleGameOver(score) {
        // 标记游戏结束
        this.gameActive = false;
        
        // 播放游戏结束音效
        this.audio.playGameOverSound();
        this.audio.stopBackgroundMusic();
        
        // 触发游戏结束回调
        if (typeof this.options.onGameOver === 'function') {
            this.options.onGameOver(score, this.highScore);
        }
    }
    
    // 高分管理
    getHighScore() {
        const savedScore = localStorage.getItem('snakeHighScore');
        return savedScore ? parseInt(savedScore, 10) : 0;
    }
    
    saveHighScore(score) {
        localStorage.setItem('snakeHighScore', score.toString());
    }
    
    toggleAudio() {
        return this.audio.toggleMute();
    }
    
    setAudioVolume(volume) {
        this.audio.setVolume(volume);
    }
    
    resize() {
        // 调整游戏大小以适应窗口变化
        this.renderer.resizeCanvas();
        
        // 获取新的游戏区域尺寸
        const boardSize = this.renderer.getBoardSize();
        
        // 更新蛇的游戏区域
        this.snake.config.boardWidth = boardSize.width;
        this.snake.config.boardHeight = boardSize.height;
        
        // 如果游戏正在进行，可能需要重新定位食物
        if (this.gameActive && !this.gamePaused) {
            this.snake.createFood();
        }
    }
    
    destroy() {
        // 停止游戏
        this.reset();
        
        // 解绑事件监听器
        this.input.unbindEvents();
        
        // 移除渲染循环
        this.gameActive = false;
    }
}

export default SnakeGame; 