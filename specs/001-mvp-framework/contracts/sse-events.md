# SSE Events Contract

本文档定义 `/api/chat` 端点的 SSE 事件格式。

## 事件格式

所有事件遵循 SSE 标准格式：

```
event: <event_type>
data: <json_payload>

```

## 事件类型

### 1. text

文本输出事件，用于流式展示 Agent 回复。

```
event: text
data: {"content": "2017年的总销售额为", "isPartial": true}

event: text
data: {"content": " R$ 8,234,567.89", "isPartial": false}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 文本内容 |
| isPartial | boolean | 否 | 是否为部分内容，默认 false |

---

### 2. tool_call

工具调用事件，通知前端 Agent 正在调用工具。

```
event: tool_call
data: {"tool": "query_sales", "args": {"start_date": "2017-01-01", "end_date": "2017-12-31"}}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tool | string | 是 | 工具名称 |
| args | object | 是 | 调用参数 |

---

### 3. tool_result

工具执行结果事件。

```
event: tool_result
data: {"tool": "query_sales", "result": {"total_sales": 8234567.89}, "duration": 125}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tool | string | 是 | 工具名称 |
| result | any | 是 | 执行结果 |
| duration | number | 否 | 执行耗时(ms) |

---

### 4. chart

图表数据事件，前端收到后渲染图表。

**Metric 类型**:
```
event: chart
data: {
  "type": "metric",
  "title": "2017年销售额",
  "data": [],
  "config": {
    "value": 8234567.89,
    "unit": "R$",
    "compareValue": 23.5,
    "compareLabel": "vs 2016",
    "trend": "up"
  }
}
```

**Table 类型**:
```
event: chart
data: {
  "type": "table",
  "title": "2017年各月销售额",
  "data": [
    {"month": "2017-01", "sales": 523456.78, "orders": 4521},
    {"month": "2017-02", "sales": 612345.67, "orders": 5234}
  ],
  "config": {
    "columns": [
      {"key": "month", "title": "月份", "dataType": "string"},
      {"key": "sales", "title": "销售额", "dataType": "number", "format": "currency"},
      {"key": "orders", "title": "订单数", "dataType": "number"}
    ]
  }
}
```

**字段说明**: 参见 data-model.md 中的 ChartConfig 定义。

---

### 5. done

完成事件，标志响应结束。

```
event: done
data: {"sessionId": "550e8400-e29b-41d4-a716-446655440000", "totalDuration": 3500}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sessionId | string | 是 | 会话 ID |
| totalDuration | number | 否 | 总耗时(ms) |

---

### 6. error

错误事件。

```
event: error
data: {"code": "QUERY_ERROR", "message": "数据库查询失败"}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 错误码 |
| message | string | 是 | 错误信息 |

**错误码**:
| 错误码 | 说明 |
|--------|------|
| INVALID_REQUEST | 请求参数无效 |
| SESSION_NOT_FOUND | 会话不存在 |
| QUERY_ERROR | 数据库查询错误 |
| AGENT_ERROR | Agent 处理错误 |
| TIMEOUT | 请求超时 |
| INTERNAL_ERROR | 内部错误 |

---

## 事件顺序示例

典型的事件流顺序：

```
event: tool_call
data: {"tool": "query_sales", "args": {...}}

event: tool_result
data: {"tool": "query_sales", "result": {...}, "duration": 125}

event: text
data: {"content": "2017年的总销售额为 R$ 8,234,567.89。", "isPartial": false}

event: chart
data: {"type": "metric", "title": "2017年销售额", ...}

event: text
data: {"content": "相比2016年增长了23.5%。", "isPartial": false}

event: done
data: {"sessionId": "...", "totalDuration": 3500}
```

---

## 前端处理建议

```typescript
const eventSource = new EventSource('/api/chat?...');

eventSource.addEventListener('text', (e) => {
  const { content, isPartial } = JSON.parse(e.data);
  appendText(content);
});

eventSource.addEventListener('chart', (e) => {
  const chartConfig = JSON.parse(e.data);
  renderChart(chartConfig);
});

eventSource.addEventListener('done', (e) => {
  const { sessionId } = JSON.parse(e.data);
  setLoading(false);
  eventSource.close();
});

eventSource.addEventListener('error', (e) => {
  const { code, message } = JSON.parse(e.data);
  showError(message);
  eventSource.close();
});
```
