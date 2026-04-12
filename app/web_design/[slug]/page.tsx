import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkDetailPage } from "@/app/components/portfolio/WorkDetailPage";
import { getGridWork, webWorks } from "@/lib/portfolio-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return webWorks.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = getGridWork("web", slug);
  return { title: work?.title ?? "作品" };
}

export default async function WebWorkPage({ params }: PageProps) {
  const { slug } = await params;
  const work = getGridWork("web", slug);
  if (!work) notFound();
  return (
    <WorkDetailPage
      work={work}
      categoryLabel="網頁設計"
      listHref="/web_design"
    />
  );
}
