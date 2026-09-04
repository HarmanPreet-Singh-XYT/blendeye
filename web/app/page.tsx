import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { FilmCard } from "@/components/cinema/film-card";
import { Letterbox } from "@/components/cinema/letterbox";
import { SlateLabel } from "@/components/cinema/slate-label";
import { FilmstripLoader } from "@/components/cinema/filmstrip-loader";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-10 p-10 max-w-3xl mx-auto w-full">
      <header className="flex flex-col gap-2">
        <SlateLabel>Agentic Cinema · Live</SlateLabel>
        <h1 className="text-2xl font-semibold tracking-tight">
          The Writers&apos; Room That Knows What Your Characters Know
        </h1>
      </header>

      <Letterbox>
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-card">
          <span className="slate-label">Imagen frame · scene 04 · wide master</span>
        </div>
      </Letterbox>

      <section className="flex flex-wrap items-center gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </section>

      <section className="flex flex-wrap items-center gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge className="border-success/40 bg-success/15 text-success">
          Generated
        </Badge>
        <Badge className="border-warning/40 bg-warning/15 text-warning">
          Stale
        </Badge>
        <Badge variant="destructive">Error</Badge>
      </section>

      <FilmCard>
        <CardHeader>
          <SlateLabel>Scene 04 / Take 2</SlateLabel>
          <CardTitle>The Vault</CardTitle>
          <CardDescription>
            Master script node · last generated 2 min ago
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Story timeline
            </span>
            <span className="timecode text-sm">00:34:12</span>
          </div>
          <Slider defaultValue={[34]} max={90} step={1} />
          <Separator />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Scrub the timeline and interrogate Marcus — he only knows what
            he&apos;d know at this exact minute.
          </p>
        </CardContent>
      </FilmCard>

      <FilmstripLoader label="Sharding character perspectives…" />

      <p className="text-xs text-muted-foreground">
        Full component reference: <a href="/design-system" className="underline underline-offset-2 hover:text-foreground">/design-system</a>
      </p>
    </div>
  );
}
