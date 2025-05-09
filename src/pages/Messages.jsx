import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Send, MoreVertical } from 'lucide-react';

export default function Messages() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Private Tuition Center',
      lastMessage: 'Thank you for your application. When can you start?',
      time: '10:30 AM',
      unread: true,
      avatar: '👨‍🏫'
    },
    {
      id: 2,
      name: 'Local Grocery Store',
      lastMessage: 'We would like to schedule an interview.',
      time: 'Yesterday',
      unread: false,
      avatar: '🏪'
    },
    {
      id: 3,
      name: 'City Pharmacy',
      lastMessage: 'Your application has been accepted!',
      time: '2 days ago',
      unread: false,
      avatar: '💊'
    }
  ];

  const messages = selectedChat ? [
    {
      id: 1,
      sender: 'Private Tuition Center',
      message: 'Hello! Thank you for your application.',
      time: '10:30 AM',
      isUser: false
    },
    {
      id: 2,
      sender: 'You',
      message: 'Thank you for considering my application.',
      time: '10:31 AM',
      isUser: true
    },
    {
      id: 3,
      sender: 'Private Tuition Center',
      message: 'When can you start?',
      time: '10:32 AM',
      isUser: false
    }
  ] : [];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // TODO: Implement message sending logic
      setMessage('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="grid grid-cols-12 h-[600px]">
          {/* Conversations List */}
          <div className="col-span-4 border-r border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 focus:border-blue-600 focus:ring-blue-600"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
            <div className="overflow-y-auto h-[calc(600px-73px)]">
              {conversations.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                    selectedChat === chat.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{chat.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900 truncate">
                          {chat.name}
                        </h3>
                        <span className="text-sm text-gray-500">{chat.time}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                    {chat.unread && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-8 flex flex-col">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {conversations.find(c => c.id === selectedChat)?.avatar}
                    </div>
                    <div>
                      <h2 className="font-medium text-gray-900">
                        {conversations.find(c => c.id === selectedChat)?.name}
                      </h2>
                      <p className="text-sm text-gray-500">Active now</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                    <MoreVertical className="h-5 w-5 text-gray-500" />
                  </Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          msg.isUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{msg.message}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1 focus:border-blue-600 focus:ring-blue-600"
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 