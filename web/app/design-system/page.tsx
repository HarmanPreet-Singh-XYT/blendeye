"use client";

import * as React from "react";
import { Section, Demo, ColorSwatch } from "./section";
import { FilmCard } from "@/components/cinema/film-card";
import { Letterbox } from "@/components/cinema/letterbox";
import { SlateLabel } from "@/components/cinema/slate-label";
import { FilmstripLoader } from "@/components/cinema/filmstrip-loader";

import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
  AvatarBadge,
} from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Item,
  ItemContent,
  ItemActions,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import {
  ChevronRightIcon,
  FilmIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  UserIcon,
  MicIcon,
} from "lucide-react";

const NAV_SECTIONS = [
  { id: "foundations", label: "Foundations" },
  { id: "cinema-motifs", label: "Cinema Motifs" },
  { id: "actions", label: "Actions" },
  { id: "forms", label: "Forms" },
  { id: "data-display", label: "Data Display" },
  { id: "feedback", label: "Feedback" },
  { id: "overlays", label: "Overlays" },
  { id: "navigation", label: "Navigation" },
  { id: "layout", label: "Layout" },
];

const chartData = [
  { minute: "0:00", tension: 20 },
  { minute: "0:15", tension: 35 },
  { minute: "0:30", tension: 30 },
  { minute: "0:45", tension: 60 },
  { minute: "1:00", tension: 85 },
];

