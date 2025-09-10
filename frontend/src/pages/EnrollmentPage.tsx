import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  FileText,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Download,
  AlertCircle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Users,
  Clock,
  DollarSign
} from 'lucide-react';
import { Card, Button, Input, useToast } from '../components/ui';
import DocumentManager from '../components/enrollment/DocumentManager';
import PaymentManager from '../components/enrollment/PaymentManager';

// Importar el tipo UploadedDocument
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

interface StudentData {
  // Datos personales
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: string;
  gender: string;
  nationality: string;
  birthPlace: string;
  
  // Contacto
  email: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  department: string;
  
  // Datos académicos
  previousSchool: string;
  graduationYear: string;
  academicLevel: string;
  specialization?: string;
  
  // Datos familiares
  fatherName: string;
  fatherDni: string;
  fatherPhone: string;
  fatherOccupation: string;
  motherName: string;
  motherDni: string;
  motherPhone: string;
  motherOccupation: string;
  emergencyContact: string;
  emergencyPhone: string;
  
  // Datos médicos
  bloodType: string;
  allergies: string;
  medications: string;
  medicalConditions: string;
  
  // Preferencias académicas
  selectedCareer: string;
  selectedShift: string;
  selectedCampus: string;
}

interface Document {
  id: string;
  name: string;
  required: boolean;
  uploaded: boolean;
  file?: File;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  observations?: string;
}

interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  totalAmount: number;
  installments: number;
  monthlyAmount: number;
  discount?: number;
}

const ENROLLMENT_STEPS = [
  { id: 1, title: 'Datos Personales', icon: User },
  { id: 2, title: 'Documentos', icon: FileText },
  { id: 3, title: 'Pago', icon: CreditCard },
  { id: 4, title: 'Confirmación', icon: CheckCircle }
];

const REQUIRED_DOCUMENTS: Document[] = [
  { id: '1', name: 'DNI (copia)', required: true, uploaded: false, status: 'pending' },
  { id: '2', name: 'Certificado de estudios', required: true, uploaded: false, status: 'pending' },
  { id: '3', name: 'Partida de nacimiento', required: true, uploaded: false, status: 'pending' },
  { id: '4', name: 'Foto tamaño carnet (4)', required: true, uploaded: false, status: 'pending' },
  { id: '5', name: 'Certificado médico', required: true, uploaded: false, status: 'pending' },
  { id: '6', name: 'Ficha socioeconómica', required: false, uploaded: false, status: 'pending' },
  { id: '7', name: 'Constancia de trabajo (padres)', required: false, uploaded: false, status: 'pending' }
];

const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: '1',
    name: 'Pago al Contado',
    description: 'Pago único con descuento del 10%',
    totalAmount: 2700,
    installments: 1,
    monthlyAmount: 2700,
    discount: 10
  },
  {
    id: '2',
    name: 'Plan Semestral',
    description: 'Pago en 6 cuotas mensuales',
    totalAmount: 3000,
    installments: 6,
    monthlyAmount: 500
  },
  {
    id: '3',
    name: 'Plan Anual',
    description: 'Pago en 10 cuotas mensuales',
    totalAmount: 3200,
    installments: 10,
    monthlyAmount: 320
  }
];

const CAREERS = [
  'Administración de Empresas',
  'Contabilidad',
  'Computación e Informática',
  'Enfermería Técnica',
  'Farmacia Técnica',
  'Secretariado Ejecutivo',
  'Marketing y Publicidad'
];

const SHIFTS = [
  { value: 'morning', label: 'Mañana (8:00 AM - 1:00 PM)' },
  { value: 'afternoon', label: 'Tarde (2:00 PM - 7:00 PM)' },
  { value: 'night', label: 'Noche (6:00 PM - 10:00 PM)' }
];

const CAMPUSES = [
  'Campus Principal - Lima Centro',
  'Campus Norte - Los Olivos',
  'Campus Sur - Villa El Salvador',
  'Campus Este - Ate Vitarte'
];

export const EnrollmentPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [studentData, setStudentData] = useState<StudentData>({
    firstName: '',
    lastName: '',
    dni: '',
    birthDate: '',
    gender: '',
    nationality: 'Peruana',
    birthPlace: '',
    email: '',
    phone: '',
    address: '',
    district: '',
    province: '',
    department: '',
    previousSchool: '',
    graduationYear: '',
    academicLevel: '',
    specialization: '',
    fatherName: '',
    fatherDni: '',
    fatherPhone: '',
    fatherOccupation: '',
    motherName: '',
    motherDni: '',
    motherPhone: '',
    motherOccupation: '',
    emergencyContact: '',
    emergencyPhone: '',
    bloodType: '',
    allergies: '',
    medications: '',
    medicalConditions: '',
    selectedCareer: '',
    selectedShift: '',
    selectedCampus: ''
  });
  
  const [documents, setDocuments] = useState<Document[]>(REQUIRED_DOCUMENTS);
  const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollmentCode, setEnrollmentCode] = useState<string>('');
  const { success, error } = useToast();

  const progress = (currentStep / ENROLLMENT_STEPS.length) * 100;

  const handleInputChange = (field: keyof StudentData, value: string) => {
    setStudentData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (documentId: string, file: File) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, uploaded: true, file, status: 'uploaded' as const }
        : doc
    ));
    success('Documento subido correctamente');
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        const requiredPersonalFields = [
          'firstName', 'lastName', 'dni', 'birthDate', 'gender',
          'email', 'phone', 'address', 'selectedCareer', 'selectedShift', 'selectedCampus'
        ];
        return requiredPersonalFields.every(field => studentData[field as keyof StudentData]);
      
      case 2:
        const requiredDocs = documents.filter(doc => doc.required);
        return requiredDocs.every(doc => doc.uploaded);
      
      case 3:
        return selectedPaymentPlan !== '';
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, ENROLLMENT_STEPS.length));
    } else {
      error('Por favor complete todos los campos requeridos');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simular envío de datos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generar código de matrícula
      const code = `MAT-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      setEnrollmentCode(code);
      
      success('Matrícula registrada exitosamente');
      setCurrentStep(4);
    } catch (error) {
      error('Error al procesar la matrícula');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPersonalDataStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Datos Personales */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Datos Personales
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombres"
                value={studentData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
              <Input
                label="Apellidos"
                value={studentData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="DNI"
                value={studentData.dni}
                onChange={(e) => handleInputChange('dni', e.target.value)}
                maxLength={8}
                required
              />
              <Input
                label="Fecha de Nacimiento"
                type="date"
                value={studentData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Género *
                </label>
                <select
                  value={studentData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">Seleccionar género</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              <Input
                label="Lugar de Nacimiento"
                value={studentData.birthPlace}
                onChange={(e) => handleInputChange('birthPlace', e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Contacto */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Información de Contacto
          </h3>
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={studentData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
            <Input
              label="Teléfono"
              value={studentData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dirección *
              </label>
              <textarea
                value={studentData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Distrito"
                value={studentData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
              />
              <Input
                label="Provincia"
                value={studentData.province}
                onChange={(e) => handleInputChange('province', e.target.value)}
              />
              <Input
                label="Departamento"
                value={studentData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Datos Académicos */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2" />
            Información Académica
          </h3>
          <div className="space-y-4">
            <Input
              label="Institución de Procedencia"
              value={studentData.previousSchool}
              onChange={(e) => handleInputChange('previousSchool', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Año de Egreso"
                type="number"
                value={studentData.graduationYear}
                onChange={(e) => handleInputChange('graduationYear', e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nivel Académico
                </label>
                <select
                  value={studentData.academicLevel}
                  onChange={(e) => handleInputChange('academicLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Seleccionar nivel</option>
                  <option value="secundaria">Secundaria Completa</option>
                  <option value="superior">Superior Técnico</option>
                  <option value="universitario">Universitario</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Preferencias Académicas */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Preferencias de Estudio
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Carrera Profesional *
              </label>
              <select
                value={studentData.selectedCareer}
                onChange={(e) => handleInputChange('selectedCareer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Seleccionar carrera</option>
                {CAREERS.map(career => (
                  <option key={career} value={career}>{career}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Turno *
              </label>
              <select
                value={studentData.selectedShift}
                onChange={(e) => handleInputChange('selectedShift', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Seleccionar turno</option>
                {SHIFTS.map(shift => (
                  <option key={shift.value} value={shift.value}>{shift.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Campus *
              </label>
              <select
                value={studentData.selectedCampus}
                onChange={(e) => handleInputChange('selectedCampus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Seleccionar campus</option>
                {CAMPUSES.map(campus => (
                  <option key={campus} value={campus}>{campus}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Datos Familiares */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Información Familiar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Datos del Padre</h4>
            <div className="space-y-3">
              <Input
                label="Nombres y Apellidos"
                value={studentData.fatherName}
                onChange={(e) => handleInputChange('fatherName', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="DNI"
                  value={studentData.fatherDni}
                  onChange={(e) => handleInputChange('fatherDni', e.target.value)}
                />
                <Input
                  label="Teléfono"
                  value={studentData.fatherPhone}
                  onChange={(e) => handleInputChange('fatherPhone', e.target.value)}
                />
              </div>
              <Input
                label="Ocupación"
                value={studentData.fatherOccupation}
                onChange={(e) => handleInputChange('fatherOccupation', e.target.value)}
              />
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Datos de la Madre</h4>
            <div className="space-y-3">
              <Input
                label="Nombres y Apellidos"
                value={studentData.motherName}
                onChange={(e) => handleInputChange('motherName', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="DNI"
                  value={studentData.motherDni}
                  onChange={(e) => handleInputChange('motherDni', e.target.value)}
                />
                <Input
                  label="Teléfono"
                  value={studentData.motherPhone}
                  onChange={(e) => handleInputChange('motherPhone', e.target.value)}
                />
              </div>
              <Input
                label="Ocupación"
                value={studentData.motherOccupation}
                onChange={(e) => handleInputChange('motherOccupation', e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Input
            label="Contacto de Emergencia"
            value={studentData.emergencyContact}
            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
          />
          <Input
            label="Teléfono de Emergencia"
            value={studentData.emergencyPhone}
            onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
          />
        </div>
      </Card>
    </div>
  );

  // Función para mapear UploadedDocument a Document
  const mapUploadedToDocument = (uploadedDocs: UploadedDocument[]): Document[] => {
    return uploadedDocs.map(doc => ({
      id: doc.id,
      name: doc.fileName,
      required: true, // Asumimos que todos son requeridos por defecto
      uploaded: doc.status !== 'pending',
      file: doc.file,
      status: doc.status === 'approved' ? 'verified' as const :
              doc.status === 'rejected' ? 'rejected' as const :
              doc.status === 'processing' ? 'uploaded' as const : 'pending' as const,
      observations: doc.rejectionReason
    }));
  };

  const renderDocumentsStep = () => (
    <DocumentManager
      studentId={studentData.dni}
      onDocumentsChange={(docs) => {
        // Convertir UploadedDocument[] a Document[]
        const mappedDocs = mapUploadedToDocument(docs);
        setDocuments(mappedDocs);
      }}
    />
  );

  const renderPaymentStep = () => (
    <PaymentManager
      studentId={studentData.dni}
      totalAmount={2500} // Monto base de matrícula
      onPaymentComplete={(payment) => {
        console.log('Pago completado:', payment);
        setSelectedPaymentPlan(payment.planId);
        // Actualizar estado del proceso de matrícula
      }}
    />
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6">
      {enrollmentCode ? (
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">
            ¡Matrícula Registrada Exitosamente!
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Su código de matrícula es:
          </p>
          <div className="text-3xl font-mono font-bold bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
            {enrollmentCode}
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Guarde este código para futuras consultas. Recibirá un email con los detalles completos.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => window.print()}>
                <Download className="w-4 h-4 mr-2" />
                Imprimir Comprobante
              </Button>
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Nueva Matrícula
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Confirmación de Datos
          </h3>
          
          <div className="space-y-6">
            {/* Resumen de datos personales */}
            <div>
              <h4 className="font-medium mb-3">Datos del Estudiante</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p><strong>Nombre:</strong> {studentData.firstName} {studentData.lastName}</p>
                <p><strong>DNI:</strong> {studentData.dni}</p>
                <p><strong>Email:</strong> {studentData.email}</p>
                <p><strong>Teléfono:</strong> {studentData.phone}</p>
                <p><strong>Carrera:</strong> {studentData.selectedCareer}</p>
                <p><strong>Turno:</strong> {SHIFTS.find(s => s.value === studentData.selectedShift)?.label}</p>
                <p><strong>Campus:</strong> {studentData.selectedCampus}</p>
              </div>
            </div>
            
            {/* Resumen de documentos */}
            <div>
              <h4 className="font-medium mb-3">Documentos</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Documentos subidos: {documents.filter(d => d.uploaded).length} de {documents.length}
                </p>
                <div className="flex flex-wrap gap-2">
                  {documents.filter(d => d.uploaded).map(doc => (
                    <span key={doc.id} className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm">
                      {doc.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Resumen de pago */}
            <div>
              <h4 className="font-medium mb-3">Plan de Pago</h4>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                {(() => {
                  const plan = PAYMENT_PLANS.find(p => p.id === selectedPaymentPlan);
                  return plan ? (
                    <div>
                      <p><strong>Plan:</strong> {plan.name}</p>
                      <p><strong>Total:</strong> S/ {plan.totalAmount.toLocaleString()}</p>
                      <p><strong>Cuotas:</strong> {plan.installments}</p>
                      {plan.discount && (
                        <p><strong>Descuento:</strong> {plan.discount}%</p>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Matrícula
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Proceso de Matrícula
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete todos los pasos para registrar su matrícula
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            {ENROLLMENT_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted ? 'bg-green-500 border-green-500 text-white' :
                    isActive ? 'bg-blue-500 border-blue-500 text-white' :
                    'bg-gray-200 border-gray-300 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : 
                      isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < ENROLLMENT_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </Card>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && renderPersonalDataStep()}
            {currentStep === 2 && renderDocumentsStep()}
            {currentStep === 3 && renderPaymentStep()}
            {currentStep === 4 && renderConfirmationStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {!enrollmentCode && (
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            
            {currentStep < ENROLLMENT_STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
              >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollmentPage;