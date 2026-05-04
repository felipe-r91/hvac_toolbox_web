import React from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaShip,
  FaTools,
  FaCamera,
  FaClipboardCheck,
  FaFileAlt,
  FaShieldAlt,
  FaGripVertical,
} from "react-icons/fa";
import { API_BASE_URL } from "../../api/config";

type Tone = "green" | "red" | "amber" | "blue" | "slate";
type SectionId =
  | "vessel"
  | "service"
  | "equipment"
  | "summary"
  | "condition"
  | "alarms"
  | "photos"
  | "impact"
  | "rootCause"
  | "recommendations"
  | "furtherAction"
  | "ehs"
  | "signatures";

type ReportPage = {
  id: string;
  sections: SectionId[];
};

export type AiCustomerReport = {
  reportNo?: string;
  title?: string;
  subtitle?: string;
  company?: string;
  branch?: string;
  date?: string;
  serviceOrder?: string;
  engineer?: string;
  projectManager?: string;
  location?: string;
  machineStatus?: string;
  severity?: string;
  finalCondition?: string;
  executiveSummary?: string;
  conditionFound?: string;
  alarms?: string[];
  operationalImpact?: string;
  probableRootCause?: string;
  recommendations?: string[];
  furtherActionRequired?: string;
  ehsStatement?: string;
};

export type SourceCfrReport = {
  id?: string;
  vesselName?: string;
  vesselImoNumber?: string;
  vesselType?: string;
  vesselOwner?: string;
  requestedBy?: string;
  vesselContact?: string;

  machineTag?: string;
  machineModel?: string;
  machineType?: string;
  machineStarterType?: string;
  machineLocation?: string;
  machineSerialNumber?: string;
  machinePhotoPreviewUrl?: string;

  createdAt?: string;
  photos?: {
    id: string;
    filename?: string;
    caption?: string;
    previewUrl?: string;
  }[];
};

type NormalizedReport = {
  reportNo: string;
  title: string;
  subtitle: string;
  company: string;
  branch: string;
  date: string;
  serviceOrder: string;
  engineer: string;
  projectManager: string;
  location: string;
  machineStatus: string;
  severity: string;
  finalCondition: string;
  vessel: {
    name: string;
    imo: string;
    type: string;
    owner: string;
    requestedBy: string;
    contact: string;
  };
  equipment: {
    unit: string;
    systemType: string;
    model: string;
    serial: string;
    refrigerant: string;
    oil: string;
    controlSystem: string;
    software: string;
    starterType: string;
  };
  executiveSummary: string;
  conditionFound: string;
  alarms: string[];
  operationalImpact: string;
  probableRootCause: string;
  recommendations: string[];
  furtherActionRequired: string;
  ehsStatement: string;
};

const initialPages: ReportPage[] = [
  { id: "page-1", sections: ["vessel", "service", "equipment"] },
  { id: "page-2", sections: ["summary", "condition", "alarms"] },
  { id: "page-3", sections: ["photos"] },
  { id: "page-4", sections: ["impact", "rootCause", "recommendations"] },
  { id: "page-5", sections: ["furtherAction", "ehs"] },
];

