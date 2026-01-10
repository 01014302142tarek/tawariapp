import { Metadata } from "next";
import { generateTermsMetadata } from "@/lib/seo/metadata";

type Props = {
    params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    return generateTermsMetadata(lang as "en" | "ar");
}

export default function TermsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