export default function DesignSystemPage() {
  const [otp, setOtp] = React.useState("");
  const [comboOpen, setComboOpen] = React.useState(false);
  const [comboValue, setComboValue] = React.useState<string | null>(null);

  return (
    <div className="flex min-h-screen">
      {/* Side nav */}
      <nav className="hidden md:flex sticky top-0 h-screen w-56 shrink-0 flex-col gap-1 border-r border-border p-4 overflow-y-auto">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 mb-2">
          Design System
        </span>
        {NAV_SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <main className="flex-1 flex flex-col gap-16 p-8 md:p-12 max-w-5xl">
        <header className="flex flex-col gap-2">
          <Badge className="w-fit border-accent/40 bg-accent/10 text-accent">
            Screening Room Theme
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Agentic Cinema Design System
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Every installed shadcn component rendered in the actual product
            theme. This page is the reference for visual consistency during
            the build — if a component looks wrong here, fix it here first.
          </p>
        </header>

        {/* FOUNDATIONS */}
        <Section
          id="foundations"
          title="Foundations"
          description="Color, type, and the one rule that matters: amber is reserved for the timeline/playhead/live state and nowhere else."
        >
          <div className="flex flex-col gap-4">
            <span className="text-sm font-medium">Surfaces</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ColorSwatch name="Background" varName="--background" />
              <ColorSwatch name="Card" varName="--card" />
              <ColorSwatch name="Secondary" varName="--secondary" />
              <ColorSwatch name="Muted" varName="--muted" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-sm font-medium">Text &amp; Border</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ColorSwatch name="Foreground" varName="--foreground" textOn="foreground" />
              <ColorSwatch name="Muted foreground" varName="--muted-foreground" textOn="foreground" />
              <ColorSwatch name="Border" varName="--border" />
              <ColorSwatch name="Ring" varName="--ring" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-sm font-medium">
              Accent &amp; Semantic — accent is reserved for timeline/playhead only
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ColorSwatch name="Accent (amber)" varName="--accent" />
              <ColorSwatch name="Success" varName="--success" />
              <ColorSwatch name="Warning" varName="--warning" />
              <ColorSwatch name="Destructive" varName="--destructive" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-sm font-medium">Typography</span>
            <div className="rounded-lg border border-border bg-card p-6 flex flex-col gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                Heading / 3xl semibold
              </h1>
              <h2 className="text-xl font-semibold tracking-tight">
                Heading / xl semibold
              </h2>
              <p className="text-base">Body / base regular</p>
              <p className="text-sm text-muted-foreground">
                Body small / muted — used for metadata, timestamps, descriptions
              </p>
              <p className="timecode text-lg">00:34:12 — timecode / mono / accent</p>
            </div>
          </div>
        </Section>

        {/* CINEMA MOTIFS */}
        <Section
          id="cinema-motifs"
          title="Cinema Motifs"
          description="The structural vocabulary that makes this read as a film tool, not generic dark-mode SaaS. Referenced from real film stock — sprocket perforations, 2.39:1 scope letterboxing, slate burn-ins — used as structure, not decoration."
        >
          <Demo label="FilmCard — sprocket-edge + grain, the signature surface for scene/character/script nodes">
            <FilmCard className="w-full max-w-sm">
              <CardHeader>
                <SlateLabel>Scene 04 / Take 2</SlateLabel>
                <CardTitle>The Vault</CardTitle>
                <CardDescription>Master script node</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generated 2 minutes ago. 3 characters sharded into ClickHouse.
                </p>
              </CardContent>
            </FilmCard>
          </Demo>

          <Demo label="Letterbox — true 2.39:1 scope framing for storyboards and scene previews" className="flex-col items-stretch">
            <Letterbox className="max-w-lg">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-card">
                <span className="slate-label">Imagen frame · scene 04 · wide master</span>
              </div>
            </Letterbox>
          </Demo>

          <Demo label="Slate label — corner burn-in tag for generated / production media">
            <SlateLabel>Frame 0142</SlateLabel>
            <SlateLabel>Scene 04 / Take 2</SlateLabel>
            <SlateLabel>Live — 00:34:12</SlateLabel>
          </Demo>

          <Demo label="Sprocket strip — standalone perforation rhythm for section dividers" className="flex-col items-stretch p-0">
            <div className="sprocket-strip" />
          </Demo>

          <Demo label="Filmstrip loader — generating state, replaces generic spinners" className="flex-col items-stretch">
            <FilmstripLoader label="Sharding character perspectives…" />
          </Demo>
        </Section>

        {/* ACTIONS */}
        <Section id="actions" title="Actions">
          <Demo label="Button variants">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
          </Demo>
          <Demo label="Button sizes & icon">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Add">
              <PlusIcon />
            </Button>
          </Demo>
          <Demo label="Button group">
            <ButtonGroup>
              <Button variant="outline">Script</Button>
              <Button variant="outline">Storyboard</Button>
              <Button variant="outline">Blocking</Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button variant="outline" size="icon" aria-label="Mic">
                <MicIcon />
              </Button>
              <ButtonGroupSeparator />
              <Button variant="outline" size="icon" aria-label="Send">
                <SendIcon />
              </Button>
            </ButtonGroup>
          </Demo>
          <Demo label="Toggle & toggle group">
            <Toggle aria-label="Mute">
              <MicIcon />
            </Toggle>
            <ToggleGroup defaultValue={["script"]}>
              <ToggleGroupItem value="script">Script</ToggleGroupItem>
              <ToggleGroupItem value="scenes">Scenes</ToggleGroupItem>
              <ToggleGroupItem value="cast">Cast</ToggleGroupItem>
            </ToggleGroup>
          </Demo>
        </Section>

        {/* FORMS */}
        <Section id="forms" title="Forms">
          <Demo label="Text inputs" className="flex-col items-stretch">
            <FieldGroup className="max-w-sm gap-4">
              <Field>
                <FieldLabel htmlFor="ds-scene">Scene premise</FieldLabel>
                <Input id="ds-scene" placeholder="A heist crew splits up after..." />
                <FieldDescription>
                  Used to generate the master script node.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="ds-notes">Director&apos;s notes</FieldLabel>
                <Textarea id="ds-notes" placeholder="Tone, pacing, references..." />
              </Field>
            </FieldGroup>
          </Demo>
          <Demo label="Input group (with icon / affix)">
            <InputGroup className="max-w-xs">
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput placeholder="Search characters..." />
            </InputGroup>
            <InputGroup className="max-w-xs">
              <InputGroupInput placeholder="00:34:12" />
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="sm">Jump</InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Demo>
          <Demo label="Checkbox, switch, radio">
            <div className="flex items-center gap-2">
              <Checkbox id="ds-check" defaultChecked />
              <Label htmlFor="ds-check">Include off-screen actions</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="ds-switch" defaultChecked />
              <Label htmlFor="ds-switch">Live ClickHouse grounding</Label>
            </div>
            <RadioGroup defaultValue="wide" className="flex gap-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="wide" id="ds-wide" />
                <Label htmlFor="ds-wide">Wide</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="ots" id="ds-ots" />
                <Label htmlFor="ds-ots">OTS</Label>
              </div>
            </RadioGroup>
          </Demo>
          <Demo label="Select & native select">
            <Select defaultValue="marcus">
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Character" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marcus">Marcus</SelectItem>
                <SelectItem value="elena">Elena</SelectItem>
                <SelectItem value="teo">Teo</SelectItem>
              </SelectContent>
            </Select>
            <NativeSelect defaultValue="gemini-2.5-flash" className="w-52">
              <NativeSelectOption value="gemini-2.5-flash">
                gemini-2.5-flash
              </NativeSelectOption>
              <NativeSelectOption value="gemini-2.5-pro">
                gemini-2.5-pro
              </NativeSelectOption>
            </NativeSelect>
          </Demo>
          <Demo label="Combobox">
            <Combobox
              items={["Marcus", "Elena", "Teo", "Detective Reyes"]}
              value={comboValue}
              onValueChange={(v) => setComboValue(v as string | null)}
              open={comboOpen}
              onOpenChange={setComboOpen}
            >
              <ComboboxInput placeholder="Interrogate character..." className="w-56" />
              <ComboboxContent>
                <ComboboxEmpty>No character found.</ComboboxEmpty>
                <ComboboxList>
                  {(item: string) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </Demo>
          <Demo label="Input OTP (repurposable for short codes)">
            <InputOTP maxLength={4} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </Demo>
        </Section>

        {/* DATA DISPLAY */}
        <Section id="data-display" title="Data Display">
          <Demo label="Card">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Scene 04 — The Vault</CardTitle>
                <CardDescription>Master script node</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generated 2 minutes ago. 3 characters sharded.
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm">Open</Button>
                <Button size="sm" variant="ghost">
                  Regenerate
                </Button>
              </CardFooter>
            </Card>
          </Demo>

          <Demo label="Avatar & avatar group">
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/64?img=12" alt="Marcus" />
              <AvatarFallback>MK</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback>EL</AvatarFallback>
              <AvatarBadge />
            </Avatar>
            <AvatarGroup>
              <Avatar>
                <AvatarFallback>MK</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>EL</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>TR</AvatarFallback>
              </Avatar>
            </AvatarGroup>
          </Demo>

          <Demo label="Badges">
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
          </Demo>

          <Demo label="Table" className="flex-col items-stretch">
            <Table>
              <TableCaption>Per-character story events (ClickHouse)</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Character</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Content</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Marcus</TableCell>
                  <TableCell className="timecode">00:28:00</TableCell>
                  <TableCell>
                    <Badge variant="secondary">known_fact</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    Lost the keys near the tunnel
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Elena</TableCell>
                  <TableCell className="timecode">00:34:00</TableCell>
                  <TableCell>
                    <Badge variant="secondary">unaware_of</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    Marcus lost the keys
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Demo>

          <Demo label="Item list">
            <ItemGroup className="w-full max-w-md">
              <Item>
                <ItemMedia>
                  <Avatar>
                    <AvatarFallback>MK</AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Marcus</ItemTitle>
                  <ItemDescription>Getaway driver · knows 4 facts at 00:34</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button size="sm" variant="ghost">
                    Chat
                  </Button>
                </ItemActions>
              </Item>
            </ItemGroup>
          </Demo>

          <Demo label="Kbd">
            <KbdGroup>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </Demo>

          <Demo label="Chart (tension curve)" className="flex-col items-stretch">
            <ChartContainer
              config={{ tension: { label: "Tension", color: "var(--chart-1)" } }}
              className="h-48 w-full"
            >
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="minute"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="tension" fill="var(--color-tension)" radius={4} />
              </BarChart>
            </ChartContainer>
          </Demo>
        </Section>

        {/* FEEDBACK */}
        <Section id="feedback" title="Feedback">
          <Demo label="Alert">
            <Alert className="max-w-md">
              <AlertTitle>Downstream nodes are stale</AlertTitle>
              <AlertDescription>
                Character &quot;Marcus&quot; was edited. 3 dependent scenes need regeneration.
              </AlertDescription>
            </Alert>
          </Demo>
          <Demo label="Progress, skeleton, spinner">
            <Progress value={64} className="w-48" />
            <Skeleton className="h-8 w-32 rounded-md" />
            <Spinner />
          </Demo>
          <Demo label="Tooltip & hover card">
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline">Hover me</Button>} />
              <TooltipContent>Scrub to a timestamp first</TooltipContent>
            </Tooltip>
            <HoverCard>
              <HoverCardTrigger render={<Button variant="outline">Marcus</Button>} />
              <HoverCardContent className="text-sm">
                Getaway driver. Loyal but easily rattled under pressure.
              </HoverCardContent>
            </HoverCard>
          </Demo>
          <Demo label="Empty state" className="flex-col items-stretch">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FilmIcon />
                </EmptyMedia>
                <EmptyTitle>No scenes yet</EmptyTitle>
                <EmptyDescription>
                  Drop in a premise to generate your first master script.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button size="sm">New scene</Button>
              </EmptyContent>
            </Empty>
          </Demo>
        </Section>

        {/* OVERLAYS */}
        <Section id="overlays" title="Overlays">
          <Demo label="Dialog">
            <Dialog>
              <DialogTrigger render={<Button variant="outline">Open dialog</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Regenerate scene?</DialogTitle>
                  <DialogDescription>
                    This will re-shard all connected character timelines.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Regenerate</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Demo>
          <Demo label="Alert dialog">
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="destructive">Delete node</Button>} />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this scene node?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This cannot be undone. Downstream nodes will be orphaned.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Demo>
          <Demo label="Sheet & drawer">
            <Sheet>
              <SheetTrigger render={<Button variant="outline">Open sheet</Button>} />
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Character: Marcus</SheetTitle>
                  <SheetDescription>Edit traits and knowledge state.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
            <Drawer>
              <DrawerTrigger render={<Button variant="outline">Open drawer</Button>} />
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Hot-seat chat</DrawerTitle>
                  <DrawerDescription>Interrogate Marcus at 00:34:12</DrawerDescription>
                </DrawerHeader>
              </DrawerContent>
            </Drawer>
          </Demo>
          <Demo label="Popover">
            <Popover>
              <PopoverTrigger render={<Button variant="outline">Node settings</Button>} />
              <PopoverContent className="text-sm">
                Model, temperature, and grounding toggles live here.
              </PopoverContent>
            </Popover>
          </Demo>
          <Demo label="Dropdown & context menu">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline">Node actions</Button>} />
              <DropdownMenuContent>
                <DropdownMenuLabel>Scene 04</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Regenerate</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ContextMenu>
              <ContextMenuTrigger
                render={
                  <div className="rounded-md border border-dashed border-border px-4 py-2 text-sm text-muted-foreground">
                    Right-click this node
                  </div>
                }
              />
              <ContextMenuContent>
                <ContextMenuItem>Regenerate</ContextMenuItem>
                <ContextMenuItem>Delete</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </Demo>
          <Demo label="Command palette">
            <Command className="max-w-xs rounded-md border border-border">
              <CommandInput placeholder="Jump to scene or character..." />
              <CommandList>
                <CommandEmpty>No results.</CommandEmpty>
                <CommandGroup heading="Characters">
                  <CommandItem>Marcus</CommandItem>
                  <CommandItem>Elena</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </Demo>
        </Section>

        {/* NAVIGATION */}
        <Section id="navigation" title="Navigation">
          <Demo label="Tabs">
            <Tabs defaultValue="script" className="w-full max-w-md">
              <TabsList>
                <TabsTrigger value="script">Script</TabsTrigger>
                <TabsTrigger value="characters">Characters</TabsTrigger>
                <TabsTrigger value="storyboard">Storyboard</TabsTrigger>
              </TabsList>
              <TabsContent value="script" className="text-sm text-muted-foreground">
                Master script content.
              </TabsContent>
              <TabsContent value="characters" className="text-sm text-muted-foreground">
                Character roster.
              </TabsContent>
              <TabsContent value="storyboard" className="text-sm text-muted-foreground">
                Imagen 3 frames.
              </TabsContent>
            </Tabs>
          </Demo>
          <Demo label="Breadcrumb">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Project</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Scene 04</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Marcus</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </Demo>
          <Demo label="Accordion">
            <Accordion className="w-full max-w-md">
              <AccordionItem value="known">
                <AccordionTrigger>Known facts (4)</AccordionTrigger>
                <AccordionContent>
                  Marcus knows the keys were his responsibility.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="unaware">
                <AccordionTrigger>Unaware of (2)</AccordionTrigger>
                <AccordionContent>
                  Marcus does not know Elena saw him drop them.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Demo>
          <Demo label="Pagination">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </Demo>
          <Demo label="Menubar">
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>Project</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>New scene</MenubarItem>
                  <MenubarItem>Export script</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Settings</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>View</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Graph</MenubarItem>
                  <MenubarItem>Timeline</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </Demo>
        </Section>

        {/* LAYOUT */}
        <Section id="layout" title="Layout">
          <Demo label="Slider (timeline scrubber base)" className="flex-col items-stretch">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Story timeline</span>
              <span className="timecode text-sm">00:34:12</span>
            </div>
            <Slider defaultValue={[34]} max={90} step={1} />
          </Demo>
          <Demo label="Separator">
            <div className="flex flex-col gap-2 w-full max-w-xs">
              <span className="text-sm">Above</span>
              <Separator />
              <span className="text-sm">Below</span>
            </div>
          </Demo>
          <Demo label="Aspect ratio (storyboard frame)">
            <AspectRatio ratio={16 / 9} className="w-64 rounded-md bg-secondary">
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                16:9 Imagen frame
              </div>
            </AspectRatio>
          </Demo>
          <Demo label="Scroll area">
            <ScrollArea className="h-32 w-64 rounded-md border border-border p-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                INT. SERVICE TUNNEL — NIGHT{"\n\n"}
                Marcus checks his pocket. Empty. He freezes.{"\n\n"}
                MARCUS{"\n"}
                (whisper) They were right here.
              </p>
            </ScrollArea>
          </Demo>
          <Demo label="Collapsible">
            <Collapsible className="w-full max-w-sm">
              <CollapsibleTrigger
                render={
                  <Button variant="ghost" className="gap-1">
                    <ChevronRightIcon className="size-4" />
                    Off-screen actions
                  </Button>
                }
              />
              <CollapsibleContent className="text-sm text-muted-foreground px-2 pt-2">
                Elena is watching from across the street, unseen.
              </CollapsibleContent>
            </Collapsible>
          </Demo>
          <Demo label="Carousel" className="flex-col items-stretch">
            <Carousel className="w-full max-w-xs mx-auto">
              <CarouselContent>
                {["Wide", "OTS", "Close-up"].map((label) => (
                  <CarouselItem key={label}>
                    <div className="flex aspect-video items-center justify-center rounded-md bg-secondary text-sm text-muted-foreground">
                      {label}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </Demo>
        </Section>

        <footer className="border-t border-border pt-6 pb-16 text-xs text-muted-foreground flex items-center gap-2">
          <UserIcon className="size-3.5" />
          Internal reference only — not part of the product build.
        </footer>
      </main>
    </div>
  );
}
