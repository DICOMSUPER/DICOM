# Patient Service

A comprehensive CRUD service for managing patients, encounters, and diagnoses in the DICOM system.

## Features

### 🏥 Patient Management
- Create, read, update, delete patients
- Search patients by name, code, or other criteria
- Pagination support
- Soft delete functionality
- Patient statistics and analytics

### 📋 Encounter Management
- Create and manage patient encounters
- Track vital signs with FHIR compliance
- Associate encounters with physicians
- Search and filter encounters
- Encounter statistics

### 🔬 Diagnosis Management
- Create and manage diagnosis reports
- Track diagnosis types, status, and severity
- Follow-up management
- Search and filter diagnoses
- Diagnosis analytics

## Architecture

### Repository Pattern
All data access is handled through repositories in the shared domain:

- `PatientRepository` - Patient CRUD operations
- `PatientEncounterRepository` - Encounter management
- `DiagnosisReportRepository` - Diagnosis management

### Service Layer
Business logic is encapsulated in the `PatientService`:

- Data validation
- Business rules enforcement
- Error handling
- Data transformation

### Controller Layer
RESTful API endpoints for all operations:

- Patient endpoints (`/patients`)
- Encounter endpoints (`/patients/:id/encounters`)
- Diagnosis endpoints (`/encounters/:id/diagnoses`)

## API Endpoints

### Patient Endpoints

#### Create Patient
```http
POST /patients
Content-Type: application/json

{
  "patientCode": "P001",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "gender": "MALE",
  "phoneNumber": "+1234567890",
  "address": "123 Main St",
  "bloodType": "O_POSITIVE",
  "insuranceNumber": "INS123456"
}
```

#### Get All Patients
```http
GET /patients?firstName=John&limit=10&offset=0
```

#### Get Patient by ID
```http
GET /patients/{id}
```

#### Update Patient
```http
PUT /patients/{id}
Content-Type: application/json

{
  "firstName": "Jane",
  "phoneNumber": "+0987654321"
}
```

#### Delete Patient
```http
DELETE /patients/{id}
```

### Encounter Endpoints

#### Create Encounter
```http
POST /patients/{patientId}/encounters
Content-Type: application/json

{
  "encounterDate": "2024-01-15T10:00:00Z",
  "encounterType": "OUTPATIENT",
  "chiefComplaint": "Chest pain",
  "symptoms": "Sharp pain in chest, shortness of breath",
  "vitalSigns": {
    "8867-4": {
      "code": "8867-4",
      "display": "Heart Rate",
      "value": 85,
      "unit": "/min",
      "measuredAt": "2024-01-15T10:00:00Z"
    }
  },
  "assignedPhysicianId": "physician-uuid",
  "notes": "Patient reports chest pain"
}
```

#### Get Patient Encounters
```http
GET /patients/{patientId}/encounters?limit=10
```

#### Update Encounter
```http
PUT /encounters/{id}
Content-Type: application/json

{
  "chiefComplaint": "Updated complaint",
  "notes": "Additional notes"
}
```

### Diagnosis Endpoints

#### Create Diagnosis
```http
POST /encounters/{encounterId}/diagnoses
Content-Type: application/json

{
  "studyId": "study-uuid",
  "diagnosisName": "Acute Myocardial Infarction",
  "description": "ST-elevation myocardial infarction",
  "diagnosisType": "PRIMARY",
  "diagnosisStatus": "ACTIVE",
  "severity": "HIGH",
  "diagnosisDate": "2024-01-15T10:30:00Z",
  "diagnosedBy": "physician-uuid",
  "notes": "Requires immediate treatment",
  "followupRequired": true
}
```

#### Get Encounter Diagnoses
```http
GET /encounters/{encounterId}/diagnoses
```

#### Get Patient Diagnoses
```http
GET /patients/{patientId}/diagnoses?limit=10
```

## Data Models

### Patient
```typescript
{
  id: string;
  patientCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  phoneNumber?: string;
  address?: string;
  bloodType?: BloodType;
  insuranceNumber?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  isDeleted?: boolean;
}
```

