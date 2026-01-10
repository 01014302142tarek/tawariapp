import { Metadata } from "next";
import { generateLoginMetadata } from "@/lib/seo/metadata";

type Props = {
    params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    return generateLoginMetadata(lang as "en" | "ar");
}

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
