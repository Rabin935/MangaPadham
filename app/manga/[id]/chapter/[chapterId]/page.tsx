import { redirect } from "next/navigation";

type LegacyReaderRedirectPageProps = {
  params: Promise<{
    chapterId: string;
  }>;
};

export default async function LegacyReaderRedirectPage({
  params,
}: LegacyReaderRedirectPageProps) {
  const { chapterId } = await params;

  redirect(`/reader/${chapterId}`);
}
