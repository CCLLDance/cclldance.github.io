/**
 * input.js - 贪吃蛇游戏输入控制模块
 */

class InputController {
    constructor(options = {}) {
        this.options = Object.assign({
            enableKeyboard: true,
            enableTouch: true,
            enableSwipe: true,
            swipeThreshold: 30,
            touchContainer: document,
            onDirectionChange: () => {},
            onRestart: () => {},
            onPause: () => {}
        }, options);
        
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        
        this.bindEvents();
    }
    
    bindEvents() {
        // 键盘控制
        if (this.options.enableKeyboard) {
            document.addEventListener('keydown', this.handleKeydown.bind(this));
        }
        
        // 触摸控制
        if (this.options.enableTouch) {
            const container = typeof this.options.touchContainer === 'string' 
                ? document.querySelector(this.options.touchContainer) 
                : this.options.touchContainer;
                
            container.addEventListener('touchstart', this.handleTouchStart.bind(this), {passive: false});
            
            if (this.options.enableSwipe) {
                container.addEventListener('touchmove', this.handleTouchMove.bind(this), {passive: false});
                container.addEventListener('touchend', this.handleTouchEnd.bind(this), {passive: false});
            } else {
                container.addEventListener('touchend', this.handleTap.bind(this), {passive: false});
            }
        }
    }
    
    handleKeydown(event) {
        switch(event.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                event.preventDefault();
                this.options.onDirectionChange('up');
                break;
                
            case 'ArrowDown':
            case 's':
            case 'S':
                event.preventDefault();
                this.options.onDirectionChange('down');
                break;
                
            case 'ArrowLeft':
            case 'a':
            case 'A':
                event.preventDefault();
                this.options.onDirectionChange('left');
                break;
                
            case 'ArrowRight':
            case 'd':
            case 'D':
                event.preventDefault();
                this.options.onDirectionChange('right');
                break;
                
            case ' ':  // 空格键
                event.preventDefault();
                this.options.onRestart();
                break;
                
            case 'p':
            case 'P':
                event.preventDefault();
                this.options.onPause();
                break;
        }
    }
    
    handleTouchStart(event) {
        event.preventDefault();
        
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
    }
    
    handleTouchMove(event) {
        event.preventDefault();
    }
    
    handleTouchEnd(event) {
        event.preventDefault();
        
        this.touchEndX = event.changedTouches[0].clientX;
        this.touchEndY = event.changedTouches[0].clientY;
        
        this.handleSwipe();
    }
    
    handleSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        
        // 确定主要方向（水平或垂直）
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑动
            if (Math.abs(deltaX) > this.options.swipeThreshold) {
                if (deltaX > 0) {
                    this.options.onDirectionChange('right');
                } else {
                    this.options.onDirectionChange('left');
                }
            }
        } else {
            // 垂直滑动
            if (Math.abs(deltaY) > this.options.swipeThreshold) {
                if (deltaY > 0) {
                    this.options.onDirectionChange('down');
                } else {
                    this.options.onDirectionChange('up');
                }
            }
        }
    }
    
    handleTap(event) {
        event.preventDefault();
        
        const touch = event.changedTouches[0];
        const touchX = touch.clientX;
        const touchY = touch.clientY;
        
        // 获取游戏区域尺寸和位置
        const container = typeof this.options.touchContainer === 'string' 
            ? document.querySelector(this.options.touchContainer) 
            : this.options.touchContainer;
            
        const rect = container.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const centerX = rect.left + width / 2;
        const centerY = rect.top + height / 2;
        
        // 计算点击位置相对于中心的位置
        const relativeX = touchX - centerX;
        const relativeY = touchY - centerY;
        
        // 确定方向
        if (Math.abs(relativeX) > Math.abs(relativeY)) {
            // 水平方向
            if (relativeX > 0) {
                this.options.onDirectionChange('right');
            } else {
                this.options.onDirectionChange('left');
            }
        } else {
            // 垂直方向
            if (relativeY > 0) {
                this.options.onDirectionChange('down');
            } else {
                this.options.onDirectionChange('up');
            }
        }
    }
    
    unbindEvents() {
        if (this.options.enableKeyboard) {
            document.removeEventListener('keydown', this.handleKeydown);
        }
        
        if (this.options.enableTouch) {
            const container = typeof this.options.touchContainer === 'string' 
                ? document.querySelector(this.options.touchContainer) 
                : this.options.touchContainer;
                
            container.removeEventListener('touchstart', this.handleTouchStart);
            
            if (this.options.enableSwipe) {
                container.removeEventListener('touchmove', this.handleTouchMove);
                container.removeEventListener('touchend', this.handleTouchEnd);
            } else {
                container.removeEventListener('touchend', this.handleTap);
            }
        }
    }
}

export default InputController; 