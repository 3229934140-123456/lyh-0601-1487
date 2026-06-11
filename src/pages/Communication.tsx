import { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  MessageSquareText,
  Send,
  Paperclip,
  CalendarClock,
  HelpCircle,
  FileText,
  Handshake,
  X,
  Plus,
  Sparkles,
  Download,
  Check,
  ChevronRight,
  User,
  Shield,
  Building2,
} from "lucide-react";
import { useCommunicationStore } from "@/store/useCommunicationStore";
import { useUiStore } from "@/store/useUiStore";
import type { Message, MessageType, UserRole, DemandStatus } from "@/types";
import { StatusBadge } from "@/components/StatusBadge";
import { DEMAND_STATUS_META, MESSAGE_TYPE_META, DEMAND_STATUS_FLOW } from "@/utils/constants";
import { formatDateTime, cn } from "@/utils/formatters";

const TYPE_FILTERS: (MessageType | "all")[] = ["all", "intention", "question", "material", "minutes"];

const ROLE_META: Record<UserRole, { label: string; Icon: typeof User; color: string }> = {
  demand: { label: "需求方", Icon: Building2, color: "text-blue-600 bg-blue-50 border-blue-100" },
  provider: { label: "提供方", Icon: Building2, color: "text-purple-600 bg-purple-50 border-purple-100" },
  operator: { label: "平台运营", Icon: Shield, color: "text-mint-600 bg-mint-50 border-mint-100" },
};

