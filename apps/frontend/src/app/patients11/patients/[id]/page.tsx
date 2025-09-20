"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { PatientForward } from "@/components/reception/patient-forward";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Save,
  FileText
} from "lucide-react";

interface PatientDetails {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  mrn: string;
  insuranceProvider: string;
  insuranceNumber: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  status: "Active" | "Inactive" | "Scheduled";
}

// Mock data - Replace with API call
const mockPatientData: PatientDetails = {
  id: "1",
  firstName: "John",
  lastName: "Doe",
  dateOfBirth: "1980-05-15",
  gender: "Male",
  email: "john.doe@email.com",
  phone: "(555) 123-4567",
  address: "123 Main St, Anytown, ST 12345",
  mrn: "2024001",
  insuranceProvider: "Health Plus",
  insuranceNumber: "HP123456789",
  emergencyContact: {
    name: "Jane Doe",
    phone: "(555) 987-6543",
    relationship: "Spouse"
  },
  status: "Active"
};

export default function PatientDetailsPage() {
  const params = useParams();
  const [patient, setPatient] = useState<PatientDetails>(mockPatientData);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    // TODO: Implement save functionality
  };

  return (
    <WorkspaceLayout sidebar={<SidebarNav userRole="Reception Staff" />}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Patient Details
            </h1>
            <p className="text-sm text-foreground">
              View and manage patient information
            </p>
          </div>
          <Badge 
            variant={patient.status === "Active" ? "default" : "secondary"}
            className="text-sm"
          >
            {patient.status}
          </Badge>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="forward">Forward Patient</TabsTrigger>
            <TabsTrigger value="conditions">Patient Conditions</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Basic patient details and contact information
                  </CardDescription>
                </div>
                <Button 
                  variant={isEditing ? "default" : "outline"}
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    "Edit Information"
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input 
                      disabled={!isEditing}
                      value={patient.firstName}
                      onChange={(e) => setPatient({...patient, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input 
                      disabled={!isEditing}
                      value={patient.lastName}
                      onChange={(e) => setPatient({...patient, lastName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input 
                      type="date"
                      disabled={!isEditing}
                      value={patient.dateOfBirth}
                      onChange={(e) => setPatient({...patient, dateOfBirth: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <select 
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={!isEditing}
                      value={patient.gender}
                      onChange={(e) => setPatient({...patient, gender: e.target.value})}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-foreground" />
                    <Label>Phone Number</Label>
                  </div>
                  <Input 
                    disabled={!isEditing}
                    value={patient.phone}
                    onChange={(e) => setPatient({...patient, phone: e.target.value})}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-foreground" />
                    <Label>Email Address</Label>
                  </div>
                  <Input 
                    type="email"
                    disabled={!isEditing}
                    value={patient.email}
                    onChange={(e) => setPatient({...patient, email: e.target.value})}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-foreground" />
                    <Label>Address</Label>
                  </div>
                  <textarea 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                    disabled={!isEditing}
                    value={patient.address}
                    onChange={(e) => setPatient({...patient, address: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
                <CardDescription>
                  Insurance and medical record details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Medical Record Number (MRN)</Label>
                    <Input 
                      disabled
                      value={patient.mrn}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Insurance Provider</Label>
                    <Input 
                      disabled={!isEditing}
                      value={patient.insuranceProvider}
                      onChange={(e) => setPatient({...patient, insuranceProvider: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Insurance Number</Label>
                    <Input 
                      disabled={!isEditing}
                      value={patient.insuranceNumber}
                      onChange={(e) => setPatient({...patient, insuranceNumber: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
                <CardDescription>
                  Emergency contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Contact Name</Label>
                    <Input 
                      disabled={!isEditing}
                      value={patient.emergencyContact.name}
                      onChange={(e) => setPatient({
                        ...patient, 
                        emergencyContact: {...patient.emergencyContact, name: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input 
                      disabled={!isEditing}
                      value={patient.emergencyContact.phone}
                      onChange={(e) => setPatient({
                        ...patient, 
                        emergencyContact: {...patient.emergencyContact, phone: e.target.value}
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Input 
                      disabled={!isEditing}
                      value={patient.emergencyContact.relationship}
                      onChange={(e) => setPatient({
                        ...patient, 
                        emergencyContact: {...patient.emergencyContact, relationship: e.target.value}
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forward">
            <PatientForward />
          </TabsContent>

          <TabsContent value="conditions">
            <Card>
              <CardHeader>
                <CardTitle>Patient Conditions</CardTitle>
                <CardDescription>
                  Active and past conditions (FHIR Condition)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mock history entries */}
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Calendar className="w-4 h-4 text-foreground" />
                      <div>
                        <p className="font-medium">General Checkup</p>
                        <p className="text-sm text-foreground">August 15, 2025</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Calendar className="w-4 h-4 text-foreground" />
                      <div>
                        <p className="font-medium">Cardiology Consultation</p>
                        <p className="text-sm text-foreground">July 28, 2025</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      View Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </WorkspaceLayout>
  );
}