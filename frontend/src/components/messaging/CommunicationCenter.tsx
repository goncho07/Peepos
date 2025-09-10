import React, { useState, useEffect, useRef } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Loading from '../ui/Loading';
import { apiService } from '../../services/apiClient';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { 
  PaperAirplaneIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  PaperClipIcon,
  FaceSmileIcon,
  PhoneIcon,
  VideoCameraIcon
} from '@heroicons/react/24/outline';

interface Message {
  id: number;
  sender_id: number;
  recipient_id?: number;
  recipient_type: 'user' | 'group' | 'class' | 'all';
  subject: string;
  content: string;
  message_type: 'info' | 'warning' | 'urgent' | 'announcement' | 'personal';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'sent' | 'delivered' | 'read';
  sent_at?: string;
  read_at?: string;
  attachments?: MessageAttachment[];
  sender: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  recipient?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  replies?: Message[];
  parent_id?: number;
}

interface MessageAttachment {
  id: number;
  filename: string;
  file_url: string;
  file_size: number;
  mime_type: string;
}

interface Conversation {
  id: number;
  participants: User[];
  last_message: Message;
  unread_count: number;
  updated_at: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  role: string;
  is_online?: boolean;
}

interface MessageFormData {
  recipient_id?: number;
  recipient_type: 'user' | 'group' | 'class' | 'all';
  subject: string;
  content: string;
  message_type: 'info' | 'warning' | 'urgent' | 'announcement' | 'personal';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments: File[];
}

