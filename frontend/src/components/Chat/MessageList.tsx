/**
 * Message List Component
 * Scrollable list of messages
 * Renders unified user and assistant messages
 */

import { useEffect, useRef } from "react";
import { Empty } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import type { ChatItem } from "../../types";
import { UserMessage, AssistantMessage } from "./MessageItem";

interface MessageListProps {
  items: ChatItem[];
  onSelectPrompt: (prompt: string) => void;
}

const starterPrompts = [
  "2017年全年销售额是多少？",
  "最近12个月订单量趋势怎么样？",
  "销售额最高的品类是什么？",
  "复购用户占比是多少？",
];

const datasetHighlights = [
  {
    label: "时间范围",
    value: "2016-09 至 2018-10（订单与支付链路）",
  },
  {
    label: "核心数据",
    value: "订单、订单项、商品、商家、客户、评论、地理信息",
  },
  {
    label: "分析主题",
    value: "销售额、订单量、品类结构、复购、客单价",
  },
];

const capabilityTags = [
  "同比/环比趋势",
  "Top N 品类分析",
  "地域分布对比",
  "新老客贡献拆解",
  "复购与留存信号",
];

export function MessageList({ items, onSelectPrompt }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items]);

  if (items.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
        }}
      >
        <Empty
          image={
            <MessageOutlined
              style={{ fontSize: 64, color: "var(--color-text-tertiary)" }}
            />
          }
          description={
            <div style={{ color: "var(--color-text-secondary)", maxWidth: 560 }}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  marginBottom: "8px",
                  color: "var(--color-text-primary)",
                }}
              >
                我是你的电商数据分析助手
              </div>
              <div
                style={{
                  marginBottom: 12,
                  padding: "14px 14px 12px",
                  borderRadius: 14,
                  background:
                    "linear-gradient(135deg, rgba(217, 119, 87, 0.13), rgba(217, 119, 87, 0.03))",
                  border: "1px solid rgba(217, 119, 87, 0.22)",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    color: "var(--accent-color)",
                    marginBottom: 8,
                  }}
                >
                  DATA OVERVIEW
                </div>
                <div
                  style={{
                    display: "grid",
                    gap: "8px",
                  }}
                >
                  {datasetHighlights.map((item) => (
                    <div key={item.label} style={{ display: "flex", gap: "8px" }}>
                      <div
                        style={{
                          minWidth: "58px",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {item.label}
                      </div>
                      <div style={{ fontSize: "12px", lineHeight: 1.6 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  fontSize: "12px",
                  lineHeight: 1.7,
                  marginBottom: 12,
                  textAlign: "left",
                }}
              >
                <span style={{ marginRight: 6 }}>支持分析：</span>
                {capabilityTags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: "inline-block",
                      marginRight: 6,
                      marginBottom: 6,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "rgba(107, 114, 128, 0.12)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: "14px", lineHeight: 1.7, marginBottom: 12 }}>
                你可以先选一个示例问题开始：
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {starterPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => onSelectPrompt(prompt)}
                    style={{
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-secondary)",
                      color: "var(--color-text-primary)",
                      borderRadius: "999px",
                      padding: "6px 12px",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  marginTop: "10px",
                  color: "var(--color-text-tertiary)",
                }}
              >
                点击示例问题后会自动填入输入框
              </div>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        minHeight: 0,
      }}
    >
      {items.map((item) => {
        if (item.type === "user_message") {
          return <UserMessage key={item.id} message={item} />;
        }
        if (item.type === "assistant_message") {
          return <AssistantMessage key={item.id} message={item} />;
        }
        return null;
      })}
      <div ref={bottomRef} />
    </div>
  );
}
