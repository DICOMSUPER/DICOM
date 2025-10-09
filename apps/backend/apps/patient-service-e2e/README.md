# Patient Service E2E Tests

Bộ test end-to-end (E2E) toàn diện cho Patient Service, bao gồm tất cả các module và chức năng chính.

## Cấu trúc Test

### 1. **patient-service.spec.ts** - Test tổng hợp
- Health check cơ bản
- Test cho tất cả các module chính
- Error handling và performance tests
- Data validation tests

### 2. **patients.e2e.spec.ts** - Test module Patients (Microservice)
- CRUD operations cho bệnh nhân
- Tìm kiếm và lọc bệnh nhân
- Thống kê bệnh nhân
- Validation dữ liệu
- Error handling

### 3. **encounters.e2e.spec.ts** - Test module Patient Encounters (Microservice)
- CRUD operations cho cuộc khám bệnh
- Tìm kiếm encounters theo bệnh nhân/bác sĩ
- Quản lý vital signs
- Thống kê encounters
- Validation dữ liệu


### 4. **queue-assignments.e2e.spec.ts** - Test module Queue Assignments (REST API)
- CRUD operations cho xếp hàng
- Quản lý trạng thái queue
- Call next patient functionality
- Token validation
- Wait time estimation
- Thống kê queue

### 5. **patient-conditions.e2e.spec.ts** - Test module Patient Conditions (Microservice)
- CRUD operations cho tình trạng bệnh nhân
- Tìm kiếm conditions theo bệnh nhân
- Validation dữ liệu

### 6. **diagnoses-reports.e2e.spec.ts** - Test module Diagnoses Reports (Microservice)
- CRUD operations cho báo cáo chẩn đoán
- Tìm kiếm reports theo bệnh nhân/encounter/physician
- Thống kê chẩn đoán
- Validation dữ liệu

## Chạy Tests

### Chạy tất cả e2e tests
```bash
nx e2e patient-service-e2e
```

### Chạy test cụ thể
```bash
# Chạy test cho module Patients
nx e2e patient-service-e2e --testNamePattern="Patients Module"


# Chạy test cho module Queue Assignments
nx e2e patient-service-e2e --testNamePattern="Queue Assignments Module"
```

### Chạy với coverage
```bash
nx e2e patient-service-e2e --coverage
```

### Chạy với verbose output
```bash
nx e2e patient-service-e2e --verbose
```

## Cấu hình Test

### Timeout
- Mỗi test có timeout 30 giây
- Tests chạy tuần tự (maxWorkers: 1) để tránh xung đột

### Mock Data
- Tests sử dụng mock data để mô phỏng responses
- Có thể dễ dàng thay thế bằng real API calls khi cần

### Error Handling
- Tests bao gồm các trường hợp lỗi phổ biến
- Validation errors
- Not found errors
- Network errors

## Test Data

### Test IDs
- `testPatientId`: ID bệnh nhân test
- `testEncounterId`: ID cuộc khám test
- `testQueueAssignmentId`: ID queue assignment test

### Sample Data
Tests sử dụng dữ liệu mẫu tiếng Việt phù hợp với hệ thống y tế:
- Tên bệnh nhân: "Nguyễn Văn A"
- Chẩn đoán: "Tăng huyết áp", "Đái tháo đường"
- Triệu chứng: "Đau đầu", "Chóng mặt"
- Thuốc: "Paracetamol", "Ibuprofen"

## Performance Tests

### Concurrent Requests
- Test khả năng xử lý nhiều request đồng thời
- Test với 10 concurrent requests

### Large Dataset
- Test khả năng xử lý dataset lớn
- Test response time < 1 giây

### High Frequency Operations
- Test các thao tác tần suất cao như "call next patient"

## Lưu ý

1. **Microservice Tests**: Một số tests sử dụng mock data vì chúng gọi microservice patterns
2. **REST API Tests**: Tests cho Queue Assignments sử dụng real HTTP calls
3. **Database**: Tests không yêu cầu database thật, sử dụng mock responses
4. **Authentication**: Tests hiện tại không bao gồm authentication, có thể thêm sau

## Mở rộng

Để thêm test mới:
1. Tạo file `.e2e.spec.ts` mới trong thư mục `src/patient-service/`
2. Follow pattern của các file test hiện có
3. Cập nhật `jest.config.ts` nếu cần
4. Thêm documentation trong README này

## Troubleshooting

### Test fails với timeout
- Kiểm tra service có đang chạy không
- Tăng timeout trong jest.config.ts nếu cần

### Mock data không đúng
- Cập nhật mock data trong test files
- Đảm bảo format dữ liệu đúng với API spec

### Network errors
- Kiểm tra baseURL trong test-setup.ts
- Đảm bảo service đang listen trên đúng port