export const CommunicationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'compose' | 'conversations'>('inbox');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all',
    status: 'all'
  });
  const [formData, setFormData] = useState<MessageFormData>({
    recipient_type: 'user',
    subject: '',
    content: '',
    message_type: 'info',
    priority: 'medium',
    attachments: []
  });
  const [replyContent, setReplyContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useAuthStore();

  useEffect(() => {
    fetchMessages();
    fetchConversations();
    fetchUsers();
    fetchClasses();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      if (activeTab === 'conversations' && selectedConversation) {
        fetchConversationMessages(selectedConversation.id);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [activeTab, filters]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedMessage?.replies]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.priority !== 'all') params.priority = filters.priority;
      if (filters.status !== 'all') params.status = filters.status;
      if (searchTerm) params.search = searchTerm;
      
      const endpoint = activeTab === 'sent' ? 'sent' : 'inbox';
      const response = await apiService.communications?.getAll({ ...params, type: endpoint }) || { data: { data: [] } };
      setMessages(response.data.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Error al cargar los mensajes');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await apiService.communications?.getConversations() || { data: { data: [] } };
      setConversations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchConversationMessages = async (conversationId: number) => {
    try {
      const response = await apiService.communications?.getConversationMessages(conversationId) || { data: { data: [] } };
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: response.data.data || []
        } : null);
      }
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiService.users?.getAll() || { data: { data: [] } };
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await apiService.classes.getAll();
      setClasses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const messageData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'attachments') {
          (value as File[]).forEach(file => {
            messageData.append('attachments[]', file);
          });
        } else {
          messageData.append(key, value as string);
        }
      });
      
      await apiService.communications?.create(messageData);
      toast.success('Mensaje enviado exitosamente');
      
      setIsComposeModalOpen(false);
      resetForm();
      fetchMessages();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Error al enviar el mensaje');
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMessage || !replyContent.trim()) return;
    
    try {
      await apiService.communications?.reply({
        message_id: selectedMessage.id,
        content: replyContent,
        message_type: 'personal'
      });
      
      toast.success('Respuesta enviada');
      setReplyContent('');
      setIsReplyModalOpen(false);
      
      // Refresh message details
      const response = await apiService.communications?.getById(selectedMessage.id);
      if (response?.data) {
        setSelectedMessage(response.data);
      }
    } catch (error: any) {
      console.error('Error sending reply:', error);
      toast.error('Error al enviar la respuesta');
    }
  };

  const markAsRead = async (messageId: number) => {
    try {
      await apiService.communications?.markAsRead(messageId);
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const deleteMessage = async (messageId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este mensaje?')) {
      return;
    }
    
    try {
      await apiService.communications?.delete(messageId);
      toast.success('Mensaje eliminado');
      setSelectedMessage(null);
      fetchMessages();
    } catch (error: any) {
      console.error('Error deleting message:', error);
      toast.error('Error al eliminar el mensaje');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      recipient_type: 'user',
      subject: '',
      content: '',
      message_type: 'info',
      priority: 'medium',
      attachments: []
    });
  };

  const openComposeModal = () => {
    resetForm();
    setIsComposeModalOpen(true);
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'urgent':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'announcement':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'personal':
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-green-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'read':
        return 'text-green-600';
      case 'delivered':
        return 'text-blue-600';
      case 'sent':
        return 'text-gray-600';
      case 'draft':
        return 'text-yellow-600';
      default:
        return 'text-gray-400';
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = !searchTerm || 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${message.sender.first_name} ${message.sender.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading && messages.length === 0) {
    return <Loading />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Centro de Comunicaciones
          </h1>
          <Button onClick={openComposeModal}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo Mensaje
          </Button>
        </div>
        
        {/* Tabs */}
        <div className="mt-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'inbox', label: 'Bandeja de Entrada', icon: ChatBubbleLeftRightIcon },
              { key: 'sent', label: 'Enviados', icon: PaperAirplaneIcon },
              { key: 'conversations', label: 'Conversaciones', icon: UserGroupIcon }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar mensajes..."
                className="pl-10"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="text-xs px-2 py-1 border border-gray-300 rounded"
              >
                <option value="all">Todos</option>
                <option value="info">Info</option>
                <option value="warning">Advertencia</option>
                <option value="urgent">Urgente</option>
                <option value="announcement">Anuncio</option>
              </select>
              
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="text-xs px-2 py-1 border border-gray-300 rounded"
              >
                <option value="all">Prioridad</option>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="text-xs px-2 py-1 border border-gray-300 rounded"
              >
                <option value="all">Estado</option>
                <option value="unread">No leído</option>
                <option value="read">Leído</option>
                <option value="draft">Borrador</option>
              </select>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'conversations' ? (
              <div className="space-y-1">
                {conversations.map(conversation => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <UserGroupIcon className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conversation.participants.map(p => `${p.first_name} ${p.last_name}`).join(', ')}
                          </p>
                          {conversation.unread_count > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {conversation.unread_count}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.last_message.content}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(conversation.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredMessages.map(message => (
                  <div
                    key={message.id}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (message.status !== 'read' && activeTab === 'inbox') {
                        markAsRead(message.id);
                      }
                    }}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedMessage?.id === message.id ? 'bg-blue-50 border-blue-200' : ''
                    } ${
                      message.status !== 'read' && activeTab === 'inbox' ? 'bg-blue-25' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getMessageTypeIcon(message.message_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium truncate ${
                            message.status !== 'read' && activeTab === 'inbox' ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {activeTab === 'sent' ? 
                              (message.recipient ? `${message.recipient.first_name} ${message.recipient.last_name}` : 'Múltiples destinatarios') :
                              `${message.sender.first_name} ${message.sender.last_name}`
                            }
                          </p>
                          <div className="flex items-center space-x-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(message.priority)}`}>
                              {message.priority}
                            </span>
                            {activeTab === 'sent' && (
                              <CheckCircleIcon className={`h-4 w-4 ${getStatusColor(message.status)}`} />
                            )}
                          </div>
                        </div>
                        <p className={`text-sm truncate ${
                          message.status !== 'read' && activeTab === 'inbox' ? 'text-gray-900 font-medium' : 'text-gray-600'
                        }`}>
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {message.content}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-400">
                            {message.sent_at ? new Date(message.sent_at).toLocaleString() : 'Borrador'}
                          </p>
                          {message.attachments && message.attachments.length > 0 && (
                            <PaperClipIcon className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedMessage ? (
            <>
              {/* Message Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getMessageTypeIcon(selectedMessage.message_type)}
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {selectedMessage.subject}
                      </h2>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-gray-600">
                          De: {selectedMessage.sender.first_name} {selectedMessage.sender.last_name}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedMessage.priority)}`}>
                          {selectedMessage.priority}
                        </span>
                        <p className="text-xs text-gray-400">
                          {selectedMessage.sent_at ? new Date(selectedMessage.sent_at).toLocaleString() : 'Borrador'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsReplyModalOpen(true)}
                    >
                      Responder
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMessage(selectedMessage.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800">
                    {selectedMessage.content}
                  </div>
                  
                  {/* Attachments */}
                  {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Archivos adjuntos:</h4>
                      <div className="space-y-2">
                        {selectedMessage.attachments.map(attachment => (
                          <div key={attachment.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <PaperClipIcon className="h-5 w-5 text-gray-400" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(attachment.file_size)}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(attachment.file_url, '_blank')}
                            >
                              Descargar
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Replies */}
                  {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Respuestas:</h4>
                      <div className="space-y-4">
                        {selectedMessage.replies.map(reply => (
                          <div key={reply.id} className="border-l-4 border-blue-200 pl-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <p className="text-sm font-medium text-gray-900">
                                {reply.sender.first_name} {reply.sender.last_name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {reply.sent_at ? new Date(reply.sent_at).toLocaleString() : ''}
                              </p>
                            </div>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap">
                              {reply.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </div>
            </>
          ) : selectedConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Conversation Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {selectedConversation.participants.map(p => `${p.first_name} ${p.last_name}`).join(', ')}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.participants.length} participantes
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <PhoneIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <VideoCameraIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Conversation Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="text-center text-gray-500">
                  Selecciona una conversación para ver los mensajes
                </div>
              </div>
              
              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <PaperClipIcon className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Escribe un mensaje..."
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm">
                    <FaceSmileIcon className="h-4 w-4" />
                  </Button>
                  <Button size="sm">
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Selecciona un mensaje para ver su contenido</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <Modal
        isOpen={isComposeModalOpen}
        onClose={() => {
          setIsComposeModalOpen(false);
          resetForm();
        }}
        title="Nuevo Mensaje"
        size="lg"
      >
        <form onSubmit={sendMessage} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Destinatario
              </label>
              <select
                value={formData.recipient_type}
                onChange={(e) => setFormData({ ...formData, recipient_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="user">Usuario específico</option>
                <option value="class">Clase completa</option>
                <option value="group">Grupo</option>
                <option value="all">Todos los usuarios</option>
              </select>
            </div>
            
            {formData.recipient_type === 'user' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destinatario
                </label>
                <select
                  value={formData.recipient_id || ''}
                  onChange={(e) => setFormData({ ...formData, recipient_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar usuario</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} - {user.role}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {formData.recipient_type === 'class' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clase
                </label>
                <select
                  value={formData.recipient_id || ''}
                  onChange={(e) => setFormData({ ...formData, recipient_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar clase</option>
                  {classes.map((classItem: any) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.name} - {classItem.schedule}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Mensaje
              </label>
              <select
                value={formData.message_type}
                onChange={(e) => setFormData({ ...formData, message_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="info">Información</option>
                <option value="warning">Advertencia</option>
                <option value="urgent">Urgente</option>
                <option value="announcement">Anuncio</option>
                <option value="personal">Personal</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>
          
          <Input
            label="Asunto"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              required
            />
          </div>
          
          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivos adjuntos
            </label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <PaperClipIcon className="h-4 w-4 mr-2" />
                Adjuntar archivo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            
            {formData.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsComposeModalOpen(false);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              <PaperAirplaneIcon className="h-4 w-4 mr-2" />
              Enviar Mensaje
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reply Modal */}
      <Modal
        isOpen={isReplyModalOpen}
        onClose={() => {
          setIsReplyModalOpen(false);
          setReplyContent('');
        }}
        title="Responder Mensaje"
        size="md"
      >
        <form onSubmit={sendReply} className="space-y-4">
          {selectedMessage && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-900">
                Respondiendo a: {selectedMessage.subject}
              </p>
              <p className="text-xs text-gray-500">
                De: {selectedMessage.sender.first_name} {selectedMessage.sender.last_name}
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tu respuesta
            </label>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Escribe tu respuesta..."
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsReplyModalOpen(false);
                setReplyContent('');
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              <PaperAirplaneIcon className="h-4 w-4 mr-2" />
              Enviar Respuesta
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CommunicationCenter;