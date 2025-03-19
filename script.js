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
        'SOUL': 0,
        'MEE': 0
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
    
    // 添加主题切换功能
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        // 默认主题
        let isDarkTheme = true; // true表示普通深色，false表示超深色
        
        // 检查本地存储中的主题偏好
        const savedTheme = localStorage.getItem('ccllDanceTheme');
        if (savedTheme === 'super-dark') {
            isDarkTheme = false;
            document.body.classList.add('super-dark-theme');
            const themeIcon = themeToggleBtn.querySelector('i');
            if (themeIcon) {
                themeIcon.className = 'bi bi-stars';
            }
        }
        
        // 主题切换事件
        themeToggleBtn.addEventListener('click', function() {
            isDarkTheme = !isDarkTheme;
            
            // 更换图标
            const themeIcon = this.querySelector('i');
            if (themeIcon) {
                if (isDarkTheme) {
                    themeIcon.className = 'bi bi-moon-stars';
                } else {
                    themeIcon.className = 'bi bi-stars';
                }
            }
            
            // 切换主题类
            if (isDarkTheme) {
                document.body.classList.remove('super-dark-theme');
                localStorage.setItem('ccllDanceTheme', 'dark');
                document.querySelector('meta[name="theme-color"]').setAttribute('content', '#070720');
            } else {
                document.body.classList.add('super-dark-theme');
                localStorage.setItem('ccllDanceTheme', 'super-dark');
                document.querySelector('meta[name="theme-color"]').setAttribute('content', '#030310');
            }
            
            // 添加旋转动画
            this.classList.add('rotating');
            setTimeout(() => {
                this.classList.remove('rotating');
            }, 500);
        });
    }
    
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

            // 添加导航切换动画效果
            addRippleEffect(e);
        });
    });
    
    // 视频播放功能
    const videoRows = document.querySelectorAll('.video-row');
    const videoPlayer = document.getElementById('videoPlayer');
    
    // 从localStorage获取保存的视频播放进度数据
    let videoProgressData = JSON.parse(localStorage.getItem('videoProgressData') || '{}');
    
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
            return;
        }
        
        const data = {
            method: action
        };
        
        if (value !== undefined) {
            data.value = value;
        }
        
        const message = JSON.stringify(data);
        
        try {
            iframe.contentWindow.postMessage(message, '*');
        } catch (error) {
            console.error('postMessage发送失败:', error);
        }
    }
    
    // 安装视频播放监控
    function setupVideoMonitoring() {
        // 清除之前的监控定时器
        if (saveIntervalId) {
            clearInterval(saveIntervalId);
            saveIntervalId = null;
        }
        
        // 如果当前没有视频，则直接返回
        if (!currentVideoData.iframe || !currentVideoData.id) {
            return;
        }
        
        // 定期请求当前播放位置并保存
        saveIntervalId = setInterval(() => {
            postMessageToVimeo(currentVideoData.iframe, 'getCurrentTime');
        }, SAVE_INTERVAL);
    }
    
    // 保存视频进度
    function saveVideoProgress(videoId, seconds) {
        if (!videoId || typeof seconds !== 'number') {
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
        } catch (error) {
            console.error('保存进度失败:', error);
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
                    // 暂停时也保存一次进度
                    postMessageToVimeo(currentVideoData.iframe, 'getCurrentTime');
                }
                
                // 处理视频播放事件
                else if (data.event === 'play') {
                    currentVideoData.isPlaying = true;
                }
                
                // 视频加载完成事件
                else if (data.event === 'ready') {
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
                        
                        // 向iframe发送seek命令
                        postMessageToVimeo(currentVideoData.iframe, 'setCurrentTime', seekTime);
                        
                        // 设置自动播放
                        setTimeout(() => {
                            postMessageToVimeo(currentVideoData.iframe, 'play');
                        }, 500);
                    } else {
                        // 直接播放
                        setTimeout(() => {
                            postMessageToVimeo(currentVideoData.iframe, 'play');
                        }, 500);
                    }
                }
            }
        } catch (error) {
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
            ? `${videoUrl}&autoplay=1&muted=0&playsinline=1` 
            : `${videoUrl}?autoplay=1&muted=0&playsinline=1`;

        // 更新视频播放器
        videoPlayer.innerHTML = `<iframe src="${autoplayUrl}" allowfullscreen allow="autoplay; fullscreen; picture-in-picture" playsinline></iframe>`;
        
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
    function addRippleEffect(event) {
        const target = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = target.getBoundingClientRect();
        
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple');
        
        // 移除已有波纹
        const existingRipple = target.querySelector('.ripple');
        if (existingRipple) {
            existingRipple.remove();
        }
        
        target.appendChild(ripple);
        
        // 动画结束后移除
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // 为可点击元素添加波纹效果
    document.querySelectorAll('.nav-link, .lesson-header, .episode-item, #themeToggleBtn').forEach(el => {
        el.addEventListener('click', addRippleEffect);
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
            
            // 增强移动设备上的视频自动播放支持
            const enhanceMobileAutoplay = () => {
                const iframe = document.querySelector('#videoPlayer iframe');
                if (iframe && iframe.contentWindow) {
                    // 尝试通过触发用户交互后自动播放
                    document.addEventListener('touchstart', function autoplayHandler() {
                        // 尝试发送播放命令
                        try {
                            postMessageToVimeo(iframe, 'play');
                        } catch (e) {
                            console.log('Mobile autoplay attempt:', e);
                        }
                        // 只执行一次
                        document.removeEventListener('touchstart', autoplayHandler);
                    }, { once: true });
                }
            };
            
            // 视频加载后尝试增强自动播放
            document.addEventListener('click', function() {
                setTimeout(enhanceMobileAutoplay, 1000);
            }, { passive: true });
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
            postMessageToVimeo(currentVideoData.iframe, 'getCurrentTime');
        }
    });
    
    // 更新粒子效果配置 - 根据主题调整
    function initParticles() {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": document.body.classList.contains('super-dark-theme') 
                        ? ["#6200b3", "#ca0046", "#0099cc", "#006633"]
                        : ["#9d19ff", "#ff2a6a", "#00e5ff", "#00ff8f"]
                },
                "shape": {
                    "type": ["circle", "triangle", "polygon"],
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 6
                    }
                },
                "opacity": {
                    "value": document.body.classList.contains('super-dark-theme') ? 0.15 : 0.2,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 0.5,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 1,
                        "size_min": 0.5,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": document.body.classList.contains('super-dark-theme') ? "#6200b3" : "#9d19ff",
                    "opacity": document.body.classList.contains('super-dark-theme') ? 0.12 : 0.15,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 1.2,
                    "direction": "none",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": true,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "bubble"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 0.4
                        }
                    },
                    "bubble": {
                        "distance": 150,
                        "size": 4,
                        "duration": 2,
                        "opacity": 0.7,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 80,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    }
    
    // 初始化粒子效果
    initParticles();
    
    // 主题切换时更新粒子效果
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            // 给粒子效果一点时间过渡
            setTimeout(() => {
                // 重新初始化粒子效果
                initParticles();
            }, 300);
        });
    }
});