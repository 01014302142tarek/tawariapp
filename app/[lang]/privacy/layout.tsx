import { Metadata } from "next";
import { generatePrivacyMetadata } from "@/lib/seo/metadata";

type Props = {
    params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    return generatePrivacyMetadata(lang as "en" | "ar");
}

export default function PrivacyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
