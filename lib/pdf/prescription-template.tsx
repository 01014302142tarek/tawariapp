import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
} from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";

// Note: Using built-in Helvetica font for reliability
// Arabic text rendering in @react-pdf/renderer has known issues with external fonts
// For now, using English-only labels to ensure PDF generation works

// Styles for the PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        fontFamily: "Helvetica", // Using built-in font for reliability
        backgroundColor: "#ffffff",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: "#0d9488", // teal-600
    },
    logo: {
        width: 80,
        height: 80,
    },
    headerTitle: {
        textAlign: "center",
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#0d9488",
        marginBottom: 4,
    },
    doctorSection: {
        backgroundColor: "#f0fdfa", // teal-50
        padding: 15,
        marginBottom: 20,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#99f6e4", // teal-200
    },
    doctorName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#134e4a", // teal-900
        marginBottom: 8,
    },
    doctorDetail: {
        fontSize: 10,
        color: "#374151", // gray-700
        marginBottom: 3,
    },
    doctorDetailRow: {
        flexDirection: "row",
        marginBottom: 3,
    },
    doctorDetailLabel: {
        fontSize: 10,
        color: "#6b7280", // gray-500
        width: 80,
    },
    doctorDetailValue: {
        fontSize: 10,
        color: "#374151", // gray-700
        flex: 1,
    },
    patientSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb", // gray-200
    },
    patientInfo: {
        flex: 1,
    },
    patientLabel: {
        fontSize: 10,
        color: "#6b7280",
        marginBottom: 2,
    },
    patientName: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1f2937",
    },
    dateInfo: {
        textAlign: "right",
    },
    dateLabel: {
        fontSize: 10,
        color: "#6b7280",
        marginBottom: 2,
    },
    dateValue: {
        fontSize: 12,
        color: "#1f2937",
    },
    medicationsHeader: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#0d9488",
        marginBottom: 15,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#0d9488",
    },
    medicationCard: {
        backgroundColor: "#fafafa",
        padding: 12,
        marginBottom: 10,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    medicationName: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 8,
    },
    medicationDetails: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 8,
    },
    medicationDetail: {
        minWidth: 100,
        marginRight: 15,
        marginBottom: 4,
    },
    medicationDetailLabel: {
        fontSize: 9,
        color: "#6b7280",
        marginBottom: 1,
    },
    medicationDetailValue: {
        fontSize: 10,
        color: "#374151",
    },
    instructions: {
        backgroundColor: "#fffbeb", // amber-50
        padding: 8,
        borderRadius: 4,
        marginTop: 5,
    },
    instructionsLabel: {
        fontSize: 9,
        color: "#92400e", // amber-800
        fontWeight: "bold",
        marginBottom: 2,
    },
    instructionsText: {
        fontSize: 10,
        color: "#78350f", // amber-900
        // Note: Using default font style (no italic)
    },
    footer: {
        position: "absolute",
        bottom: 40,
        left: 40,
        right: 40,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },
    footerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 5,
    },
    footerText: {
        fontSize: 9,
        color: "#9ca3af", // gray-400
    },
    footerNote: {
        fontSize: 8,
        color: "#9ca3af",
        textAlign: "center",
        marginTop: 10,
    },
    rxSymbol: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#0d9488",
        marginRight: 10,
    },
});

// Types for prescription data
export interface PrescriptionMedication {
    medication_name: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    quantity?: number;
    instructions?: string;
}

export interface PrescriptionPdfData {
    id: string;
    prescribed_at: string;
    medications: PrescriptionMedication[];
    doctor: {
        full_name: string;
        specialty?: string;
        license_number?: string;
        clinic_name?: string;
        clinic_address?: string;
        clinic_phone?: string;
        phone_number?: string;
    };
    patient: {
        full_name: string;
    };
}

interface PrescriptionPdfProps {
    data: PrescriptionPdfData;
    logoBase64?: string;
}

// Format date for display
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

