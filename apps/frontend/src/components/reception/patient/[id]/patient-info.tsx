import { Badge } from "@/components/ui/badge";
import { Patient } from "@/interfaces/patient/patient-workflow.interface";
import { Calendar, FileText, Heart, MapPin, Phone, User } from "lucide-react";
import React from "react";

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
    <div className="rounded-2xl p-6 shadow border-border border space-y-6">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <User className="h-5 w-5" />
        Patient Information
      </div>

      {/* Hero Section */}
      <section className="rounded-[28px] bg-linear-to-br from-primary/10 via-background to-background shadow-lg ring-1 ring-border/30 p-6 lg:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm">
              <User className="h-3.5 w-3.5" />
              {patient?.patientCode || "N/A"}
            </div>
            <div>
              <p className="text-3xl font-semibold text-foreground leading-tight">
                {patient?.firstName} {patient?.lastName}
              </p>
              <div className="mt-3 grid gap-2 text-sm text-foreground">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {patient?.dateOfBirth
                    ? new Date(patient.dateOfBirth).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Date of birth not set"}
                </p>
                <p className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {patient?.gender ? formatGender(patient.gender) : "Gender not specified"}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-4 text-right">
            <Badge
              className={`${getStatusColor(patient?.isActive ?? true)} px-4 py-1 text-xs font-semibold shadow-sm`}
            >
              {patient?.isActive ? "Active" : "Inactive"}
            </Badge>
            {patient?.bloodType && (
              <div className="rounded-2xl bg-background/70 px-4 py-3 text-sm text-foreground shadow">
                <p className="uppercase text-xs tracking-wide">Blood Type</p>
                <p className="text-base font-semibold text-foreground flex items-center gap-1 justify-end">
                  <Heart className="h-4 w-4" />
                  {patient.bloodType}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-foreground">Date of Birth</p>
              <p className="text-lg font-semibold text-foreground">
                {patient?.dateOfBirth
                  ? new Date(patient.dateOfBirth).toLocaleDateString()
                  : "N/A"}
              </p>
              <p className="text-xs text-foreground">Birth date</p>
            </div>
          </div>
          <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-foreground">Gender</p>
              <p className="text-lg font-semibold text-foreground">
                {patient?.gender ? formatGender(patient.gender) : "N/A"}
              </p>
              <p className="text-xs text-foreground">Patient gender</p>
            </div>
          </div>
          <div className="rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-border/20 flex items-start gap-3 transition hover:ring-border/40">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-foreground">Blood Type</p>
              <p className="text-lg font-semibold text-foreground">
                {patient?.bloodType || "N/A"}
              </p>
              <p className="text-xs text-foreground">Blood group</p>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="rounded-2xl p-6 shadow border-border border space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <User className="h-5 w-5" />
          Contact Information
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Phone className="h-4 w-4" />
              Phone Number
            </div>
            <p className="text-base font-semibold text-foreground">
              {patient?.phoneNumber || "N/A"}
            </p>
          </div>
          <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10 md:col-span-2">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <MapPin className="h-4 w-4" />
              Address
            </div>
            <p className="text-base font-semibold text-foreground">
              {patient?.address || "N/A"}
            </p>
          </div>
          <div className="rounded-2xl bg-primary/10 text-foreground p-4 shadow-sm space-y-2 ring-1 ring-border/10 md:col-span-3">
            <div className="flex items-center gap-2 text-sm text-foreground">
              <FileText className="h-4 w-4" />
              Insurance Number
            </div>
            <p className="text-base font-semibold text-foreground">
              {patient?.insuranceNumber || "N/A"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
