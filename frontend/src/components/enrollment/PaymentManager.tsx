import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Receipt,
  Building2,
  Smartphone,
  Wallet,
  FileText,
  Eye,
  X
} from 'lucide-react';
import { Button, Card, Input } from '../ui';

interface PaymentPlan {
  id: string;
  name: string;
  description: string;
  totalAmount: number;
  installments: number;
  monthlyAmount: number;
  dueDate: string;
  discount?: number;
  popular?: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  processingFee: number;
  available: boolean;
}

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  date: string;
  reference: string;
  receipt?: string;
  planId: string;
}

interface PaymentManagerProps {
  studentId: string;
  totalAmount: number;
  onPaymentComplete: (payment: Payment) => void;
}

const PaymentManager: React.FC<PaymentManagerProps> = ({
  studentId,
  totalAmount,
  onPaymentComplete
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    bankAccount: '',
    phoneNumber: ''
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showReceipt, setShowReceipt] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const paymentPlans: PaymentPlan[] = [
    {
      id: 'full',
      name: 'Pago Completo',
      description: 'Paga el total de la matrícula de una vez',
      totalAmount: totalAmount,
      installments: 1,
      monthlyAmount: totalAmount,
      dueDate: '2024-03-15',
      discount: 10,
      popular: true
    },
    {
      id: 'bimonthly',
      name: 'Plan Bimestral',
      description: 'Divide el pago en 2 cuotas bimestrales',
      totalAmount: totalAmount,
      installments: 2,
      monthlyAmount: totalAmount / 2,
      dueDate: '2024-02-15'
    },
    {
      id: 'quarterly',
      name: 'Plan Trimestral',
      description: 'Divide el pago en 3 cuotas trimestrales',
      totalAmount: totalAmount,
      installments: 3,
      monthlyAmount: totalAmount / 3,
      dueDate: '2024-01-15'
    },
    {
      id: 'monthly',
      name: 'Plan Mensual',
      description: 'Divide el pago en 6 cuotas mensuales',
      totalAmount: totalAmount * 1.05, // 5% de recargo
      installments: 6,
      monthlyAmount: (totalAmount * 1.05) / 6,
      dueDate: '2024-01-15'
    }
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Tarjeta de Crédito/Débito',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Visa, Mastercard, American Express',
      processingFee: 2.5,
      available: true
    },
    {
      id: 'bank',
      name: 'Transferencia Bancaria',
      icon: <Building2 className="w-5 h-5" />,
      description: 'Transferencia directa desde tu banco',
      processingFee: 0,
      available: true
    },
    {
      id: 'mobile',
      name: 'Pago Móvil',
      icon: <Smartphone className="w-5 h-5" />,
      description: 'Pago a través de aplicaciones móviles',
      processingFee: 1.5,
      available: true
    },
    {
      id: 'wallet',
      name: 'Billetera Digital',
      icon: <Wallet className="w-5 h-5" />,
      description: 'PayPal, Skrill, otros',
      processingFee: 3.0,
      available: false
    }
  ];

  const handlePayment = async () => {
    if (!selectedPlan || !selectedMethod) return;

    setProcessing(true);
    
    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const selectedPlanData = paymentPlans.find(p => p.id === selectedPlan)!;
    const newPayment: Payment = {
      id: `PAY-${Date.now()}`,
      planId: selectedPlan,
      amount: selectedPlanData.monthlyAmount,
      method: selectedMethod,
      status: Math.random() > 0.1 ? 'completed' : 'failed',
      date: new Date().toISOString(),
      reference: `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      receipt: `receipt-${Date.now()}.pdf`
    };
    
    setPayments(prev => [...prev, newPayment]);
    setProcessing(false);
    
    if (newPayment.status === 'completed') {
      onPaymentComplete(newPayment);
    }
  };

  const renderPaymentPlans = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Selecciona tu Plan de Pago</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentPlans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative cursor-pointer transition-all ${
              selectedPlan === plan.id
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <Card className="p-6">
              {plan.popular && (
                <div className="absolute -top-2 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Más Popular
                </div>
              )}
              
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-lg">{plan.name}</h4>
                {plan.discount && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    -{plan.discount}% desc.
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {plan.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total:</span>
                  <span className="font-semibold">${plan.totalAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cuotas:</span>
                  <span className="font-semibold">{plan.installments}x</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Por cuota:</span>
                  <span className="font-semibold text-blue-600">
                    ${plan.monthlyAmount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Vencimiento:</span>
                  <span className="text-sm">{plan.dueDate}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Método de Pago</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <motion.div
            key={method.id}
            whileHover={{ scale: method.available ? 1.02 : 1 }}
            whileTap={{ scale: method.available ? 0.98 : 1 }}
            className={`cursor-pointer transition-all ${
              !method.available ? 'opacity-50 cursor-not-allowed' :
              selectedMethod === method.id
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'hover:shadow-md'
            }`}
            onClick={() => method.available && setSelectedMethod(method.id)}
          >
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  {method.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{method.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {method.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Comisión: {method.processingFee}%
                  </p>
                </div>
                {!method.available && (
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    No disponible
                  </span>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderPaymentForm = () => {
    if (!selectedMethod) return null;

    const method = paymentMethods.find(m => m.id === selectedMethod)!;

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Datos de Pago - {method.name}</h3>
        
        {selectedMethod === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Número de Tarjeta</label>
              <Input
                placeholder="1234 5678 9012 3456"
                value={paymentData.cardNumber}
                onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Fecha de Vencimiento</label>
              <Input
                placeholder="MM/AA"
                value={paymentData.expiryDate}
                onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">CVV</label>
              <Input
                placeholder="123"
                value={paymentData.cvv}
                onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Nombre en la Tarjeta</label>
              <Input
                placeholder="Juan Pérez"
                value={paymentData.cardName}
                onChange={(e) => setPaymentData(prev => ({ ...prev, cardName: e.target.value }))}
              />
            </div>
          </div>
        )}
        
        {selectedMethod === 'bank' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Número de Cuenta</label>
              <Input
                placeholder="0123456789"
                value={paymentData.bankAccount}
                onChange={(e) => setPaymentData(prev => ({ ...prev, bankAccount: e.target.value }))}
              />
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium mb-2">Datos para Transferencia</h4>
              <div className="text-sm space-y-1">
                <p><strong>Banco:</strong> Banco Nacional</p>
                <p><strong>Cuenta:</strong> 1234-5678-9012-3456</p>
                <p><strong>Titular:</strong> Instituto Educativo</p>
                <p><strong>Referencia:</strong> {studentId}</p>
              </div>
            </div>
          </div>
        )}
        
        {selectedMethod === 'mobile' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Número de Teléfono</label>
              <Input
                placeholder="+58 412 123 4567"
                value={paymentData.phoneNumber}
                onChange={(e) => setPaymentData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium mb-2">Instrucciones</h4>
              <p className="text-sm">
                Recibirás un SMS con las instrucciones para completar el pago.
              </p>
            </div>
          </div>
        )}
      </Card>
    );
  };

  const renderPaymentHistory = () => {
    if (payments.length === 0) return null;

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Historial de Pagos</h3>
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  payment.status === 'completed' ? 'bg-green-500' :
                  payment.status === 'processing' ? 'bg-yellow-500' :
                  payment.status === 'failed' ? 'bg-red-500' :
                  'bg-gray-500'
                }`} />
                
                <div>
                  <p className="font-medium">${payment.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {payment.reference} • {new Date(payment.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                  payment.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {payment.status === 'completed' ? 'Completado' :
                   payment.status === 'processing' ? 'Procesando' :
                   payment.status === 'failed' ? 'Fallido' : 'Pendiente'}
                </span>
                
                {payment.receipt && payment.status === 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReceipt(payment.id)}
                  >
                    <Receipt className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {renderPaymentPlans()}
      
      {selectedPlan && renderPaymentMethods()}
      
      {selectedMethod && renderPaymentForm()}
      
      {selectedPlan && selectedMethod && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total a pagar: <span className="font-semibold text-lg">
              ${paymentPlans.find(p => p.id === selectedPlan)?.monthlyAmount.toLocaleString()}
            </span>
          </div>
          
          <Button
            onClick={handlePayment}
            disabled={processing}
            className="min-w-[120px]"
          >
            {processing ? (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Procesando...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>Pagar Ahora</span>
              </div>
            )}
          </Button>
        </div>
      )}
      
      {renderPaymentHistory()}
      
      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowReceipt(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Recibo de Pago</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReceipt(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Referencia:</span>
                  <span className="font-medium">{showReceipt}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estudiante:</span>
                  <span>{studentId}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${paymentPlans.find(p => p.id === selectedPlan)?.monthlyAmount.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <Button variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
                <Button variant="outline" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentManager;