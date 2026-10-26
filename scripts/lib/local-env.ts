import { config } from "dotenv";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "../..");
const ENV_LOCAL = path.join(ROOT, ".env.local");
const ENV_TEMPLATE = path.join(ROOT, ".env.local.template");

export function loadLocalEnv(): void {
    config({ path: ENV_LOCAL });
}

export function getSupabaseConfig(): {
    url: string | undefined;
    anonKey: string | undefined;
    serviceRoleKey: string | undefined;
} {
    loadLocalEnv();
    const url =
        process.env.NEXT_PUBLIC_SUPABASE_URL ??
        process.env.NEXT_PUBLIC_TawariAppSUPABASE_URL ??
        process.env.SUPABASE_URL;
    const anonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_TawariAppSUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return { url, anonKey, serviceRoleKey };
}

export function projectRefFromSupabaseUrl(url: string): string | null {
    try {
        const host = new URL(url).hostname;
        const ref = host.split(".")[0];
        return ref && ref !== "localhost" ? ref : null;
    } catch {
        return null;
    }
}

export function readLinkedProjectRef(): string | null {
    const refPath = path.join(ROOT, "supabase", ".temp", "project-ref");
    if (!fs.existsSync(refPath)) return null;
    return fs.readFileSync(refPath, "utf8").trim() || null;
}

const PLACEHOLDER_PATTERNS = [
    /YOUR_PROJECT_REF/i,
    /your-anon-key/i,
    /your-service-role-key/i,
    /your_supabase/i,
    /abcdefghijklm/i,
];

export function envLooksLikePlaceholder(value: string | undefined): boolean {
    if (!value || value.trim().length < 8) return true;
    return PLACEHOLDER_PATTERNS.some((p) => p.test(value));
}

export function ensureEnvLocalFromTemplate(): boolean {
    if (fs.existsSync(ENV_LOCAL)) return false;
    if (!fs.existsSync(ENV_TEMPLATE)) {
        throw new Error("Missing .env.local.template");
    }
    fs.copyFileSync(ENV_TEMPLATE, ENV_LOCAL);
    return true;
}

export { ROOT, ENV_LOCAL, ENV_TEMPLATE };
