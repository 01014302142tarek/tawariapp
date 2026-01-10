import { Metadata } from "next";
import { generateAboutMetadata } from "@/lib/seo/metadata";

type Props = {
    params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    return generateAboutMetadata(lang as "en" | "ar");
}

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
