/**
 * 贪吃蛇游戏排行榜服务器API
 * 用于保存和获取玩家分数数据
 */

const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3010;

// 中间件
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

// 排行榜数据文件路径
const LEADERBOARD_FILE = path.join(__dirname, 'leaderboard.json');

// 获取排行榜数据
app.get('/api/getLeaderboard', (req, res) => {
  try {
    // 获取查询参数
    const sortBy = req.query.sort || 'score'; // 'score' 或 'time'
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    
    // 检查文件是否存在
    if (!fs.existsSync(LEADERBOARD_FILE)) {
      return res.status(404).json({ error: 'Leaderboard data not found' });
    }
    
    // 读取并解析JSON文件
    const leaderboardData = JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf8'));
    
    // 计算总页数
    const totalItems = leaderboardData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    // 排序
    if (sortBy === 'time') {
      // 按时间排序（最新的在前）
      leaderboardData.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
      // 默认按分数排序
      leaderboardData.sort((a, b) => b.score - a.score);
    }
    
    // 分页
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = leaderboardData.slice(startIndex, endIndex);
    
    // 返回带有分页信息的数据
    res.json({
      data: paginatedData,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        sortBy
      }
    });
  } catch (error) {
    console.error('Error reading leaderboard data:', error);
    res.status(500).json({ error: 'Failed to retrieve leaderboard data' });
  }
});

// 保存分数到排行榜
app.post('/api/saveScore', (req, res) => {
  try {
    const { ip, hostname, score, date, city, region, country } = req.body;
    
    // 基本验证
    if (!ip || typeof score !== 'number' || !date) {
      return res.status(400).json({ error: 'Invalid score data' });
    }
    
    // 获取现有排行榜数据
    let leaderboardData = [];
    if (fs.existsSync(LEADERBOARD_FILE)) {
      leaderboardData = JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf8'));
    }
    
    // 不再检查IP，直接添加新记录
    // 使用时间作为唯一标识
    const recordId = date + '-' + ip;
    
    // 添加新记录
    leaderboardData.push({ 
      id: recordId,
      ip, 
      hostname: hostname || 'unknown-host',
      score, 
      date,
      city: city || 'Unknown',
      region: region || '',
      country: country || ''
    });
    
    // 不再限制保存的记录数量
    // 写入文件
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboardData, null, 2));
    
    res.json({ success: true, message: 'Score saved successfully' });
  } catch (error) {
    console.error('Error saving score:', error);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Snake Game Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} to play the game`);
}); 