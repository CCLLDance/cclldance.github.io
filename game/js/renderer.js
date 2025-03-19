/**
 * renderer.js - 贪吃蛇游戏渲染模块
 */

class SnakeRenderer {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas with id ${canvasId} not found`);
        }
        
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.options = Object.assign({
            gridSize: 16, // 更高精度的网格
            backgroundColor: '#070720',
            gridColor: '#131342',
            snakeHeadColor: '#9d19ff',
            snakeBodyColor: '#ff2a6a',
            snakeGradient: true,
            foodColor: '#00e5ff',
            foodGlowColor: 'rgba(0, 229, 255, 0.7)',
            foodPulse: true,
            borderColor: '#2d2d60',
            textColor: '#f0f8ff',
            scorePosition: { x: 10, y: 22 },
            gameOverPosition: { x: null, y: null },
            drawGrid: true,
            maxGridWidth: 28,
            maxGridHeight: 28,
            aspectRatio: 1,
            pixelFont: true, // 默认使用像素风格字体
            language: 'en' // 使用英文
        }, options);
        
        // 禁用图像平滑，保持像素清晰
        this.ctx.imageSmoothingEnabled = false;
        
        // 设置画布大小
        this.resizeCanvas();
        
        // 计算游戏区域的实际像素尺寸
        this.pixelWidth = this.canvas.width;
        this.pixelHeight = this.canvas.height;
        
        // 初始化脉冲动画
        this.pulseValue = 0;
        this.pulseDirection = 0.05;
        
        // 绑定resize事件
        window.addEventListener('resize', this.resizeCanvas.bind(this));
    }
    
    resizeCanvas() {
        // 获取父容器尺寸
        const parent = this.canvas.parentElement;
        
        // 确保有效的父容器
        if (!parent) return;
        
        const containerWidth = parent.clientWidth;
        const containerHeight = parent.clientHeight;
        
        // 确保有效的容器尺寸
        if (containerWidth <= 0 || containerHeight <= 0) return;
        
        // 计算可用空间
        const gridSize = this.options.gridSize;
        
        // 确保游戏区域尺寸合适，使用父容器的尺寸
        const size = Math.min(containerWidth, containerHeight);
        
        // 计算能容纳的网格数量
        let gridCount = Math.floor(size / gridSize);
        
        // 确保网格数量不超过设置的最大值
        gridCount = Math.min(gridCount, this.options.maxGridWidth, this.options.maxGridHeight);
        
        // 计算实际画布大小
        const canvasSize = gridCount * gridSize;
        
        // 设置CSS尺寸 - 让画布填充整个容器
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        
        // 考虑设备像素比
        const dpr = window.devicePixelRatio || 1;
        
        // 设置画布实际尺寸 (考虑设备像素比)
        this.canvas.width = canvasSize * dpr;
        this.canvas.height = canvasSize * dpr;
        
        // 缩放上下文以匹配像素比
        this.ctx.scale(dpr, dpr);
        
        // 更新游戏区域大小
        this.boardWidth = gridCount;
        this.boardHeight = gridCount;
        
        // 设置游戏结束消息的位置
        this.options.gameOverPosition.x = canvasSize / 2;
        this.options.gameOverPosition.y = canvasSize / 2;
        
        // 确保上下文属性在重新调整大小后保持一致
        this.ctx.imageSmoothingEnabled = false;
        
        console.log(`Canvas resized: ${this.boardWidth}x${this.boardHeight} grids, ${canvasSize}x${canvasSize} pixels`);
    }
    
    updatePulse() {
        this.pulseValue += this.pulseDirection;
        if (this.pulseValue >= 1 || this.pulseValue <= 0) {
            this.pulseDirection *= -1;
        }
    }
    
    clear() {
        // 清除画布，使用整个画布区域
        const dpr = window.devicePixelRatio || 1;
        const width = this.canvas.width / dpr;
        const height = this.canvas.height / dpr;
        
        this.ctx.fillStyle = this.options.backgroundColor;
        this.ctx.fillRect(0, 0, width, height);
        
        // 绘制网格
        if (this.options.drawGrid) {
            this.drawGrid();
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = this.options.gridColor;
        this.ctx.lineWidth = 0.5;
        
        const gridSize = this.options.gridSize;
        
        // 绘制竖线
        for (let x = 0; x <= this.boardWidth; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * gridSize, 0);
            this.ctx.lineTo(x * gridSize, this.boardHeight * gridSize);
            this.ctx.stroke();
        }
        
        // 绘制横线
        for (let y = 0; y <= this.boardHeight; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * gridSize);
            this.ctx.lineTo(this.boardWidth * gridSize, y * gridSize);
            this.ctx.stroke();
        }
    }
    
    drawSnake(snake) {
        // 绘制蛇身
        for (let i = snake.length - 1; i >= 0; i--) {
            const segment = snake[i];
            const x = segment.x * this.options.gridSize;
            const y = segment.y * this.options.gridSize;
            const size = this.options.gridSize;
            
            // 为每个蛇身分段设置颜色
            if (this.options.snakeGradient && i > 0) {
                // 计算渐变
                const ratio = i / snake.length;
                const r = this.hexToRgb(this.options.snakeHeadColor).r * (1 - ratio) + this.hexToRgb(this.options.snakeBodyColor).r * ratio;
                const g = this.hexToRgb(this.options.snakeHeadColor).g * (1 - ratio) + this.hexToRgb(this.options.snakeBodyColor).g * ratio;
                const b = this.hexToRgb(this.options.snakeHeadColor).b * (1 - ratio) + this.hexToRgb(this.options.snakeBodyColor).b * ratio;
                
                this.ctx.fillStyle = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
            } else {
                this.ctx.fillStyle = i === 0 ? this.options.snakeHeadColor : this.options.snakeBodyColor;
            }
            
            // 绘制蛇身体部分
            const padding = 0.5; // 轻微的内边距，让蛇身段之间有微小空隙
            const segmentSize = size - padding * 2;
            
            // 创建圆角矩形
            const radius = Math.max(3, segmentSize / 4); // 调整圆角半径
            this.roundRect(x + padding, y + padding, segmentSize, segmentSize, radius, true);
            
            // 为蛇头添加特效
            if (i === 0) {
                // 绘制蛇眼睛，增强视觉辨识度
                const eyeSize = Math.max(2, size / 8);
                const eyeOffset = size / 4;
                
                // 绘制光晕
                this.ctx.shadowColor = this.options.snakeHeadColor;
                this.ctx.shadowBlur = 10;
                this.roundRect(x + padding, y + padding, segmentSize, segmentSize, radius, true);
                this.ctx.shadowBlur = 0;
                
                // 根据方向绘制眼睛
                this.ctx.fillStyle = '#ffffff';
                
                // 默认眼睛位置 (右方向)
                let leftEyeX = x + size - eyeOffset - eyeSize;
                let leftEyeY = y + eyeOffset;
                let rightEyeX = x + size - eyeOffset - eyeSize;
                let rightEyeY = y + size - eyeOffset - eyeSize;
                
                // 根据蛇头方向调整眼睛位置
                if (snake.length > 1) {
                    const neck = snake[1];
                    
                    // 根据蛇头和第二段的相对位置判断方向
                    if (segment.x > neck.x) { // 向右
                        leftEyeX = x + size - eyeOffset - eyeSize;
                        leftEyeY = y + eyeOffset;
                        rightEyeX = x + size - eyeOffset - eyeSize;
                        rightEyeY = y + size - eyeOffset - eyeSize;
                    } else if (segment.x < neck.x) { // 向左
                        leftEyeX = x + eyeOffset;
                        leftEyeY = y + eyeOffset;
                        rightEyeX = x + eyeOffset;
                        rightEyeY = y + size - eyeOffset - eyeSize;
                    } else if (segment.y < neck.y) { // 向上
                        leftEyeX = x + eyeOffset;
                        leftEyeY = y + eyeOffset;
                        rightEyeX = x + size - eyeOffset - eyeSize;
                        rightEyeY = y + eyeOffset;
                    } else if (segment.y > neck.y) { // 向下
                        leftEyeX = x + eyeOffset;
                        leftEyeY = y + size - eyeOffset - eyeSize;
                        rightEyeX = x + size - eyeOffset - eyeSize;
                        rightEyeY = y + size - eyeOffset - eyeSize;
                    }
                }
                
                // 绘制眼睛
                this.ctx.beginPath();
                this.ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }
    
    drawFood(food) {
        const x = food.x * this.options.gridSize;
        const y = food.y * this.options.gridSize;
        const size = this.options.gridSize;
        
        // 更新脉冲动画
        if (this.options.foodPulse) {
            this.updatePulse();
        }
        
        // 绘制食物的发光效果
        this.ctx.shadowColor = this.options.foodGlowColor;
        this.ctx.shadowBlur = 12 + (this.options.foodPulse ? this.pulseValue * 5 : 0);
        
        // 绘制食物主体
        this.ctx.fillStyle = this.options.foodColor;
        
        // 圆形食物
        this.ctx.beginPath();
        this.ctx.arc(
            x + size / 2,
            y + size / 2,
            size / 2 - 3 + (this.options.foodPulse ? this.pulseValue * 2 : 0),
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // 重置阴影
        this.ctx.shadowBlur = 0;
        
        // 绘制内部亮点，增强立体感
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.beginPath();
        this.ctx.arc(
            x + size * 0.3,
            y + size * 0.3,
            size / 8,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }
    
    drawScore(score) {
        this.ctx.fillStyle = this.options.textColor;
        
        // 添加像素风格的文字阴影效果
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        this.ctx.shadowBlur = 2;
        this.ctx.shadowOffsetX = 1;
        this.ctx.shadowOffsetY = 1;
        
        // 使用"Press Start 2P"字体确保显示一致
        const pixelFontSize = this.options.pixelFont ? 10 : 12;
        this.ctx.font = `${pixelFontSize}px "Press Start 2P", monospace`;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        // 绘制分数文本，像素字体要稍小一些，使用英文
        this.ctx.fillText(`SCORE: ${score}`, this.options.scorePosition.x, this.options.scorePosition.y);
        
        // 重置阴影
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }
    
    drawGameOver(score) {
        // 半透明背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.boardWidth * this.options.gridSize, this.boardHeight * this.options.gridSize);
        
        // 游戏结束文字
        this.ctx.fillStyle = this.options.textColor;
        this.ctx.textAlign = 'center';
        
        // 根据画布尺寸和像素字体选项调整字体大小
        const pixelFontMode = this.options.pixelFont;
        const titleSize = pixelFontMode ? 14 : 16;
        const scoreSize = pixelFontMode ? 10 : 12;
        const spacing = pixelFontMode ? 45 : 30;
        
        // 添加文字阴影，增强可读性
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        this.ctx.shadowBlur = 3;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        // 添加扫描线效果
        this.addScanLineEffect();
        
        // 绘制游戏结束标题，使用英文
        this.ctx.font = `${titleSize}px "Press Start 2P", monospace`;
        this.ctx.fillText('GAME OVER', this.options.gameOverPosition.x, this.options.gameOverPosition.y - spacing);
        
        // 绘制最终分数，使用英文
        this.ctx.font = `${scoreSize}px "Press Start 2P", monospace`;
        this.ctx.fillText(`FINAL SCORE: ${score}`, this.options.gameOverPosition.x, this.options.gameOverPosition.y + 5);
        
        // 重置阴影效果
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }
    
    // 添加扫描线效果，增强复古游戏机感觉
    addScanLineEffect() {
        const width = this.boardWidth * this.options.gridSize;
        const height = this.boardHeight * this.options.gridSize;
        
        // 创建扫描线效果
        const scanlineHeight = 2; // 扫描线高度
        const scanlineSpacing = 4; // 扫描线间隔
        
        // 绘制多条细线
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        for (let y = 0; y < height; y += scanlineSpacing) {
            this.ctx.fillRect(0, y, width, scanlineHeight);
        }
    }
    
    render(gameState) {
        this.clear();
        
        // 添加全局扫描线效果
        if (this.options.pixelFont) {
            this.addScanLineEffect();
        }
        
        if (gameState.snake && gameState.snake.length) {
            this.drawSnake(gameState.snake);
        }
        
        if (gameState.food) {
            this.drawFood(gameState.food);
        }
        
        // 不再在画布上绘制分数，使用外部HTML元素显示分数
        // this.drawScore(gameState.score);
        
        if (gameState.gameOver) {
            this.drawGameOver(gameState.score);
        }
    }
    
    // 辅助方法 - 绘制圆角矩形
    roundRect(x, y, width, height, radius = 5, fill = true, stroke = false) {
        if (typeof radius === 'number') {
            radius = {tl: radius, tr: radius, br: radius, bl: radius};
        }
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius.tl, y);
        this.ctx.lineTo(x + width - radius.tr, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
        this.ctx.lineTo(x + width, y + height - radius.br);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
        this.ctx.lineTo(x + radius.bl, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
        this.ctx.lineTo(x, y + radius.tl);
        this.ctx.quadraticCurveTo(x, y, x + radius.tl, y);
        this.ctx.closePath();
        
        if (fill) {
            this.ctx.fill();
        }
        
        if (stroke) {
            this.ctx.stroke();
        }
    }
    
    // 辅助方法 - hex转rgb
    hexToRgb(hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : {r: 0, g: 0, b: 0};
    }
    
    // 获取实际游戏区域大小（网格数）
    getBoardSize() {
        return {
            width: this.boardWidth,
            height: this.boardHeight
        };
    }
}

export default SnakeRenderer; 