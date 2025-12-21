import React, { useRef } from 'react';
import { Icon, Input, Button } from '../../../components/design-system';
import { User, EventChatMessage, EventChatMessageReaction } from 'common/schema';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import { Tooltip } from '../../../components/design-system';
import { Socket } from 'socket.io-client';

interface ChatDrawerProps {
    canInteract: boolean;
    isChatMinimized: boolean;
    setIsChatMinimized: (minimized: boolean) => void;
    messages: EventChatMessage[];
    userCache: Map<string, User>;
    currentUser: User | null;
    sendMessage: (message: string) => void;
    sendReaction: (messageId: string, reaction: string) => void;
    removeReaction: (reactionId: string) => void;
    editMessage: (messageId: string, newMessage: string) => void;
    handleWheel: (e: React.WheelEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement | null>) => void;
    socket: Socket | null;
    cancelled: boolean;
    eventHostId: string;
}

function ChatInput({ onSend, onTypingStart, onTypingStop, disabled = false }: { onSend: (message: string) => void; onTypingStart: () => void; onTypingStop: () => void; disabled?: boolean }) {
    const [message, setMessage] = React.useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
        onTypingStart();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSend(message);
            setMessage('');
            onTypingStop();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
                value={message}
                onChange={handleChange}
                placeholder="Type a message..."
                className="flex-1"
                disabled={disabled}
            />
            <Button type="submit" variant="primary" disabled={disabled}>
                <Icon name="send" size={16} />
            </Button>
        </form>
    );
}

