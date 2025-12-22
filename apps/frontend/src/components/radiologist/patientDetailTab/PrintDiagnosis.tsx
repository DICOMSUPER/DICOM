"use client";

import React, { forwardRef } from "react";
import { DiagnosisType, Severity } from "@/common/interfaces/patient/patient-workflow.interface";

interface PrintDiagnosisProps {
    diagnosis: {
        description: string;
        diagnosedByName?: string;
        diagnosisDate?: string;
        notes?: string;
        diagnosisType?: DiagnosisType;
        severity?: Severity;
    } | null;
    patientName?: string;
    encounterId?: string;
}

const PrintDiagnosis = forwardRef<HTMLDivElement, PrintDiagnosisProps>(
    ({ diagnosis, patientName, encounterId }, ref) => {
        if (!diagnosis) return <div>No diagnosis available to print</div>;

        return (
            <div
                ref={ref}
                style={{
                    backgroundColor: "#ffffff",
                    color: "#1f2937",
                    padding: "24px",
                    fontFamily: "Arial, sans-serif",
                    lineHeight: 1.5,
                }}
            >
                <h1 style={{ textAlign: "center", fontWeight: 700, fontSize: "24px", marginBottom: "16px" }}>
                    DIAGNOSIS REPORT
                </h1>

                <div style={{ marginBottom: "16px" }}>
                    {patientName && <p><strong>Patient:</strong> {patientName}</p>}
                    {encounterId && <p><strong>Encounter ID:</strong> {encounterId}</p>}
                    {diagnosis.diagnosisDate && <p><strong>Diagnosis Date:</strong> {diagnosis.diagnosisDate}</p>}
                    {diagnosis.diagnosedByName && <p><strong>Signed By:</strong> {diagnosis.diagnosedByName}</p>}
                    {diagnosis.diagnosisType && <p><strong>Diagnosis Type:</strong> {diagnosis.diagnosisType}</p>}
                    {diagnosis.severity && <p><strong>Severity:</strong> {diagnosis.severity}</p>}
                </div>

                <hr style={{ border: "1px solid #ccc", margin: "16px 0" }} />

                <div style={{ marginBottom: "16px" }}>
                    <h2 style={{ fontWeight: 600, fontSize: "20px", marginBottom: "8px" }}>Diagnosis Content</h2>
                    <div style={{ whiteSpace: "pre-line" }}>{diagnosis.description}</div>
                </div>

                {diagnosis.notes && (
                    <>
                        <hr style={{ border: "1px solid #ccc", margin: "16px 0" }} />
                        <div>
                            <h2 style={{ fontWeight: 600, fontSize: "20px", marginBottom: "8px" }}>Notes</h2>
                            <div>{diagnosis.notes}</div>
                        </div>
                    </>
                )}
            </div>
        );
    }
);

PrintDiagnosis.displayName = "PrintDiagnosis";
export default PrintDiagnosis;
