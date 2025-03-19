document.addEventListener('DOMContentLoaded', function() {
    // 导航切换功能
    const navLinks = document.querySelectorAll('.nav-link');
    const courseContainers = document.querySelectorAll('.course-container');
    const courseLinkBtn = document.getElementById('courseLinkBtn');
    
    // 移动设备检测
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // 根据设备类型应用不同样式
    if (isMobile) {
        document.body.classList.add('mobile-device');
    }
    
    // 存储每个列表的滚动位置
    const scrollPositions = {
        'CHTTO': 0,
        'HIPHOP': 0,
        'SOUL': 0
    };
    
    // 当前活动的课程类型
    let activeCategory = 'CHTTO';
    
    // 初始化展开所有课程列表
    const episodeLists = document.querySelectorAll('.episode-list');
    episodeLists.forEach(list => {
        list.classList.add('show');
    });
    
    // 为所有课程标题添加展开状态
    const lessonHeaders = document.querySelectorAll('.lesson-header');
    lessonHeaders.forEach(header => {
        header.classList.add('expanded');
    });
    
    // 导航点击处理
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            
            // 保存当前滚动位置
            const currentList = document.getElementById(`${activeCategory}-list`);
            if (currentList) {
                scrollPositions[activeCategory] = currentList.scrollTop;
            }
            
            // 更新导航活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应课程内容
            courseContainers.forEach(container => {
                container.classList.remove('active');
                if (container.id === targetId) {
                    container.classList.add('active');
                    
                    // 记录当前活动的课程类型
                    activeCategory = targetId;
                    
                    // 恢复滚动位置
                    const targetList = document.getElementById(`${targetId}-list`);
                    if (targetList) {
                        setTimeout(() => {
                            targetList.scrollTop = scrollPositions[targetId];
                        }, 10);
                    }
                }
            });
        });
    });
    
    // 视频播放功能
    const videoRows = document.querySelectorAll('.video-row');
    const videoPlayer = document.getElementById('videoPlayer');
    
    // 显示调试面板和调试信息
    const debugMode = true; // 设置为true开启调试
    
    // 创建调试面板
    if (debugMode) {
        // 创建调试面板容器
        const debugPanel = document.createElement('div');
        debugPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            background-color: rgba(0,0,0,0.85);
            color: #00ff00;
            padding: 15px;
            border-radius: 5px;
            z-index: 9999999;
            max-height: 300px;
            overflow-y: auto;
            font-size: 14px;
            font-family: monospace;
            white-space: pre;
            border: 2px solid #00ff00;
            display: block !important;
            pointer-events: auto;
        `;
        debugPanel.id = 'debug-panel';
        
        // 创建标题
        const title = document.createElement('div');
        title.style.cssText = `
            border-bottom: 1px solid #00ff00;
            margin-bottom: 10px;
            padding-bottom: 5px;
            font-size: 16px;
            font-weight: bold;
        `;
        title.innerText = '视频播放调试信息 (DEBUG PANEL)';
        debugPanel.appendChild(title);
        
        // 创建内容区域
        const content = document.createElement('div');
        content.id = 'debug-content';
        content.style.cssText = `
            margin-bottom: 10px;
            max-height: 200px;
            overflow-y: auto;
        `;
        debugPanel.appendChild(content);
        
        // 创建按钮容器
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            margin-top: 15px;
            display: flex;
            justify-content: space-between;
            gap: 10px;
        `;
        
        // 创建按钮样式
        const buttonStyle = `
            padding: 5px 10px;
            background: #333;
            color: #fff;
            border: 1px solid #00ff00;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `;
        
        // 清除按钮
        const clearBtn = document.createElement('button');
        clearBtn.style.cssText = buttonStyle;
        clearBtn.innerText = '清除存储';
        clearBtn.onclick = function() {
            localStorage.removeItem('videoProgressData');
            localStorage.removeItem('lastVideoId');
            logDebug('已清除所有存储的视频进度数据');
        };
        
        // 显示存储按钮
        const showBtn = document.createElement('button');
        showBtn.style.cssText = buttonStyle;
        showBtn.innerText = '显示存储';
        showBtn.onclick = function() {
            const data = JSON.parse(localStorage.getItem('videoProgressData') || '{}');
            const lastId = localStorage.getItem('lastVideoId') || 'none';
            logDebug(`最后播放视频: ${lastId}\n存储数据: ${JSON.stringify(data, null, 2)}`);
        };
        
        // 调试数据按钮
        const initialDataBtn = document.createElement('button');
        initialDataBtn.style.cssText = buttonStyle;
        initialDataBtn.innerText = '调试数据';
        initialDataBtn.onclick = function() {
            const data = JSON.parse(localStorage.getItem('videoProgressData') || '{}');
            const lastId = localStorage.getItem('lastVideoId') || 'none';
            const storageInfo = `最后播放视频: ${lastId}\n存储数据: ${JSON.stringify(data, null, 2)}`;
            
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(0,0,0,0.9);
                color: #00ff00;
                padding: 20px;
                border-radius: 5px;
                z-index: 1000000;
                max-width: 80%;
                max-height: 80%;
                overflow-y: auto;
                border: 2px solid #00ff00;
            `;
            
            const closeBtn = document.createElement('button');
            closeBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 5px 10px;
                background: #333;
                color: #fff;
                border: 1px solid #00ff00;
                border-radius: 4px;
                cursor: pointer;
            `;
            closeBtn.innerText = '关闭';
            closeBtn.onclick = function() {
                document.body.removeChild(modal);
            };
            
            const content = document.createElement('pre');
            content.style.cssText = `
                margin: 20px 0;
                white-space: pre-wrap;
                word-wrap: break-word;
            `;
            content.innerText = storageInfo;
            
            modal.appendChild(closeBtn);
            modal.appendChild(content);
            document.body.appendChild(modal);
        };
        
        buttonContainer.appendChild(clearBtn);
        buttonContainer.appendChild(showBtn);
        buttonContainer.appendChild(initialDataBtn);
        debugPanel.appendChild(buttonContainer);
        
        // 添加到页面
        document.body.appendChild(debugPanel);
        
        // 立即显示初始调试信息
        logDebug('调试面板已初始化');
        
        // 显示当前存储的数据
        const data = JSON.parse(localStorage.getItem('videoProgressData') || '{}');
        const lastId = localStorage.getItem('lastVideoId') || 'none';
        logDebug(`当前存储数据:\n最后播放视频: ${lastId}\n存储数据: ${JSON.stringify(data, null, 2)}`);
    }
    
    // 调试日志函数
    function logDebug(message) {
        if (!debugMode) return;
        
        console.log(`[视频调试] ${message}`);
        
        const debugContent = document.getElementById('debug-content');
        if (debugContent) {
            const timestamp = new Date().toLocaleTimeString();
            const logEntry = document.createElement('div');
            logEntry.style.cssText = `
                margin-bottom: 5px;
                padding: 3px;
                border-bottom: 1px solid rgba(0,255,0,0.2);
            `;
            logEntry.innerText = `[${timestamp}] ${message}`;
            
            // 在开头插入新日志
            debugContent.insertBefore(logEntry, debugContent.firstChild);
            
            // 保持日志不超过10条
            while (debugContent.children.length > 10) {
                debugContent.removeChild(debugContent.lastChild);
            }
        }
    }
    
    // 从localStorage获取保存的视频播放进度数据
    let videoProgressData = JSON.parse(localStorage.getItem('videoProgressData') || '{}');
    logDebug(`加载存储的视频数据: ${JSON.stringify(videoProgressData, null, 2)}`);
    
    // 当前播放的视频信息
    let currentVideoData = {
        id: '',
        url: '',
        iframe: null,
        isPlaying: false
    };
    
    // 每隔一段时间保存当前视频播放位置
    const SAVE_INTERVAL = 3000; // 3秒保存一次
    let saveIntervalId = null;
    
    // 使用postMessage与iframe进行通信
    function postMessageToVimeo(iframe, action, value) {
        if (!iframe || !iframe.contentWindow) {
            logDebug(`postMessage失败: iframe不存在或无法访问`);
            return;
        }
        
        const data = {
            method: action
        };
        
        if (value !== undefined) {
            data.value = value;
        }
        
        const message = JSON.stringify(data);
        logDebug(`发送到Vimeo: ${message}`);
        
        try {
            iframe.contentWindow.postMessage(message, '*');
        } catch (error) {
            logDebug(`postMessage发送失败: ${error.message}`);
        }
    }
    
    // 安装视频播放监控
    function setupVideoMonitoring() {
        // 清除之前的监控定时器
        if (saveIntervalId) {
            clearInterval(saveIntervalId);
            saveIntervalId = null;
            logDebug('清除了之前的视频时间监控');
        }
        
        // 如果当前没有视频，则直接返回
        if (!currentVideoData.iframe || !currentVideoData.id) {
            logDebug('没有当前视频，无法设置监控');
            return;
        }
        
        logDebug(`开始监控视频 ${currentVideoData.id} 的播放时间`);
        
        // 定期请求当前播放位置并保存
        saveIntervalId = setInterval(() => {
            postMessageToVimeo(currentVideoData.iframe, 'getCurrentTime');
        }, SAVE_INTERVAL);
    }
    
    // 保存视频进度
    function saveVideoProgress(videoId, seconds) {
        if (!videoId || typeof seconds !== 'number') {
            logDebug(`无法保存进度: videoId=${videoId}, seconds=${seconds}`);
            return;
        }
        
        try {
            // 保存当前视频ID和播放时间
            videoProgressData[videoId] = {
                time: seconds,
                lastUpdated: Date.now(),
                url: currentVideoData.url // 保存视频URL以便恢复
            };
            
            // 存入localStorage
            localStorage.setItem('videoProgressData', JSON.stringify(videoProgressData));
            localStorage.setItem('lastVideoId', videoId);
            
            logDebug(`保存视频进度: ${videoId} 在 ${seconds.toFixed(2)} 秒`);
        } catch (error) {
            logDebug(`保存进度失败: ${error.message}`);
        }
    }
    
    // 监听iframe消息以接收视频播放进度
    window.addEventListener('message', function(event) {
        // 来自任何域的消息都处理，以确保能接收到Vimeo的消息
        try {
            // 尝试解析消息数据
            let data;
            if (typeof event.data === 'string') {
                try {
                    data = JSON.parse(event.data);
                } catch (e) {
                    // 如果不是JSON格式，直接使用原始数据
                    data = event.data;
                }
            } else {
                data = event.data;
            }
            
            // 记录所有接收到的消息，方便调试
            console.log('收到消息:', event.origin, data);
            logDebug(`收到消息: ${event.origin}, 数据: ${JSON.stringify(data)}`);
            
            // 处理各种消息类型
            if (data) {
                // 处理获取当前时间的响应
                if (data.method === 'getCurrentTime' && typeof data.value === 'number') {
                    saveVideoProgress(currentVideoData.id, data.value);
                }
                
                // 处理播放进度事件
                else if (data.event === 'playProgress' && data.data && typeof data.data.seconds === 'number') {
                    saveVideoProgress(currentVideoData.id, data.data.seconds);
                }
                
                // 处理视频暂停事件
                else if (data.event === 'pause') {
                    currentVideoData.isPlaying = false;
                    logDebug('视频已暂停');
                    // 暂停时也保存一次进度
                    postMessageToVimeo(currentVideoData.iframe, 'getCurrentTime');
                }
                
                // 处理视频播放事件
                else if (data.event === 'play') {
                    currentVideoData.isPlaying = true;
                    logDebug('视频开始播放');
                }
                
                // 视频加载完成事件
                else if (data.event === 'ready') {
                    logDebug('视频准备就绪');
                    
                    // 获取视频总时长
                    postMessageToVimeo(currentVideoData.iframe, 'getDuration');
                    
                    // 添加事件监听
                    postMessageToVimeo(currentVideoData.iframe, 'addEventListener', 'playProgress');
                    postMessageToVimeo(currentVideoData.iframe, 'addEventListener', 'pause');
                    postMessageToVimeo(currentVideoData.iframe, 'addEventListener', 'play');
                    postMessageToVimeo(currentVideoData.iframe, 'addEventListener', 'loaded');
                    
                    // 如果有保存的播放位置，则设置
                    if (currentVideoData.id && videoProgressData[currentVideoData.id] && 
                        typeof videoProgressData[currentVideoData.id].time === 'number') {
                        
                        const seekTime = videoProgressData[currentVideoData.id].time;
                        logDebug(`恢复到保存的时间点: ${seekTime.toFixed(2)}秒`);
                        
                        // 向iframe发送seek命令
                        postMessageToVimeo(currentVideoData.iframe, 'setCurrentTime', seekTime);
                        
                        // 设置自动播放
                        setTimeout(() => {
                            postMessageToVimeo(currentVideoData.iframe, 'play');
                        }, 500);
                    } else {
                        logDebug(`没有找到视频 ${currentVideoData.id} 的保存进度`);
                        // 直接播放
                        setTimeout(() => {
                            postMessageToVimeo(currentVideoData.iframe, 'play');
                        }, 500);
                    }
                }
            }
        } catch (error) {
            logDebug(`处理消息出错: ${error.message}`);
            console.error('处理消息出错:', error);
        }
    });
    
    // 加载新视频
    function loadNewVideo(videoId, videoUrl, courseLink) {
        // 保存当前视频进度
        const currentIframe = videoPlayer.querySelector('iframe');
        if (currentIframe) {
            postMessageToVimeo(currentIframe, 'getCurrentTime', null);
        }

        // 高亮选中行
        videoRows.forEach(r => r.classList.remove('selected'));
        const selectedRow = document.querySelector(`[data-video-url="${videoUrl}"]`);
        if (selectedRow) {
            selectedRow.classList.add('selected');
        }

        // 添加自动播放参数
        const autoplayUrl = videoUrl.includes('?') 
            ? `${videoUrl}&autoplay=1&muted=0` 
            : `${videoUrl}?autoplay=1&muted=0`;

        // 更新视频播放器
        videoPlayer.innerHTML = `<iframe src="${autoplayUrl}" allowfullscreen allow="autoplay"></iframe>`;
        
        // 更新课程链接按钮
        if (courseLink) {
            courseLinkBtn.href = courseLink;
            courseLinkBtn.style.display = 'block';
        } else {
            courseLinkBtn.style.display = 'none';
        }

        // 保存最后播放的视频ID
        localStorage.setItem('lastVideoId', videoId);

        // 设置新iframe加载完成后的处理
        const newIframe = videoPlayer.querySelector('iframe');
        if (newIframe) {
            newIframe.onload = function() {
                this.classList.add('loaded');
                
                // 恢复之前保存的进度
                const savedProgress = JSON.parse(localStorage.getItem('videoProgressData') || '{}');
                if (savedProgress[videoId]) {
                    setTimeout(() => {
                        postMessageToVimeo(newIframe, 'seekTo', savedProgress[videoId]);
                        logDebug(`恢复视频 ${videoId} 的进度: ${savedProgress[videoId]}秒`);
                    }, 1000); // 等待1秒确保视频已加载
                }
            };
        }

        // 设置视频进度监控
        setupVideoMonitoring();
    }
    
    // 恢复上一个播放的视频
    function restorePreviousVideo() {
        const lastVideoId = localStorage.getItem('lastVideoId');
        if (!lastVideoId) return;

        // 查找对应的视频行
        const videoRow = document.querySelector(`[data-video-url*="${lastVideoId}"]`);
        if (!videoRow) return;

        // 获取视频信息
        const videoUrl = videoRow.getAttribute('data-video-url');
        const courseLink = videoRow.getAttribute('data-course-link');

        // 加载视频
        loadNewVideo(lastVideoId, videoUrl, courseLink);
    }
    
    // 定期备份视频进度
    function startBackupProgress() {
        setInterval(() => {
            const iframe = videoPlayer.querySelector('iframe');
            if (iframe) {
                postMessageToVimeo(iframe, 'getCurrentTime', null);
            }
        }, 30000); // 每30秒备份一次
    }
    
    // 初始化视频播放功能
    function initializeVideoPlayer() {
        // 为所有视频行添加点击事件
        videoRows.forEach(row => {
            row.addEventListener('click', function() {
                const videoUrl = this.getAttribute('data-video-url');
                const courseLink = this.getAttribute('data-course-link');
                const videoId = videoUrl.match(/video\/(\d+)/)?.[1];

                if (videoId && videoUrl) {
                    loadNewVideo(videoId, videoUrl, courseLink);
                }
            });
        });

        // 启动进度备份
        startBackupProgress();

        // 尝试恢复上一个视频
        restorePreviousVideo();
    }
    
    // 课程一级标题点击展开/折叠功能
    lessonHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const episodeList = this.nextElementSibling;
            if (episodeList) {
                if (episodeList.classList.contains('show')) {
                    episodeList.classList.remove('show');
                    this.classList.remove('expanded');
                } else {
                    episodeList.classList.add('show');
                    this.classList.add('expanded');
                }
                
                // 保存滚动位置
                scrollPositions[activeCategory] = document.getElementById(`${activeCategory}-list`).scrollTop;
            }
        });
    });
    
    // 添加波纹点击效果
    function createRipple(event) {
        const button = event.currentTarget;
        
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        
        const rect = button.getBoundingClientRect();
        
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = button.getElementsByClassName('ripple')[0];
        
        if (ripple) {
            ripple.remove();
        }
        
        button.appendChild(circle);
    }
    
    const buttons = document.querySelectorAll('.nav-link, .lesson-header, .episode-item');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
    
    // 页面加载时恢复记忆的滚动位置
    const initialList = document.getElementById('CHTTO-list');
    if (initialList) {
        initialList.scrollTop = scrollPositions['CHTTO'];
    }
    
    // 初始化视频播放功能
    initializeVideoPlayer();
    
    // 添加触摸事件支持
    function addTouchSupport() {
        // 为课程标题添加触摸事件
        const lessonHeaders = document.querySelectorAll('.lesson-header');
        lessonHeaders.forEach(header => {
            header.addEventListener('touchstart', function(e) {
                // 阻止默认行为，防止滚动
                e.preventDefault();
                this.click();
            }, { passive: false });
        });
        
        // 为视频项添加触摸事件
        const episodeItems = document.querySelectorAll('.episode-item');
        episodeItems.forEach(item => {
            item.addEventListener('touchstart', function(e) {
                // 阻止默认行为，防止滚动
                e.preventDefault();
                this.click();
            }, { passive: false });
        });
        
        // 为导航链接添加触摸事件
        navLinks.forEach(link => {
            link.addEventListener('touchstart', function(e) {
                // 阻止默认行为，防止滚动
                e.preventDefault();
                this.click();
            }, { passive: false });
        });
    }
    
    // 调整移动设备上的视频播放器大小
    function adjustVideoPlayerForMobile() {
        if (isMobile) {
            const videoPlayer = document.getElementById('videoPlayer');
            const resizeVideoPlayer = () => {
                // 横屏模式下调整视频大小
                if (window.innerWidth > window.innerHeight) {
                    videoPlayer.style.height = '100%';
                } else {
                    videoPlayer.style.height = '50vh';
                }
            };
            
            // 初始调整和屏幕旋转时调整
            resizeVideoPlayer();
            window.addEventListener('resize', resizeVideoPlayer);
            window.addEventListener('orientationchange', resizeVideoPlayer);
        }
    }
    
    // 初始化移动设备支持
    function initMobileSupport() {
        if (isMobile) {
            addTouchSupport();
            adjustVideoPlayerForMobile();
        }
    }
    
    // 在页面加载后初始化移动设备支持
    window.addEventListener('load', function() {
        initMobileSupport();
        
        // 延迟一点时间确保所有内容都已加载
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 800);
    });
    
    // 页面关闭或刷新前保存当前视频播放状态
    window.addEventListener('beforeunload', function() {
        // 在页面关闭前保存视频进度
        if (currentVideoData.id && currentVideoData.iframe) {
            logDebug('页面关闭前保存视频进度');
            postMessageToVimeo(currentVideoData.iframe, 'getCurrentTime');
        }
    });
}); 

document.addEventListener('DOMContentLoaded', function() {
    fetch('courses.json')
        .then(response => response.json())
        .then(courseData => {
            generateCourseHTML(courseData);
        })
        .catch(error => console.error('Error loading course data:', error));
});