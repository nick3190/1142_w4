import Image from "next/image";
import Link from "next/link";
import { ParticleRing } from "@/app/components/ParticleRing";
import { GeorgieHero } from "@/app/components/home/GeorgieHero";
import { getGeorgieFinalePath, getGeorgieRandomPool } from "@/lib/georgie-images";
import { wangHongTeeImagePath } from "@/lib/portfolio-data";
import { siteSections } from "@/lib/site-sections";

const SHOWREEL_VIMEO_ID = "1120960224";

const featuredWorks = [
  {
    title: "他在他方",
    subtitle: "C-LAB 聲響藝術節 VR 劇場",
    href: "/audio?slug=ta-zai-ta-fang&autoplay=1",
    imageSrc: "https://i.ytimg.com/vi/Sdb2TiOQjPY/hqdefault.jpg",
    remote: true,
  },
  {
    title: "網紅 T 恤設計",
    subtitle: "平面設計，亞洲統神主題",
    href: "/graphic_design/wang-hong-tee",
    imageSrc: wangHongTeeImagePath,
    remote: false,
  },
  {
    title: "狗與嬰兒",
    subtitle: "短片配樂",
    href: "/audio?slug=gou-yu-ying-er&autoplay=1",
    imageSrc: "/featured/gou-yu-ying-er.jpg",
    remote: false,
  },
] as const;

function SectionList({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="主要頁面" className={className}>
      <ul className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4 lg:grid-cols-1 lg:gap-y-1.5">
        {siteSections.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex flex-col py-1 lg:flex-row lg:items-baseline lg:justify-end lg:gap-4"
            >
              <span className="order-2 text-xs text-mute opacity-100 transition-opacity lg:order-1 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100">
                {item.desc}
              </span>
              <span className="order-1 text-base text-paper transition-colors group-hover:text-mute lg:order-2 lg:text-lg">
                {item.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Home() {
  const georgiePoolPaths = getGeorgieRandomPool();
  const georgieFinalePath = getGeorgieFinalePath();

  return (
    <main className="min-h-full bg-ink">
      <section className="relative h-[100svh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <ParticleRing interactive radius={0.3} centerY={0.42} />
        </div>

        <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between px-5 py-5 sm:px-8 sm:py-7 lg:px-12 lg:py-10">
          <header className="pointer-events-auto flex items-baseline justify-between gap-4 text-sm">
            <span className="text-mute">聲音、配樂與設計</span>
            <a
              href="mailto:uniqueee3190@gmail.com"
              className="text-mute transition-colors hover:text-paper"
            >
              uniqueee3190@gmail.com
            </a>
          </header>

          <div className="pointer-events-auto flex items-end justify-between gap-10">
            <GeorgieHero
              georgiePoolPaths={georgiePoolPaths}
              finalePath={georgieFinalePath}
            />
            <SectionList className="hidden shrink-0 lg:block" />
          </div>
        </div>
      </section>

      <SectionList className="border-t border-line px-5 py-8 sm:px-8 lg:hidden" />

      <section
        id="showreel"
        className="border-t border-line px-5 py-14 sm:px-8 lg:grid lg:grid-cols-[14rem_1fr] lg:gap-12 lg:px-12 lg:py-20"
      >
        <div>
          <h2 className="font-serif text-2xl text-paper">Showreel</h2>
          <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-mute">
            近年配樂、聲音設計與影像作品的剪輯。
          </p>
          <a
            href="https://vimeo.com/1120960224?fl=ip&fe=ec"
            className="mt-4 inline-block text-sm text-paper underline decoration-line underline-offset-4 transition-colors hover:decoration-paper"
            target="_blank"
            rel="noopener noreferrer"
          >
            在 Vimeo 開啟
          </a>
        </div>
        <div className="mt-6 aspect-video w-full overflow-hidden bg-faint lg:mt-0">
          <iframe
            title="Showreel"
            src={`https://player.vimeo.com/video/${SHOWREEL_VIMEO_ID}?color=ededed`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </section>

      <section
        id="featured"
        className="border-t border-line px-5 py-14 sm:px-8 lg:grid lg:grid-cols-[14rem_1fr] lg:gap-12 lg:px-12 lg:py-20"
      >
        <h2 className="font-serif text-2xl text-paper">精選作品</h2>
        <ul className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-3 lg:mt-0">
          {featuredWorks.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="group block">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-faint">
                  <Image
                    src={item.imageSrc}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover grayscale transition duration-500 ease-out group-hover:grayscale-0 motion-reduce:transition-none"
                    unoptimized={item.remote}
                  />
                </div>
                <h3 className="mt-3 text-base text-paper">{item.title}</h3>
                <p className="mt-0.5 text-sm text-mute">{item.subtitle}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