// The PDF Document Component
export function PrescriptionPdf({ data, logoBase64 }: PrescriptionPdfProps): React.ReactElement<DocumentProps> {
    const referenceNumber = `RX-${data.id.slice(0, 8).toUpperCase()}`;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header with Logo and Title */}
                <View style={styles.header}>
                    {logoBase64 && (
                        // react-pdf Image doesn't support alt text.
                        // eslint-disable-next-line jsx-a11y/alt-text
                        <Image
                            style={styles.logo}
                            src={`data:image/png;base64,${logoBase64}`}
                        />
                    )}
                    <View style={styles.headerTitle}>
                        <Text style={styles.title}>Medical Prescription</Text>
                    </View>
                    <Text style={styles.rxSymbol}>℞</Text>
                </View>

                {/* Doctor Information */}
                <View style={styles.doctorSection}>
                    <Text style={styles.doctorName}>
                        {data.doctor.full_name.startsWith("Dr.") || data.doctor.full_name.startsWith("Dr ")
                            ? data.doctor.full_name
                            : `Dr. ${data.doctor.full_name}`}
                    </Text>
                    {data.doctor.specialty && (
                        <View style={styles.doctorDetailRow}>
                            <Text style={styles.doctorDetailLabel}>Specialty:</Text>
                            <Text style={styles.doctorDetailValue}>
                                {data.doctor.specialty}
                            </Text>
                        </View>
                    )}
                    {data.doctor.license_number && (
                        <View style={styles.doctorDetailRow}>
                            <Text style={styles.doctorDetailLabel}>License No:</Text>
                            <Text style={styles.doctorDetailValue}>
                                {data.doctor.license_number}
                            </Text>
                        </View>
                    )}
                    {data.doctor.clinic_name && (
                        <View style={styles.doctorDetailRow}>
                            <Text style={styles.doctorDetailLabel}>Clinic:</Text>
                            <Text style={styles.doctorDetailValue}>
                                {data.doctor.clinic_name}
                            </Text>
                        </View>
                    )}
                    {data.doctor.clinic_address && (
                        <View style={styles.doctorDetailRow}>
                            <Text style={styles.doctorDetailLabel}>Address:</Text>
                            <Text style={styles.doctorDetailValue}>
                                {data.doctor.clinic_address}
                            </Text>
                        </View>
                    )}
                    {(data.doctor.clinic_phone || data.doctor.phone_number) && (
                        <View style={styles.doctorDetailRow}>
                            <Text style={styles.doctorDetailLabel}>Phone:</Text>
                            <Text style={styles.doctorDetailValue}>
                                {data.doctor.clinic_phone || data.doctor.phone_number}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Patient Information and Date */}
                <View style={styles.patientSection}>
                    <View style={styles.patientInfo}>
                        <Text style={styles.patientLabel}>Patient Name</Text>
                        <Text style={styles.patientName}>{data.patient.full_name}</Text>
                    </View>
                    <View style={styles.dateInfo}>
                        <Text style={styles.dateLabel}>Date</Text>
                        <Text style={styles.dateValue}>
                            {formatDate(data.prescribed_at)}
                        </Text>
                    </View>
                </View>

                {/* Medications */}
                <Text style={styles.medicationsHeader}>
                    Prescribed Medications
                </Text>

                {data.medications.map((med, index) => (
                    <View key={index} style={styles.medicationCard}>
                        <Text style={styles.medicationName}>
                            {index + 1}. {med.medication_name}
                        </Text>
                        <View style={styles.medicationDetails}>
                            {med.dosage && (
                                <View style={styles.medicationDetail}>
                                    <Text style={styles.medicationDetailLabel}>
                                        Dosage
                                    </Text>
                                    <Text style={styles.medicationDetailValue}>
                                        {med.dosage}
                                    </Text>
                                </View>
                            )}
                            {med.frequency && (
                                <View style={styles.medicationDetail}>
                                    <Text style={styles.medicationDetailLabel}>
                                        Frequency
                                    </Text>
                                    <Text style={styles.medicationDetailValue}>
                                        {med.frequency}
                                    </Text>
                                </View>
                            )}
                            {med.duration && (
                                <View style={styles.medicationDetail}>
                                    <Text style={styles.medicationDetailLabel}>
                                        Duration
                                    </Text>
                                    <Text style={styles.medicationDetailValue}>
                                        {med.duration}
                                    </Text>
                                </View>
                            )}
                            {med.quantity && (
                                <View style={styles.medicationDetail}>
                                    <Text style={styles.medicationDetailLabel}>
                                        Quantity
                                    </Text>
                                    <Text style={styles.medicationDetailValue}>
                                        {med.quantity}
                                    </Text>
                                </View>
                            )}
                        </View>
                        {med.instructions && (
                            <View style={styles.instructions}>
                                <Text style={styles.instructionsLabel}>
                                    Special Instructions:
                                </Text>
                                <Text style={styles.instructionsText}>
                                    {med.instructions}
                                </Text>
                            </View>
                        )}
                    </View>
                ))}

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerRow}>
                        <Text style={styles.footerText}>
                            Reference: {referenceNumber}
                        </Text>
                        <Text style={styles.footerText}>
                            Generated: {new Date().toLocaleString()}
                        </Text>
                    </View>
                    <Text style={styles.footerNote}>
                        This is an electronically generated prescription from Tawari
                        Telemedicine Platform. For verification, contact support@tawari.app
                    </Text>
                </View>
            </Page>
        </Document>
    );
}

export default PrescriptionPdf;
