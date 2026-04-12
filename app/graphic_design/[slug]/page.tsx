import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkDetailPage } from "@/app/components/portfolio/WorkDetailPage";
import { getGridWork, graphicWorks } from "@/lib/portfolio-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return graphicWorks.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = getGridWork("graphic", slug);
  return { title: work?.title ?? "作品" };
}

export default async function GraphicWorkPage({ params }: PageProps) {
  const { slug } = await params;
  const work = getGridWork("graphic", slug);
  if (!work) notFound();
  return (
    <WorkDetailPage
      work={work}
      categoryLabel="平面設計"
      listHref="/graphic_design"
    />
  );
}
