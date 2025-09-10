import { LucideProps } from 'lucide-react';
import React from 'react';


export interface NavItem {
  to: string;
  text: string;
  icon: React.ComponentType<LucideProps>;
  notifications?: number;
  badge?: string;
  progress?: number;
}


export interface Student {
  documentNumber: string;
  studentCode: string;
  paternalLastName: string;
  maternalLastName:string;
  names: string;
  fullName: string;
  gender: 'Hombre' | 'Mujer';
  birthDate: string;
  grade: string;
  section: string;
  avatarUrl: string;
}


export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  timestamp: string;
  status: 'presente' | 'tarde';
  synced: boolean;
}


export interface User {
  dni: string;
  name: string;
  area: string;
  role: string;
  avatarUrl: string;
}