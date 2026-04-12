import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkDetailPage } from "@/app/components/portfolio/WorkDetailPage";
import { getGridWork, mixingWorks } from "@/lib/portfolio-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return mixingWorks.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = getGridWork("mixing", slug);
  return { title: work?.title ?? "作品" };
}

export default async function MixingWorkPage({ params }: PageProps) {
  const { slug } = await params;
  const work = getGridWork("mixing", slug);
  if (!work) notFound();
  return (
    <WorkDetailPage
      work={work}
      categoryLabel="混音"
      listHref="/mixing"
    />
  );
}