function DesktopChatDrawer({
    isChatMinimized,
    setIsChatMinimized,
    messages,
    userCache,
    currentUser,
    sendMessage,
    sendReaction,
    removeReaction,
    editMessage,
    handleWheel,
    messagesRef,
    messageRefs,
    picker,
    setPicker,
    pickerRef,
    typingUsers,
    onTypingStart,
    onTypingStop,
    editingMessageId,
    editingMessageText,
    setEditingMessageId,
    setEditingMessageText,
    chatDisabled,
    cancelled,
}: {
    isChatMinimized: boolean;
    setIsChatMinimized: (minimized: boolean) => void;
    messages: EventChatMessage[];
    userCache: Map<string, User>;
    currentUser: User | null;
    sendMessage: (message: string) => void;
    sendReaction: (messageId: string, reaction: string) => void;
    removeReaction: (reactionId: string) => void;
    editMessage: (messageId: string, newMessage: string) => void;
    handleWheel: (e: React.WheelEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement | null>) => void;
    messagesRef: React.RefObject<HTMLDivElement | null>;
    messageRefs: React.RefObject<Record<string, HTMLDivElement | null>>;
    picker: { open: boolean; messageId: string; position: { top: number; left: number }; width: number; height: number };
    setPicker: React.Dispatch<React.SetStateAction<{ open: boolean; messageId: string; position: { top: number; left: number }; width: number; height: number }>>;
    pickerRef: React.RefObject<HTMLDivElement | null>;
    typingUsers: Set<string>;
    onTypingStart: () => void;
    onTypingStop: () => void;
    editingMessageId: string | null;
    editingMessageText: string;
    setEditingMessageId: (id: string | null) => void;
    setEditingMessageText: (text: string) => void;
    chatDisabled: boolean;
    cancelled: boolean;
}) {
    return (
        <div className="hidden lg:block">
            <div
                className={`absolute shadow-xl bottom-0 right-4 transition-all duration-300 ease-out ${isChatMinimized ? 'w-96 h-12' : 'w-96 h-[80vh]'
                    }`}
            >
                <div
                    className={`w-full h-full flex flex-col border border-gray-200 ${isChatMinimized ? 'rounded-t-2xl cursor-pointer' : 'rounded-t-2xl'
                        } bg-white`}
                    onClick={isChatMinimized ? () => setIsChatMinimized(false) : undefined}
                >
                    {isChatMinimized ? (
                        /* Minimized State - Small Square */
                        <div className="w-full h-full flex flex-col items-center justify-center bg-primary-500 rounded-t-2xl text-center">
                            <div className="relative">
                                <Icon name="chat" size={20} className="text-white" />
                                <span className="text-white text-s font-bold leading-tight ml-2">Event Chat</span>
                            </div>
                        </div>
                    ) : (
                        /* Expanded State - Full Drawer */
                        <>
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primary-500 rounded-t-2xl">
                                <h3 className="text-lg font-bold text-primary-50 flex items-center gap-2">
                                    <Icon name="chat" size={20} className="text-primary-50" />
                                    Event Chat
                                </h3>
                                <button
                                    onClick={() => setIsChatMinimized(true)}
                                    className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors duration-200"
                                >
                                    <Icon name="chevronDown" size={16} className="text-gray-600" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-hidden flex flex-col">
                                <div
                                    className="flex-1 overflow-y-auto p-4 space-y-3"
                                    ref={messagesRef}
                                    onWheel={(e) => handleWheel(e, messagesRef)}
                                >
                                    {messages.length === 0 ? (
                                        <p className="text-gray-500 italic text-center">No messages yet. Start the conversation!</p>
                                    ) : (
                                        messages.map((msg) => {
                                            const user = userCache.get(msg.userId) || { firstName: '?', lastName: '' };
                                            const isCurrentUser = currentUser?.id === msg.userId;
                                            const reactions = msg.reactions || [];
                                            return (
                                                <div
                                                    key={msg.id}
                                                    ref={(el) => { messageRefs.current![msg.id] = el; }}
                                                    className={`p-3 rounded-lg ${isCurrentUser ? 'bg-blue-100 ml-4' : 'bg-gray-100 mr-4'}`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-semibold text-sm">
                                                            {user.firstName} {user.lastName}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                                hour12: true,
                                                            })}
                                                        </span>
                                                        {msg.updatedAt > msg.createdAt && (
                                                            <span className="text-xs text-gray-400">(edited)</span>
                                                        )}
                                                    </div>
                                                    {editingMessageId === msg.id ? (
                                                        <div className="flex flex-col gap-2">
                                                            <Input
                                                                value={editingMessageText}
                                                                onChange={(e) => setEditingMessageText(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        if (editingMessageText.trim()) {
                                                                            editMessage(msg.id, editingMessageText.trim());
                                                                        }
                                                                        setEditingMessageId(null);
                                                                        setEditingMessageText('');
                                                                    } else if (e.key === 'Escape') {
                                                                        setEditingMessageId(null);
                                                                        setEditingMessageText('');
                                                                    }
                                                                }}
                                                                className="flex-1"
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    onClick={() => {
                                                                        if (editingMessageText.trim()) {
                                                                            editMessage(msg.id, editingMessageText.trim());
                                                                        }
                                                                        setEditingMessageId(null);
                                                                        setEditingMessageText('');
                                                                    }}
                                                                    variant="primary"
                                                                    size="sm"
                                                                    className="text-xs px-0.5 py-0 flex-shrink-0"
                                                                >
                                                                    Save
                                                                </Button>
                                                                <Button
                                                                    onClick={() => {
                                                                        setEditingMessageId(null);
                                                                        setEditingMessageText('');
                                                                    }}
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="text-xs px-0.5 py-0 flex-shrink-0"
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-gray-900 text-sm flex-1">{msg.message}</p>
                                                            {isCurrentUser && !cancelled && (
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingMessageId(msg.id);
                                                                        setEditingMessageText(msg.message);
                                                                    }}
                                                                    className="text-xs hover:bg-gray-200 p-1 rounded"
                                                                >
                                                                    <Icon name="edit" size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                    {reactions.length > 0 && (
                                                        <div className="flex gap-1 mt-2 flex-wrap">
                                                            {(() => {
                                                                const groupedReactions = new Map<string, { count: number; reactors: { user: User; reactionId: string }[] }>();
                                                                for (const reaction of reactions) {
                                                                    const user = userCache.get(reaction.userId);
                                                                    if (!user) continue;
                                                                    if (!groupedReactions.has(reaction.reaction)) {
                                                                        groupedReactions.set(reaction.reaction, { count: 0, reactors: [] });
                                                                    }
                                                                    const group = groupedReactions.get(reaction.reaction)!;
                                                                    group.count++;
                                                                    group.reactors.push({ user, reactionId: reaction.id });
                                                                }
                                                                return Array.from(groupedReactions.entries()).map(([emoji, { count, reactors }]) => {
                                                                    const hasReacted = reactors.some(r => r.user.id === currentUser?.id);
                                                                    const tooltipContent = reactors.map(r => `${r.user.firstName} ${r.user.lastName}`).join('\n');
                                                                    return (
                                                                        <Tooltip key={emoji} content={tooltipContent}>
                                                                            <button
                                                                                onClick={() => {
                                                                                    if (hasReacted) {
                                                                                        const ownReactor = reactors.find(r => r.user.id === currentUser?.id);
                                                                                        if (ownReactor) removeReaction(ownReactor.reactionId);
                                                                                    } else {
                                                                                        sendReaction(msg.id, emoji);
                                                                                    }
                                                                                }}
                                                                                className={`text-sm px-1 rounded hover:bg-gray-200 border-1 border-[rgb(120,120,120)] shadow-sm select-none transition-colors duration-300 ${hasReacted ? 'hover:bg-blue-100' : ''}`}
                                                                                style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
                                                                            >
                                                                                {emoji}{count > 1 ? <span className="select-none"> {count}</span> : ''}
                                                                            </button>
                                                                        </Tooltip>
                                                                    );
                                                                });
                                                            })()}
                                                        </div>
                                                    )}
                                                    <div className="flex gap-1 mt-2 relative">
                                                        <button
                                                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                                const vw = window.innerWidth;
                                                                const vh = window.innerHeight;
                                                                const width = vw < 640 ? Math.min(320, vw - 32) : 340;

                                                                // Scroll the message into view to ensure accurate rect
                                                                messageRefs.current![msg.id]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });

                                                                // Prefer the button rect (most accurate)
                                                                const btnRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                                                let rect = btnRect;

                                                                // Fallback to message container if button rect is invalid
                                                                if (!rect || !isFinite(rect.left) || !isFinite(rect.top)) {
                                                                    const msgRect = messageRefs.current![msg.id]?.getBoundingClientRect();
                                                                    if (msgRect && isFinite(msgRect.left) && isFinite(msgRect.top)) rect = msgRect;
                                                                    else rect = { top: vh / 2, bottom: vh / 2, left: Math.max(8, vw - width - 16) } as DOMRect;
                                                                }

                                                                const availableAbove = rect.top;
                                                                const availableBelow = vh - rect.bottom;
                                                                let height = Math.min(420, Math.max(200, availableBelow >= 360 ? Math.min(420, availableBelow - 16) : Math.min(420, availableAbove - 16)));
                                                                if (height < 200) height = Math.min(200, vh - 32);

                                                                let top: number;
                                                                if (availableBelow >= height + 8 || availableBelow >= availableAbove) {
                                                                    top = rect.bottom + 8;
                                                                } else {
                                                                    top = Math.max(8, rect.top - height - 8);
                                                                }

                                                                let left = Math.min(Math.max(rect.left, 8), vw - width - 8);

                                                                // Final clamp and fallback: center if invalid
                                                                top = Math.min(Math.max(8, top), vh - height - 8);
                                                                left = Math.min(Math.max(8, left), vw - width - 8);
                                                                if (!isFinite(top) || !isFinite(left) || !isFinite(width) || !isFinite(height)) {
                                                                    top = Math.max(8, (vh - height) / 2);
                                                                    left = Math.max(8, (vw - width) / 2);
                                                                }

                                                                setPicker({ open: true, messageId: msg.id, position: { top, left }, width, height });
                                                            }}
                                                            className="text-xs hover:bg-gray-100 p-1 rounded border-1 border-[rgb(120,120,120)] rounded transition-colors duration-400 shadow-sm"
                                                        >
                                                            <Icon name="plus-smile" size={14} className="inline-block" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Input */}
                                <div className="p-4 border-t border-gray-200 bg-white">
                                    {typingUsers.size > 0 && (
                                        <div className="mb-2 text-sm text-gray-500 italic">
                                            {Array.from(typingUsers)
                                                .filter(id => id !== currentUser?.id)
                                                .map(id => {
                                                    const user = userCache.get(id);
                                                    return user ? `${user.firstName} ${user.lastName}` : 'Someone';
                                                })
                                                .join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                                        </div>
                                    )}
                                    <ChatInput onSend={sendMessage} onTypingStart={onTypingStart} onTypingStop={onTypingStop} disabled={chatDisabled} />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function MobileChatDrawer({
    isChatMinimized,
    setIsChatMinimized,
    messages,
    userCache,
    currentUser,
    sendMessage,
    sendReaction,
    removeReaction,
    editMessage,
    handleWheel,
    mobileMessagesRef,
    messageRefs,
    picker,
    setPicker,
    pickerRef,
    typingUsers,
    onTypingStart,
    onTypingStop,
    editingMessageId,
    editingMessageText,
    setEditingMessageId,
    setEditingMessageText,
    chatDisabled,
    cancelled,
}: {
    isChatMinimized: boolean;
    setIsChatMinimized: (minimized: boolean) => void;
    messages: EventChatMessage[];
    userCache: Map<string, User>;
    currentUser: User | null;
    sendMessage: (message: string) => void;
    sendReaction: (messageId: string, reaction: string) => void;
    removeReaction: (reactionId: string) => void;
    editMessage: (messageId: string, newMessage: string) => void;
    handleWheel: (e: React.WheelEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement | null>) => void;
    mobileMessagesRef: React.RefObject<HTMLDivElement | null>;
    messageRefs: React.RefObject<Record<string, HTMLDivElement | null>>;
    picker: { open: boolean; messageId: string; position: { top: number; left: number }; width: number; height: number };
    setPicker: React.Dispatch<React.SetStateAction<{ open: boolean; messageId: string; position: { top: number; left: number }; width: number; height: number }>>;
    pickerRef: React.RefObject<HTMLDivElement | null>;
    typingUsers: Set<string>;
    onTypingStart: () => void;
    onTypingStop: () => void;
    editingMessageId: string | null;
    editingMessageText: string;
    setEditingMessageId: (id: string | null) => void;
    setEditingMessageText: (text: string) => void;
    chatDisabled: boolean;
    cancelled: boolean;
}) {
    return (
        <div className="lg:hidden">
            {/* Floating Chat Icon */}
            <button
                onClick={() => setIsChatMinimized(false)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 z-50"
            >
                <div className="relative">
                    <Icon name="chat" size={24} className="text-white" />
                </div>
            </button>

            {/* Mobile Drawer */}
            <div
                className={`fixed inset-0 transition-all duration-300 ease-out ${isChatMinimized ? 'z-0 opacity-0 pointer-events-none' : 'z-50 opacity-100'
                    }`}
            >
                <div className="bg-black/50 backdrop-blur-sm h-full" onClick={() => setIsChatMinimized(true)} />
                <div
                    className={`absolute inset-0 flex flex-col bg-white transition-transform duration-300 ease-out ${isChatMinimized ? 'translate-y-full' : 'translate-y-0'
                        }`}
                    style={{
                        paddingTop: 'env(safe-area-inset-top)',
                        paddingBottom: 'env(safe-area-inset-bottom)',
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primary-500 rounded-t-2xl">
                        <h3 className="text-lg font-bold text-primary-50">
                            Event Chat
                            <Icon name="chat" size={20} className="text-primary-50 inline-block ml-2" />
                        </h3>
                        <button
                            onClick={() => setIsChatMinimized(true)}
                            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors duration-200"
                        >
                            <Icon name="close" size={16} className="text-gray-600" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div
                            className="flex-1 overflow-y-auto p-4 space-y-3"
                            ref={mobileMessagesRef}
                            onWheel={(e) => handleWheel(e, mobileMessagesRef)}
                        >
                            {messages.length === 0 ? (
                                <p className="text-gray-500 italic text-center">No messages yet. Start the conversation!</p>
                            ) : (
                                messages.map((msg, index) => {
                                    const user = userCache.get(msg.userId) || { firstName: '?', lastName: '' };
                                    const isCurrentUser = currentUser?.id === msg.userId;
                                    const reactions = msg.reactions || [];
                                    return (
                                        <div
                                            key={msg.id}
                                            ref={(el) => { messageRefs.current![msg.id] = el; }}
                                            className={`p-3 rounded-lg ${isCurrentUser ? 'bg-blue-100 ml-4' : 'bg-gray-100 mr-4'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-sm">
                                                    {user.firstName} {user.lastName}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true,
                                                    })}
                                                </span>
                                                {msg.updatedAt > msg.createdAt && (
                                                    <span className="text-xs text-gray-400">(edited)</span>
                                                )}
                                            </div>
                                            {editingMessageId === msg.id ? (
                                                <div className="flex flex-col gap-2">
                                                    <Input
                                                        value={editingMessageText}
                                                        onChange={(e) => setEditingMessageText(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                if (editingMessageText.trim()) {
                                                                    editMessage(msg.id, editingMessageText.trim());
                                                                }
                                                                setEditingMessageId(null);
                                                                setEditingMessageText('');
                                                            } else if (e.key === 'Escape') {
                                                                setEditingMessageId(null);
                                                                setEditingMessageText('');
                                                            }
                                                        }}
                                                        className="flex-1"
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={() => {
                                                                if (editingMessageText.trim()) {
                                                                    editMessage(msg.id, editingMessageText.trim());
                                                                }
                                                                setEditingMessageId(null);
                                                                setEditingMessageText('');
                                                            }}
                                                            variant="primary"
                                                            size="sm"
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            onClick={() => {
                                                                setEditingMessageId(null);
                                                                setEditingMessageText('');
                                                            }}
                                                            variant="secondary"
                                                            size="sm"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <p className="text-gray-900 text-sm flex-1">{msg.message}</p>
                                                    {isCurrentUser && !cancelled && (
                                                        <button
                                                            onClick={() => {
                                                                setEditingMessageId(msg.id);
                                                                setEditingMessageText(msg.message);
                                                            }}
                                                            className="text-xs hover:bg-gray-200 p-1 rounded"
                                                        >
                                                            <Icon name="edit" size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            {reactions.length > 0 && (
                                                <div className="flex gap-1 mt-2 flex-wrap">
                                                    {(() => {
                                                        const groupedReactions = new Map<string, { count: number; reactors: { user: User; reactionId: string }[] }>();
                                                        for (const reaction of reactions) {
                                                            const user = userCache.get(reaction.userId);
                                                            if (!user) continue;
                                                            if (!groupedReactions.has(reaction.reaction)) {
                                                                groupedReactions.set(reaction.reaction, { count: 0, reactors: [] });
                                                            }
                                                            const group = groupedReactions.get(reaction.reaction)!;
                                                            group.count++;
                                                            group.reactors.push({ user, reactionId: reaction.id });
                                                        }
                                                        return Array.from(groupedReactions.entries()).map(([emoji, { count, reactors }]) => {
                                                            const hasReacted = reactors.some(r => r.user.id === currentUser?.id);
                                                            const tooltipContent = reactors.map(r => `${r.user.firstName} ${r.user.lastName}`).join('\n');
                                                            return (
                                                                <Tooltip key={emoji} content={tooltipContent}>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (hasReacted) {
                                                                                const ownReactor = reactors.find(r => r.user.id === currentUser?.id);
                                                                                if (ownReactor) removeReaction(ownReactor.reactionId);
                                                                            } else {
                                                                                sendReaction(msg.id, emoji);
                                                                            }
                                                                        }}
                                                                        className={`text-sm p-1 mt-2 rounded hover:bg-gray-200 border-1 border-[rgb(120,120,120)] shadow-sm select-none transition-colors duration-300 ${hasReacted ? 'bg-blue-100' : ''}`}
                                                                        style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
                                                                    >
                                                                        {emoji}{count > 1 ? <span className="select-none!"> {count}</span> : ''}
                                                                    </button>
                                                                </Tooltip>
                                                            );
                                                        });
                                                    })()}
                                                </div>
                                            )}
                                            <div className="flex gap-1 mt-2 relative">
                                                <button
                                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                                        const vw = window.innerWidth;
                                                        const vh = window.innerHeight;
                                                        const width = vw < 640 ? Math.min(320, vw - 32) : 340;

                                                        // Scroll the message into view to ensure accurate rect
                                                        messageRefs.current![msg.id]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });

                                                        const btnRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                                        let rect = btnRect;
                                                        if (!rect || !isFinite(rect.left) || !isFinite(rect.top)) {
                                                            const msgRect = messageRefs.current![msg.id]?.getBoundingClientRect();
                                                            if (msgRect && isFinite(msgRect.left) && isFinite(msgRect.top)) rect = msgRect;
                                                            else rect = { top: vh / 2, bottom: vh / 2, left: Math.max(8, vw - width - 16) } as DOMRect;
                                                        }

                                                        const availableAbove = rect.top;
                                                        const availableBelow = vh - rect.bottom;
                                                        let height = Math.min(420, Math.max(200, availableBelow >= 360 ? Math.min(420, availableBelow - 16) : Math.min(420, availableAbove - 16)));
                                                        if (height < 200) height = Math.min(200, vh - 32);

                                                        let top: number;
                                                        if (availableBelow >= height + 8 || availableBelow >= availableAbove) {
                                                            top = rect.bottom + 8;
                                                        } else {
                                                            top = Math.max(8, rect.top - height - 8);
                                                        }

                                                        let left = Math.min(Math.max(rect.left, 8), vw - width - 8);
                                                        top = Math.min(Math.max(8, top), vh - height - 8);
                                                        left = Math.min(Math.max(8, left), vw - width - 8);

                                                        // If computed coords are invalid (edge cases), center the picker
                                                        if (!isFinite(top) || !isFinite(left) || !isFinite(width) || !isFinite(height)) {
                                                            top = Math.max(8, (vh - height) / 2);
                                                            left = Math.max(8, (vw - width) / 2);
                                                        }

                                                        setPicker({ open: true, messageId: msg.id, position: { top, left }, width, height });
                                                    }}
                                                    className={`text-xs hover:bg-gray-200 p-1 rounded border-1 border-[rgb(120,120,120)] rounded transition-colors duration-400 shadow-sm ${reactions.length > 0 ? 'mt-3' : ''}`}
                                                >
                                                    <Icon name="plus-smile" size={14} className="inline-block" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            {typingUsers.size > 0 && (
                                <div className="mb-2 text-sm text-gray-500 italic">
                                    {Array.from(typingUsers)
                                        .filter(id => id !== currentUser?.id)
                                        .map(id => {
                                            const user = userCache.get(id);
                                            return user ? `${user.firstName} ${user.lastName}` : 'Someone';
                                        })
                                        .join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                                </div>
                            )}
                            <ChatInput onSend={sendMessage} onTypingStart={onTypingStart} onTypingStop={onTypingStop} disabled={chatDisabled} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ChatDrawer({
    canInteract,
    isChatMinimized,
    setIsChatMinimized,
    messages,
    userCache,
    currentUser,
    sendMessage,
    sendReaction,
    removeReaction,
    editMessage,
    handleWheel,
    socket,
    cancelled,
    eventHostId,
}: ChatDrawerProps) {
    const messagesRef = useRef<HTMLDivElement>(null);
    const mobileMessagesRef = useRef<HTMLDivElement>(null);
    const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const pickerRef = useRef<HTMLDivElement | null>(null);
    const [picker, setPicker] = React.useState<{ open: boolean; messageId: string; position: { top: number; left: number }; width: number; height: number }>({ open: false, messageId: '', position: { top: 0, left: 0 }, width: 320, height: 360 });
    const [typingUsers, setTypingUsers] = React.useState<Set<string>>(new Set());
    const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const [editingMessageId, setEditingMessageId] = React.useState<string | null>(null);
    const [editingMessageText, setEditingMessageText] = React.useState<string>('');

    React.useEffect(() => {
        function handleDocClick(e: MouseEvent) {
            if (!pickerRef.current) return;
            if (!(pickerRef.current as HTMLElement).contains(e.target as Node)) {
                setPicker((p) => (p.open ? { ...p, open: false } : p));
            }
        }
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setPicker((p) => (p.open ? { ...p, open: false } : p));
            }
        }
        function handleTypingStart(data: { userId: string }) {
            setTypingUsers(prev => new Set(prev).add(data.userId));
        }
        function handleTypingStop(data: { userId: string }) {
            setTypingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(data.userId);
                return newSet;
            });
        }
        document.addEventListener('mousedown', handleDocClick);
        document.addEventListener('keydown', handleKey);
        if (socket) {
            socket.on('typing-start', handleTypingStart);
            socket.on('typing-stop', handleTypingStop);
        }
        return () => {
            document.removeEventListener('mousedown', handleDocClick);
            document.removeEventListener('keydown', handleKey);
            if (socket) {
                socket.off('typing-start', handleTypingStart);
                socket.off('typing-stop', handleTypingStop);
            }
        };
    }, [socket]);

    const onTypingStart = React.useCallback(() => {
        if (socket && currentUser) {
            socket.emit('typing-start');
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing-stop');
            }, 3000);
        }
    }, [socket, currentUser]);

    const onTypingStop = React.useCallback(() => {
        if (socket && currentUser) {
            socket.emit('typing-stop');
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
        }
    }, [socket, currentUser]);

    if (!canInteract) return null;

    const chatDisabled = cancelled && currentUser?.id !== eventHostId;

    return (
        <div className="fixed bottom-0 right-0 z-40">
            <DesktopChatDrawer
                isChatMinimized={isChatMinimized}
                setIsChatMinimized={setIsChatMinimized}
                messages={messages}
                userCache={userCache}
                currentUser={currentUser}
                sendMessage={sendMessage}
                sendReaction={sendReaction}
                removeReaction={removeReaction}
                editMessage={editMessage}
                handleWheel={handleWheel}
                messagesRef={messagesRef}
                messageRefs={messageRefs}
                picker={picker}
                setPicker={setPicker}
                pickerRef={pickerRef}
                typingUsers={typingUsers}
                onTypingStart={onTypingStart}
                onTypingStop={onTypingStop}
                editingMessageId={editingMessageId}
                editingMessageText={editingMessageText}
                setEditingMessageId={setEditingMessageId}
                setEditingMessageText={setEditingMessageText}
                chatDisabled={chatDisabled}
                cancelled={cancelled}
            />
            <MobileChatDrawer
                isChatMinimized={isChatMinimized}
                setIsChatMinimized={setIsChatMinimized}
                messages={messages}
                userCache={userCache}
                currentUser={currentUser}
                sendMessage={sendMessage}
                sendReaction={sendReaction}
                removeReaction={removeReaction}
                editMessage={editMessage}
                handleWheel={handleWheel}
                mobileMessagesRef={mobileMessagesRef}
                messageRefs={messageRefs}
                picker={picker}
                setPicker={setPicker}
                pickerRef={pickerRef}
                typingUsers={typingUsers}
                onTypingStart={onTypingStart}
                onTypingStop={onTypingStop}
                editingMessageId={editingMessageId}
                editingMessageText={editingMessageText}
                setEditingMessageId={setEditingMessageId}
                setEditingMessageText={setEditingMessageText}
                chatDisabled={chatDisabled}
                cancelled={cancelled}
            />
            {picker.open && (
                <div
                    ref={pickerRef}
                    style={{
                        position: 'fixed',
                        top: picker.position.top,
                        left: picker.position.left - 15,
                        zIndex: 99999,
                        width: picker.width,
                        height: picker.height,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        borderRadius: 8,
                        overflow: 'hidden',
                        background: 'white',
                    }}
                >
                    <EmojiPicker
                        onEmojiClick={(emojiData) => {
                            sendReaction(picker.messageId, emojiData.emoji);
                            setPicker((p) => ({ ...p, open: false }));
                        }}
                        width={picker.width}
                        height={picker.height}
                        skinTonesDisabled={true}
                        emojiStyle={EmojiStyle.NATIVE}
                        autoFocusSearch={false}
                    />
                </div>
            )}
        </div>
    );
}