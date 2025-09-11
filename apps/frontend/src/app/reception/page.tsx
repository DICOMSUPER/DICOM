import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { 
  Users, 
  UserPlus, 
  FileText, 
  Search,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ReceptionDashboard() {
  return (
    <DashboardLayout
      title="Reception Dashboard"
      subtitle="Patient Management & System Overview"
      userRole="Reception Staff"
      headerActions={
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <UserPlus className="w-4 h-4 mr-2" />
          Register Patient
        </Button>
      }
    >
        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Total Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">1,247</div>
              <p className="text-xs text-foreground">+12 this week</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground flex items-center">
                <UserPlus className="w-4 h-4 mr-2" />
                New Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">8</div>
              <p className="text-xs text-foreground">Registered today</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                Active Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">1,189</div>
              <p className="text-xs text-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Pending Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neutral">23</div>
              <p className="text-xs text-foreground">Awaiting review</p>
            </CardContent>
          </Card>
        </section>

        {/* Main Actions */}
        <section className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Patient Management */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Patient Management
              </CardTitle>
              <CardDescription>
                Register new patients and manage existing patient records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <UserPlus className="w-4 h-4 mr-2" />
                Register New Patient
              </Button>
              <Button variant="outline" className="w-full border-border">
                <Search className="w-4 h-4 mr-2" />
                Search Patient Records
              </Button>
              <Button variant="outline" className="w-full border-border">
                <FileText className="w-4 h-4 mr-2" />
                Update Patient Info
              </Button>
            </CardContent>
          </Card>

          {/* System Management */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                System Management
              </CardTitle>
              <CardDescription>
                Manage system operations and generate reports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <FileText className="w-4 h-4 mr-2" />
                Generate Reports
              </Button>
              <Button variant="outline" className="w-full border-border">
                <Users className="w-4 h-4 mr-2" />
                Patient Statistics
              </Button>
              <Button variant="outline" className="w-full border-border">
                <Activity className="w-4 h-4 mr-2" />
                System Status
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Recent Patient Activity */}
        <section className="mb-8">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Patient Activity
              </CardTitle>
              <CardDescription>
                Latest patient registrations and system activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Activity Item */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">JD</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">John Doe</h4>
                      <p className="text-sm text-foreground">New patient registration</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className="bg-accent text-white">2 min ago</Badge>
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      Registered
                    </Badge>
                    <Button size="sm" variant="outline" className="border-border">
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Activity Item */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                      <span className="text-secondary font-semibold">SM</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Sarah Miller</h4>
                      <p className="text-sm text-foreground">Patient information updated</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className="bg-accent text-white">15 min ago</Badge>
                    <Badge variant="outline" className="border-border text-foreground">
                      Updated
                    </Badge>
                    <Button size="sm" variant="outline" className="border-border">
                      View Changes
                    </Button>
                  </div>
                </div>

                {/* Activity Item */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-neutral/10 rounded-full flex items-center justify-center">
                      <span className="text-neutral font-semibold">RJ</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Robert Johnson</h4>
                      <p className="text-sm text-foreground">Medical record accessed</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className="bg-accent text-white">1 hour ago</Badge>
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                      Accessed
                    </Badge>
                    <Button size="sm" variant="outline" className="border-border">
                      View Record
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section>
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and system shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col border-border">
                  <FileText className="w-6 h-6 mb-2" />
                  <span className="text-sm">Patient Forms</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col border-border">
                  <Users className="w-6 h-6 mb-2" />
                  <span className="text-sm">Patient List</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col border-border">
                  <Search className="w-6 h-6 mb-2" />
                  <span className="text-sm">Search</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col border-border">
                  <Activity className="w-6 h-6 mb-2" />
                  <span className="text-sm">Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
    </DashboardLayout>
  );
}
