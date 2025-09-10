import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Eye,
  Check,
  X,
  Clock,
  AlertCircle,
  Download,
  MessageSquare,
  User,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { Button, Card, Input } from '../ui';

interface DocumentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  uploadDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  reviewedBy?: string;
  reviewDate?: Date;
  rejectionReason?: string;
  comments?: string;
  previewUrl: string;
  priority: 'high' | 'medium' | 'low';
}

interface DocumentReviewProps {
  onStatusChange?: (documentId: string, status: string, reason?: string) => void;
}

// Datos mock para demostración
const mockDocuments: DocumentSubmission[] = [
  {
    id: '1',
    studentId: 'STU001',
    studentName: 'Ana García Pérez',
    documentType: 'Partida de Nacimiento',
    fileName: 'partida_nacimiento_ana.pdf',
    fileSize: 2.5 * 1024 * 1024,
    uploadDate: new Date('2024-01-15T10:30:00'),
    status: 'pending',
    previewUrl: '/api/documents/preview/1',
    priority: 'high'
  },
  {
    id: '2',
    studentId: 'STU002',
    studentName: 'Carlos Mendoza Silva',
    documentType: 'DNI del Estudiante',
    fileName: 'dni_carlos_frente_reverso.jpg',
    fileSize: 1.8 * 1024 * 1024,
    uploadDate: new Date('2024-01-15T11:15:00'),
    status: 'approved',
    reviewedBy: 'María López',
    reviewDate: new Date('2024-01-15T14:20:00'),
    previewUrl: '/api/documents/preview/2',
    priority: 'medium'
  },
  {
    id: '3',
    studentId: 'STU003',
    studentName: 'Lucía Fernández Torres',
    documentType: 'Certificado de Estudios',
    fileName: 'certificado_estudios_lucia.pdf',
    fileSize: 3.2 * 1024 * 1024,
    uploadDate: new Date('2024-01-14T16:45:00'),
    status: 'rejected',
    reviewedBy: 'Pedro Ramírez',
    reviewDate: new Date('2024-01-15T09:30:00'),
    rejectionReason: 'El documento no está firmado por la institución educativa',
    previewUrl: '/api/documents/preview/3',
    priority: 'high'
  },
  {
    id: '4',
    studentId: 'STU001',
    studentName: 'Ana García Pérez',
    documentType: 'DNI del Apoderado',
    fileName: 'dni_apoderado_ana.jpg',
    fileSize: 1.5 * 1024 * 1024,
    uploadDate: new Date('2024-01-15T12:00:00'),
    status: 'processing',
    previewUrl: '/api/documents/preview/4',
    priority: 'medium'
  },
  {
    id: '5',
    studentId: 'STU004',
    studentName: 'Diego Vargas Ruiz',
    documentType: 'Certificado Médico',
    fileName: 'certificado_medico_diego.pdf',
    fileSize: 2.1 * 1024 * 1024,
    uploadDate: new Date('2024-01-15T13:30:00'),
    status: 'pending',
    previewUrl: '/api/documents/preview/5',
    priority: 'low'
  }
];

const DocumentReview: React.FC<DocumentReviewProps> = ({ onStatusChange }) => {
  const [documents, setDocuments] = useState<DocumentSubmission[]>(mockDocuments);
  const [selectedDocument, setSelectedDocument] = useState<DocumentSubmission | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [comments, setComments] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || doc.priority === filterPriority;
    const matchesSearch = doc.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const handleReviewDocument = (document: DocumentSubmission, action: 'approve' | 'reject') => {
    setSelectedDocument(document);
    setReviewAction(action);
    setShowReviewModal(true);
    setRejectionReason('');
    setComments('');
  };

  const submitReview = () => {
    if (!selectedDocument || !reviewAction) return;

    const updatedDocument: DocumentSubmission = {
      ...selectedDocument,
      status: reviewAction === 'approve' ? 'approved' : 'rejected',
      reviewedBy: 'Usuario Actual', // En una app real, esto vendría del contexto de autenticación
      reviewDate: new Date(),
      rejectionReason: reviewAction === 'reject' ? rejectionReason : undefined,
      comments: comments || undefined
    };

    setDocuments(prev => 
      prev.map(doc => 
        doc.id === selectedDocument.id ? updatedDocument : doc
      )
    );

    onStatusChange?.(selectedDocument.id, updatedDocument.status, rejectionReason);
    setShowReviewModal(false);
    setSelectedDocument(null);
  };

  const getStats = () => {
    const total = documents.length;
    const pending = documents.filter(d => d.status === 'pending').length;
    const approved = documents.filter(d => d.status === 'approved').length;
    const rejected = documents.filter(d => d.status === 'rejected').length;
    const processing = documents.filter(d => d.status === 'processing').length;

    return { total, pending, approved, rejected, processing };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            Revisión de Documentos
          </h2>
        </div>
        
        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
            <div className="text-sm text-yellow-600">Pendientes</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{stats.processing}</div>
            <div className="text-sm text-blue-600">Procesando</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
            <div className="text-sm text-green-600">Aprobados</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
            <div className="text-sm text-red-600">Rechazados</div>
          </div>
        </div>
      </Card>

      {/* Filtros y búsqueda */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por estudiante, documento o archivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="processing">Procesando</option>
              <option value="approved">Aprobados</option>
              <option value="rejected">Rechazados</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Todas las prioridades</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de documentos */}
      <div className="space-y-4">
        {filteredDocuments.map((document) => (
          <motion.div
            key={document.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex-shrink-0">
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {document.documentType}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      getPriorityColor(document.priority)
                    }`}>
                      {document.priority === 'high' ? 'Alta' : 
                       document.priority === 'medium' ? 'Media' : 'Baja'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {document.studentName}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {document.uploadDate.toLocaleDateString()}
                    </div>
                    <div>
                      {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {document.fileName}
                  </p>
                  
                  {document.rejectionReason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      <strong>Motivo de rechazo:</strong> {document.rejectionReason}
                    </div>
                  )}
                  
                  {document.reviewedBy && (
                    <div className="mt-1 text-xs text-gray-500">
                      Revisado por {document.reviewedBy} el {document.reviewDate?.toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(document.status)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    getStatusColor(document.status)
                  }`}>
                    {document.status === 'pending' ? 'Pendiente' :
                     document.status === 'approved' ? 'Aprobado' :
                     document.status === 'rejected' ? 'Rechazado' : 'Procesando'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(document.previewUrl, '_blank')}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  {document.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReviewDocument(document, 'approve')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReviewDocument(document, 'reject')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron documentos con los filtros aplicados</p>
          </div>
        )}
      </div>

      {/* Modal de revisión */}
      <AnimatePresence>
        {showReviewModal && selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {reviewAction === 'approve' ? 'Aprobar Documento' : 'Rechazar Documento'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Estudiante:</p>
                    <p className="font-medium">{selectedDocument.studentName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Documento:</p>
                    <p className="font-medium">{selectedDocument.documentType}</p>
                  </div>
                  
                  {reviewAction === 'reject' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Motivo del rechazo *
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        rows={3}
                        placeholder="Explique por qué se rechaza el documento..."
                        required
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comentarios adicionales
                    </label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      rows={2}
                      placeholder="Comentarios opcionales..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={submitReview}
                    disabled={reviewAction === 'reject' && !rejectionReason.trim()}
                    className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                  >
                    {reviewAction === 'approve' ? 'Aprobar' : 'Rechazar'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentReview;