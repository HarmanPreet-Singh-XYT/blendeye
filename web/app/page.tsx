"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AmbientBackground } from "@/components/landing/ambient-background";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { LandingHero } from "@/components/landing/landing-hero";
import { TimeGateSimulator } from "@/components/landing/time-gate-simulator";
import { BacklotCanvasSimulator } from "@/components/landing/backlot-canvas-simulator";
import { DirectorsDeckSuite } from "@/components/landing/directors-deck-suite";
import { MultiverseTakesSwitcher } from "@/components/landing/multiverse-takes-switcher";
import { FilmFusionCrossover } from "@/components/landing/film-fusion-crossover";
import { FeaturedSlatesShowcase } from "@/components/landing/featured-slates-showcase";
import { ClickHouseDeepDive } from "@/components/landing/clickhouse-deep-dive";
import { LandingFooter } from "@/components/landing/landing-footer";
import {
  NewProjectDialog,
  type NewProjectFormData,
} from "@/components/cinema/new-project-dialog";
import { FilmFusionDialog } from "@/components/cinema/film-fusion-dialog";
import { createNewProjectEntry } from "@/lib/project-store";

export default function FilmHubLandingPage() {
  const router = useRouter();
  const [newProjectOpen, setNewProjectOpen] = React.useState(false);
  const [fusionOpen, setFusionOpen] = React.useState(false);

  const handleCreateProject = (data: NewProjectFormData) => {
    const project = createNewProjectEntry({
      title: data.title,
      logline: data.logline,
      genre: data.genre,
      characters: data.characters,
      directorStyle: data.directorStyle,
      coreSecret: data.coreSecret,
      primaryLocation: data.primaryLocation,
      targetTerritories: data.targetTerritories,
      customCharacters: data.customCharacters,
      narrativeFormat: data.narrativeFormat,
      targetRuntimeMinutes: data.targetRuntimeMinutes,
      scenePlacementSeconds: data.scenePlacementSeconds,
      sceneDurationSeconds: data.sceneDurationSeconds,
      totalScenesEstimate: data.totalScenesEstimate,
    });
    router.push(`/studio/${project.id}?pipeline=1`);
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col selection:bg-accent/30 selection:text-accent-foreground overflow-x-hidden">
      {/* Ambient Visual Background Effects */}
      <AmbientBackground />

      {/* Top Studio Nav */}
      <LandingNavbar
        onOpenNewProject={() => setNewProjectOpen(true)}
        onOpenFusion={() => setFusionOpen(true)}
      />

      {/* Main Landing Page Content Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-20">
        {/* 1. High-Impact Cinematic Hero */}
        <LandingHero
          onOpenNewProject={() => setNewProjectOpen(true)}
          onOpenFusion={() => setFusionOpen(true)}
        />

        {/* 2. Centerpiece: Interactive Time-Gate Engine & Interrogation Simulator */}
        <TimeGateSimulator />

        {/* 3. The Visual Backlot: Unreal-Style Node Graph Simulator */}
        <BacklotCanvasSimulator />

        {/* 4. The Director's Deck Suite: 2D Floor Plan, Tension Curve, Box Office, Audio Table Read, Stripboard */}
        <DirectorsDeckSuite />

        {/* 5. Multiverse Alternate Takes: 3-Way Director Styles (A24 / Mann / Nolan) */}
        <MultiverseTakesSwitcher />

        {/* 6. Film Fusion Screenplay Crossover Engine */}
        <FilmFusionCrossover onOpenFusionDialog={() => setFusionOpen(true)} />

        {/* 7. Featured Production Slates (With 2.39:1 Letterbox Frames) */}
        <FeaturedSlatesShowcase onOpenNewProject={() => setNewProjectOpen(true)} />

        {/* 8. ClickHouse Deep Dive: Architecture & Partner Track Benchmarks */}
        <ClickHouseDeepDive />
      </main>

      {/* Footer */}
      <LandingFooter />

      {/* New Project Dialog */}
      <NewProjectDialog
        open={newProjectOpen}
        onOpenChange={setNewProjectOpen}
        onSubmit={handleCreateProject}
      />

      {/* Film Fusion Crossover Dialog */}
      <FilmFusionDialog
        open={fusionOpen}
        onOpenChange={setFusionOpen}
      />
    </div>
  );
}
