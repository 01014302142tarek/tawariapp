import { Metadata } from "next";
import { generateRegisterMetadata } from "@/lib/seo/metadata";

type Props = {
    params: Promise<{ lang: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { lang } = await params;
    return generateRegisterMetadata(lang as "en" | "ar");
}

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