function resolvePhotoUrl(url?: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url}`;
}

function EditableText({
  children,
  className = "",
  multiline = false,
}: {
  children: React.ReactNode;
  className?: string;
  multiline?: boolean;
}) {
  const Tag = multiline ? "div" : "span";

  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      className={`${className} rounded-sm outline-none transition focus:bg-yellow-50 focus:ring-1 focus:ring-yellow-300`}
    >
      {children}
    </Tag>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border-b border-slate-300 py-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        <EditableText>{label}</EditableText>
      </p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">
        <EditableText>{value || "—"}</EditableText>
      </p>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
  right,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="border-t border-slate-300 bg-white">
      <div className="flex items-center justify-between border-b border-slate-300 px-4 py-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-[#003594]" />}
          <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-[#003594]">
            {title}
          </h2>
        </div>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function DraggableSection({
  id,
  children,
}: {
  id: SectionId;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`${isDragging ? "opacity-60" : "opacity-100"} relative`}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        zIndex: isDragging ? 50 : undefined,
      }}
    >
      <button
        type="button"
        {...listeners}
        {...attributes}
        className="absolute right-2 top-2 z-10 hidden items-center gap-1 border border-slate-300 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 hover:bg-slate-100 print:hidden md:inline-flex"
      >
        <FaGripVertical className="h-3 w-3" /> Move
      </button>
      {children}
    </div>
  );
}

function StatusPill({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  const tones: Record<Tone, string> = {
    green: "border-emerald-300 text-emerald-700 bg-emerald-50",
    red: "border-red-300 text-red-700 bg-red-50",
    amber: "border-amber-300 text-amber-800 bg-amber-50",
    blue: "border-[#003594] text-[#003594] bg-[#EAF6FB]",
    slate: "border-slate-300 text-slate-700 bg-slate-100",
  };

  return (
    <span
      className={`inline-flex items-center border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${tones[tone]} print:border-none print:bg-transparent`}
    >
      <EditableText>{children}</EditableText>
    </span>
  );
}

function ReportFooter({
  pageNumber,
  totalPages,
}: {
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <footer className="mt-auto bg-white pt-5">
      <div className="h-0.5 bg-linear-to-r from-[#003594] via-[#00A9E0] to-[#78BE20]" />

      <div className="px-5 py-2 text-[8px] leading-tight text-slate-500 md:flex md:items-center md:justify-between">
        <div className="space-y-1">
          <p>
            <EditableText multiline>
              This document is the property of Johnson Controls and is delivered upon the express condition that the content will not be disclosed to third party without Johnson Controls’ written consent.
            </EditableText>
          </p>
          <p className="font-semibold text-slate-600">
            <EditableText>
              Johnson Controls Building Solutions LLC, Marine & Navy - Global Marine Services, Miami
            </EditableText>
          </p>
          <p className="font-semibold text-slate-600">
            <EditableText>
              10550 Commerce Pkwy, Miramar – Florida, 33025 - USA
            </EditableText>
          </p>
        </div>

        <p className="mt-2 shrink-0 text-right font-bold text-[#003594] md:mt-0">
          Page {pageNumber} of {totalPages}
        </p>
      </div>
    </footer>
  );
}

function AlarmCard({ alarm, onDelete }: { alarm: string; onDelete: () => void }) {
  return (
    <li className="group flex gap-3 bg-amber-50 p-2.5 text-sm text-amber-950 ring-1 ring-amber-100">
      <FaExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
      <EditableText className="flex-1">{alarm}</EditableText>

      <button
        type="button"
        onClick={onDelete}
        className="ml-auto hidden shrink-0 border border-amber-300 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800 hover:bg-amber-100 group-hover:inline-flex print:hidden"
      >
        Delete
      </button>
    </li>
  );
}

function RecommendationCard({
  recommendation,
  index,
  onDelete,
}: {
  recommendation: string;
  index: number;
  onDelete: () => void;
}) {
  return (
    <li className="group flex gap-3 border-t border-b border-slate-300 bg-white p-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#003594] text-[11px] font-black text-white">
        {index + 1}
      </span>
      <EditableText multiline className="block flex-1 text-sm leading-6 text-slate-800">
        {recommendation}
      </EditableText>

      <button
        type="button"
        onClick={onDelete}
        className="ml-auto hidden shrink-0 self-start border border-slate-300 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 hover:bg-slate-100 group-hover:inline-flex print:hidden"
      >
        Delete
      </button>
    </li>
  );
}

function SwappableImage({
  src,
  alt,
  className,
  emptyText = "Click to select image",
}: {
  src?: string;
  alt: string;
  className?: string;
  emptyText?: string;
}) {
  const [imageUrl, setImageUrl] = React.useState(src || "");
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setImageUrl(src || "");
  }, [src]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setImageUrl(localUrl);
    event.target.value = "";
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
        className="group relative h-full w-full cursor-pointer overflow-hidden bg-slate-50 print:pointer-events-none"
      >
        {imageUrl ? (
          <img src={imageUrl} alt={alt} className={className} />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-4 text-center text-xs text-slate-400">
            {emptyText}
          </div>
        )}

        <div className="absolute inset-0 hidden items-center justify-center bg-black/40 text-xs font-bold uppercase tracking-wide text-white group-hover:flex print:hidden">
          Change image
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
}

function ReportHeader({ report }: { report: NormalizedReport }) {
  return (
    <header className="avoid-break overflow-hidden rounded-md border border-slate-300 bg-white">
      <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="mb-4 flex items-center gap-2">
            <img
              src="/jci-logo.png"
              alt="Johnson Controls logo"
              className="h-14 w-auto object-contain"
            />
            <div className="hidden h-10 w-px bg-slate-300 sm:block" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#003594]">
                <EditableText>{report.branch}</EditableText>
              </p>
            </div>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-[#152EA9]">
            <EditableText>{report.title}</EditableText>
          </h1>
          <p className="mt-1 text-base font-semibold text-slate-500">
            <EditableText>{report.subtitle}</EditableText>
          </p>
        </div>
      </div>

      <div className="h-3 bg-linear-to-r from-[#003594] via-[#00A9E0] to-[#78BE20]" />

      <div className="border-t border-slate-300 bg-white px-4 py-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
            <EditableText>Machine Status</EditableText>
          </p>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="amber">{report.machineStatus}</StatusPill>
            <StatusPill tone="red">Severity: {report.severity}</StatusPill>
          </div>
        </div>
      </div>
    </header>
  );
}

function DroppablePageBody({
  pageId,
  children,
  bodyRef,
}: {
  pageId: string;
  children: React.ReactNode;
  bodyRef: (node: HTMLDivElement | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: pageId });

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        bodyRef(node);
      }}
      className={`flex-1 space-y-3 overflow-hidden ${isOver ? "bg-[#EAF6FB]/40" : "bg-white"
        }`}
    >
      {children}
    </div>
  );
}

function SignatureBlock({ report }: { report: NormalizedReport }) {
  return (
    <div className="px-4 pb-24 pt-6">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            <EditableText>Service Engineer</EditableText>
          </p>
          <div className="mr-24 mt-8 border-t border-slate-400 pt-2 text-sm font-bold text-[#003594]">
            <EditableText>{report.engineer || "—"}</EditableText>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            <EditableText>Customer Representative</EditableText>
          </p>
          <div className="mt-8 border-t border-slate-400 pt-2 text-sm font-bold text-[#003594]">
            <EditableText>Signature/ Vessel Stamp</EditableText>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConditionsFoundReportUI({
  aiReport,
  sourceReport,
}: {
  aiReport: AiCustomerReport;
  sourceReport: SourceCfrReport;
}) {
  const report: NormalizedReport = {
    reportNo: aiReport.reportNo || `CFR-${sourceReport.id || "DRAFT"}`,
    title: aiReport.title || "Conditions Found Report",
    subtitle:
      aiReport.subtitle ||
      `${sourceReport.machineTag || "Machine"} – ${sourceReport.machineType || ""}`,
    company: aiReport.company || "Johnson Controls",
    branch: aiReport.branch || "Global Marine & Navy Service – Miami",
    date:
      aiReport.date ||
      (sourceReport.createdAt
        ? new Date(sourceReport.createdAt).toLocaleDateString()
        : new Date().toLocaleDateString()),
    serviceOrder: aiReport.serviceOrder || "",
    engineer: aiReport.engineer || "",
    projectManager: aiReport.projectManager || "",
    location: aiReport.location || sourceReport.machineLocation || "",
    machineStatus: aiReport.machineStatus || "Not provided",
    severity: aiReport.severity || "Not classified",
    finalCondition: aiReport.finalCondition || "Not provided",

    vessel: {
      name: sourceReport.vesselName || "—",
      imo: sourceReport.vesselImoNumber || "—",
      type: sourceReport.vesselType || "—",
      owner: sourceReport.vesselOwner || "—",
      requestedBy: sourceReport.requestedBy || "—",
      contact: sourceReport.vesselContact || "—",
    },

    equipment: {
      unit: sourceReport.machineTag || "—",
      systemType: sourceReport.machineType || "—",
      model: sourceReport.machineModel || "—",
      serial: sourceReport.machineSerialNumber || "—",
      refrigerant: "",
      oil: "",
      controlSystem: "",
      software: "",
      starterType: sourceReport.machineStarterType || "—",
    },

    executiveSummary: aiReport.executiveSummary || "",
    conditionFound: aiReport.conditionFound || "",
    alarms: aiReport.alarms || [],
    operationalImpact: aiReport.operationalImpact || "",
    probableRootCause: aiReport.probableRootCause || "",
    recommendations: aiReport.recommendations || [],
    furtherActionRequired: aiReport.furtherActionRequired || "",
    ehsStatement:
      aiReport.ehsStatement ||
      "All work was conducted in compliance with vessel safety requirements, applicable regulations, and company Environment, Health & Safety procedures. Hazard awareness and safe work practices were observed at all times. No safety incidents were reported during the execution of the work.",
  };

  const reportPhotos = sourceReport.photos || [];

  const [isPrintPreview, setIsPrintPreview] = React.useState(false);
  const [alarms, setAlarms] = React.useState<string[]>(report.alarms);
  const [recommendations, setRecommendations] = React.useState<string[]>(
    report.recommendations
  );
  const [pages, setPages] = React.useState<ReportPage[]>(initialPages);
  const reportRef = React.useRef<HTMLElement | null>(null);
  const pageBodyRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const [totalPages, setTotalPages] = React.useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  React.useEffect(() => {
    setAlarms(report.alarms);
    setRecommendations(report.recommendations);
    setPages(initialPages);
  }, [aiReport, sourceReport]);

  React.useLayoutEffect(() => {
    if (!reportRef.current) return;

    const updatePageCount = () => {
      const pagesCount =
        reportRef.current?.querySelectorAll(".report-page").length || 0;
      setTotalPages(pagesCount);
    };

    updatePageCount();

    const observer = new MutationObserver(updatePageCount);
    observer.observe(reportRef.current, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  React.useLayoutEffect(() => {
    const timeout = window.setTimeout(() => {
      setPages((currentPages) => {
        const nextPages = currentPages.map((page) => ({
          ...page,
          sections: [...page.sections],
        }));
        let changed = false;

        for (let pageIndex = 0; pageIndex < nextPages.length; pageIndex++) {
          const page = nextPages[pageIndex];
          const body = pageBodyRefs.current[page.id];
          const isOverflowing = body && body.scrollHeight > body.clientHeight + 2;

          if (!isOverflowing || page.sections.length === 0) continue;

          const movedSection = page.sections.pop();
          if (!movedSection) continue;

          const nextPage = nextPages[pageIndex + 1];
          if (nextPage) {
            nextPage.sections.unshift(movedSection);
          } else {
            nextPages.push({
              id: `page-${nextPages.length + 1}`,
              sections: [movedSection],
            });
          }

          changed = true;
          break;
        }

        return changed ? nextPages : currentPages;
      });
    }, 50);

    return () => window.clearTimeout(timeout);
  }, [pages, alarms, recommendations]);

  function handleDragEnd(event: DragEndEvent) {
    const activeSectionId = event.active.id as SectionId;
    const targetPageId = event.over?.id as string | undefined;

    if (!targetPageId || !targetPageId.startsWith("page-")) return;

    setPages((currentPages) => {
      const nextPages = currentPages.map((page) => ({
        ...page,
        sections: page.sections.filter((section) => section !== activeSectionId),
      }));
      const targetPage = nextPages.find((page) => page.id === targetPageId);
      if (!targetPage) return currentPages;
      targetPage.sections.push(activeSectionId);
      return nextPages;
    });
  }

  function renderSection(sectionId: SectionId) {
    switch (sectionId) {
      case "vessel":
        return (
          <Section icon={FaShip} title="Vessel / Customer Information">
            <div className="grid gap-x-4 md:grid-cols-2">
              <InfoRow label="Vessel Name" value={report.vessel.name} />
              <InfoRow label="IMO No." value={report.vessel.imo} />
              <InfoRow label="Vessel Type" value={report.vessel.type} />
              <InfoRow label="Owner / Customer" value={report.vessel.owner} />
              <InfoRow label="Requested By" value={report.vessel.requestedBy} />
              <InfoRow label="Vessel Contact" value={report.vessel.contact} />
            </div>
          </Section>
        );

      case "service":
        return (
          <Section icon={FaClipboardCheck} title="Service Information">
            <div className="grid gap-x-4 md:grid-cols-2">
              <InfoRow label="Service Order No." value={report.serviceOrder} />
              <InfoRow label="Project Manager" value={report.projectManager} />
              <InfoRow label="Date" value={report.date} />
              <InfoRow label="Location" value={report.location} />
              <InfoRow label="Service Engineer" value={report.engineer} />
              <InfoRow label="Report Type" value="Conditions Found Report" />
              <InfoRow label="Reason for Attendance" value="" />
              <InfoRow label="Final Condition" value={report.finalCondition} />
              <InfoRow label="Further Action" value="Required" />
            </div>
          </Section>
        );

      case "equipment":
        return (
          <Section icon={FaTools} title="Equipment Information">
            <div className="grid gap-2 md:grid-cols-4">
              <div className="flex max-h-[52mm] flex-col border border-slate-300 bg-white md:col-span-1">
                <div className="flex flex-1 items-center justify-center overflow-hidden">
                  <SwappableImage
                    src={resolvePhotoUrl(sourceReport.machinePhotoPreviewUrl)}
                    alt={report.equipment.unit}
                    className="h-full w-full object-contain"
                    emptyText="No machine photo available"
                  />
                </div>

                <div className="border-t border-slate-300 px-2 py-1.5">
                  <p className="text-[9px] uppercase text-slate-500">Unit</p>
                  <p className="text-[11px] font-semibold text-[#003594]">
                    {report.equipment.unit}
                  </p>
                </div>
              </div>

              <div className="grid gap-x-4 border border-slate-300 p-2 md:col-span-3 md:grid-cols-3">
                <InfoRow label="Model" value={report.equipment.model} />
                <InfoRow label="Serial No." value={report.equipment.serial} />
                <InfoRow label="Refrigerant" value={report.equipment.refrigerant} />
                <InfoRow label="Oil Type" value={report.equipment.oil} />
                <InfoRow label="Control System" value={report.equipment.controlSystem} />
                <InfoRow label="Software Version" value={report.equipment.software} />
                <InfoRow label="Run Hours" value="" />
                <InfoRow label="Start Count" value="" />
                <InfoRow label="Starter Type" value={report.equipment.starterType} />
                <InfoRow label="Last Overhaul Hours" value="" />
                <InfoRow label="Compressor Type" value={report.equipment.systemType} />
                <InfoRow label="Mfg" value="" />
              </div>
            </div>
          </Section>
        );

      case "summary":
        return (
          <Section icon={FaFileAlt} title="Summary">
            <div className="border-l-4 border-[#003594] bg-[#EAF6FB] p-4">
              <EditableText multiline className="block text-sm leading-6 text-slate-800">
                {report.executiveSummary}
              </EditableText>
            </div>
          </Section>
        );

      case "condition":
        return (
          <Section icon={FaExclamationTriangle} title="Condition Identified">
            <EditableText multiline className="block text-sm leading-6 text-slate-800">
              {report.conditionFound}
            </EditableText>
          </Section>
        );

      case "alarms":
        return (
          <Section
            icon={FaExclamationTriangle}
            title="Alarms / Abnormal Readings"
            right={
              <button
                type="button"
                onClick={() =>
                  setAlarms((current) => [...current, "New alarm / abnormal reading"])
                }
                className="mr-24 border border-[#003594] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#003594] hover:bg-[#EAF6FB] print:hidden"
              >
                Add alarm
              </button>
            }
          >
            {alarms.length > 0 ? (
              <ul className="space-y-2">
                {alarms.map((alarm, index) => (
                  <AlarmCard
                    key={`${alarm}-${index}`}
                    alarm={alarm}
                    onDelete={() =>
                      setAlarms((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index)
                      )
                    }
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No alarms reported.</p>
            )}
          </Section>
        );

      case "photos":
        return (
          <Section icon={FaCamera} title="Photo Evidence">
            {reportPhotos.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {reportPhotos.map((photo, index) => (
                  <figure
                    key={photo.id || index}
                    className="overflow-hidden border border-slate-300 bg-slate-50"
                  >
                    <div className="h-[70mm]">
                      <SwappableImage
                        src={resolvePhotoUrl(photo.previewUrl)}
                        alt={photo.caption || `Photo ${index + 1}`}
                        className="h-full w-full object-cover"
                        emptyText="Photo unavailable"
                      />
                    </div>

                    <figcaption className="p-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#003594]">
                        Pic {index + 1}:{" "}
                        <EditableText>
                          {photo.filename || `Photo ${index + 1}`}
                        </EditableText>
                      </p>
                      <EditableText multiline className="mt-1 block text-xs leading-5 text-slate-700">
                        {photo.caption || "No caption"}
                      </EditableText>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No photos attached.</p>
            )}
          </Section>
        );

      case "impact":
        return (
          <Section icon={FaExclamationTriangle} title="Operational Impact">
            <EditableText multiline className="block text-sm leading-6 text-slate-800">
              {report.operationalImpact}
            </EditableText>
          </Section>
        );

      case "rootCause":
        return (
          <Section icon={FaTools} title="Probable Root Cause">
            <EditableText multiline className="block text-sm leading-6 text-slate-800">
              {report.probableRootCause}
            </EditableText>
          </Section>
        );

      case "recommendations":
        return (
          <Section
            icon={FaCheckCircle}
            title="Recommendations"
            right={
              <button
                type="button"
                onClick={() =>
                  setRecommendations((current) => [...current, "New recommendation"])
                }
                className="mr-24 border border-[#003594] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#003594] hover:bg-[#EAF6FB] print:hidden"
              >
                Add recommendation
              </button>
            }
          >
            {recommendations.length > 0 ? (
              <ol className="space-y-2">
                {recommendations.map((item, index) => (
                  <RecommendationCard
                    key={`${item}-${index}`}
                    recommendation={item}
                    index={index}
                    onDelete={() =>
                      setRecommendations((current) =>
                        current.filter((_, itemIndex) => itemIndex !== index)
                      )
                    }
                  />
                ))}
              </ol>
            ) : (
              <p className="text-sm text-slate-500">No recommendations provided.</p>
            )}
          </Section>
        );

      case "furtherAction":
        return (
          <Section icon={FaClipboardCheck} title="Further Action Required">
            <div className="bg-white p-3">
              <EditableText multiline className="block text-sm leading-6 text-slate-800">
                {report.furtherActionRequired}
              </EditableText>
            </div>
          </Section>
        );

      case "ehs":
        return (
          <Section icon={FaShieldAlt} title="Environment, Health & Safety">
            <EditableText multiline className="block text-sm leading-6 text-slate-800">
              {report.ehsStatement}
            </EditableText>
          </Section>
        );

      default:
        return null;
    }
  }

  return (
    <div
      className={`${isPrintPreview ? "bg-neutral-300 p-4 md:p-8" : "bg-slate-100 p-4 md:p-8"
        } min-h-screen text-slate-900 print:bg-white print:p-0`}
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <style>{`
  @page {
    size: A4;
    margin: 0;
  }

  @media print {
    body * {
      visibility: hidden;
    }

    .report-print-area,
    .report-print-area * {
      visibility: visible;
    }

    .report-print-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 210mm;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .report-page {
      width: 210mm;
      height: 297mm;
      page-break-after: always;
      break-after: page;
      box-shadow: none !important;
    }

    .report-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .print\\:hidden {
      display: none !important;
    }
  }
