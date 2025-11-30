"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  useGetPatientsQuery, 
  useGetPatientsPaginatedQuery,
  useSearchPatientsByNameQuery,
  useGetPatientStatsQuery
} from "@/store/patientApi";
import { PatientSearchFilters } from "@/interfaces/patient/patient-workflow.interface";
import { Gender, BloodType } from "@/enums/patient-workflow.enum";
import { PriorityLevel, HIGH_PRIORITY_LEVELS } from "@/enums/priority.enum";
import { formatDate } from "@/lib/formatTimeDate";
import { 
  Search, 
  Filter, 
  X, 
  Users, 
  Calendar, 
  Phone, 
  User, 
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface PatientSearchProps {
  onPatientSelect?: (patient: any) => void;
  showStats?: boolean;
  compact?: boolean;
}

export function PatientSearch({ 
  onPatientSelect, 
  showStats = true, 
  compact = false 
}: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [hasSearched, setHasSearched] = useState(true);

  // Format gender for display
  const formatGender = (gender: string | null | undefined): string => {
    if (!gender) return "N/A";
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };
  
  const [filters, setFilters] = useState<PatientSearchFilters>({
    firstName: '',
    lastName: '',
    patientCode: '',
    phoneNumber: '',
    gender: undefined,
    bloodType: undefined,
    isActive: true,
    limit: 20
  });

  // Use search by name when searchTerm is provided, otherwise use pagination
  const { data: searchResults, isLoading: searchLoading } = useSearchPatientsByNameQuery(
    { searchTerm, limit: pageSize },
    { skip: !searchTerm || !hasSearched }
  );

  const { data: paginatedResults, isLoading: paginatedLoading } = useGetPatientsPaginatedQuery(
    { page: currentPage, limit: pageSize, filters: { ...filters } },
    { skip: !!searchTerm || !hasSearched }
  );

  const { data: patientStats } = useGetPatientStatsQuery();

  const results = searchTerm ? (searchResults || []) : (paginatedResults?.data || []);
  const isLoading = searchTerm ? searchLoading : paginatedLoading;

  // Handle search
  const handleSearch = () => {
    setHasSearched(true);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (field: keyof PatientSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clear all filters
  const handleClear = () => {
    setSearchTerm('');
    setFilters({
      firstName: '',
      lastName: '',
      patientCode: '',
      phoneNumber: '',
      gender: undefined,
      bloodType: undefined,
      isActive: true,
      limit: 20
    });
    setCurrentPage(1);
    setHasSearched(false);
  };

  // Remove auto-search - only search when button is clicked

  return (
    <div className="space-y-4">
      {/* Statistics */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Patients */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{patientStats?.totalPatients || 0}</div>
              <p className="text-xs text-foreground">
                All registered patients
              </p>
            </CardContent>
          </Card>

          {/* Active Patients */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Active Patients</CardTitle>
              <CheckCircle className="h-4 w-4 text-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{patientStats?.activePatients || 0}</div>
              <p className="text-xs text-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          {/* New This Month */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">New This Month</CardTitle>
              <Calendar className="h-4 w-4 text-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{patientStats?.newPatientsThisMonth || 0}</div>
              <p className="text-xs text-foreground">
                Registered this month
              </p>
            </CardContent>
          </Card>

          {/* Inactive Patients */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Inactive Patients</CardTitle>
              <AlertTriangle className="h-4 w-4 text-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{patientStats?.inactivePatients || 0}</div>
              <p className="text-xs text-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Search */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="flex gap-2">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground h-4 w-4" />
              <Input
                placeholder="Search patients, codes, or names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
        
        {/* Filter Controls */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showAdvanced ? 'Hide' : 'Show'} Filters
            {showAdvanced ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
          >
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>

        {/* Advanced Search */}
        {showAdvanced && (
          <div className="space-y-4 p-4 rounded-lg bg-slate-50/50 shadow-sm">
              <h4 className="font-medium text-foreground">Advanced Filters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  placeholder="First Name"
                  value={filters.firstName || ''}
                  onChange={(e) => handleFilterChange('firstName', e.target.value)}
                />
                <Input
                  placeholder="Last Name"
                  value={filters.lastName || ''}
                  onChange={(e) => handleFilterChange('lastName', e.target.value)}
                />
                <Input
                  placeholder="Patient Code"
                  value={filters.patientCode || ''}
                  onChange={(e) => handleFilterChange('patientCode', e.target.value)}
                />
                <Input
                  placeholder="Phone Number"
                  value={filters.phoneNumber || ''}
                  onChange={(e) => handleFilterChange('phoneNumber', e.target.value)}
                />
                <Select
                  value={filters.gender || 'all'}
                  onValueChange={(value) => handleFilterChange('gender', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent className="border-border">
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value={Gender.MALE}>Male</SelectItem>
                    <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                    <SelectItem value={Gender.OTHER}>Other</SelectItem>
                    <SelectItem value={Gender.UNKNOWN}>Unknown</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.bloodType || 'all'}
                  onValueChange={(value) => handleFilterChange('bloodType', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Blood Type" />
                  </SelectTrigger>
                  <SelectContent className="border-border">
                    <SelectItem value="all">All Blood Types</SelectItem>
                    <SelectItem value={BloodType.A_Positive}>A+</SelectItem>
                    <SelectItem value={BloodType.A_Negative}>A-</SelectItem>
                    <SelectItem value={BloodType.B_Positive}>B+</SelectItem>
                    <SelectItem value={BloodType.B_Negative}>B-</SelectItem>
                    <SelectItem value={BloodType.O_Positive}>O+</SelectItem>
                    <SelectItem value={BloodType.O_Negative}>O-</SelectItem>
                    <SelectItem value={BloodType.AB_Positive}>AB+</SelectItem>
                    <SelectItem value={BloodType.AB_Negative}>AB-</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show</span>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => setPageSize(parseInt(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border">
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-600">per page</span>
                </div>
              </div>
            </div>
          )}

        {/* Results */}
        <div className="space-y-3">
            {!hasSearched ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <div className="text-lg font-medium mb-2">Search for patients</div>
                <div className="text-sm">Enter a name or use filters to find patients</div>
              </div>
            ) : results && results.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {searchTerm ? 
                      `Found ${results.length} patients matching "${searchTerm}"` :
                      paginatedResults ? 
                        `Showing ${((currentPage - 1) * pageSize) + 1}-${Math.min(currentPage * pageSize, paginatedResults.total)} of ${paginatedResults.total} patients` :
                        `Found ${results.length} patients`
                    }
                  </div>
                </div>

                <div className="space-y-2">
                  {results.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
                      onClick={() => onPatientSelect?.(patient)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            ID: {patient.patientCode} • {formatGender(patient.gender)}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(patient.dateOfBirth)}
                            </span>
                            {patient.phoneNumber && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {patient.phoneNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={patient.isActive ? "default" : "secondary"}
                          className={patient.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                        >
                          {patient.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {patient.bloodType && (
                          <div className="text-xs text-gray-500 mt-1">
                            {patient.bloodType}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination - only show when not searching */}
                {!searchTerm && paginatedResults && paginatedResults.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage(currentPage - 1);
                        setHasSearched(true);
                      }}
                    >
                      Previous
                    </Button>
                    
                    {Array.from({ length: Math.min(5, paginatedResults.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(
                        paginatedResults.totalPages - 4,
                        Math.max(1, currentPage - 2)
                      )) + i;
                      
                      if (pageNum <= paginatedResults.totalPages) {
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              setCurrentPage(pageNum);
                              setHasSearched(true);
                            }}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                      return null;
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === paginatedResults.totalPages}
                      onClick={() => {
                        setCurrentPage(currentPage + 1);
                        setHasSearched(true);
                      }}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <div className="text-lg font-medium mb-2">No patients found</div>
                <div className="text-sm">Try adjusting your search criteria</div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
