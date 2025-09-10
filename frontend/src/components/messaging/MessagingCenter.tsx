import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  Search,
  Plus,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Users,
  Star,
  Archive,
  Trash2,
  Circle,
  CheckCheck,
  Clock
} from 'lucide-react';
import { Card, Button, Input } from '../ui';

interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
  replyTo?: string;
}

interface Conversation {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  isPinned: boolean;
  isArchived: boolean;
}

const MessagingCenter: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      participants: [
        {
          id: '2',
          name: 'María González',
          avatar: 'https://ui-avatars.com/api/?name=Ana+Garcia&background=6366f1&color=fff&size=150',
          role: 'Docente',
          status: 'online'
        }
      ],
      lastMessage: {
        id: '1',
        senderId: '2',
        content: 'Hola, necesito revisar las calificaciones del examen',
        timestamp: new Date(Date.now() - 300000),
        type: 'text',
        status: 'read'
      },
      unreadCount: 2,
      isGroup: false,
      isPinned: true,
      isArchived: false
    },
    {
      id: '2',
      participants: [
        {
          id: '3',
          name: 'Carlos Ruiz',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
          role: 'Administrador',
          status: 'away'
        }
      ],
      lastMessage: {
        id: '2',
        senderId: '3',
        content: 'Los reportes están listos para revisión',
        timestamp: new Date(Date.now() - 3600000),
        type: 'text',
        status: 'delivered'
      },
      unreadCount: 0,
      isGroup: false,
      isPinned: false,
      isArchived: false
    },
    {
      id: '3',
      participants: [
        {
          id: '4',
          name: 'Ana Martínez',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
          role: 'Secretaria',
          status: 'offline',
          lastSeen: '2 horas'
        },
        {
          id: '5',
          name: 'Luis Torres',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          role: 'Docente',
          status: 'online'
        }
      ],
      lastMessage: {
        id: '3',
        senderId: '4',
        content: 'Reunión programada para mañana a las 10:00 AM',
        timestamp: new Date(Date.now() - 7200000),
        type: 'text',
        status: 'read'
      },
      unreadCount: 1,
      isGroup: true,
      groupName: 'Equipo Administrativo',
      isPinned: false,
      isArchived: false
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: '2',
      content: 'Hola, ¿cómo estás?',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
      status: 'read'
    },
    {
      id: '2',
      senderId: '1',
      content: 'Muy bien, gracias. ¿En qué puedo ayudarte?',
      timestamp: new Date(Date.now() - 3300000),
      type: 'text',
      status: 'read'
    },
    {
      id: '3',
      senderId: '2',
      content: 'Necesito revisar las calificaciones del examen de matemáticas',
      timestamp: new Date(Date.now() - 300000),
      type: 'text',
      status: 'read'
    },
    {
      id: '4',
      senderId: '2',
      content: '¿Podrías enviarme el archivo cuando tengas tiempo?',
      timestamp: new Date(Date.now() - 60000),
      type: 'text',
      status: 'delivered'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = {
    id: '1',
    name: 'Director',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      content: newMessage,
      timestamp: new Date(),
      type: 'text',
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simular entrega del mensaje
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        )
      );
    }, 1000);
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sent':
        return <Circle className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      conv.groupName?.toLowerCase().includes(searchLower) ||
      conv.participants.some(p => p.name.toLowerCase().includes(searchLower)) ||
      conv.lastMessage.content.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Sidebar - Lista de conversaciones */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header del sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Mensajes</h2>
            <Button
              onClick={() => setShowNewChat(true)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lista de conversaciones */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => {
            const otherParticipant = conversation.participants[0];
            const isSelected = selectedConversation?.id === conversation.id;
            
            return (
              <motion.div
                key={conversation.id}
                whileHover={{ backgroundColor: '#f9fafb' }}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 cursor-pointer border-b border-gray-100 transition-colors ${
                  isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    {conversation.isGroup ? (
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    ) : (
                      <img
                        src={otherParticipant.avatar}
                        alt={otherParticipant.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    {!conversation.isGroup && (
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(otherParticipant.status)} rounded-full border-2 border-white`}></div>
                    )}
                  </div>

                  {/* Información de la conversación */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.isGroup ? conversation.groupName : otherParticipant.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        {conversation.isPinned && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                        <span className="text-xs text-gray-500">
                          {conversation.lastMessage.timestamp.toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.content}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Área principal del chat */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Header del chat */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {selectedConversation.isGroup ? (
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                  ) : (
                    <img
                      src={selectedConversation.participants[0].avatar}
                      alt={selectedConversation.participants[0].name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  {!selectedConversation.isGroup && (
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(selectedConversation.participants[0].status)} rounded-full border-2 border-white`}></div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">
                    {selectedConversation.isGroup 
                      ? selectedConversation.groupName 
                      : selectedConversation.participants[0].name
                    }
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedConversation.isGroup 
                      ? `${selectedConversation.participants.length} participantes`
                      : selectedConversation.participants[0].status === 'online' 
                        ? 'En línea' 
                        : `Última vez: ${selectedConversation.participants[0].lastSeen || 'hace tiempo'}`
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Video className="h-4 w-4" />
                </Button>
                <Button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            <AnimatePresence>
              {messages.map((message) => {
                const isOwn = message.senderId === currentUser.id;
                const sender = isOwn 
                  ? currentUser 
                  : selectedConversation.participants.find(p => p.id === message.senderId);
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isOwn && (
                        <img
                          src={sender?.avatar}
                          alt={sender?.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      
                      <div className={`px-4 py-2 rounded-2xl ${isOwn 
                        ? 'bg-blue-500 text-white rounded-br-md' 
                        : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                            {message.timestamp.toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {isOwn && getStatusIcon(message.status)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Área de entrada de mensaje */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <Button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="pr-12 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full transition-colors"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una conversación</h3>
            <p className="text-gray-500">Elige una conversación para comenzar a chatear</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingCenter;