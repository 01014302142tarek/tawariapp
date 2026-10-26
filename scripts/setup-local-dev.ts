/**
 * Private local setup: your Supabase project + schema + test users.
 * Does not contact GitHub. Only talks to the Supabase URL in .env.local.
 *
 * Usage: npm run setup:local
 */

import { execSync, spawnSync } from "child_process";
import readline from "readline";
import {
    ensureEnvLocalFromTemplate,
    envLooksLikePlaceholder,
    getSupabaseConfig,
    loadLocalEnv,
    projectRefFromSupabaseUrl,
    readLinkedProjectRef,
    ENV_LOCAL,
    ROOT,
} from "./lib/local-env";

const nonInteractive = process.argv.includes("--print-steps");

function ask(question: string): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function tableExists(url: string, serviceKey: string, table: string): Promise<boolean> {
    const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${table}?select=id&limit=1`, {
        headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
        },
    });
    if (res.status === 404) return false;
    const text = await res.text();
    if (
        text.includes("Could not find the table") ||
        (text.includes("relation") && text.includes("does not exist"))
    ) {
        return false;
    }
    return res.ok || res.status === 406;
}

async function main() {
    console.log("\n=== TawariApp — إعداد تطوير محلي (مشروع Supabase خاص بيك) ===\n");

    const created = ensureEnvLocalFromTemplate();
    if (created) {
        console.log(`✓ Created ${ENV_LOCAL} from template.`);
        console.log("  Open it and paste keys from YOUR Supabase project (Settings → API).\n");
    }

    loadLocalEnv();
    let { url, anonKey, serviceRoleKey } = getSupabaseConfig();

    if (envLooksLikePlaceholder(url) || envLooksLikePlaceholder(serviceRoleKey)) {
        console.log("⚠  .env.local still has placeholder values.\n");
        console.log("  1. https://supabase.com/dashboard → New project");
        console.log("  2. Settings → API → Project URL, anon key, service_role key");
        console.log(`  3. Edit: ${ENV_LOCAL}\n`);
        if (nonInteractive) {
            console.log("Re-run after editing: npm run setup:local\n");
            process.exit(0);
        }
        const cont = await ask("After saving .env.local, press Enter to continue (or type q to quit): ");
        if (cont.toLowerCase() === "q") process.exit(0);
        loadLocalEnv();
        ({ url, anonKey, serviceRoleKey } = getSupabaseConfig());
    }

    if (!url || !serviceRoleKey) {
        console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
        process.exit(1);
    }

    const envRef = projectRefFromSupabaseUrl(url);
    const linkedRef = readLinkedProjectRef();
    if (linkedRef && envRef && linkedRef !== envRef) {
        console.log(`⚠  CLI linked to project "${linkedRef}" but .env.local uses "${envRef}".`);
        console.log("   Run: npx supabase link --project-ref " + envRef + "\n");
    }

    console.log(`Using Supabase project: ${envRef ?? url}\n`);

    const hasProfiles = await tableExists(url, serviceRoleKey, "profiles");
    if (!hasProfiles) {
        console.log("Database schema not found (profiles table missing).\n");
        console.log("Apply migrations to YOUR project (pick one):\n");
        console.log("  A) Supabase CLI (recommended):");
        console.log("     npx supabase login");
        console.log(`     npx supabase link --project-ref ${envRef ?? "<your-ref>"}`);
        console.log("     npx supabase db push\n");
        console.log("  B) Dashboard: SQL Editor → run each file in supabase/migrations/ in order (00001 … 00018)\n");

        const push = await ask("Try `npx supabase db push` now? (y/N): ");
        if (push.toLowerCase() === "y") {
            try {
                execSync("npx supabase db push", { cwd: ROOT, stdio: "inherit" });
            } catch {
                console.error("\n✗ db push failed. Link your project first (see steps above).\n");
                process.exit(1);
            }
        } else {
            const again = await ask("Press Enter after migrations are applied (or q to quit): ");
            if (again.toLowerCase() === "q") process.exit(0);
        }
    } else {
        console.log("✓ Schema looks present (profiles table reachable).\n");
    }

    const seed = await ask("Seed test users (patient1@tawari.test, …)? (Y/n): ");
    if (seed.toLowerCase() !== "n") {
        const result = spawnSync("npx", ["tsx", "scripts/seed-test-users.ts"], {
            cwd: ROOT,
            stdio: "inherit",
            shell: true,
        });
        if (result.status !== 0) process.exit(result.status ?? 1);
    }

    console.log("\n=== Done ===");
    console.log("  npm run dev");
    console.log("  http://localhost:3000/en");
    console.log("  Login: patient1@tawari.test / TawariPatient1!2024\n");
    console.log("GitHub is not notified. Only your Supabase project receives API calls.\n");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
