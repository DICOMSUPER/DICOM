"use client";

const tableData = [
  {
    stt: 1,
    studyUID: "7704106",
    mrn: "2108017088",
    patientFirstName: "HOA",
    patientLastName: "NGUYEN",
    reportStatus: "0/0/1",
    studyStatus: "Approved",
    genderAge: "F, 72",
    bodyPart: "BRAIN",
    studyDate: "5/7/05",
    studyTime: "19:28",
    room: "101",
    modality: "CT",
    contrast: "Yes",
    notes: "CT number 16 day | co t...",
  },
  {
    stt: 2,
    studyUID: "7712838",
    mrn: "2108019701",
    patientFirstName: "HOA",
    patientLastName: "NGUYEN",
    reportStatus: "0/0/1",
    studyStatus: "Approved",
    genderAge: "F, 69",
    bodyPart: "CHEST",
    studyDate: "5/8/75",
    studyTime: "09:36",
    room: "102",
    modality: "CT",
    contrast: "Yes",
    notes: "CT chest 16 day |h...",
  },
  {
    stt: 3,
    studyUID: "7704528",
    mrn: "2108017088",
    patientFirstName: "HOA",
    patientLastName: "NGUYEN",
    reportStatus: "0/0/1",
    studyStatus: "Approved",
    genderAge: "F, 72",
    bodyPart: "BRAIN",
    studyDate: "5/6/75",
    studyTime: "00:05",
    room: "104",
    modality: "CT",
    contrast: "Yes",
    notes: "CT number 16 day |kho...",
  },
];

export default function DataTable() {
  return (
    <div className="flex-1 bg-white">
      <div className="w-full overflow-x-scroll horizontal-scrollbar">
        <table className="min-w-[1200px] w-full border-collapse text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr className="border-b border-gray-300">
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                No.
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Study UID
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                MRN
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Patient First Name
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Patient Last Name
              </th>

              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Study Status
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Report Status
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Gender, Age
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Body Part
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Study Date
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Study Time
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Room
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Modality
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">
                Contrast
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">
                Notes
              </th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-200 hover:bg-gray-50"
              >
                <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                  {row.stt}
                </td>
                <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                  {row.studyUID}
                </td>
                <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                  {row.mrn}
                </td>
                <td className="px-4 py-2 border-r border-gray-200 text-gray-700 font-medium">
                  {row.patientFirstName}
                </td>
                <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                  {row.patientLastName}
                </td>

                <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                  {row.studyStatus}
                </td>
                <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                  {row.reportStatus}
                </td>
                <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                  {row.genderAge}
                </td>
                <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                  {row.bodyPart}
                </td>
                <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                  {row.studyDate}
                </td>
                <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                  {row.studyTime}
                </td>
                <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                  {row.room}
                </td>
                <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                  {row.modality}
                </td>
                <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                  {row.contrast}
                </td>
                <td className="px-4 py-2 border-r border-gray-200 text-gray-700">
                  {row.notes}
                </td>
                <td className="px-4 py-2 text-gray-600 text-xs">
                  {/* Placeholder for Actions (e.g., buttons) */}
                  <button className="text-blue-500">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