`}</style>

      <div className="mx-auto mb-4 flex max-w-[225mm] items-center justify-between border-t border-b border-slate-300 bg-white px-4 py-3 print:hidden">
        <div>
          <p className="text-sm font-bold text-[#003594]">Report preview mode</p>
          <p className="text-xs text-slate-500">
            {isPrintPreview ? "Strict A4 PDF preview" : "Wider screen editing preview"}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsPrintPreview((current) => !current)}
            className="border border-[#003594] bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#003594] hover:bg-[#EAF6FB]"
          >
            {isPrintPreview ? "Screen view" : "A4 preview"}
          </button>
          {isPrintPreview &&
            <button
              type="button"
              onClick={() => window.print()}
              className="border border-[#003594] bg-[#003594] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#00266b]"
            >
              Save as PDF
            </button>}

        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <main
  ref={reportRef}
  id="conditions-found-report-print-area"
  className={`${
    isPrintPreview ? "max-w-[210mm]" : "max-w-[225mm]"
  } report-print-area mx-auto space-y-6 print:max-w-[210mm] print:space-y-0`}
>
          {pages.map((page, pageIndex) => (
            <section
              key={page.id}
              className={`${isPrintPreview ? "w-[210mm]" : "w-full"
                } report-page mx-auto flex h-[297mm] flex-col overflow-hidden bg-white p-[10mm] shadow-none print:mx-0 print:h-[297mm] print:w-[210mm] print:p-[10mm]`}
            >
              <DroppablePageBody
                pageId={page.id}
                bodyRef={(node) => {
                  pageBodyRefs.current[page.id] = node;
                }}
              >
                {pageIndex === 0 && <ReportHeader report={report} />}

                {page.sections.map((sectionId) => {
                  const isFixedSection =
                    sectionId === "vessel" || sectionId === "service";

                  if (isFixedSection) {
                    return <div key={sectionId}>{renderSection(sectionId)}</div>;
                  }

                  return (
                    <DraggableSection key={sectionId} id={sectionId}>
                      {renderSection(sectionId)}
                    </DraggableSection>
                  );
                })}
              </DroppablePageBody>

              {pageIndex === pages.length - 1 && <SignatureBlock report={report} />}

              <ReportFooter
                pageNumber={pageIndex + 1}
                totalPages={totalPages || pages.length}
              />
            </section>
          ))}
        </main>
      </DndContext>
    </div>
  );
}