### Patient Encounter
```typescript
{
  id: string;
  patientId: string;
  encounterDate: Date;
  encounterType: EncounterType;
  chiefComplaint?: string;
  symptoms?: string;
  vitalSigns?: VitalSignsCollection;
  assignedPhysicianId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
}
```

### Diagnosis Report
```typescript
{
  id: string;
  encounterId: string;
  studyId: string;
  diagnosisName: string;
  description?: string;
  diagnosisType: DiagnosisType;
  diagnosisStatus: DiagnosisStatus;
  severity?: Severity;
  diagnosisDate: Date;
  diagnosedBy: string;
  notes?: string;
  followupRequired: boolean;
  followUpInstructions: boolean;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Validation

### Patient Validation
- Patient code must be unique
- Required fields: patientCode, firstName, lastName, dateOfBirth, gender
- Phone number format validation
- Date of birth must be valid date

### Encounter Validation
- Patient must exist
- Vital signs must be FHIR compliant (if provided)
- Encounter date must be valid

### Diagnosis Validation
- Encounter must exist
- Required fields: diagnosisName, diagnosisType, diagnosisDate, diagnosedBy
- Diagnosis date must be valid

## Error Handling

The service provides comprehensive error handling:

- `NotFoundException` - Resource not found
- `BadRequestException` - Invalid input data
- `ConflictException` - Duplicate resource (e.g., patient code)
- `ValidationException` - Data validation errors

## Statistics and Analytics

### Patient Statistics
- Total patients
- Active/inactive patients
- New patients this month
- Deleted patients

### Encounter Statistics
- Total encounters
- Encounters by type
- Encounters this month
- Average encounters per patient

### Diagnosis Statistics
- Total diagnoses
- Diagnoses by type, status, severity
- Diagnoses this month
- Follow-up required count

## Usage Examples

### Creating a Complete Patient Record

```typescript
// 1. Create patient
const patient = await patientService.createPatient({
  patientCode: 'P001',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01',
  gender: 'MALE'
});

// 2. Create encounter
const encounter = await patientService.createPatientEncounter({
  patientId: patient.id,
  encounterDate: '2024-01-15T10:00:00Z',
  encounterType: 'OUTPATIENT',
  chiefComplaint: 'Chest pain',
  vitalSigns: {
    '8867-4': {
      code: '8867-4',
      display: 'Heart Rate',
      value: 85,
      unit: '/min',
      measuredAt: new Date()
    }
  }
});

// 3. Create diagnosis
const diagnosis = await patientService.createDiagnosisReport({
  encounterId: encounter.id,
  studyId: 'study-uuid',
  diagnosisName: 'Acute Myocardial Infarction',
  diagnosisType: 'PRIMARY',
  diagnosisDate: '2024-01-15T10:30:00Z',
  diagnosedBy: 'physician-uuid'
});
```

### Searching and Filtering

```typescript
// Search patients by name
const patients = await patientService.searchPatientsByName('John');

// Get patients with pagination
const paginatedPatients = await patientService.findPatientsWithPagination(1, 10, {
  gender: 'MALE',
  isActive: true
});

// Get encounters for a patient
const encounters = await patientService.findEncountersByPatientId(patientId, 5);

// Get diagnoses requiring follow-up
const followupDiagnoses = await patientService.getFollowupRequiredDiagnoses(10);
```

## Dependencies

- `@nestjs/common` - NestJS framework
- `@nestjs/typeorm` - TypeORM integration
- `typeorm` - Database ORM
- `class-validator` - Data validation
- `class-transformer` - Data transformation
- `@backend/shared-domain` - Shared domain entities and repositories
- `@backend/shared-utils` - Shared utilities (vital signs validation)

## Testing

The service includes comprehensive unit tests covering:

- Repository operations
- Service business logic
- Controller endpoints
- Data validation
- Error handling

Run tests with:
```bash
npm run test
npm run test:e2e
```

## Contributing

When adding new features:

1. Update the repository layer for data access
2. Add business logic to the service layer
3. Create appropriate DTOs for data transfer
4. Add controller endpoints
5. Update documentation
6. Add tests

## License

This project is part of the DICOM system and follows the same licensing terms.
