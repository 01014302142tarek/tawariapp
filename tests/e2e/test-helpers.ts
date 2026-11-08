import { chromium, Browser, BrowserContext, Page } from "playwright";

export const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export interface LoggedIssue {
    type: "console-error" | "page-error" | "request-failed" | "assertion" | "layout";
    url: string;
    message: string;
    details?: any;
}

export class TestRunner {
    browser!: Browser;
    context!: BrowserContext;
    page!: Page;
    issues: LoggedIssue[] = [];
    passCount = 0;
    failCount = 0;

    async setup(viewport = { width: 1280, height: 800 }) {
        this.browser = await chromium.launch({
            channel: "chrome",
            headless: true,
        });
        this.context = await this.browser.newContext({
            viewport,
            ignoreHTTPSErrors: true,
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        });
        this.page = await this.context.newPage();
        this.attachListeners(this.page);
    }

    attachListeners(page: Page) {
        page.on("console", (msg) => {
            if (msg.type() === "error") {
                const text = msg.text();
                // Filter out external analytics/third-party blocked requests if any
                if (!text.includes("favicon") && !text.includes("googletagmanager")) {
                    this.issues.push({
                        type: "console-error",
                        url: page.url(),
                        message: text,
                    });
                }
            }
        });

        page.on("pageerror", (err) => {
            this.issues.push({
                type: "page-error",
                url: page.url(),
                message: err.message,
                details: err.stack,
            });
        });

        page.on("requestfailed", (req) => {
            const url = req.url();
            // Ignore optional 3rd-party services like daily.co or google analytics if offline
            if (!url.includes("google-analytics") && !url.includes("googletagmanager")) {
                this.issues.push({
                    type: "request-failed",
                    url: page.url(),
                    message: `Failed request: ${req.method()} ${url} (${req.failure()?.errorText})`,
                });
            }
        });
    }

    async teardown() {
        if (this.context) await this.context.close();
        if (this.browser) await this.browser.close();
    }

    assert(condition: boolean, desc: string) {
        if (condition) {
            this.passCount++;
            console.log(`  ✓ PASS: ${desc}`);
        } else {
            this.failCount++;
            console.log(`  ✗ FAIL: ${desc}`);
            this.issues.push({
                type: "assertion",
                url: this.page.url(),
                message: `Assertion failed: ${desc}`,
            });
        }
    }

    async checkHorizontalOverflow(page: Page, desc: string) {
        const hasOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth;
        });
        this.assert(!hasOverflow, `${desc} - No horizontal overflow (scrollWidth <= innerWidth)`);
        if (hasOverflow) {
            this.issues.push({
                type: "layout",
                url: page.url(),
                message: `Horizontal overflow detected: scrollWidth > innerWidth on ${desc}`,
            });
        }
    }
}

