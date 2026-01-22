import React, { StrictMode, useEffect, useLayoutEffect, useRef, useState } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";
import { 
	Send, 
	ArrowLeft, 
	MoreVertical, 
	Phone, 
	Video, 
	Camera, 
	Mic, 
	Paperclip, 
	Smile,
	Search,
	Check
} from "https://esm.sh/lucide-react";
import Markdown from "https://esm.sh/react-markdown";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<WhatsAppSimulator />
	</StrictMode>
);

interface Message {
	id: string;
	type: "user" | "ai";
	content: string;
	timestamp: string;
}

const ChatText = {
	p({ node, ...rest }) {
		return <p className="msg-text" {...rest} />
	},
	ul({ node, ...rest }) {
		return <ul className="msg-list" {...rest} />
	}
};

function WhatsAppSimulator() {
	const [view, setView] = useState<"list" | "chat">("list");
	const [activeChat, setActiveChat] = useState<string | null>(null);
	const [messages, setMessages] = useState<Message[]>([]);
	
	// Mock Suggestions acting as "Recent Chats"
	const chats = [
		{ id: "marketing", name: "Marketing Team", lastMsg: "Draft for the Q3 campaign?", time: "10:30 AM", avatar: "M" },
		{ id: "summarize", name: "Summarizer Bot", lastMsg: "Send me text to shorten", time: "Yesterday", avatar: "S" },
		{ id: "analysis", name: "Data Analyst", lastMsg: "The trends look positive", time: "Yesterday", avatar: "D" },
		{ id: "checklist", name: "Task Manager", lastMsg: "Don't forget the milk", time: "Tuesday", avatar: "T" }
	];

	const handleChatSelect = (chatId: string) => {
		setActiveChat(chatId);
		setView("chat");
		// Reset/Init messages for this chat mock
		setMessages([]); 
	};

	const handleBack = () => {
		setView("list");
		setActiveChat(null);
	};

	return (
		<main className="phone-wrapper">
			<div className="phone-frame">
				<div className="phone-notch"></div>
				<div className="status-bar">
					<span>14:20</span>
					<div className="status-icons">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
					</div>
				</div>
				
				{view === "list" ? (
					<ChatList onSelect={handleChatSelect} chats={chats} />
				) : (
					<ChatInterface 
						chatId={activeChat} 
						chatName={chats.find(c => c.id === activeChat)?.name || "Chat"} 
						onBack={handleBack}
						initialMessages={messages}
						onUpdateMessages={setMessages}
					/>
				)}
				
				<div className="home-indicator"></div>
			</div>
		</main>
	);
}

function ChatList({ onSelect, chats }: { onSelect: (id: string) => void, chats: any[] }) {
	return (
		<div className="wa-list-view">
			<div className="wa-header">
				<div className="wa-header-top">
					<span className="wa-logo">WhatsApp</span>
					<div className="wa-header-icons">
						<Camera size={20} />
						<Search size={20} />
						<MoreVertical size={20} />
					</div>
				</div>
				<div className="wa-tabs">
					<div className="wa-tab"><Camera size={16} /></div>
					<div className="wa-tab active">CHATS</div>
					<div className="wa-tab">STATUS</div>
					<div className="wa-tab">CALLS</div>
				</div>
			</div>
			<div className="wa-chats-container">
				{chats.map(chat => (
					<div key={chat.id} className="wa-chat-item" onClick={() => onSelect(chat.id)}>
						<div className="wa-avatar">{chat.avatar}</div>
						<div className="wa-chat-info">
							<div className="wa-chat-row-1">
								<span className="wa-chat-name">{chat.name}</span>
								<span className="wa-chat-time">{chat.time}</span>
							</div>
							<div className="wa-chat-row-2">
								<span className="wa-chat-preview">{chat.lastMsg}</span>
							</div>
						</div>
					</div>
				))}
			</div>
			<div className="wa-fab">
				<div className="wa-fab-icon">+</div>
			</div>
		</div>
	);
}

function ChatInterface({ chatId, chatName, onBack, initialMessages, onUpdateMessages }: any) {
	const [input, setInput] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	};

	useEffect(() => {
		scrollToBottom();
	}, [initialMessages, isTyping]);

	const mockResponses: Record<string, string> = {
		"marketing": "I'll review the draft and get back to you by EOD.",
		"summarize": "Sure, paste the text here and I'll summarize it.",
		"checklist": "Added to your to-do list.",
		"default": "Usage: This is a simulated response."
	};

	const getTime = () => {
		const now = new Date();
		return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	const handleSend = () => {
		if (!input.trim()) return;
		
		const userMsg: Message = {
			id: Date.now().toString(),
			type: "user",
			content: input,
			timestamp: getTime()
		};
		
		const newMsgs = [...initialMessages, userMsg];
		onUpdateMessages(newMsgs);
		setInput("");
		setIsTyping(true);

		setTimeout(() => {
			const responseText = mockResponses[chatId] || mockResponses["default"];
			const aiMsg: Message = {
				id: (Date.now() + 1).toString(),
				type: "ai",
				content: responseText,
				timestamp: getTime()
			};
			onUpdateMessages([...newMsgs, aiMsg]);
			setIsTyping(false);
		}, 1500);
	};

	return (
		<div className="wa-chat-view">
			<div className="wa-chat-header">
				<button className="wa-back-btn" onClick={onBack}>
					<ArrowLeft size={24} />
				</button>
				<div className="wa-chat-avatar-small">
					{chatName[0]}
				</div>
				<div className="wa-chat-details">
					<span className="wa-contact-name">{chatName}</span>
					<span className="wa-contact-status">online</span>
				</div>
				<div className="wa-chat-actions">
					<Video size={22} />
					<Phone size={20} />
					<MoreVertical size={20} />
				</div>
			</div>

			<div className="wa-chat-bg" ref={scrollRef}>
				<div className="wa-encryption-msg">
					Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
				</div>

				{initialMessages.map((msg: Message) => (
					<div key={msg.id} className={`wa-bubble wa-bubble-${msg.type}`}>
						<div className="wa-bubble-content">
							<Markdown components={ChatText}>{msg.content}</Markdown>
							<span className="wa-msg-time">
								{msg.timestamp}
								{msg.type === 'user' && <Check size={14} className="wa-double-check"/>}
							</span>
						</div>
					</div>
				))}
				
				{isTyping && (
					<div className="wa-bubble wa-bubble-ai">
						<div className="wa-typing">
							<span></span><span></span><span></span>
						</div>
					</div>
				)}
			</div>

			<div className="wa-chat-input-area">
				<button className="wa-input-action"><Smile size={24} /></button>
				<div className="wa-input-wrapper">
					<input 
						type="text" 
						placeholder="Message" 
						value={input}
						onChange={e => setInput(e.target.value)}
						onKeyDown={e => e.key === 'Enter' && handleSend()}
					/>
					<div className="wa-input-utils">
						<Paperclip size={20} className="rotate-icon" />
						{!input && <Camera size={20} />}
					</div>
				</div>
				<button className="wa-mic-btn" onClick={handleSend}>
					{input ? <Send size={20} /> : <Mic size={20} />}
				</button>
			</div>
		</div>
	);
}