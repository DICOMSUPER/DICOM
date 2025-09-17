import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function PatientSearch() {
  const router = useRouter();
  return (
    <DashboardLayout
      title="Patient Management"
      subtitle="Search and manage patient records"
      userRole="Reception Staff"
      showBackButton={true}
      onBackClick={() => window.history.back()}
      headerActions={
        <Button 
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => router.push('/reception/register')}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Patient
        </Button>
      }
    >
        {/* Search Section */}
        <section className="mb-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Search Patients</CardTitle>
              <CardDescription>
                Find patients by name, MRN, phone number, or other criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Search by Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter patient name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Medical Record Number</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter MRN"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Date of Birth</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Search
                </Button>
                <Button variant="outline" className="border-border">
                  Clear
                </Button>
                <Button variant="outline" className="border-border">
                  Advanced Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Search Results */}
        <section className="mb-8">
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Search Results</CardTitle>
                  <CardDescription>
                    Found 3 patients matching your search criteria
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="border-border">
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="border-border">
                    Print
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Patient Result */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">JD</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">John Doe</h4>
                      <p className="text-sm text-foreground">MRN: 2024001 | DOB: 1985-03-15</p>
                      <p className="text-sm text-foreground">Phone: (555) 123-4567 | Email: john.doe@email.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      Active
                    </Badge>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-border">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="border-border">
                        Edit
                      </Button>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Schedule
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Patient Result */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                      <span className="text-secondary font-semibold">SM</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Sarah Miller</h4>
                      <p className="text-sm text-foreground">MRN: 2024002 | DOB: 1990-07-22</p>
                      <p className="text-sm text-foreground">Phone: (555) 234-5678 | Email: sarah.miller@email.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      Active
                    </Badge>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-border">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="border-border">
                        Edit
                      </Button>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Schedule
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Patient Result */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-neutral/10 rounded-full flex items-center justify-center">
                      <span className="text-neutral font-semibold">RJ</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Robert Johnson</h4>
                      <p className="text-sm text-foreground">MRN: 2024003 | DOB: 1978-11-08</p>
                      <p className="text-sm text-foreground">Phone: (555) 345-6789 | Email: robert.johnson@email.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className="bg-accent text-white">
                      Inactive
                    </Badge>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="border-border">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="border-border">
                        Edit
                      </Button>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Schedule
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section>
          <div className="grid md:grid-cols-4 gap-6">
            {/* Recent Patients */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Patients</CardTitle>
                <CardDescription>
                  Last 5 registered patients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">John Doe</span>
                    <span className="text-foreground">Today</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">Sarah Miller</span>
                    <span className="text-foreground">Yesterday</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">Robert Johnson</span>
                    <span className="text-foreground">2 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Statistics */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Patient Statistics</CardTitle>
                <CardDescription>
                  Current patient metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground">Total Patients</span>
                    <span className="font-semibold text-foreground">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground">Active</span>
                    <span className="font-semibold text-secondary">1,189</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground">New This Month</span>
                    <span className="font-semibold text-primary">58</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
                <CardDescription>
                  Common patient tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full border-border"
                  onClick={() => router.push('/reception/register')}
                >
                  Register New Patient
                </Button>
                <Button variant="outline" size="sm" className="w-full border-border">
                  Bulk Import
                </Button>
                <Button variant="outline" size="sm" className="w-full border-border">
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">System Status</CardTitle>
                <CardDescription>
                  Database and system health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Database</span>
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      Online
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Backup</span>
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      Current
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Sync Status</span>
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      Up to Date
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
    </DashboardLayout>
  );
}
