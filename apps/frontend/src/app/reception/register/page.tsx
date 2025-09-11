import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function PatientRegistration() {
  return (
    <DashboardLayout
      title="Patient Registration"
      subtitle="Register new patients in the DICOM system"
      userRole="Reception Staff"
      showBackButton={true}
      onBackClick={() => window.history.back()}
    >
        <div className="max-w-4xl mx-auto">
          {/* Registration Form */}
          <Card className="border-border mb-8">
            <CardHeader>
              <CardTitle className="text-foreground">Patient Information</CardTitle>
              <CardDescription>
                Enter the patient's personal and medical information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">First Name *</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Last Name *</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Date of Birth *</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Gender *</label>
                  <select className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone Number *</label>
                <input 
                  type="tel" 
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Address *</label>
                <textarea 
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Enter full address"
                />
              </div>

              {/* Medical Information */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Medical Information</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Medical Record Number</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Auto-generated"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Insurance Provider</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter insurance provider"
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium text-foreground">Medical History</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                    placeholder="Enter relevant medical history"
                  />
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium text-foreground">Allergies</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter known allergies (if any)"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Emergency Contact</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Contact Name *</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter emergency contact name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Contact Phone *</label>
                    <input 
                      type="tel" 
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter emergency contact phone"
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium text-foreground">Relationship</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Spouse, Parent, Sibling"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-border">
                <Button variant="outline" className="border-border">
                  Cancel
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Register Patient
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Registration Guidelines */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Registration Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-foreground">
                <div className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>All fields marked with * are required for patient registration</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Medical Record Number will be automatically generated upon registration</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Verify patient information before submitting to ensure accuracy</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Emergency contact information is mandatory for all patients</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-primary">•</span>
                  <span>Patient will receive a confirmation email with their registration details</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </DashboardLayout>
  );
}
