import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorkDetailPage } from "@/app/components/portfolio/WorkDetailPage";
import { deviceWorks, getGridWork } from "@/lib/portfolio-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return deviceWorks.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = getGridWork("device", slug);
  return { title: work?.title ?? "作品" };
}

export default async function DeviceWorkPage({ params }: PageProps) {
  const { slug } = await params;
  const work = getGridWork("device", slug);
  if (!work) notFound();
  return (
    <WorkDetailPage
      work={work}
      categoryLabel="裝置設計"
      listHref="/device_design"
    />
  );
}
