/**
 * snake.js - 贪吃蛇游戏核心逻辑
 */

class Snake {
    constructor(config) {
        this.config = Object.assign({
            gridSize: 16, // 增加网格大小提高精度
            initialSpeed: 85,
            speedIncrement: 2.5, // 调整加速度，使游戏难度曲线更平滑
            minSpeed: 45, // 调整最小速度，避免过快导致失控
            initialSnakeLength: 3,
            boardWidth: 30,
            boardHeight: 30,
            onScore: () => {},
            onGameOver: () => {}
        }, config);
        
        this.snake = [];
        this.food = null;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.speed = this.config.initialSpeed;
        this.gameOver = false;
        this.score = 0;
        this.gameLoopTimeout = null;
        this.lastUpdateTime = 0; // 用于精确控制帧率
        this.lastMoveTime = 0; // 用于防止快速连续移动
        this.moveDelay = 40; // 减少移动延迟，提高响应性
        this.directionQueue = []; // 方向队列，提高响应性
        
        this.initializeSnake();
        this.createFood();
    }
    
    initializeSnake() {
        // 从中心位置开始，更合理的起点位置
        const centerX = Math.floor(this.config.boardWidth / 3);
        const centerY = Math.floor(this.config.boardHeight / 2);
        
        this.snake = [];
        for (let i = 0; i < this.config.initialSnakeLength; i++) {
            this.snake.push({
                x: centerX - i, // 逆序添加，蛇头在左侧，准备向右移动
                y: centerY
            });
        }
    }
    
    createFood() {
        // 生成新的食物位置，但不要与蛇身重叠
        let validPosition = false;
        let foodPosition;
        let attempts = 0;
        const maxAttempts = 100; // 防止无限循环
        
        while (!validPosition && attempts < maxAttempts) {
            attempts++;
            foodPosition = {
                x: Math.floor(Math.random() * this.config.boardWidth),
                y: Math.floor(Math.random() * this.config.boardHeight)
            };
            
            // 避免食物出现在太靠边的位置
            if (foodPosition.x < 1 || foodPosition.x >= this.config.boardWidth - 1 ||
                foodPosition.y < 1 || foodPosition.y >= this.config.boardHeight - 1) {
                continue;
            }
            
            validPosition = true;
            
            // 检查是否与蛇身重叠
            for (let i = 0; i < this.snake.length; i++) {
                if (this.snake[i].x === foodPosition.x && this.snake[i].y === foodPosition.y) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        this.food = foodPosition;
    }
    
    setDirection(newDirection) {
        // 防止直接掉头
        if ((this.direction === 'up' && newDirection === 'down') ||
            (this.direction === 'down' && newDirection === 'up') ||
            (this.direction === 'left' && newDirection === 'right') ||
            (this.direction === 'right' && newDirection === 'left')) {
            return;
        }
        
        // 防止快速连续移动导致的自撞
        const now = performance.now();
        
        // 将新方向添加到队列
        if (this.directionQueue.length < 2) { // 限制队列长度为2，防止过多输入积压
            this.directionQueue.push({
                direction: newDirection,
                time: now
            });
        }
        
        this.lastMoveTime = now;
    }
    
    moveSnake() {
        if (this.gameOver) return;
        
        // 处理方向队列
        if (this.directionQueue.length > 0) {
            const nextMove = this.directionQueue[0];
            // 只有当距离上次移动有足够时间时才处理
            if (performance.now() - nextMove.time >= this.moveDelay) {
                this.nextDirection = nextMove.direction;
                this.directionQueue.shift();
            }
        }
        
        // 更新方向
        this.direction = this.nextDirection;
        
        // 获取蛇头位置
        const head = Object.assign({}, this.snake[0]);
        
        // 根据方向更新蛇头位置
        switch (this.direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        
        // 检查是否撞墙
        if (head.x < 0 || head.x >= this.config.boardWidth || 
            head.y < 0 || head.y >= this.config.boardHeight) {
            this.gameOver = true;
            this.config.onGameOver(this.score);
            return;
        }
        
        // 检查是否碰到自己的身体（从第二个身体部分开始检查，因为头部会移出原位置）
        for (let i = 1; i < this.snake.length; i++) {
            if (this.snake[i].x === head.x && this.snake[i].y === head.y) {
                this.gameOver = true;
                this.config.onGameOver(this.score);
                return;
            }
        }
        
        // 将新的头部添加到蛇身
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            // 增加分数
            this.score += 1;
            // 调用分数回调
            this.config.onScore(this.score);
            // 加快速度（平滑加速）
            this.speed = Math.max(this.config.minSpeed, this.speed - this.config.speedIncrement);
            // 创建新的食物
            this.createFood();
        } else {
            // 移除尾部
            this.snake.pop();
        }
    }
    
    gameLoop() {
        // 获取当前时间
        const now = performance.now();
        const elapsed = now - this.lastUpdateTime;
        
        // 如果经过了足够的时间才更新
        if (elapsed >= this.speed) {
            this.moveSnake();
            this.lastUpdateTime = now;
        }
        
        if (!this.gameOver) {
            // 使用requestAnimationFrame代替setTimeout，提供更流畅的动画
            this.gameLoopTimeout = requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    start() {
        if (this.gameLoopTimeout) {
            cancelAnimationFrame(this.gameLoopTimeout);
            this.gameLoopTimeout = null;
        }
        
        this.snake = [];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.speed = this.config.initialSpeed;
        this.gameOver = false;
        this.score = 0;
        this.lastUpdateTime = performance.now();
        this.lastMoveTime = 0;
        this.directionQueue = [];
        
        this.initializeSnake();
        this.createFood();
        this.gameLoop();
        
        return this;
    }
    
    pause() {
        if (this.gameLoopTimeout) {
            cancelAnimationFrame(this.gameLoopTimeout);
            this.gameLoopTimeout = null;
        }
        return this;
    }
    
    resume() {
        if (!this.gameLoopTimeout && !this.gameOver) {
            this.lastUpdateTime = performance.now();
            this.gameLoop();
        }
        return this;
    }
    
    getState() {
        return {
            snake: [...this.snake],
            food: Object.assign({}, this.food),
            score: this.score,
            gameOver: this.gameOver
        };
    }
}

export default Snake; 