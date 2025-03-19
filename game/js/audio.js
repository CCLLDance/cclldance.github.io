/**
 * audio.js - 贪吃蛇游戏音频模块
 */

class AudioController {
    constructor(options = {}) {
        this.options = Object.assign({
            enabled: true,
            volume: 0.5,
            muted: false,
            audioPath: './audio/'
        }, options);
        
        this.sounds = {
            eat: null,        // 吃到食物音效
            gameOver: null,   // 游戏结束音效
            move: null,       // 移动音效
            background: null  // 背景音乐
        };
        
        this.init();
    }
    
    init() {
        // 初始化所有音频元素，但不加载
        if (this.options.enabled) {
            try {
                for (const soundName in this.sounds) {
                    this.createAudio(soundName);
                }
                console.log('音频系统初始化完成');
            } catch (error) {
                console.error('音频初始化失败，禁用音频:', error);
                this.options.enabled = false;
            }
        }
    }
    
    createAudio(name) {
        try {
            // 创建音频元素
            const audio = new Audio();
            audio.volume = this.options.volume;
            audio.muted = this.options.muted;
            
            // 设置音频源
            const filePath = `${this.options.audioPath}${name}.mp3`;
            
            // 添加错误处理
            audio.addEventListener('error', (e) => {
                console.warn(`音频加载失败: ${name} - 文件可能不存在或格式不正确`, e.target.error);
            });
            
            // 添加加载完成事件
            audio.addEventListener('canplaythrough', () => {
                console.log(`音频加载成功: ${name}`);
            });
            
            // 尝试设置音频源
            audio.src = filePath;
            audio.load();
            
            this.sounds[name] = audio;
        } catch (e) {
            console.error(`创建音频失败: ${name}`, e);
            // 创建一个空的Audio对象作为回退
            this.sounds[name] = { 
                play: () => {}, 
                pause: () => {},
                addEventListener: () => {} 
            };
        }
    }
    
    playSound(name, options = {}) {
        if (!this.options.enabled || this.options.muted) return;
        
        const sound = this.sounds[name];
        if (!sound || !sound.src) return;
        
        // 检查音频是否已准备就绪
        if (sound.readyState === 0) {
            console.log(`音频文件未加载: ${name}`);
            // 尝试重新加载
            sound.load();
            return;
        }
        
        // 应用选项
        if (options.volume !== undefined) {
            sound.volume = options.volume * this.options.volume;
        }
        
        if (options.loop !== undefined) {
            sound.loop = options.loop;
        }
        
        // 播放前重置
        sound.currentTime = 0;
        
        // 尝试播放
        const playPromise = sound.play();
        
        // 处理可能的播放失败
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // 自动播放政策可能导致播放失败
                console.log(`音频播放失败: ${name} - ${error}`);
            });
        }
    }
    
    stopSound(name) {
        const sound = this.sounds[name];
        if (!sound) return;
        
        sound.pause();
        sound.currentTime = 0;
    }
    
    playEatSound() {
        this.playSound('eat');
    }
    
    playGameOverSound() {
        this.playSound('gameOver');
    }
    
    playMoveSound() {
        this.playSound('move');
    }
    
    playBackgroundMusic() {
        this.playSound('background', { loop: true, volume: 0.3 });
    }
    
    stopBackgroundMusic() {
        this.stopSound('background');
    }
    
    setMute(muted) {
        this.options.muted = muted;
        
        // 更新所有音频元素的静音状态
        for (const soundName in this.sounds) {
            if (this.sounds[soundName]) {
                this.sounds[soundName].muted = muted;
            }
        }
    }
    
    setVolume(volume) {
        this.options.volume = Math.max(0, Math.min(1, volume));
        
        // 更新所有音频元素的音量
        for (const soundName in this.sounds) {
            if (this.sounds[soundName]) {
                this.sounds[soundName].volume = this.options.volume;
            }
        }
    }
    
    toggleMute() {
        this.setMute(!this.options.muted);
        return this.options.muted;
    }
}

export default AudioController; 