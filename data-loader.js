// 舞蹈课程数据加载器
document.addEventListener('DOMContentLoaded', function() {
    // 存储课程数据的对象
    const courseData = {
        CHTTO: [],
        HIPHOP: [],
        SOUL: [],
        MEE: []
    };

    // 定义要加载的JSON文件路径
    const jsonFiles = {
        CHTTO: [
            'data/chtto-courses.json',
            'data/chtto-courses-2.json',
            'data/chtto-courses-3.json',
            'data/chtto-courses-4.json',
            'data/chtto-courses-5.json',
            'data/chtto-courses-6.json'
        ],
        HIPHOP: [
            'data/hiphop-courses.json',
            'data/hiphop-courses-2.json'
        ],
        SOUL: [
            'data/soul-courses.json'
        ],
        MEE: [
            'data/mee-courses-1.json',
            'data/mee-courses-2.json'
        ]
    };

    // 加载所有JSON文件的函数
    async function loadAllData() {
        try {
            // 加载CHTTO课程数据
            for (const file of jsonFiles.CHTTO) {
                const response = await fetch(file);
                if (!response.ok) {
                    throw new Error(`加载文件 ${file} 失败: ${response.status}`);
                }
                const data = await response.json();
                courseData.CHTTO = courseData.CHTTO.concat(data);
            }

            // 加载HIPHOP课程数据
            for (const file of jsonFiles.HIPHOP) {
                const response = await fetch(file);
                if (!response.ok) {
                    throw new Error(`加载文件 ${file} 失败: ${response.status}`);
                }
                const data = await response.json();
                courseData.HIPHOP = courseData.HIPHOP.concat(data);
            }

            // 加载SOUL课程数据
            for (const file of jsonFiles.SOUL) {
                const response = await fetch(file);
                if (!response.ok) {
                    throw new Error(`加载文件 ${file} 失败: ${response.status}`);
                }
                const data = await response.json();
                courseData.SOUL = courseData.SOUL.concat(data);
            }
            
            // 加载MEE课程数据
            for (const file of jsonFiles.MEE) {
                const response = await fetch(file);
                if (!response.ok) {
                    throw new Error(`加载文件 ${file} 失败: ${response.status}`);
                }
                const data = await response.json();
                courseData.MEE = courseData.MEE.concat(data);
            }

            // 按课程顺序排序
            courseData.CHTTO.sort((a, b) => a.lessonNumber - b.lessonNumber);
            courseData.HIPHOP.sort((a, b) => a.lessonNumber - b.lessonNumber);
            courseData.SOUL.sort((a, b) => a.lessonNumber - b.lessonNumber);
            courseData.MEE.sort((a, b) => a.lessonNumber - b.lessonNumber);

            // 生成课程列表
            generateCourseLists();
            
            // 返回成功结果
            return Promise.resolve();
        } catch (error) {
            console.error('加载数据失败:', error);
            return Promise.reject(error);
        }
    }

    // 生成课程列表的函数
    function generateCourseLists() {
        // 生成CHTTO课程列表
        generateCourseList('CHTTO', courseData.CHTTO);
        
        // 生成HIPHOP课程列表
        generateCourseList('HIPHOP', courseData.HIPHOP);
        
        // 生成SOUL课程列表
        generateCourseList('SOUL', courseData.SOUL);
        
        // 生成MEE课程列表
        generateCourseList('MEE', courseData.MEE);

        // 初始化视频点击事件
        initVideoClickEvents();
    }

    // 为特定类型生成课程列表
    function generateCourseList(type, courses) {
        const listContainer = document.getElementById(`${type}-list`);
        if (!listContainer) return;

        const lessonList = document.createElement('ul');
        lessonList.className = 'lesson-list';

        courses.forEach(course => {
            // 创建课程项
            const lessonItem = document.createElement('li');
            lessonItem.className = 'lesson-item';

            // 创建课程标题
            const lessonHeader = document.createElement('div');
            lessonHeader.className = 'lesson-header expanded';
            lessonHeader.textContent = `第${course.lessonNumber}课`;
            
            // 创建集数列表
            const episodeList = document.createElement('ul');
            episodeList.className = 'episode-list show';

            // 为每个集数创建列表项
            course.episodes.forEach(episode => {
                if (!episode.videoUrl) return; // 跳过没有视频链接的集数
                
                const episodeItem = document.createElement('li');
                episodeItem.className = 'episode-item video-row';
                episodeItem.setAttribute('data-video-url', episode.videoUrl);
                episodeItem.setAttribute('data-course-link', course.courseLink);
                
                const episodeSpan = document.createElement('span');
                episodeSpan.textContent = `第${episode.episodeNumber}集`;
                
                episodeItem.appendChild(episodeSpan);
                episodeList.appendChild(episodeItem);
            });

            // 将标题和集数列表添加到课程项
            lessonItem.appendChild(lessonHeader);
            lessonItem.appendChild(episodeList);
            
            // 将课程项添加到列表容器
            lessonList.appendChild(lessonItem);
        });

        // 清空现有内容并添加新生成的列表
        listContainer.innerHTML = '';
        listContainer.appendChild(lessonList);
    }

    // 初始化视频点击事件
    function initVideoClickEvents() {
        const videoRows = document.querySelectorAll('.video-row');
        const videoPlayer = document.getElementById('videoPlayer');
        const courseLinkBtn = document.getElementById('courseLinkBtn');
        
        // 清除之前绑定的点击事件
        videoRows.forEach(row => {
            row.removeEventListener('click', handleVideoRowClick);
            row.addEventListener('click', handleVideoRowClick);
        });

        // 视频行点击处理函数
        function handleVideoRowClick() {
            const videoUrl = this.getAttribute('data-video-url');
            const courseLink = this.getAttribute('data-course-link');
            
            if (videoUrl) {
                // 高亮选中行
                videoRows.forEach(r => r.classList.remove('selected'));
                this.classList.add('selected');
                
                // 添加自动播放参数
                const autoplayUrl = videoUrl.includes('?') 
                    ? `${videoUrl}&autoplay=1&muted=0` 
                    : `${videoUrl}?autoplay=1&muted=0`;
                
                // 更新视频播放器，添加自动播放
                videoPlayer.innerHTML = `<iframe src="${autoplayUrl}" allowfullscreen allow="autoplay"></iframe>`;
                
                // 添加加载动画
                const iframe = videoPlayer.querySelector('iframe');
                if (iframe) {
                    iframe.onload = function() {
                        this.classList.add('loaded');
                    };
                }
                
                // 更新课程链接按钮
                if (courseLink) {
                    courseLinkBtn.href = courseLink;
                    courseLinkBtn.style.display = 'block';
                    
                    // 添加显示动画
                    setTimeout(() => {
                        courseLinkBtn.classList.add('show');
                    }, 100);
                }
            }
        }

        // 课程一级标题点击展开/折叠功能
        const lessonHeaders = document.querySelectorAll('.lesson-header');
        lessonHeaders.forEach(header => {
            header.removeEventListener('click', handleLessonHeaderClick);
            header.addEventListener('click', handleLessonHeaderClick);
        });

        function handleLessonHeaderClick() {
            const episodeList = this.nextElementSibling;
            if (episodeList) {
                if (episodeList.classList.contains('show')) {
                    episodeList.classList.remove('show');
                    this.classList.remove('expanded');
                } else {
                    episodeList.classList.add('show');
                    this.classList.add('expanded');
                }
            }
        }

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
        
        // 移除之前绑定的点击事件，避免多次绑定
        const buttons = document.querySelectorAll('.nav-link, .lesson-header, .episode-item');
        buttons.forEach(button => {
            button.removeEventListener('click', createRipple);
            button.addEventListener('click', createRipple);
        });
        
        // 为导航选项卡添加点击事件，清除波纹效果
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(navLink => {
            navLink.addEventListener('click', function() {
                // 清除所有波纹效果
                document.querySelectorAll('.ripple').forEach(ripple => ripple.remove());
                
                // 在切换前保存当前视图状态
                setTimeout(() => {
                    // 确保在DOM更新后执行
                    const activeContainer = document.querySelector('.course-container.active');
                    if (activeContainer) {
                        // 清除当前容器中所有波纹效果
                        activeContainer.querySelectorAll('.ripple').forEach(ripple => ripple.remove());
                    }
                }, 50);
            });
        });
    }

    // 添加视频点击后的动态更新
    function handleDynamicUpdates() {
        // 在视频处理完成后，重新检查是否有新的课程项需要绑定事件
        const allEpisodeItems = document.querySelectorAll('.episode-item');
        allEpisodeItems.forEach(item => {
            if (!item.hasAttribute('data-event-bound')) {
                item.setAttribute('data-event-bound', 'true');
                
                // 添加点击事件
                item.addEventListener('click', function() {
                    const videoUrl = this.getAttribute('data-video-url');
                    const courseLink = this.getAttribute('data-course-link');
                    
                    if (videoUrl) {
                        // 高亮选中行
                        allEpisodeItems.forEach(r => r.classList.remove('selected'));
                        this.classList.add('selected');
                        
                        // 添加自动播放参数
                        const autoplayUrl = videoUrl.includes('?') 
                            ? `${videoUrl}&autoplay=1&muted=0` 
                            : `${videoUrl}?autoplay=1&muted=0`;
                        
                        // 更新视频播放器
                        const videoPlayer = document.getElementById('videoPlayer');
                        videoPlayer.innerHTML = `<iframe src="${autoplayUrl}" allowfullscreen allow="autoplay"></iframe>`;
                        
                        // 添加加载动画
                        const iframe = videoPlayer.querySelector('iframe');
                        if (iframe) {
                            iframe.onload = function() {
                                this.classList.add('loaded');
                            };
                        }
                        
                        // 更新课程链接按钮
                        const courseLinkBtn = document.getElementById('courseLinkBtn');
                        if (courseLink && courseLinkBtn) {
                            courseLinkBtn.href = courseLink;
                            courseLinkBtn.style.display = 'block';
                            
                            // 添加显示动画
                            setTimeout(() => {
                                courseLinkBtn.classList.add('show');
                            }, 100);
                        }
                    }
                });
                
                // 添加波纹效果
                item.addEventListener('click', createRipple);
            }
        });
    }

    // 启动加载
    loadAllData().then(() => {
        // 数据加载完成后，确保所有事件绑定正确
        setTimeout(() => {
            handleDynamicUpdates();
            
            // 确保MEE类别的视频点击也被绑定
            const meeItems = document.querySelectorAll('#MEE-list .episode-item');
            console.log('MEE视频数量:', meeItems.length);
            
            // 重新初始化所有课程展开/折叠功能
            document.querySelectorAll('.lesson-header').forEach(header => {
                if (!header.hasAttribute('data-event-bound')) {
                    header.setAttribute('data-event-bound', 'true');
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
                        }
                    });
                }
            });
        }, 500);
    });

    // 添加类别切换处理
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(navLink => {
        navLink.addEventListener('click', function() {
            const tabId = this.getAttribute('data-target');
            if (!tabId) return;
            
            // 更新导航样式
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            
            // 切换课程容器
            const containers = document.querySelectorAll('.course-container');
            containers.forEach(container => {
                container.classList.remove('active');
                
                // 清除所有波纹效果
                container.querySelectorAll('.ripple').forEach(ripple => ripple.remove());
            });
            
            // 显示目标容器
            const targetContainer = document.getElementById(tabId);
            if (targetContainer) {
                targetContainer.classList.add('active');
            }
        });
    });
}); 