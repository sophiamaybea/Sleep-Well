import React, { useState, useEffect } from 'react';
import { Send, Inbox, MessageCircle } from 'lucide-react';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

const GardenWalkInbox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendMessageMutation, { isPending }] = useState({ isPending: false });

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now(),
        sender: 'You',
        content: newMessage,
        timestamp: new Date(),
        isRead: true
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 text-white">
            <div className="flex items-center gap-3">
              <Inbox className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Garden Walk Inbox</h1>
            </div>
            <p className="text-white/80 mt-2">Connect with your garden community</p>
          </div>

          {/* Messages List */}
          <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No messages yet</p>
                <p className="text-gray-400">Start a conversation with your garden friends</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.sender === 'You'
                      ? 'bg-green-100 ml-auto max-w-[80%]'
                      : 'bg-gray-100 mr-auto max-w-[80%]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-700">
                      {message.sender}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-800">{message.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray/[0.08] pt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                placeholder="Type your feedback message..."
                className="flex-grow bg-white/[0.15] rounded-lg border border-white/[0.2] px-4 py-2"
              />
              <button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending || !newMessage.trim()}
                className="px-4 py-2 rounded-lg bg-white/[0.08] border border-white/[0.2] hover:bg-white/[0.15] transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Section */}
      <div className="flex-grow flex items-center justify-center">
        <p className="font-serif text-sm text-white/50 italic">
          Select a submission to view details.
        </p>
      </div>
    </div>
  );
};

export default GardenWalkInbox;
