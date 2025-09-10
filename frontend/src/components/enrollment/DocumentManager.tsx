import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  Check,
  X,
  Eye,
  Download,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Camera,
  Scan
} from 'lucide-react';
import { Button, Card, Input } from '../ui';

interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
  formats: string[];
  maxSize: number; // in MB
  examples?: string[];
}

interface UploadedDocument {
  id: string;
  documentTypeId: string;
  fileName: string;
  fileSize: number;
  uploadDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  rejectionReason?: string;
  previewUrl?: string;
  file?: File;
}

interface DocumentManagerProps {
  studentId?: string;
  onDocumentsChange?: (documents: UploadedDocument[]) => void;
  readOnly?: boolean;
}

const documentTypes: DocumentType[] = [
  {
    id: 'birth-certificate',
    name: 'Partida de Nacimiento',
    description: 'Documento oficial que certifica el nacimiento del estudiante',
    required: true,
    formats: ['pdf', 'jpg', 'jpeg', 'png'],
    maxSize: 5,
    examples: ['Partida de nacimiento original', 'Copia certificada']
  },
  {
    id: 'dni-student',
    name: 'DNI del Estudiante',
    description: 'Documento Nacional de Identidad del estudiante (ambas caras)',
    required: true,
    formats: ['pdf', 'jpg', 'jpeg', 'png'],
    maxSize: 3
  },
  {
    id: 'dni-parent',
    name: 'DNI del Apoderado',
    description: 'Documento Nacional de Identidad del padre/madre/apoderado',
    required: true,
    formats: ['pdf', 'jpg', 'jpeg', 'png'],
    maxSize: 3
  },
  {
    id: 'academic-record',
    name: 'Certificado de Estudios',
    description: 'Certificado de estudios del año anterior o libreta de notas',
    required: true,
    formats: ['pdf', 'jpg', 'jpeg', 'png'],
    maxSize: 10
  },
  {
    id: 'medical-certificate',
    name: 'Certificado Médico',
    description: 'Certificado médico de aptitud física y mental',
    required: true,
    formats: ['pdf', 'jpg', 'jpeg', 'png'],
    maxSize: 5
  },
  {
    id: 'vaccination-card',
    name: 'Carnet de Vacunas',
    description: 'Carnet de vacunas actualizado',
    required: false,
    formats: ['pdf', 'jpg', 'jpeg', 'png'],
    maxSize: 5
  },
  {
    id: 'photos',
    name: 'Fotografías',
    description: '4 fotografías tamaño carnet fondo blanco',
    required: true,
    formats: ['jpg', 'jpeg', 'png'],
    maxSize: 2
  }
];

