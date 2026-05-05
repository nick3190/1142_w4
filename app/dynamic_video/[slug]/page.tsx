import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkDetailPage } from "@/app/components/portfolio/WorkDetailPage";
import { dynamicVideoWorks, getGridWork } from "@/lib/portfolio-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return dynamicVideoWorks.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = getGridWork("dynamicVideo", slug);
  return { title: work?.title ?? "作品" };
}

export default async function DynamicVideoWorkPage({ params }: PageProps) {
  const { slug } = await params;
  const work = getGridWork("dynamicVideo", slug);
  if (!work) notFound();
  return (
    <WorkDetailPage
      work={work}
      categoryLabel="動態影像"
      listHref="/dynamic_video"
    />
  );
}
