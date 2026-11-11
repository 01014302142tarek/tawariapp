/**
 * Utility to compress receipt images on the client side before uploading.
 * Reduces raw mobile photos (5MB - 15MB) to compact JPEGs (~150KB - 300KB)
 * while preserving high legibility of transfer text, amounts, and dates.
 */

export interface CompressedImageResult {
    base64: string;
    fileName: string;
    originalSize: number;
    compressedSize: number;
}

/**
 * Compresses an image file using HTML5 Canvas.
 * Proportionally downscales to fit within maxDimension and re-encodes as JPEG.
 */
export async function compressImageFile(
    file: File,
    maxDimension: number = 1600,
    quality: number = 0.82
): Promise<CompressedImageResult> {
    const originalSize = file.size;

    return new Promise((resolve) => {
        // Fallback helper in case canvas fails or is unsupported
        const fallback = (dataUrl: string) => {
            resolve({
                base64: dataUrl,
                fileName: file.name,
                originalSize,
                compressedSize: originalSize,
            });
        };

        const reader = new FileReader();

        reader.onerror = () => {
            fallback("");
        };

        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result !== "string") {
                fallback("");
                return;
            }

            // Only attempt canvas compression in browser environments
            if (typeof window === "undefined" || typeof document === "undefined") {
                fallback(result);
                return;
            }

            const img = new Image();
            img.crossOrigin = "anonymous";

            img.onload = () => {
                try {
                    let { width, height } = img;

                    if (width <= 0 || height <= 0) {
                        fallback(result);
                        return;
                    }

                    // Downscale proportionally if larger than maxDimension
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = Math.round((height * maxDimension) / width);
                            width = maxDimension;
                        } else {
                            width = Math.round((width * maxDimension) / height);
                            height = maxDimension;
                        }
                    }

                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                        fallback(result);
                        return;
                    }

                    // Draw image on white background (in case of PNG with transparency)
                    ctx.fillStyle = "#FFFFFF";
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedBase64 = canvas.toDataURL("image/jpeg", quality);

                    // Estimate compressed size from base64 string
                    const padding = compressedBase64.endsWith("==") ? 2 : compressedBase64.endsWith("=") ? 1 : 0;
                    const base64Length = compressedBase64.length - (compressedBase64.indexOf(",") + 1);
                    const compressedSize = Math.round((base64Length * 3) / 4 - padding);

                    const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
                    const safeName = `${baseName.replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, "_")}.jpg`;

                    resolve({
                        base64: compressedBase64,
                        fileName: safeName,
                        originalSize,
                        compressedSize,
                    });
                } catch {
                    fallback(result);
                }
            };

            img.onerror = () => {
                fallback(result);
            };

            img.src = result;
        };

        reader.readAsDataURL(file);
    });
}

