/**
 * animations.js - 简化版
 * 必要的动画效果
 */

document.addEventListener('DOMContentLoaded', function() {
    // 仅初始化必要的动画效果
    initVideoModeToggle();
});

/**
 * 初始化视频模式切换逻辑
 */
function initVideoModeToggle() {
    const videoModeBtn = document.getElementById('videoModeBtn');
    const videoPlayer = document.getElementById('videoPlayer');
    
    if (!videoModeBtn || !videoPlayer) return;
    
    // 添加视频消息元素（如果不存在）
    if (!videoPlayer.querySelector('.video-message')) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'video-message';
        messageDiv.innerHTML = `
            <i class="bi bi-play-circle"></i>
            <p>选择课程视频开始播放</p>
        `;
        videoPlayer.appendChild(messageDiv);
    }
    
    // 监听列表项点击，切换到视频模式
    document.querySelectorAll('.episode-item, .video-row').forEach(item => {
        item.addEventListener('click', function() {
            // 只有在视频加载时才切换视频模式
            const videoUrl = this.getAttribute('data-video-url');
            if (videoUrl && window.danceBirdGame) {
                // 如果游戏正在运行，切换到视频模式
                if (!window.danceBirdGame.isVideoMode) {
                    window.danceBirdGame.toggleVideoMode();
                }
            }
        });
    });
}
