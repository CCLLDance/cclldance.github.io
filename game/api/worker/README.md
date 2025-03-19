# 贪吃蛇游戏排行榜Worker

这个Cloudflare Worker用于处理贪吃蛇游戏的排行榜功能，支持获取排行榜数据和保存新的分数记录。

## 关键更新

已添加对`playerName`字段的支持，使排行榜可以显示"玩家名称@IP"格式的玩家标识。这个更新包括：

1. 在保存新分数时添加playerName字段
2. 在获取排行榜数据时确保每条记录都有playerName字段（向后兼容）
3. 修复了游戏前端代码中的相关显示逻辑
4. 添加了玩家名称输入框，允许玩家自定义名称

## 部署步骤

### 前提条件

1. 拥有Cloudflare账户
2. 在Cloudflare中设置Workers
3. 有权访问R2存储桶

### 快速部署

1. 登录Cloudflare Workers控制台
2. 创建一个新的Worker
3. 将`index.js`中的代码复制粘贴到Worker编辑器中
4. 在Worker绑定中添加一个R2绑定，名称为`SNAKE_BUCKET`，指向您的R2存储桶
5. 保存并部署Worker

### 使用wrangler CLI部署

如果您喜欢使用命令行方式部署，可以按照以下步骤进行：

1. 安装Wrangler CLI: `npm install -g wrangler`
2. 登录到您的Cloudflare账户: `wrangler login`
3. 在Worker目录中创建wrangler.toml文件，内容如下：

```toml
name = "snake-api"
main = "index.js"
compatibility_date = "2023-10-30"

[[r2_buckets]]
binding = "SNAKE_BUCKET"
bucket_name = "your-bucket-name"
```

4. 部署Worker: `wrangler publish`

## API端点

### GET /api/getLeaderboard

获取排行榜数据，支持排序和分页。

参数：
- `sort`: 排序方式，可选值为`score`(按分数排序)或`time`(按时间排序)，默认为`score`
- `page`: 页码，默认为1
- `pageSize`: 每页显示条数，默认为10

### POST /api/saveScore

保存新的分数记录。

请求体：
```json
{
  "ip": "玩家IP",
  "playerName": "玩家名称",
  "score": 分数(数字),
  "date": "ISO格式日期字符串",
  "city": "城市名(可选)",
  "region": "地区(可选)",
  "country": "国家(可选)"
}
```

## 完整源代码

```javascript
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
            
            // 确保每条记录都有playerName字段
            leaderboardData = leaderboardData.map(entry => {
              if (!entry.playerName) {
                entry.playerName = 'unknown-player';
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
          playerName: playerName || 'unknown-player', // 添加玩家名字段，如果未提供则使用默认值
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
``` 