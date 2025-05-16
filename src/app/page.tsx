"use client"
import { useState } from 'react';
// import UserForm from './components/AdminForm';
import LoginForm from './components/LoginForm';
interface EmployeeFormProps {
  onSubmit: (data: EmployeeFormData) => void;
}

export interface EmployeeFormData {
  name: string;
  email: string;
  password: string;
  role: 'Employee' | 'Manager' | 'HR' | 'Director';
  managerId?: string;
  hrId?: string;
  directorId?: string;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
  });

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { name, value } = e.target;
  //   setFormData(prev => ({ ...prev, [name]: value }));
  // // };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   onSubmit(formData);
  // };

  return (
   <><LoginForm /></>  );
};

export default EmployeeForm;
