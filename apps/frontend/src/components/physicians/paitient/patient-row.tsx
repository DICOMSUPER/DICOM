'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Patient } from '@/interfaces/patient/patient.interface';
import { MoreHorizontal, Eye, Edit, Trash2, FileText } from 'lucide-react';

interface PatientRowProps {
  patient: Patient;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewRecords: (id: string) => void;
}

export function PatientRow({
  patient,
  onView,
  onEdit,
  onDelete,
  onViewRecords,
}: PatientRowProps) {
  const getInitials = (first: string, last: string) => {
    return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Tính tuổi từ date_of_birth
  const calcAge = (dob: Date) => {
    const birth = new Date(dob);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const fullName = `${patient.first_name} ${patient.last_name}`;
  const statusLabel = patient.is_active ? 'Active' : 'Inactive';

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {/* Nếu sau này bạn có avatar thì thêm field, tạm để trống */}
            <AvatarImage src={''} alt={fullName} />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
              {getInitials(patient.first_name, patient.last_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-gray-900">{fullName}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-600">
        {calcAge(patient.date_of_birth)} • {patient.gender}
      </td>
      <td className="px-6 py-4">
        <Badge
          variant={patient.is_active ? 'default' : 'secondary'}
          className={
            patient.is_active
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          }
        >
          {statusLabel}
        </Badge>
      </td>
      <td className="px-6 py-4 text-gray-600">
        {/* Nếu chưa có lastVisit trong Patient thì dùng created_at */}
        {patient.created_at ? formatDate(new Date(patient.created_at)) : 'N/A'}
      </td>
      <td className="px-6 py-4 text-gray-600">
        {/* condition không có trong Patient, bạn có thể lấy từ medical_history */}
        {patient.medical_history_id ?? '—'}
      </td>
      <td className="px-6 py-4 text-gray-600">
        {/* doctor cũng không có, tạm placeholder */}
        {'—'}
      </td>
      <td className="px-6 py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(patient.patient_id)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewRecords(patient.patient_id)}>
              <FileText className="mr-2 h-4 w-4" />
              Medical Records
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(patient.patient_id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(patient.patient_id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
