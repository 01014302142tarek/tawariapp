import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { createClient } from "@/lib/supabase/server";
import { getPrescriptionForPdf, updatePrescriptionPdfPath } from "@/app/actions/prescriptions";
import { PrescriptionPdf } from "@/lib/pdf/prescription-template";
import fs from "fs";
import path from "path";

// Cache the logo in memory
let logoBase64Cache: string | null = null;

async function getLogoBase64(): Promise<string> {
    if (logoBase64Cache) {
        return logoBase64Cache;
    }

    try {
        const logoPath = path.join(process.cwd(), "public", "logo.png");
        const logoBuffer = fs.readFileSync(logoPath);
        logoBase64Cache = logoBuffer.toString("base64");
        return logoBase64Cache;
    } catch (error) {
        console.error("Error reading logo file:", error);
        return "";
    }
}

/**
 * GET /api/prescriptions/[id]/pdf
 * Generate or retrieve prescription PDF
 *
 * Query params:
 * - download=true: Force download instead of inline display
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: prescriptionId } = await params;
        const { searchParams } = new URL(request.url);
        const forceDownload = searchParams.get("download") === "true";

        // Get prescription data with full doctor details
        const { data: prescriptionData, error: fetchError } = await getPrescriptionForPdf(prescriptionId);

        if (fetchError || !prescriptionData) {
            return NextResponse.json(
                { error: fetchError || "Prescription not found" },
                { status: fetchError?.includes("Not authenticated") ? 401 : 404 }
            );
        }

        // Check if PDF already exists in storage
        const supabase = await createClient();
        const { data: existingPrescription } = await supabase
            .from("prescriptions")
            .select("pdf_path, pdf_generated_at")
            .eq("id", prescriptionId)
            .single();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rxData = existingPrescription as any;

        // If PDF exists and was generated recently (within last 7 days), serve from storage
        if (rxData?.pdf_path && rxData?.pdf_generated_at) {
            const generatedAt = new Date(rxData.pdf_generated_at);
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            if (generatedAt > sevenDaysAgo) {
                // Get signed URL for existing PDF
                const { data: signedUrlData } = await supabase.storage
                    .from("medical_documents")
                    .createSignedUrl(rxData.pdf_path, 3600); // 1 hour expiry

                if (signedUrlData?.signedUrl) {
                    // Redirect to the signed URL
                    return NextResponse.redirect(signedUrlData.signedUrl);
                }
            }
        }

        // Generate new PDF
        console.log("[PDF] Generating prescription PDF for:", prescriptionId);

        const logoBase64 = await getLogoBase64();

        // Render the PDF to buffer
        const pdfBuffer = await renderToBuffer(
            PrescriptionPdf({
                data: prescriptionData,
                logoBase64,
            }) as ReactElement<DocumentProps>
        );

        // Upload to storage
        const pdfPath = `prescriptions/${prescriptionId}.pdf`;
        const { error: uploadError } = await supabase.storage
            .from("medical_documents")
            .upload(pdfPath, pdfBuffer, {
                contentType: "application/pdf",
                upsert: true,
            });

        if (uploadError) {
            console.error("[PDF] Error uploading to storage:", uploadError);
            // Still return the PDF even if storage fails
        } else {
            // Update prescription record with PDF path
            await updatePrescriptionPdfPath(prescriptionId, pdfPath);
        }

        // Return the PDF
        const filename = `prescription-${prescriptionData.id.slice(0, 8)}.pdf`;
        const disposition = forceDownload ? "attachment" : "inline";

        const responseBody = new Uint8Array(pdfBuffer);

        return new NextResponse(responseBody, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `${disposition}; filename="${filename}"`,
                "Cache-Control": "private, max-age=3600", // Cache for 1 hour
            },
        });
    } catch (error) {
        console.error("[PDF] Error generating prescription PDF:", error);
        // Log more details for debugging
        if (error instanceof Error) {
            console.error("[PDF] Error name:", error.name);
            console.error("[PDF] Error message:", error.message);
            console.error("[PDF] Error stack:", error.stack);
        }
        return NextResponse.json(
            { error: "Failed to generate PDF", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