const DocumentManager: React.FC<DocumentManagerProps> = ({
  studentId,
  onDocumentsChange,
  readOnly = false
}) => {
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [previewDocument, setPreviewDocument] = useState<UploadedDocument | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDocumentStatus = (documentTypeId: string) => {
    const doc = uploadedDocuments.find(d => d.documentTypeId === documentTypeId);
    return doc?.status || 'missing';
  };

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
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      case 'processing':
        return 'bg-blue-50 border-blue-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const validateFile = (file: File, documentType: DocumentType): string | null => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !documentType.formats.includes(fileExtension)) {
      return `Formato no válido. Formatos permitidos: ${documentType.formats.join(', ')}`;
    }
    
    if (file.size > documentType.maxSize * 1024 * 1024) {
      return `Archivo muy grande. Tamaño máximo: ${documentType.maxSize}MB`;
    }
    
    return null;
  };

  const handleFileUpload = async (file: File, documentType: DocumentType) => {
    const validationError = validateFile(file, documentType);
    if (validationError) {
      alert(validationError);
      return;
    }

    const documentId = `${documentType.id}-${Date.now()}`;
    
    // Simular progreso de subida
    setUploadProgress(prev => ({ ...prev, [documentId]: 0 }));
    
    const newDocument: UploadedDocument = {
      id: documentId,
      documentTypeId: documentType.id,
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date(),
      status: 'processing',
      previewUrl: URL.createObjectURL(file),
      file
    };

    // Remover documento anterior del mismo tipo
    setUploadedDocuments(prev => {
      const filtered = prev.filter(d => d.documentTypeId !== documentType.id);
      return [...filtered, newDocument];
    });

    // Simular progreso
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(prev => ({ ...prev, [documentId]: i }));
    }

    // Simular procesamiento
    setTimeout(() => {
      setUploadedDocuments(prev => 
        prev.map(d => 
          d.id === documentId 
            ? { ...d, status: 'pending' }
            : d
        )
      );
      setUploadProgress(prev => {
        const { [documentId]: _, ...rest } = prev;
        return rest;
      });
    }, 1000);

    onDocumentsChange?.(uploadedDocuments);
  };

  const handleDrop = (e: React.DragEvent, documentType: DocumentType) => {
    e.preventDefault();
    setDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0], documentType);
    }
  };

  const handleFileSelect = (documentType: DocumentType) => {
    setSelectedDocument(documentType);
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedDocument) {
      handleFileUpload(file, selectedDocument);
    }
    e.target.value = '';
  };

  const removeDocument = (documentId: string) => {
    setUploadedDocuments(prev => prev.filter(d => d.id !== documentId));
    onDocumentsChange?.(uploadedDocuments.filter(d => d.id !== documentId));
  };

  const getCompletionStats = () => {
    const requiredDocs = documentTypes.filter(dt => dt.required);
    const completedRequired = requiredDocs.filter(dt => {
      const status = getDocumentStatus(dt.id);
      return status === 'approved' || status === 'pending' || status === 'processing';
    }).length;
    
    const totalOptional = documentTypes.filter(dt => !dt.required).length;
    const completedOptional = documentTypes.filter(dt => !dt.required).filter(dt => {
      const status = getDocumentStatus(dt.id);
      return status === 'approved' || status === 'pending' || status === 'processing';
    }).length;

    return {
      required: { completed: completedRequired, total: requiredDocs.length },
      optional: { completed: completedOptional, total: totalOptional }
    };
  };

  const stats = getCompletionStats();

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            Gestión de Documentos
          </h2>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Requeridos: {stats.required.completed}/{stats.required.total}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Opcionales: {stats.optional.completed}/{stats.optional.total}</span>
            </div>
          </div>
        </div>
        
        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(stats.required.completed / stats.required.total) * 100}%` 
            }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {stats.required.completed === stats.required.total 
            ? '¡Todos los documentos requeridos han sido subidos!' 
            : `Faltan ${stats.required.total - stats.required.completed} documentos requeridos`
          }
        </p>
      </Card>

      {/* Lista de documentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentTypes.map((documentType) => {
          const status = getDocumentStatus(documentType.id);
          const uploadedDoc = uploadedDocuments.find(d => d.documentTypeId === documentType.id);
          const progress = uploadedDoc ? uploadProgress[uploadedDoc.id] : undefined;

          return (
            <motion.div
              key={documentType.id}
              layout
              className={`border-2 border-dashed rounded-lg p-4 transition-all ${
                dragOver === documentType.id 
                  ? 'border-blue-400 bg-blue-50' 
                  : getStatusColor(status)
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(documentType.id);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, documentType)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <h3 className="font-medium text-gray-900">{documentType.name}</h3>
                    {documentType.required && (
                      <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                        Requerido
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{documentType.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos: {documentType.formats.join(', ')} | Máx: {documentType.maxSize}MB
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(status)}
                </div>
              </div>

              {uploadedDoc ? (
                <div className="space-y-3">
                  {/* Información del archivo subido */}
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">{uploadedDoc.fileName}</p>
                          <p className="text-xs text-gray-500">
                            {(uploadedDoc.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {uploadedDoc.previewUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewDocument(uploadedDoc)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {!readOnly && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeDocument(uploadedDoc.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Barra de progreso de subida */}
                    {progress !== undefined && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Mensaje de rechazo */}
                    {uploadedDoc.status === 'rejected' && uploadedDoc.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Rechazado:</strong> {uploadedDoc.rejectionReason}
                      </div>
                    )}
                  </div>
                  
                  {/* Botón para reemplazar */}
                  {!readOnly && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileSelect(documentType)}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Reemplazar Archivo
                    </Button>
                  )}
                </div>
              ) : (
                /* Zona de subida */
                !readOnly && (
                  <div className="text-center py-8">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      Arrastra y suelta tu archivo aquí o
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => handleFileSelect(documentType)}
                    >
                      Seleccionar Archivo
                    </Button>
                  </div>
                )
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Input oculto para selección de archivos */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInputChange}
        accept={selectedDocument?.formats.map(f => `.${f}`).join(',')}
      />

      {/* Modal de previsualización */}
      <AnimatePresence>
        {previewDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewDocument(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">{previewDocument.fileName}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewDocument(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4">
                {previewDocument.previewUrl && (
                  <img
                    src={previewDocument.previewUrl}
                    alt={previewDocument.fileName}
                    className="max-w-full max-h-[70vh] object-contain mx-auto"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentManager;