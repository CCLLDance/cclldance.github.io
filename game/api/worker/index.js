// 排行榜API Worker - 使用R2存储

// 定义CORS头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// 处理OPTIONS请求
function handleOptions() {
  return new Response(null, {
    headers: corsHeaders
  });
}

// 处理请求
export default {
  async fetch(request, env) {
    // 处理CORS预检请求
    if (request.method === "OPTIONS") {
      return handleOptions();
    }

    const url = new URL(request.url);
    
    // 获取排行榜数据
    if (url.pathname === "/api/getLeaderboard") {
      try {
        // 获取查询参数
        const sortBy = url.searchParams.get('sort') || 'score';
        const page = parseInt(url.searchParams.get('page')) || 1;
        const pageSize = parseInt(url.searchParams.get('pageSize')) || 10;
        
        // 从R2获取排行榜文件
        let leaderboardData = [];
        
        try {
          // 尝试从R2读取文件
          const leaderboardObject = await env.SNAKE_BUCKET.get("leaderboard.json");
          
          if (leaderboardObject) {
            // 如果文件存在，解析内容
            const leaderboardText = await leaderboardObject.text();
            leaderboardData = JSON.parse(leaderboardText);
            
            // 确保每条记录都有playerName字段（向后兼容）
            leaderboardData = leaderboardData.map(entry => {
              // 如果没有playerName字段，但有hostname字段，使用hostname
              if (!entry.playerName && entry.hostname) {
                entry.playerName = entry.hostname;
              }
              // 如果两者都没有，使用默认名称
              if (!entry.playerName) {
                entry.playerName = 'Anonymous';
              }
              return entry;
            });
          }
        } catch (error) {
          console.error("读取排行榜失败:", error);
          // 如果出错或文件不存在，使用空数组
        }
        
        // 基于sortBy参数排序
        if (sortBy === 'time') {
          // 按时间排序（最新的在前）
          leaderboardData.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else {
          // 默认按分数排序
          leaderboardData.sort((a, b) => b.score - a.score);
        }
        
        // 计算分页
        const totalItems = leaderboardData.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = leaderboardData.slice(startIndex, endIndex);
        
        // 返回排行榜数据和分页信息
        return new Response(JSON.stringify({
          data: paginatedData,
          pagination: {
            page,
            pageSize,
            totalItems,
            totalPages,
            sortBy
          }
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "获取排行榜失败" }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }
    
    // 保存分数
    if (url.pathname === "/api/saveScore" && request.method === "POST") {
      try {
        const data = await request.json();
        const { ip, playerName, score, date, city, region, country } = data;
        
        // 基本验证
        if (!ip || typeof score !== 'number' || !date) {
          return new Response(JSON.stringify({ error: "无效的分数数据" }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        // 获取现有排行榜数据
        let leaderboardData = [];
        
        try {
          // 尝试从R2读取文件
          const leaderboardObject = await env.SNAKE_BUCKET.get("leaderboard.json");
          
          if (leaderboardObject) {
            // 如果文件存在，解析内容
            const leaderboardText = await leaderboardObject.text();
            leaderboardData = JSON.parse(leaderboardText);
          }
        } catch (error) {
          console.error("读取排行榜失败:", error);
          // 如果出错或文件不存在，使用空数组
        }
        
        // 使用时间和IP创建唯一ID
        const recordId = date + '-' + ip;
        
        // 添加新记录
        leaderboardData.push({
          id: recordId,
          ip,
          playerName: playerName || 'Anonymous', // 添加玩家名称字段，如果未提供则使用默认值
          score,
          date,
          city: city || 'Unknown',
          region: region || '',
          country: country || ''
        });
        
        // 将更新后的数据保存回R2
        await env.SNAKE_BUCKET.put("leaderboard.json", JSON.stringify(leaderboardData));
        
        return new Response(JSON.stringify({ success: true, message: "分数保存成功" }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "保存分数失败" }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }
    }
    
    // 默认返回404
    return new Response("未找到", {
      status: 404,
      headers: corsHeaders
    });
  }
}; 