export default function Communication() {
  const communications = useCommunicationStore((s) => s.communications);
  const activeId = useCommunicationStore((s) => s.activeId);
  const setActive = useCommunicationStore((s) => s.setActive);
  const markAsRead = useCommunicationStore((s) => s.markAsRead);
  const messages = useCommunicationStore((s) => s.messages);
  const sendMessage = useCommunicationStore((s) => s.sendMessage);
  const updateStatus = useCommunicationStore((s) => s.updateStatus);
  const showToast = useUiStore((s) => s.showToast);
  const role = useUiStore((s) => s.role);

  const active = useMemo(
    () => communications.find((c) => c.id === activeId),
    [communications, activeId]
  );
  const activeMessages = useMemo(() => {
    if (!activeId) return [];
    return messages
      .filter((m) => m.communicationId === activeId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages, activeId]);

  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState<MessageType | "all">("all");
  const [quickType, setQuickType] = useState<MessageType>("text");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredMessages = activeMessages.filter((m) =>
    typeFilter === "all" ? true : m.type === typeFilter
  );

  const totalUnread = communications.reduce((sum, c) => sum + c.unreadCount, 0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredMessages.length, activeId]);

  const handleSelect = (id: string) => {
    setActive(id);
    markAsRead(id);
  };

  const handleSend = () => {
    if (!input.trim() || !active) return;
    const sender = role === "operator" ? "平台运营-周琳" : role === "demand" ? active.partyA : active.partyB;
    sendMessage({
      communicationId: active.id,
      sender,
      senderRole: role,
      type: quickType,
      content: input.trim(),
    });
    setInput("");
    setQuickType("text");
    if (quickType !== "text") {
      showToast(
        "success",
        `${MESSAGE_TYPE_META[quickType].label}已发送`
      );
    }
  };

  const handleAttach = () => {
    if (!active) return;
    sendMessage({
      communicationId: active.id,
      sender: role === "operator" ? "平台运营-周琳" : "当前用户",
      senderRole: role,
      type: "material",
      content: "已上传以下材料，请查收并反馈意见。",
      attachments: [
        { name: "数据对接接口说明V2.1.pdf", size: "2.8 MB", type: "pdf" },
        { name: "字段样例数据.xlsx", size: "512 KB", type: "xlsx" },
      ],
    });
    showToast("success", "材料上传成功");
  };

  const filteredComms = communications.filter((c) =>
    keyword
      ? c.demandTitle.includes(keyword) ||
        c.productName.includes(keyword) ||
        c.partyA.includes(keyword) ||
        c.partyB.includes(keyword)
      : true
  );

  return (
    <div className="grid grid-cols-12 gap-5 h-[calc(100vh-140px)] animate-fadeUp">
      {/* 左侧会话列表 */}
      <div className="col-span-4 card flex flex-col overflow-hidden">
        <div className="p-4 border-b border-ink-100 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-ink-800 flex items-center gap-2">
              <MessageSquareText size={18} className="text-mint-500" />
              沟通会话
            </h2>
            <span className="tag bg-amber-50 text-amber-600 ring-1 ring-amber-200 font-bold">
              {totalUnread} 条未读
            </span>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索会话..."
              className="input !py-2 pl-9"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {TYPE_FILTERS.map((t) => {
              const meta = t === "all" ? { label: "全部", icon: "layers", color: "" } : MESSAGE_TYPE_META[t];
              const active = typeFilter === t;
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    "px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all",
                    active
                      ? "bg-ink-800 text-white border-ink-800"
                      : "bg-white text-ink-500 border-ink-100 hover:border-mint-400 hover:text-mint-700"
                  )}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-ink-50">
          {filteredComms.map((c, idx) => (
            <button
              key={c.id}
              style={{ animationDelay: `${idx * 40}ms` }}
              onClick={() => handleSelect(c.id)}
              className={cn(
                "w-full text-left p-4 transition-all animate-fadeUp relative",
                activeId === c.id
                  ? "bg-gradient-to-r from-mint-50 via-white to-white"
                  : "hover:bg-ink-50/70"
              )}
            >
              {activeId === c.id && (
                <div className="absolute left-0 top-4 bottom-4 w-1 bg-mint-400 rounded-r" />
              )}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-sm font-semibold text-ink-800 line-clamp-1 pr-2">
                  {c.partyA} ↔ {c.partyB}
                </span>
                <span className="text-[10px] text-ink-400 shrink-0 whitespace-nowrap mt-0.5">
                  {formatDateTime(c.lastMessageAt)}
                </span>
              </div>
              <div className="text-xs text-ink-500 leading-relaxed mb-2.5 line-clamp-2 pr-8 relative">
                {c.lastMessage}
                {c.unreadCount > 0 && (
                  <span className="absolute right-0 top-0 min-w-[20px] h-5 px-1.5 rounded-full bg-amber-400 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                    {c.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <StatusBadge status={c.status} size="sm" />
                <div className="flex items-center gap-1 text-[10px] text-ink-400">
                  <ChevronRight size={12} />
                  查看详情
                </div>
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-ink-50 grid grid-cols-2 gap-1.5">
                <div className="text-[10px] text-ink-400 truncate">
                  <span className="text-blue-500 font-bold">需</span> {c.demandTitle.slice(0, 10)}...
                </div>
                <div className="text-[10px] text-ink-400 truncate">
                  <span className="text-mint-500 font-bold">供</span> {c.productName.slice(0, 10)}...
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 右侧消息区 */}
      <div className="col-span-8 card flex flex-col overflow-hidden">
        {active ? (
          <>
            {/* 会话头部 */}
            <div className="p-5 border-b border-ink-100 bg-gradient-to-r from-ink-50/80 to-white">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex -space-x-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white shadow-md">
                      {active.partyA.slice(0, 1)}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white shadow-md">
                      {active.partyB.slice(0, 1)}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white shadow-md">
                      <Shield size={14} />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-display text-lg text-ink-800 truncate">
                        {active.partyA}
                        <span className="mx-2 text-ink-300">↔</span>
                        {active.partyB}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-ink-400">
                      <StatusBadge status={active.status} />
                      <span>·</span>
                      <span className="truncate">{active.demandTitle}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-outline !py-2 !px-3 text-xs">
                    <Sparkles size={14} />
                    生成会议纪要
                  </button>
                  <button className="btn-outline !py-2 !px-3 text-xs">
                    <Download size={14} />
                    导出记录
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-ink-100">
                <span className="text-xs font-bold text-ink-500 uppercase tracking-wider shrink-0">状态推进</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {DEMAND_STATUS_FLOW.map((status, idx) => {
                    const currentIdx = DEMAND_STATUS_FLOW.indexOf(active.status);
                    const isCurrent = status === active.status;
                    const isPast = idx < currentIdx;
                    const isNext = idx === currentIdx + 1;
                    const meta = DEMAND_STATUS_META[status];
                    const buttonLabels: Record<DemandStatus, string> = {
                      pending: "待确认",
                      negotiating: "推进到洽谈",
                      signing: "推进到签约",
                      delivered: "标记已交付",
                      closed: "已关闭",
                    };
                    return (
                      <div key={status} className="flex items-center gap-2">
                        {isCurrent ? (
                          <StatusBadge status={status} size="md" />
                        ) : isNext ? (
                          <button
                            onClick={() => updateStatus(active.id, status)}
                            className={cn(
                              "px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all",
                              "bg-white border-ink-200 text-ink-600 hover:border-mint-400 hover:text-mint-700 hover:bg-mint-50"
                            )}
                          >
                            {buttonLabels[status]}
                          </button>
                        ) : (
                          <span className={cn(
                            "px-3 py-1.5 text-xs font-semibold rounded-lg",
                            isPast ? "bg-ink-100 text-ink-400" : "bg-ink-50 text-ink-300"
                          )}>
                            {meta.label}
                          </span>
                        )}
                        {idx < DEMAND_STATUS_FLOW.length - 1 && (
                          <ChevronRight size={12} className="text-ink-300" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 消息时间线 */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5 bg-gradient-to-b from-white via-ink-50/30 to-white"
            >
              <div className="text-center">
                <span className="inline-block text-[10px] font-bold text-ink-400 uppercase tracking-widest px-3 py-1 rounded-full bg-ink-100">
                  以下是本次撮合的全部沟通记录
                </span>
              </div>

              {filteredMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquareText size={40} className="mx-auto text-ink-200 mb-2" />
                    <div className="text-sm text-ink-400">暂无消息，开始沟通吧</div>
                  </div>
                </div>
              ) : (
                filteredMessages.map((m, idx) => (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    isSelf={m.senderRole === role || m.sender.includes("运营")}
                    idx={idx}
                  />
                ))
              )}
            </div>

            {/* 输入区 */}
            <div className="border-t border-ink-100 p-4 bg-white/90 backdrop-blur-sm space-y-3">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin pb-1">
                <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mr-2 shrink-0">
                  消息类型：
                </span>
                {(Object.keys(MESSAGE_TYPE_META) as MessageType[]).map((t) => {
                  const meta = MESSAGE_TYPE_META[t];
                  const sel = quickType === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setQuickType(t)}
                      className={cn(
                        "shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all border",
                        sel
                          ? `${meta.color} bg-opacity-10 border-current ${meta.color.replace("text-", "bg-").replace("600", "50")}`
                          : "bg-white text-ink-500 border-ink-100 hover:border-ink-300"
                      )}
                    >
                      {t === "text" && <MessageSquareText size={12} />}
                      {t === "intention" && <Handshake size={12} />}
                      {t === "question" && <HelpCircle size={12} />}
                      {t === "material" && <FileText size={12} />}
                      {t === "minutes" && <CalendarClock size={12} />}
                      {meta.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    rows={2}
                    placeholder={
                      quickType === "text"
                        ? "输入消息内容，按 Enter 发送，Shift+Enter 换行..."
                        : `输入${MESSAGE_TYPE_META[quickType].label}内容...`
                    }
                    className="input resize-none pr-12 !py-3 leading-relaxed"
                  />
                  <button
                    onClick={handleAttach}
                    className="absolute right-3 bottom-3 text-ink-400 hover:text-mint-600 transition-colors"
                    title="上传材料"
                  >
                    <Paperclip size={18} />
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="btn-mint !py-3 !px-5 self-stretch"
                >
                  <Send size={16} />
                  发送
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-10">
            <div className="text-center max-w-sm">
              <MessageSquareText size={48} className="mx-auto text-ink-200 mb-3" />
              <h3 className="font-display text-xl text-ink-700 mb-1">选择会话开始沟通</h3>
              <p className="text-sm text-ink-400 mb-5">
                从左侧列表选择一个供需配对会话，查看历史沟通记录并继续洽谈
              </p>
              <button className="btn-primary mx-auto">
                <Plus size={16} />
                创建新会话
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isSelf,
  idx,
}: {
  message: Message;
  isSelf: boolean;
  idx: number;
}) {
  const typeMeta = MESSAGE_TYPE_META[message.type];
  const roleMeta = ROLE_META[message.senderRole];
  const Icon = roleMeta.Icon;

  const wrapperClass = isSelf ? "flex-row-reverse" : "flex-row";
  const bubbleClass = isSelf
    ? "bg-ink-800 text-white rounded-tr-sm"
    : "bg-white text-ink-800 rounded-tl-sm border border-ink-100 shadow-sm";
  const textClass = isSelf ? "text-white" : "text-ink-800";
  const metaClass = isSelf ? "text-white/60" : "text-ink-400";

  const isSpecial = message.type !== "text";

  return (
    <div
      style={{ animationDelay: `${idx * 25}ms` }}
      className={`flex items-start gap-3 animate-fadeUp ${wrapperClass}`}
    >
      <div
        className={`w-9 h-9 rounded-xl border ${roleMeta.color} flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm`}
      >
        <Icon size={15} strokeWidth={2.2} />
      </div>
      <div className={`max-w-[68%] min-w-0 ${isSelf ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`flex items-center gap-2 mb-1 text-[11px] ${metaClass}`}>
          <span className="font-semibold">{message.sender}</span>
          <span className="px-1.5 py-0.5 rounded-md bg-current opacity-20 font-bold">
            {roleMeta.label}
          </span>
          {isSpecial && (
            <span className={`px-1.5 py-0.5 rounded-md ${typeMeta.color} bg-current opacity-15 font-bold flex items-center gap-1`}>
              {message.type === "intention" && <Handshake size={10} />}
              {message.type === "question" && <HelpCircle size={10} />}
              {message.type === "material" && <FileText size={10} />}
              {message.type === "minutes" && <CalendarClock size={10} />}
              {typeMeta.label}
            </span>
          )}
          <span>·</span>
          <span>{formatDateTime(message.timestamp)}</span>
        </div>

        {isSpecial && <SpecialCard message={message} isSelf={isSelf} />}

        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${bubbleClass} ${
            !isSpecial ? "" : "mt-2"
          }`}
        >
          <p className={textClass}>{message.content}</p>
        </div>

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-1.5 w-full max-w-md">
            {message.attachments.map((att, i) => (
              <div
                key={i}
                className={`flex items-center gap-2.5 p-3 rounded-xl2 border ${
                  isSelf
                    ? "bg-white/90 border-ink-100 self-end"
                    : "bg-mint-50/60 border-mint-100"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    att.type === "pdf"
                      ? "bg-red-50 text-red-500"
                      : att.type === "xlsx"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-blue-50 text-blue-500"
                  }`}
                >
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-ink-800 truncate">
                    {att.name}
                  </div>
                  <div className="text-[10px] text-ink-400 mt-0.5">{att.size}</div>
                </div>
                <button className={`w-7 h-7 rounded-md flex items-center justify-center ${
                  isSelf ? "bg-ink-100 text-ink-600" : "bg-white text-mint-600 border border-mint-100"
                } hover:shadow-sm transition-shadow`}>
                  <Download size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {isSelf && (
          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-emerald-500 font-semibold">
            <Check size={10} />
            已送达
          </div>
        )}
      </div>
    </div>
  );
}

function SpecialCard({ message, isSelf }: { message: Message; isSelf: boolean }) {
  const typeMeta = MESSAGE_TYPE_META[message.type];
  const cardBg = isSelf ? "bg-white/10" : DEMAND_STATUS_META.pending.bg;
  const cardBorder = isSelf ? "border-white/20" : `border ${typeMeta.color.replace("text-", "ring-").replace("600", "200")}`;

  const HeaderIcon =
    message.type === "intention"
      ? Handshake
      : message.type === "question"
      ? HelpCircle
      : message.type === "material"
      ? FileText
      : CalendarClock;

  return (
    <div
      className={`w-full rounded-xl2 border px-4 py-3 flex items-start gap-3 ${cardBg} ${cardBorder}`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          isSelf ? "bg-white/20 text-white" : `${typeMeta.color} bg-current bg-opacity-10`
        }`}
      >
        <HeaderIcon size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-bold uppercase tracking-wider ${isSelf ? "text-white/80" : typeMeta.color}`}>
          {typeMeta.label}
        </div>
        <div className={`text-[11px] mt-0.5 ${isSelf ? "text-white/60" : "text-ink-500"}`}>
          {message.timestamp.slice(0, 10)}
        </div>
      </div>
      {message.type === "intention" && (
        <div className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold">
          待确认
        </div>
      )}
    </div>
  );
}
