/**
 * Quick check: .env.local is filled and not obviously placeholder.
 * npm run env:check
 */

import {
    envLooksLikePlaceholder,
    getSupabaseConfig,
    projectRefFromSupabaseUrl,
    readLinkedProjectRef,
    ENV_LOCAL,
} from "./lib/local-env";
import fs from "fs";

function main() {
    if (!fs.existsSync(ENV_LOCAL)) {
        console.error("Missing .env.local — run: npm run setup:local");
        process.exit(1);
    }

    const { url, anonKey, serviceRoleKey } = getSupabaseConfig();
    let ok = true;

    if (envLooksLikePlaceholder(url)) {
        console.error("✗ NEXT_PUBLIC_SUPABASE_URL is missing or still a placeholder");
        ok = false;
    }
    if (envLooksLikePlaceholder(anonKey)) {
        console.error("✗ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or still a placeholder");
        ok = false;
    }
    if (envLooksLikePlaceholder(serviceRoleKey)) {
        console.error("✗ SUPABASE_SERVICE_ROLE_KEY is missing or still a placeholder");
        ok = false;
    }

    if (ok) {
        const ref = url ? projectRefFromSupabaseUrl(url) : null;
        const linked = readLinkedProjectRef();
        console.log(`✓ .env.local OK — Supabase project: ${ref ?? "unknown"}`);
        if (linked && ref && linked !== ref) {
            console.warn(`⚠ CLI link (${linked}) differs from .env (${ref}) — run supabase link`);
        }
    }

    process.exit(ok ? 0 : 1);
}

main();
