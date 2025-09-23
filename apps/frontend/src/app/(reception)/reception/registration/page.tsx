"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { SidebarNav } from "@/components/sidebar-nav";
import { AppHeader } from "@/components/app-header";
import { useState } from "react";
import { useCreatePatientMutation } from "@/store/patientApi";
import { CreatePatientDto } from "@/interfaces/patient/patient-workflow.interface";
import { Gender, BloodType, ClinicalStatus, ConditionVerificationStatus } from "@/enums/patient-workflow.enum";
import { useRouter } from "next/navigation";
import { User, Plus, X, Save } from "lucide-react";

interface PatientCondition {
  conditionName: string;
  clinicalStatus: ClinicalStatus;
  verificationStatus: ConditionVerificationStatus;
  severity: string;
  notes?: string;
}

export default function PatientRegistration() {
  const router = useRouter();
  const [notificationCount] = useState(3);
  const [createPatient, { isLoading: isCreating }] = useCreatePatientMutation();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<CreatePatientDto>({
    patientCode: `PAT${Date.now()}`,
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: Gender.MALE,
    phoneNumber: "",
    address: "",
    bloodType: BloodType.O_Positive,
    insuranceNumber: "",
    isActive: true,
    conditions: [],
  });

  const [conditions, setConditions] = useState<PatientCondition[]>([]);

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addCondition = () => {
    setConditions(prev => [...prev, {
      conditionName: "",
      clinicalStatus: ClinicalStatus.ACTIVE,
      verificationStatus: ConditionVerificationStatus.CONFIRMED,
      severity: "mild",
      notes: ""
    }]);
  };

  const removeCondition = (index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof PatientCondition, value: string) => {
    setConditions(prev => prev.map((condition, i) => 
      i === index ? { ...condition, [field]: value } : condition
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormErrors({});
      
      const patientData = {
        ...formData,
        conditions: conditions.map(condition => ({
          patientId: '', // Will be set by backend
          code: condition.conditionName,
          codeDisplay: condition.conditionName,
          clinicalStatus: condition.clinicalStatus,
          verificationStatus: condition.verificationStatus,
          severity: condition.severity,
          stageSummary: condition.notes
        }))
      };
      
      await createPatient(patientData).unwrap();
      router.push('/reception/patients');
    } catch (error: any) {
      if (error.data?.message) {
        setFormErrors({ general: error.data.message });
      } else if (error.data?.errors) {
        setFormErrors(error.data.errors);
      } else {
        setFormErrors({ general: 'An error occurred. Please try again.' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        notificationCount={notificationCount}
        onNotificationClick={handleNotificationClick}
        onLogout={handleLogout}
      />

      <WorkspaceLayout sidebar={<SidebarNav />}>
        <div className="mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Patient Registration</h1>
            <p className="text-foreground">
              Register a new patient in the system
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {formErrors.general && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{formErrors.general}</p>
              </div>
            )}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Basic patient details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientCode">Patient Code</Label>
                    <Input
                      id="patientCode"
                      name="patientCode"
                      value={formData.patientCode}
                      onChange={handleInputChange}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select
                      name="gender"
                      value={formData.gender}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value as Gender }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Gender.MALE}>Male</SelectItem>
                        <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                        <SelectItem value={Gender.OTHER}>Other</SelectItem>
                        <SelectItem value={Gender.UNKNOWN}>Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceNumber">Insurance Number</Label>
                    <Input
                      id="insuranceNumber"
                      name="insuranceNumber"
                      value={formData.insuranceNumber}
                      onChange={handleInputChange}
                      placeholder="Enter insurance number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter full address"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select
                    name="bloodType"
                    value={formData.bloodType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, bloodType: value as BloodType }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BloodType.A_Positive}>A+</SelectItem>
                      <SelectItem value={BloodType.A_Negative}>A-</SelectItem>
                      <SelectItem value={BloodType.B_Positive}>B+</SelectItem>
                      <SelectItem value={BloodType.B_Negative}>B-</SelectItem>
                      <SelectItem value={BloodType.AB_Positive}>AB+</SelectItem>
                      <SelectItem value={BloodType.AB_Negative}>AB-</SelectItem>
                      <SelectItem value={BloodType.O_Positive}>O+</SelectItem>
                      <SelectItem value={BloodType.O_Negative}>O-</SelectItem>
                      <SelectItem value={BloodType.Unknown}>Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Medical Conditions Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Medical Conditions</h3>
                      <p className="text-sm text-foreground">Add any known medical conditions</p>
                    </div>
                    <Button type="button" onClick={addCondition} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>

                  {conditions.length === 0 ? (
                    <div className="text-center py-6 text-foreground border-2 border-dashed border-border rounded-lg">
                      <div className="text-sm">No conditions added yet</div>
                      <div className="text-xs">Click "Add Condition" to add medical conditions</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {conditions.map((condition, index) => (
                        <Card key={index} className="border-border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant="outline">Condition {index + 1}</Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCondition(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`condition-${index}`}>Condition Name</Label>
                                <Input
                                  id={`condition-${index}`}
                                  value={condition.conditionName}
                                  onChange={(e) => updateCondition(index, 'conditionName', e.target.value)}
                                  placeholder="Enter condition name"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`clinicalStatus-${index}`}>Clinical Status</Label>
                                <Select
                                  value={condition.clinicalStatus}
                                  onValueChange={(value) => updateCondition(index, 'clinicalStatus', value as ClinicalStatus)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={ClinicalStatus.ACTIVE}>Active</SelectItem>
                                    <SelectItem value={ClinicalStatus.INACTIVE}>Inactive</SelectItem>
                                    <SelectItem value={ClinicalStatus.RESOLVED}>Resolved</SelectItem>
                                    <SelectItem value={ClinicalStatus.REMISSION}>Remission</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`verificationStatus-${index}`}>Verification Status</Label>
                                <Select
                                  value={condition.verificationStatus}
                                  onValueChange={(value) => updateCondition(index, 'verificationStatus', value as ConditionVerificationStatus)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select verification" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={ConditionVerificationStatus.CONFIRMED}>Confirmed</SelectItem>
                                    <SelectItem value={ConditionVerificationStatus.PROVISIONAL}>Provisional</SelectItem>
                                    <SelectItem value={ConditionVerificationStatus.DIFFERENTIAL}>Differential</SelectItem>
                                    <SelectItem value={ConditionVerificationStatus.REFUTED}>Refuted</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`severity-${index}`}>Severity</Label>
                                <Select
                                  value={condition.severity}
                                  onValueChange={(value) => updateCondition(index, 'severity', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select severity" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="mild">Mild</SelectItem>
                                    <SelectItem value="moderate">Moderate</SelectItem>
                                    <SelectItem value="severe">Severe</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="md:col-span-2 space-y-2">
                                <Label htmlFor={`notes-${index}`}>Notes</Label>
                                <Textarea
                                  id={`notes-${index}`}
                                  value={condition.notes || ''}
                                  onChange={(e) => updateCondition(index, 'notes', e.target.value)}
                                  placeholder="Additional notes about this condition"
                                  rows={2}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => router.push('/reception/patients')}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    <Save className="h-4 w-4 mr-2" />
                    {isCreating ? 'Creating...' : 'Create Patient'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </WorkspaceLayout>
    </div>
  );
}