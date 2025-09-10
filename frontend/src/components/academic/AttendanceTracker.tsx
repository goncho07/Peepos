import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import DataTable from '../ui/DataTable';
import Loading from '../ui/Loading';
import { apiService } from '../../services/apiClient';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { 
  PlusIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface Attendance {
  id: number;
  student_id: number;
  class_id: number;
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  arrival_time?: string;
  departure_time?: string;
  notes?: string;
  student: {
    id: number;
    student_code: string;
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
  class: {
    id: number;
    name: string;
    course: {
      name: string;
      course_code: string;
    };
  };
}

interface AttendanceFormData {
  student_id: number;
  class_id: number;
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  arrival_time?: string;
  departure_time?: string;
  notes?: string;
}

interface AttendanceTrackerProps {
  classId?: number;
  studentId?: number;
  date?: string;
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ 
  classId, 
  studentId, 
  date 
}) => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null);
  const [selectedDate, setSelectedDate] = useState(date || new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState<AttendanceFormData>({
    student_id: studentId || 0,
    class_id: classId || 0,
    attendance_date: selectedDate,
    status: 'present',
    arrival_time: '',
    departure_time: '',
    notes: ''
  });
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [bulkAttendance, setBulkAttendance] = useState<{[key: number]: string}>({});
  
  const { user } = useAuthStore();

  useEffect(() => {
    fetchAttendances();
    if (!studentId) fetchStudents();
    if (!classId) fetchClasses();
  }, [classId, studentId, selectedDate]);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      const params: any = {
        date: selectedDate
      };
      if (classId) params.class_id = classId;
      if (studentId) params.student_id = studentId;
      
      const response = await apiService.attendance.getAll(params);
      setAttendances(response.data.data || []);
    } catch (error) {
      console.error('Error fetching attendances:', error);
      toast.error('Error al cargar la asistencia');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await apiService.students.getAll();
      setStudents(response.data.data || []);
      
      // Initialize bulk attendance for all students
      const initialBulk: {[key: number]: string} = {};
      response.data.data.forEach((student: any) => {
        initialBulk[student.id] = 'present';
      });
      setBulkAttendance(initialBulk);
    } catch (error) {
      console.error('Error fetching students:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAttendance) {
        await apiService.attendance.update(editingAttendance.id, formData);
        toast.success('Asistencia actualizada exitosamente');
      } else {
        await apiService.attendance.create(formData);
        toast.success('Asistencia registrada exitosamente');
      }
      
      setIsModalOpen(false);
      setEditingAttendance(null);
      resetForm();
      fetchAttendances();
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      toast.error(error.response?.data?.message || 'Error al guardar la asistencia');
    }
  };

  const handleBulkSubmit = async () => {
    try {
      const attendanceData = Object.entries(bulkAttendance).map(([studentId, status]) => ({
        student_id: parseInt(studentId),
        class_id: formData.class_id,
        attendance_date: selectedDate,
        status: status as 'present' | 'absent' | 'late' | 'excused'
      }));

      await apiService.attendance.bulkCreate(attendanceData);
      toast.success('Asistencia masiva registrada exitosamente');
      setIsBulkModalOpen(false);
      fetchAttendances();
    } catch (error: any) {
      console.error('Error saving bulk attendance:', error);
      toast.error(error.response?.data?.message || 'Error al guardar la asistencia masiva');
    }
  };

  const handleEdit = (attendance: Attendance) => {
    setEditingAttendance(attendance);
    setFormData({
      student_id: attendance.student_id,
      class_id: attendance.class_id,
      attendance_date: attendance.attendance_date.split('T')[0],
      status: attendance.status,
      arrival_time: attendance.arrival_time || '',
      departure_time: attendance.departure_time || '',
      notes: attendance.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleQuickStatusChange = async (attendanceId: number, newStatus: 'present' | 'absent' | 'late' | 'excused') => {
    try {
      await apiService.attendance.update(attendanceId, { status: newStatus });
      toast.success('Estado de asistencia actualizado');
      fetchAttendances();
    } catch (error: any) {
      console.error('Error updating attendance status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: studentId || 0,
      class_id: classId || 0,
      attendance_date: selectedDate,
      status: 'present',
      arrival_time: '',
      departure_time: '',
      notes: ''
    });
  };

  const openCreateModal = () => {
    setEditingAttendance(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openBulkModal = () => {
    setIsBulkModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'absent':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'late':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'excused':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'excused':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present':
        return 'Presente';
      case 'absent':
        return 'Ausente';
      case 'late':
        return 'Tardanza';
      case 'excused':
        return 'Justificado';
      default:
        return status;
    }
  };

  const getAttendanceStats = () => {
    const total = attendances.length;
    const present = attendances.filter(a => a.status === 'present').length;
    const absent = attendances.filter(a => a.status === 'absent').length;
    const late = attendances.filter(a => a.status === 'late').length;
    const excused = attendances.filter(a => a.status === 'excused').length;
    
    return { total, present, absent, late, excused };
  };

  const stats = getAttendanceStats();

  const columns = [
    {
      key: 'student',
      label: 'Estudiante',
      render: (attendance: Attendance) => (
        <div>
          <div className="font-medium">
            {attendance.student.user.first_name} {attendance.student.user.last_name}
          </div>
          <div className="text-sm text-gray-500">{attendance.student.student_code}</div>
        </div>
      )
    },
    {
      key: 'class',
      label: 'Clase',
      render: (attendance: Attendance) => (
        <div>
          <div className="font-medium">{attendance.class.name}</div>
          <div className="text-sm text-gray-500">
            {attendance.class.course.course_code} - {attendance.class.course.name}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (attendance: Attendance) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(attendance.status)}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(attendance.status)}`}>
            {getStatusLabel(attendance.status)}
          </span>
        </div>
      )
    },
    {
      key: 'times',
      label: 'Horarios',
      render: (attendance: Attendance) => (
        <div className="text-sm">
          {attendance.arrival_time && (
            <div>Llegada: {attendance.arrival_time}</div>
          )}
          {attendance.departure_time && (
            <div>Salida: {attendance.departure_time}</div>
          )}
        </div>
      )
    },
    {
      key: 'notes',
      label: 'Notas',
      render: (attendance: Attendance) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {attendance.notes || '-'}
        </div>
      )
    },
    {
      key: 'quick_actions',
      label: 'Acciones Rápidas',
      render: (attendance: Attendance) => (
        <div className="flex space-x-1">
          <button
            onClick={() => handleQuickStatusChange(attendance.id, 'present')}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Marcar presente"
          >
            <CheckCircleIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleQuickStatusChange(attendance.id, 'absent')}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Marcar ausente"
          >
            <XCircleIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleQuickStatusChange(attendance.id, 'late')}
            className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
            title="Marcar tardanza"
          >
            <ClockIcon className="h-4 w-4" />
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(attendance)}
            className="p-1"
          >
            Editar
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Presentes</p>
              <p className="text-2xl font-semibold text-green-600">{stats.present}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Ausentes</p>
              <p className="text-2xl font-semibold text-red-600">{stats.absent}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tardanzas</p>
              <p className="text-2xl font-semibold text-yellow-600">{stats.late}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Justificados</p>
              <p className="text-2xl font-semibold text-blue-600">{stats.excused}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Control de Asistencia
            </h2>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={openBulkModal}>
              <UserGroupIcon className="h-4 w-4 mr-2" />
              Registro Masivo
            </Button>
            <Button onClick={openCreateModal}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nueva Asistencia
            </Button>
          </div>
        </div>

        <DataTable
          data={attendances}
          columns={columns}
          searchable
          searchPlaceholder="Buscar asistencias..."
        />
      </Card>

      {/* Individual Attendance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAttendance(null);
          resetForm();
        }}
        title={editingAttendance ? 'Editar Asistencia' : 'Nueva Asistencia'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!studentId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estudiante
              </label>
              <select
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar estudiante</option>
                {students.map((student: any) => (
                  <option key={student.id} value={student.id}>
                    {student.user.first_name} {student.user.last_name} - {student.student_code}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!classId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clase
              </label>
              <select
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar clase</option>
                {classes.map((classItem: any) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input
            label="Fecha"
            type="date"
            value={formData.attendance_date}
            onChange={(e) => setFormData({ ...formData, attendance_date: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="present">Presente</option>
              <option value="absent">Ausente</option>
              <option value="late">Tardanza</option>
              <option value="excused">Justificado</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hora de Llegada"
              type="time"
              value={formData.arrival_time}
              onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
            />
            <Input
              label="Hora de Salida"
              type="time"
              value={formData.departure_time}
              onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Notas adicionales..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingAttendance(null);
                resetForm();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {editingAttendance ? 'Actualizar' : 'Registrar'} Asistencia
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Attendance Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Registro Masivo de Asistencia"
        size="lg"
      >
        <div className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clase
            </label>
            <select
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar clase</option>
              {classes.map((classItem: any) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {students.map((student: any) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {student.user.first_name} {student.user.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{student.student_code}</div>
                  </div>
                  <select
                    value={bulkAttendance[student.id] || 'present'}
                    onChange={(e) => setBulkAttendance({
                      ...bulkAttendance,
                      [student.id]: e.target.value
                    })}
                    className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="present">Presente</option>
                    <option value="absent">Ausente</option>
                    <option value="late">Tardanza</option>
                    <option value="excused">Justificado</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBulkModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleBulkSubmit}>
              Registrar Asistencia Masiva
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AttendanceTracker;