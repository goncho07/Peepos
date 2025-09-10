import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  FileText,
  Download,
  Filter,
  Search,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';
import { Button, Card, Input } from '../components/ui';

interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
  reference: string;
  concept: string;
  installment?: string;
}

interface PaymentStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  completedPayments: number;
  refundedAmount: number;
}

const PaymentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  // Mock data
  const stats: PaymentStats = {
    totalRevenue: 125000,
    monthlyRevenue: 45000,
    pendingPayments: 12,
    completedPayments: 156,
    refundedAmount: 2500
  };

  const payments: PaymentRecord[] = [
    {
      id: 'PAY-001',
      studentId: 'EST-001',
      studentName: 'Juan Pérez',
      amount: 2500,
      method: 'Tarjeta de Crédito',
      status: 'completed',
      date: '2024-01-15',
      reference: 'REF-ABC123',
      concept: 'Matrícula 2024',
      installment: '1/1'
    },
    {
      id: 'PAY-002',
      studentId: 'EST-002',
      studentName: 'María García',
      amount: 1250,
      method: 'Transferencia Bancaria',
      status: 'pending',
      date: '2024-01-14',
      reference: 'REF-DEF456',
      concept: 'Matrícula 2024',
      installment: '1/2'
    },
    {
      id: 'PAY-003',
      studentId: 'EST-003',
      studentName: 'Carlos López',
      amount: 833,
      method: 'Pago Móvil',
      status: 'completed',
      date: '2024-01-13',
      reference: 'REF-GHI789',
      concept: 'Matrícula 2024',
      installment: '1/3'
    },
    {
      id: 'PAY-004',
      studentId: 'EST-004',
      studentName: 'Ana Rodríguez',
      amount: 2500,
      method: 'Tarjeta de Débito',
      status: 'failed',
      date: '2024-01-12',
      reference: 'REF-JKL012',
      concept: 'Matrícula 2024',
      installment: '1/1'
    },
    {
      id: 'PAY-005',
      studentId: 'EST-005',
      studentName: 'Luis Martínez',
      amount: 1250,
      method: 'Transferencia Bancaria',
      status: 'refunded',
      date: '2024-01-11',
      reference: 'REF-MNO345',
      concept: 'Matrícula 2024',
      installment: '2/2'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'refunded': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Fallido';
      case 'refunded': return 'Reembolsado';
      default: return status;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Ingresos Totales
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${stats.totalRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Este Mes
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${stats.monthlyRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
            <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pendientes
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.pendingPayments}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Completados
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.completedPayments}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <TrendingDown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Reembolsos
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${stats.refundedAmount.toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderFilters = () => (
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por estudiante, referencia o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="completed">Completados</option>
            <option value="pending">Pendientes</option>
            <option value="failed">Fallidos</option>
            <option value="refunded">Reembolsados</option>
          </select>
          
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los métodos</option>
            <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
            <option value="Tarjeta de Débito">Tarjeta de Débito</option>
            <option value="Transferencia Bancaria">Transferencia Bancaria</option>
            <option value="Pago Móvil">Pago Móvil</option>
          </select>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderPaymentsList = () => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Historial de Pagos</h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {filteredPayments.length} de {payments.length} pagos
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                Estudiante
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                Concepto
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                Monto
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                Método
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                Estado
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                Fecha
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <tr
                key={payment.id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium">{payment.studentName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {payment.studentId}
                    </p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium">{payment.concept}</p>
                    {payment.installment && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Cuota {payment.installment}
                      </p>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold">
                    ${payment.amount.toLocaleString()}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm">{payment.method}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    getStatusColor(payment.status)
                  }`}>
                    {getStatusText(payment.status)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm">
                    {new Date(payment.date).toLocaleDateString()}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPayment(payment)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const renderPaymentModal = () => {
    if (!selectedPayment) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Detalles del Pago</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPayment(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">ID:</span>
              <span className="font-medium">{selectedPayment.id}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Estudiante:</span>
              <span className="font-medium">{selectedPayment.studentName}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Concepto:</span>
              <span className="font-medium">{selectedPayment.concept}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Monto:</span>
              <span className="font-semibold text-lg">
                ${selectedPayment.amount.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Método:</span>
              <span className="font-medium">{selectedPayment.method}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Estado:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                getStatusColor(selectedPayment.status)
              }`}>
                {getStatusText(selectedPayment.status)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Referencia:</span>
              <span className="font-medium">{selectedPayment.reference}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
              <span className="font-medium">
                {new Date(selectedPayment.date).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Recibo
            </Button>
            <Button variant="outline" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Factura
            </Button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Pagos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Administra los pagos y finanzas del instituto
          </p>
        </div>
        
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Generar Reporte
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {renderStatsCards()}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {renderFilters()}
      </motion.div>

      {/* Payments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {renderPaymentsList()}
      </motion.div>

      {/* Payment Modal */}
      {renderPaymentModal()}
    </div>
  );
};

export default PaymentsPage;