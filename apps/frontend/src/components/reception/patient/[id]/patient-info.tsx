import { Badge } from "@/components/ui/badge";
import { Patient } from "@/common/interfaces/patient/patient-workflow.interface";
import { Calendar, FileText, Heart, MapPin, Phone, User } from "lucide-react";
import React from "react";
import { formatDate } from "@/common/lib/formatTimeDate";
import { modalStyles } from "@/common/utils/format-status";

// Format gender for display
const formatGender = (gender: string | null | undefined): string => {
  if (!gender) return "N/A";
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
};

export default function PatientInfo({ patient }: { patient: Patient }) {
  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-rose-100 text-rose-700 border-rose-200";
  };

  return (
    <div className={modalStyles.section}>
      <div className={modalStyles.sectionHeader}>
        <div className={modalStyles.sectionIconContainer}>
          <User className={modalStyles.sectionIcon} />
        </div>
        <h3 className={modalStyles.sectionTitle}>Patient Information</h3>
      </div>

      {/* Hero Section */}
      <section className={modalStyles.heroSection}>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-4">
            <div className={`${modalStyles.heroLabel} inline-flex items-center gap-2`}>
              <User className="h-3.5 w-3.5" />
              {patient?.patientCode || "N/A"}
            </div>
            <div>
              <p className={modalStyles.heroTitle}>
                {patient?.firstName} {patient?.lastName}
              </p>
            </div>
          </div>
          <div className="space-y-4 text-right">
            <Badge
              className={`${getStatusColor(patient?.isActive ?? true)} px-4 py-1 text-xs font-semibold shadow-sm`}
            >
              {patient?.isActive ? "Active" : "Inactive"}
            </Badge>
            {patient?.bloodType && (
              <div className={modalStyles.infoCard}>
                <p className={modalStyles.infoCardLabel}>Blood Type</p>
                <p className={`${modalStyles.infoCardLarge} flex items-center gap-1 justify-end`}>
                  <Heart className="h-4 w-4" />
                  {patient.bloodType}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className={modalStyles.infoCard}>
            <div className={modalStyles.sectionIconContainer}>
              <Calendar className={modalStyles.sectionIcon} />
            </div>
            <div>
              <p className={modalStyles.infoCardLabel}>Date of Birth</p>
              <p className={modalStyles.infoCardLarge}>
                {patient?.dateOfBirth
                  ? formatDate(patient.dateOfBirth)
                  : "N/A"}
              </p>
              <p className="text-xs text-slate-500">Birth date</p>
            </div>
          </div>
          <div className={modalStyles.infoCard}>
            <div className={modalStyles.sectionIconContainer}>
              <User className={modalStyles.sectionIcon} />
            </div>
            <div>
              <p className={modalStyles.infoCardLabel}>Gender</p>
              <p className={modalStyles.infoCardLarge}>
                {patient?.gender ? formatGender(patient.gender) : "N/A"}
              </p>
              <p className="text-xs text-slate-500">Patient gender</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className={`${modalStyles.section} mt-6`}>
        <div className={modalStyles.sectionHeader}>
          <div className={modalStyles.sectionIconContainer}>
            <Phone className={modalStyles.sectionIcon} />
          </div>
          <h3 className={modalStyles.sectionTitle}>Contact Information</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className={modalStyles.gridCard}>
            <div className={modalStyles.gridCardLabel}>
              <Phone className={modalStyles.gridCardIcon} />
              Phone Number
            </div>
            <p className={modalStyles.gridCardValue}>
              {patient?.phoneNumber || "N/A"}
            </p>
          </div>
          <div className={`${modalStyles.gridCard} md:col-span-2`}>
            <div className={modalStyles.gridCardLabel}>
              <MapPin className={modalStyles.gridCardIcon} />
              Address
            </div>
            <p className={modalStyles.gridCardValue}>
              {patient?.address || "N/A"}
            </p>
          </div>
          <div className={`${modalStyles.gridCard} md:col-span-3`}>
            <div className={modalStyles.gridCardLabel}>
              <FileText className={modalStyles.gridCardIcon} />
              Insurance Number
            </div>
            <p className={modalStyles.gridCardValue}>
              {patient?.insuranceNumber || "N/A"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
