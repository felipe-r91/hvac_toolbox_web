import React from "react";
import { createPortal } from "react-dom";
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
  FaCamera,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaFileAlt,
  FaGripVertical,
  FaShieldAlt,
  FaShip,
  FaTools,
} from "react-icons/fa";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { API_BASE_URL } from "../../api/config";
import { uploadCustomerReportPdf } from "../../api/customerReportApi";

type Tone = "green" | "red" | "amber" | "blue" | "slate";
type SectionId =
  | "vessel"
  | "service"
  | "equipment"
  | "summary"
  | "photos"
  | "furtherAction"
  | "ehs"
  | `alarms-${number}`
  | `activities-${number}`;

type ReportPage = {
  id: string;
  sections: SectionId[];
};

export type AiMachineMaintenanceReport = {
  reportNo?: string;
  title?: string;
  subtitle?: string;
  company?: string;
  vesselImo?: string;
  vesselImoNumber?: string;
  imoNumber?: string;
  branch?: string;
  date?: string;
  serviceOrder?: string;
  engineer?: string;
  projectManager?: string;
  location?: string;
  machineStatus?: string;
  maintenanceResult?: string;
  alarmStatus?: string;
  executiveSummary?: string;
  maintenanceSummary?: string;
  alarms?: MaintenanceAlarmItem[];
  activities?: MaintenanceActivityItem[];
  recommendations?: string[];
  furtherActionRequired?: string;
  ehsStatement?: string;
};

export type MaintenanceAlarmItem = {
  description?: string;
  status?: string;
};

export type MaintenanceActivityItem = {
  category?: string;
  task?: string;
  tool?: string;
  status?: string;
  notes?: string;
  measuredValue?: string;
  unit?: string;
  completedAt?: string;
  photos?: string[];
};

type SourceMaintenancePhoto = {
  id?: string;
  filename?: string;
  caption?: string;
  previewUrl?: string;
  taskId?: string;
};

type SourceMaintenanceTask = {
  id?: string;
  taskTemplateId?: string;
  category?: string;
  taskName?: string;
  task?: string;
  tool?: string;
  checked?: boolean;
  status?: string;
  notes?: string;
  measuredValue?: string;
  unit?: string;
  completedAt?: string;
  photoIds?: string[];
  photos?: SourceMaintenancePhoto[];
};

export type SourceMachineMaintenanceReport = {
  id?: string;
  vesselId?: string;
  vesselName?: string;
  vesselImo?: string;
  vesselImoNumber?: string;
  imoNumber?: string;
  vesselType?: string;
  vesselOwner?: string;
  ownerCustomer?: string;
  customer?: string;
  requestedBy?: string;
  vesselContact?: string;

  machineId?: string;
  machineTag?: string;
  machineModel?: string;
  machineMfg?: string;
  machineManufacturer?: string;
  mfg?: string;
  manufacturer?: string;
  machineType?: string;
  machineCompressorType?: string;
  machineStarterType?: string;
  machineLocation?: string;
  machineSerialNumber?: string;
  machineRefrigerant?: string;
  refrigerant?: string;
  machineOilType?: string;
  oilType?: string;
  machineControlSystem?: string;
  controlSystem?: string;
  machineSoftwareVersion?: string;
  softwareVersion?: string;
  machinePhotoPreviewUrl?: string;

  completedAt?: string;
  overallStatus?: string;
  downtimeReason?: string;
  failureComponent?: string;
  failureMode?: string;
  failureCode?: string;
  failureNotes?: string;
  faultCount?: number;
  skippedCount?: number;
  reportCategory?: string;
  tasks?: SourceMaintenanceTask[];
  photos?: SourceMaintenancePhoto[];
};

type NormalizedMaintenanceReport = {
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
  maintenanceResult: string;
  alarmStatus: string;
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
    compressorType: string;
    manufacturer: string;
  };
  executiveSummary: string;
  alarms: Required<MaintenanceAlarmItem>[];
  activities: Required<MaintenanceActivityItem>[];
  furtherActionRequired: string;
  ehsStatement: string;
};

function resolvePhotoUrl(url?: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url}`;
}

function formatDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString();
}

function statusLabel(value?: string) {
  if (!value) return "";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function isImageReference(value?: string) {
  if (!value) return false;
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/") ||
    /\.(png|jpe?g|webp|gif)$/i.test(value)
  );
}

function buildInitialPages(
  alarmChunkCount: number,
  activityChunkCount: number,
  includePhotos: boolean
): ReportPage[] {
  const alarmPages: ReportPage[] = Array.from(
    { length: Math.max(alarmChunkCount - 1, 0) },
    (_, index) => ({
      id: `page-alarms-${index + 2}`,
      sections: [`alarms-${index + 1}`],
    })
  );

  const activityPages: ReportPage[] = Array.from(
    { length: Math.max(activityChunkCount, 1) },
    (_, index) => ({
      id: `page-activity-${index + 1}`,
      sections: [`activities-${index}`],
    })
  );

  return [
    { id: "page-1", sections: ["vessel", "service"] },
    { id: "page-2", sections: ["equipment", "summary", "alarms-0"] },
    ...alarmPages,
    ...activityPages,
    ...(includePhotos ? [{ id: "page-photos", sections: ["photos"] as SectionId[] }] : []),
    { id: "page-final", sections: ["furtherAction", "ehs"] },
  ];
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
        <EditableText>{value || "-"}</EditableText>
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
  isEditing,
}: {
  id: SectionId;
  children: React.ReactNode;
  isEditing: boolean;
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
      {isEditing && (
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="absolute right-2 top-2 z-10 hidden items-center gap-1 border border-slate-300 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 hover:bg-slate-100 print:hidden md:inline-flex"
        >
          <FaGripVertical className="h-3 w-3" /> Move
        </button>
      )}
      {children}
    </div>
  );
}

function DroppablePageBody({
  pageId,
  children,
  bodyRef,
}: {
  pageId: string;
  children: React.ReactNode;
  bodyRef?: (node: HTMLDivElement | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: pageId });

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        bodyRef?.(node);
      }}
      className={`flex-1 space-y-3 overflow-hidden ${isOver ? "bg-[#EAF6FB]/40" : "bg-white"}`}
    >
      {children}
    </div>
  );
}

function SwappableImage({
  src,
  alt,
  className = "",
  emptyText,
}: {
  src?: string;
  alt: string;
  className?: string;
  emptyText: string;
}) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 px-4 text-center text-xs text-slate-400">
        {emptyText}
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} />;
}

function ActivityStatusPill({ status }: { status?: string }) {
  const normalized = status?.toLowerCase() || "";
  const classes =
    normalized === "fault" || normalized === "down" || normalized === "open"
      ? "bg-red-100 text-red-800"
      : normalized === "attention" || normalized === "monitoring"
        ? "bg-yellow-100 text-yellow-800"
        : normalized === "ok" || normalized === "solved" || normalized === "complete"
          ? "bg-green-100 text-green-800"
          : "bg-slate-100 text-slate-700";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${classes}`}>
      {statusLabel(status) || "Not provided"}
    </span>
  );
}

function StatusPill({
  children,
  tone = "slate",
  isPrintPreview = false,
  preservePrintStyle = false,
}: {
  children: React.ReactNode;
  tone?: Tone;
  isPrintPreview?: boolean;
  preservePrintStyle?: boolean;
}) {
  const [selectedTone, setSelectedTone] = React.useState<Tone>(tone);
  const [isOpen, setIsOpen] = React.useState(false);
  const pillRef = React.useRef<HTMLSpanElement | null>(null);
  const [menuPosition, setMenuPosition] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    setSelectedTone(tone);
  }, [tone]);

  function openMenu() {
    if (isPrintPreview) return;

    const rect = pillRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPosition({ top: rect.bottom + 6, left: rect.left });
    }

    setIsOpen((prev) => !prev);
  }

  const tones: Record<Tone, string> = {
    green: "border-emerald-300 text-emerald-700 bg-emerald-50",
    red: "border-red-300 text-red-700 bg-red-50",
    amber: "border-amber-300 text-amber-800 bg-amber-50",
    blue: "border-[#003594] text-[#003594] bg-[#EAF6FB]",
    slate: "border-slate-300 text-slate-700 bg-slate-100",
  };

  const dotColors: Record<Tone, string> = {
    green: "bg-emerald-500",
    red: "bg-red-500",
    amber: "bg-yellow-500",
    blue: "bg-blue-500",
    slate: "bg-slate-400",
  };

  const toneOptions: Tone[] = ["green", "amber", "red", "blue", "slate"];

  return (
    <>
      <span
        ref={pillRef}
        onClick={openMenu}
        className={`inline-flex items-center border px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${
          isPrintPreview ? "cursor-default" : "cursor-pointer"
        } ${tones[selectedTone]} ${
          preservePrintStyle ? "" : "print:border-none print:bg-transparent"
        }`}
      >
        <EditableText>{children}</EditableText>
      </span>

      {!isPrintPreview &&
        isOpen &&
        createPortal(
          <div
            className="fixed z-9999 w-40 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-slate-200 print:hidden"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            {toneOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setSelectedTone(option);
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${dotColors[option]}`} />
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

function getStatusTone(status?: string): Tone {
  const value = (status || "").toLowerCase();

  if (
    value.includes("not returned") ||
    value.includes("down") ||
    value.includes("offline") ||
    value.includes("non-operational") ||
    value.includes("unavailable") ||
    value.includes("no")
  ) {
    return "red";
  }

  if (
    value.includes("restriction") ||
    value.includes("restricted") ||
    value.includes("limited") ||
    value.includes("degraded") ||
    value.includes("monitor") ||
    value.includes("progress")
  ) {
    return "amber";
  }

  if (
    value.includes("returned") ||
    value.includes("online") ||
    value.includes("operational") ||
    value.includes("running") ||
    value.includes("finished") ||
    value.includes("yes") ||
    value.includes("ok")
  ) {
    return "green";
  }

  return "slate";
}

function ReportHeader({
  report,
  isPrintPreview,
  hasActiveAlarm,
}: {
  report: NormalizedMaintenanceReport;
  isPrintPreview: boolean;
  hasActiveAlarm: boolean;
}) {
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
            <EditableText>Machine Maintenance Report Status</EditableText>
          </p>
          <div className="flex flex-wrap gap-2">
            <StatusPill
              tone={getStatusTone(report.machineStatus)}
              isPrintPreview={isPrintPreview}
              preservePrintStyle
            >
              {report.machineStatus}
            </StatusPill>

            <StatusPill
              tone={hasActiveAlarm ? "amber" : "green"}
              isPrintPreview={isPrintPreview}
              preservePrintStyle
            >
              {hasActiveAlarm ? "alarm" : "no alarm"}
            </StatusPill>
          </div>
        </div>
      </div>
    </header>
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
              This document is the property of Johnson Controls and is delivered upon the express condition that the content will not be disclosed to third party without Johnson Controls' written consent.
            </EditableText>
          </p>
          <p className="font-semibold text-slate-600">
            <EditableText>
              Johnson Controls Building Solutions LLC, Marine & Navy - Global Marine Services, Miami
            </EditableText>
          </p>
          <p className="font-semibold text-slate-600">
            <EditableText>
              10550 Commerce Pkwy, Miramar - Florida, 33025 - USA
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

function SignatureBlock({ report }: { report: NormalizedMaintenanceReport }) {
  return (
    <div className="px-4 pb-20 pt-6">
      <div className="grid max-w-[95mm] gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            <EditableText>Service Engineer</EditableText>
          </p>
          <div className="mr-24 mt-8 border-t border-slate-400 pt-2 text-sm font-bold text-[#003594]">
            <EditableText>{report.engineer || "-"}</EditableText>
          </div>
        </div>
      </div>
    </div>
  );
}

function normalizeActivityChunks(
  chunks: Required<MaintenanceActivityItem>[][]
) {
  const nextChunks = chunks.filter((chunk) => chunk.length > 0);
  return nextChunks.length > 0 ? nextChunks : [[]];
}

function normalizeAlarmChunks(chunks: Required<MaintenanceAlarmItem>[][]) {
  const nextChunks = chunks.filter((chunk) => chunk.length > 0);
  return nextChunks.length > 0 ? nextChunks : [[]];
}

function normalizeActivities(
  aiActivities?: MaintenanceActivityItem[],
  sourceTasks?: SourceMaintenanceTask[]
): Required<MaintenanceActivityItem>[] {
  const activities =
    aiActivities && aiActivities.length > 0
      ? aiActivities
      : sourceTasks?.map((task) => ({
          category: task.category,
          task: task.taskName || task.task,
          tool: task.tool,
          status: task.status,
          notes: task.notes,
          measuredValue: task.measuredValue,
          unit: task.unit,
          completedAt: task.completedAt,
          photos: task.photoIds || task.photos?.map((photo) => photo.id || photo.filename || ""),
        })) || [];

  return activities
    .map((activity) => ({
      category: activity.category || "-",
      task: activity.task || "-",
      tool: activity.tool || "",
      status: activity.status || "",
      notes: activity.notes || "",
      measuredValue: activity.measuredValue || "",
      unit: activity.unit || "",
      completedAt: activity.completedAt || "",
      photos: activity.photos || [],
    }))
    .filter((activity) => activity.status.toLowerCase() !== "skipped");
}

function matchPhotoReference(
  reference: string,
  sourceReport: SourceMachineMaintenanceReport
) {
  const term = reference.toLowerCase();

  return sourceReport.photos?.find((photo) => {
    return [photo.id, photo.filename, photo.caption, photo.taskId]
      .filter(Boolean)
      .some((value) => term.includes(String(value).toLowerCase()));
  });
}

function ActivityCard({
  activity,
  index,
  sourceReport,
  isEditing,
  onDelete,
}: {
  activity: Required<MaintenanceActivityItem>;
  index: number;
  sourceReport: SourceMachineMaintenanceReport;
  isEditing: boolean;
  onDelete: () => void;
}) {
  const matchedPhotos = activity.photos
    .map((photo) => matchPhotoReference(photo, sourceReport))
    .filter((photo): photo is SourceMaintenancePhoto => Boolean(photo));

  const unmatchedPhotoRefs = activity.photos.filter(
    (photo) => !matchPhotoReference(photo, sourceReport)
  );
  const measuredValue = `${activity.measuredValue || ""} ${activity.unit || ""}`.trim();
  const hasNotes = Boolean(activity.notes.trim());
  const hasMeasuredValue = Boolean(measuredValue);
  const shouldShowActivityDetails = hasNotes || hasMeasuredValue;

  return (
    <article className="avoid-break group border border-slate-300 bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-slate-300 bg-slate-50 px-3 py-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#003594]">
            Activity {index + 1} - <EditableText>{activity.category}</EditableText>
          </p>
          <h3 className="mt-1 text-sm font-bold text-slate-950">
            <EditableText>{activity.task}</EditableText>
          </h3>
        </div>
        <div className="flex shrink-0 items-start gap-2">
          <ActivityStatusPill status={activity.status} />
          {isEditing && (
            <button
              type="button"
              onClick={onDelete}
              className="hidden border border-slate-300 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 hover:bg-slate-100 group-hover:inline-flex print:hidden"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {shouldShowActivityDetails ? (
        <>
          <div className="border-t border-slate-300 px-3 py-2">
            {hasMeasuredValue ? (
              <InfoRow label="Measured Value" value={measuredValue} />
            ) : null}

            {hasNotes ? (
              <>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Notes
                </p>
                <EditableText multiline className="mt-1 block text-xs leading-5 text-slate-700">
                  {activity.notes}
                </EditableText>
              </>
            ) : null}
          </div>

          {(matchedPhotos.length > 0 || unmatchedPhotoRefs.length > 0) && (
            <div className="border-t border-slate-300 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Photos
              </p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {matchedPhotos.map((photo, photoIndex) => (
                  <figure
                    key={`${photo.id || photo.filename || photoIndex}-${photoIndex}`}
                    className="overflow-hidden border border-slate-300 bg-slate-50"
                  >
                    <div className="h-[34mm]">
                      <SwappableImage
                        src={resolvePhotoUrl(photo.previewUrl)}
                        alt={photo.caption || photo.filename || `Activity photo ${photoIndex + 1}`}
                        className="h-full w-full object-cover"
                        emptyText="Photo unavailable"
                      />
                    </div>
                    <figcaption className="p-2 text-[10px] leading-4 text-slate-600">
                      <EditableText multiline>
                        {photo.caption || photo.filename || `Photo ${photoIndex + 1}`}
                      </EditableText>
                    </figcaption>
                  </figure>
                ))}

                {unmatchedPhotoRefs.map((photo, photoIndex) =>
                  isImageReference(photo) ? (
                    <figure
                      key={`${photo}-${photoIndex}`}
                      className="overflow-hidden border border-slate-300 bg-slate-50"
                    >
                      <div className="h-[34mm]">
                        <SwappableImage
                          src={resolvePhotoUrl(photo)}
                          alt={`Activity photo ${photoIndex + 1}`}
                          className="h-full w-full object-cover"
                          emptyText="Photo unavailable"
                        />
                      </div>
                      <figcaption className="p-2 text-[10px] leading-4 text-slate-600">
                        <EditableText>{photo}</EditableText>
                      </figcaption>
                    </figure>
                  ) : (
                    <div
                      key={`${photo}-${photoIndex}`}
                      className="border border-slate-300 bg-slate-50 p-2 text-xs text-slate-700"
                    >
                      <EditableText>{photo}</EditableText>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </>
      ) : null}
    </article>
  );
}

function AlarmCard({
  alarm,
  onDelete,
  isEditing,
}: {
  alarm: Required<MaintenanceAlarmItem>;
  onDelete: () => void;
  isEditing: boolean;
}) {
  return (
    <li className="avoid-break group flex gap-3 bg-amber-50 p-2.5 text-sm text-amber-950 ring-1 ring-amber-100">
      <FaExclamationTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
      <EditableText multiline className="block flex-1 leading-6">
        {alarm.description}
      </EditableText>

      {isEditing && (
        <button
          type="button"
          onClick={onDelete}
          className="ml-auto hidden shrink-0 self-start border border-amber-300 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800 hover:bg-amber-100 group-hover:inline-flex print:hidden"
        >
          Delete
        </button>
      )}
    </li>
  );
}

export default function MachineMaintenanceReportUI({
  aiReport,
  sourceReport,
}: {
  aiReport: AiMachineMaintenanceReport;
  sourceReport: SourceMachineMaintenanceReport;
}) {
  const report: NormalizedMaintenanceReport = {
    reportNo: aiReport.reportNo || `MMR-${sourceReport.id || "DRAFT"}`,
    title: aiReport.title || "Machine Maintenance Report",
    subtitle:
      aiReport.subtitle ||
      `${sourceReport.machineTag || "Machine"} - ${sourceReport.machineType || ""}`,
    company: aiReport.company || "Johnson Controls",
    branch: aiReport.branch || "Global Marine & Navy Service - Miami",
    date:
      aiReport.date ||
      formatDate(sourceReport.completedAt) ||
      new Date().toLocaleDateString(),
    serviceOrder: aiReport.serviceOrder || "",
    engineer: aiReport.engineer || "",
    projectManager: aiReport.projectManager || "",
    location: aiReport.location || sourceReport.machineLocation || "",
    machineStatus: aiReport.machineStatus || statusLabel(sourceReport.overallStatus) || "",
    maintenanceResult:
      aiReport.maintenanceResult || "Maintenance result not provided.",
    alarmStatus: aiReport.alarmStatus || "No alarm reported",

    vessel: {
      name: sourceReport.vesselName || "-",
      imo:
        aiReport.vesselImo ||
        aiReport.vesselImoNumber ||
        aiReport.imoNumber ||
        sourceReport.vesselImo ||
        sourceReport.vesselImoNumber ||
        sourceReport.imoNumber ||
        "-",
      type: sourceReport.vesselType || "-",
      owner:
        sourceReport.vesselOwner ||
        sourceReport.ownerCustomer ||
        sourceReport.customer ||
        "-",
      requestedBy: sourceReport.requestedBy || "-",
      contact: sourceReport.vesselContact || "-",
    },

    equipment: {
      unit: sourceReport.machineTag || "-",
      systemType: sourceReport.machineType || "-",
      model: sourceReport.machineModel || "-",
      serial: sourceReport.machineSerialNumber || "-",
      refrigerant: sourceReport.machineRefrigerant || sourceReport.refrigerant || "-",
      oil: sourceReport.machineOilType || sourceReport.oilType || "-",
      controlSystem:
        sourceReport.machineControlSystem || sourceReport.controlSystem || "-",
      software:
        sourceReport.machineSoftwareVersion || sourceReport.softwareVersion || "-",
      starterType: sourceReport.machineStarterType || "-",
      compressorType: sourceReport.machineCompressorType || "-",
      manufacturer:
        sourceReport.machineMfg ||
        sourceReport.machineManufacturer ||
        sourceReport.mfg ||
        sourceReport.manufacturer ||
        "-",
    },

    executiveSummary: aiReport.executiveSummary || "",
    alarms:
      aiReport.alarms?.map((alarm) => ({
        description: alarm.description || "Alarm / abnormal finding",
        status: alarm.status || "",
      })) || [],
    activities: normalizeActivities(aiReport.activities, sourceReport.tasks),
    furtherActionRequired: aiReport.furtherActionRequired || "",
    ehsStatement:
      aiReport.ehsStatement ||
      "All work was conducted in compliance with vessel safety requirements, applicable regulations, and company Environment, Health & Safety procedures. Hazard awareness and safe work practices were observed at all times. No safety incidents were reported during the execution of the work.",
  };

  const [isPrintPreview, setIsPrintPreview] = React.useState(false);
  const isEditing = !isPrintPreview;
  const [alarmChunks, setAlarmChunks] = React.useState<
    Required<MaintenanceAlarmItem>[][]
  >(() => [report.alarms]);
  const [activityChunks, setActivityChunks] = React.useState<
    Required<MaintenanceActivityItem>[][]
  >(() => [report.activities]);
  const [isUploadingReport, setIsUploadingReport] = React.useState(false);
  const reportRef = React.useRef<HTMLElement | null>(null);
  const pageBodyRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const [pages, setPages] = React.useState<ReportPage[]>(() =>
    buildInitialPages(
      alarmChunks.length,
      activityChunks.length,
      Boolean(sourceReport.photos?.length)
    )
  );
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );
  const hasActiveAlarm = alarmChunks.flat().some(
    (alarm) => alarm.status.toLowerCase() !== "solved"
  );

  React.useEffect(() => {
    setAlarmChunks([report.alarms]);
    setActivityChunks([report.activities]);
    setPages(
      buildInitialPages(
        1,
        1,
        Boolean(sourceReport.photos?.length)
      )
    );
  }, [aiReport, sourceReport]);

  React.useEffect(() => {
    setPages((currentPages) => {
      let nextPages = currentPages.map((page) => ({
        ...page,
        sections: page.sections.filter((section) => {
          if (section.startsWith("alarms-")) {
            const chunkIndex = Number(section.replace("alarms-", ""));
            return chunkIndex < alarmChunks.length;
          }

          if (!section.startsWith("activities-")) return true;
          const chunkIndex = Number(section.replace("activities-", ""));
          return chunkIndex < activityChunks.length;
        }),
      }));

      for (let index = 0; index < alarmChunks.length; index += 1) {
        const sectionId = `alarms-${index}` as SectionId;
        const hasSection = nextPages.some((page) =>
          page.sections.includes(sectionId)
        );

        if (hasSection) continue;

        const firstActivityPageIndex = nextPages.findIndex((page) =>
          page.sections.some((section) => section.startsWith("activities-"))
        );
        const finalPageIndex = nextPages.findIndex((page) => page.id === "page-final");
        const insertIndex =
          firstActivityPageIndex === -1
            ? finalPageIndex === -1
              ? nextPages.length
              : finalPageIndex
            : firstActivityPageIndex;

        nextPages = [
          ...nextPages.slice(0, insertIndex),
          { id: `page-alarms-${index + 1}`, sections: [sectionId] },
          ...nextPages.slice(insertIndex),
        ];
      }

      for (let index = 0; index < activityChunks.length; index += 1) {
        const sectionId = `activities-${index}` as SectionId;
        const hasSection = nextPages.some((page) =>
          page.sections.includes(sectionId)
        );

        if (hasSection) continue;

        const finalPageIndex = nextPages.findIndex((page) => page.id === "page-final");
        const insertIndex = finalPageIndex === -1 ? nextPages.length : finalPageIndex;

        nextPages = [
          ...nextPages.slice(0, insertIndex),
          { id: `page-activity-${index + 1}`, sections: [sectionId] },
          ...nextPages.slice(insertIndex),
        ];
      }

      while (
        nextPages.length > 1 &&
        nextPages[nextPages.length - 1].sections.length === 0
      ) {
        nextPages = nextPages.slice(0, -1);
      }

      return nextPages;
    });
  }, [alarmChunks.length, activityChunks.length]);

  React.useLayoutEffect(() => {
    const timeout = window.setTimeout(() => {
      for (const page of pages) {
        const body = pageBodyRefs.current[page.id];
        const isOverflowing = body && body.scrollHeight > body.clientHeight + 2;

        if (!isOverflowing) continue;

        const alarmSection = [...page.sections]
          .reverse()
          .find((section) => section.startsWith("alarms-"));

        if (alarmSection) {
          const chunkIndex = Number(alarmSection.replace("alarms-", ""));

          setAlarmChunks((currentChunks) => {
            const sourceChunk = currentChunks[chunkIndex];
            if (!sourceChunk || sourceChunk.length <= 1) return currentChunks;

            const nextChunks = currentChunks.map((chunk) => [...chunk]);
            const movedAlarm = nextChunks[chunkIndex].pop();
            if (!movedAlarm) return currentChunks;

            if (nextChunks[chunkIndex + 1]) {
              nextChunks[chunkIndex + 1].unshift(movedAlarm);
            } else {
              nextChunks[chunkIndex + 1] = [movedAlarm];
            }

            return normalizeAlarmChunks(nextChunks);
          });

          break;
        }

        const activitySection = [...page.sections]
          .reverse()
          .find((section) => section.startsWith("activities-"));

        if (!activitySection) continue;

        const chunkIndex = Number(activitySection.replace("activities-", ""));

        setActivityChunks((currentChunks) => {
          const sourceChunk = currentChunks[chunkIndex];
          if (!sourceChunk || sourceChunk.length <= 1) return currentChunks;

          const nextChunks = currentChunks.map((chunk) => [...chunk]);
          const movedActivity = nextChunks[chunkIndex].pop();
          if (!movedActivity) return currentChunks;

          if (nextChunks[chunkIndex + 1]) {
            nextChunks[chunkIndex + 1].unshift(movedActivity);
          } else {
            nextChunks[chunkIndex + 1] = [movedActivity];
          }

          return normalizeActivityChunks(nextChunks);
        });

        break;
      }
    }, 80);

    return () => window.clearTimeout(timeout);
  }, [alarmChunks, activityChunks, pages, isPrintPreview]);

  function handleDragEnd(event: DragEndEvent) {
    if (!isEditing) return;

    const activeSectionId = event.active.id as SectionId;
    const targetPageId = event.over?.id as string | undefined;

    if (!targetPageId || !targetPageId.startsWith("page-")) return;

    setPages((currentPages) => {
      let nextPages = currentPages.map((page) => ({
        ...page,
        sections: page.sections.filter((section) => section !== activeSectionId),
      }));
      const targetPage = nextPages.find((page) => page.id === targetPageId);
      if (!targetPage) return currentPages;
      targetPage.sections.push(activeSectionId);
      nextPages = nextPages.filter(
        (page, index) => index === 0 || page.sections.length > 0
      );
      return nextPages;
    });
  }

  function waitForRender() {
    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
  }

  async function createReportPdfBlob(element: HTMLElement): Promise<Blob> {
    const pages = Array.from(element.querySelectorAll<HTMLElement>(".report-page"));

    if (pages.length === 0) {
      throw new Error("No report pages found.");
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    for (let index = 0; index < pages.length; index++) {
      const page = pages[index];
      const canvas = await html2canvas(page, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: page.scrollWidth,
        windowHeight: page.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png");

      if (index > 0) {
        pdf.addPage("a4", "portrait");
      }

      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
    }

    return pdf.output("blob");
  }

  async function handleUploadCustomerReport() {
    if (!reportRef.current || isUploadingReport) return;

    try {
      setIsUploadingReport(true);
      setIsPrintPreview(true);

      await waitForRender();

      const filename = `${report.reportNo || "machine-maintenance-report"}.pdf`.replaceAll(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );

      const pdfBlob = await createReportPdfBlob(reportRef.current);
      const pdfFile = new File([pdfBlob], filename, {
        type: "application/pdf",
      });

      await uploadCustomerReportPdf(
        {
          sourceReportId: sourceReport.id,
          sourceReportType: "machine_maintenance",

          vesselId: sourceReport.vesselId,
          vesselName: sourceReport.vesselName,

          machineId: sourceReport.machineId,
          machineTag: sourceReport.machineTag,
          machineModel: sourceReport.machineModel,
          machineType: sourceReport.machineType,
          machineStatus: report.machineStatus,

          title: report.title,
          createdBy: report.engineer || "Not provided",
        },
        pdfFile
      );

      alert("Machine maintenance report saved successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to save machine maintenance report.");
    } finally {
      setIsUploadingReport(false);
    }
  }

  function renderActivityPage(activityChunk: Required<MaintenanceActivityItem>[], chunkIndex: number) {
    const activityOffset = activityChunks
      .slice(0, chunkIndex)
      .reduce((total, chunk) => total + chunk.length, 0);

    return (
      <Section
        icon={FaTools}
        title={chunkIndex === 0 ? "Maintenance Activities" : "Maintenance Activities Contd."}
      >
        {activityChunk.length > 0 ? (
          <div className="space-y-3">
            {activityChunk.map((activity, index) => (
              <ActivityCard
                key={`${activity.category}-${activity.task}-${chunkIndex}-${index}`}
                activity={activity}
                index={activityOffset + index}
                sourceReport={sourceReport}
                isEditing={isEditing}
                onDelete={() => {
                  setActivityChunks((currentChunks) => {
                    const flatActivities = currentChunks.flat();
                    const realIndex =
                      currentChunks
                        .slice(0, chunkIndex)
                        .reduce((total, chunk) => total + chunk.length, 0) +
                      index;
                    const nextActivities = flatActivities.filter(
                      (_, itemIndex) => itemIndex !== realIndex
                    );

                    return [nextActivities];
                  });
                  setPages(
                    buildInitialPages(
                      alarmChunks.length,
                      1,
                      Boolean(sourceReport.photos?.length)
                    )
                  );
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No maintenance activities provided.</p>
        )}
      </Section>
    );
  }

  function renderAlarmPage(alarmChunk: Required<MaintenanceAlarmItem>[], chunkIndex: number) {
    return (
      <Section
        icon={FaExclamationTriangle}
        title={
          chunkIndex === 0
            ? "Alarms / Abnormal Findings"
            : "Alarms / Abnormal Findings Contd."
        }
        right={
          isEditing ? (
            <button
              type="button"
              onClick={() => {
                setAlarmChunks((currentChunks) => [
                  [
                    ...currentChunks.flat(),
                    {
                      description: "New alarm / abnormal finding",
                      status: "Open",
                    },
                  ],
                ]);
                setPages(
                  buildInitialPages(
                    1,
                    activityChunks.length,
                    Boolean(sourceReport.photos?.length)
                  )
                );
              }}
              className="mr-24 border border-[#003594] bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#003594] hover:bg-[#EAF6FB] print:hidden"
            >
              Add alarm
            </button>
          ) : null
        }
      >
        {alarmChunk.length > 0 ? (
          <ul className="space-y-2">
            {alarmChunk.map((alarm, index) => (
              <AlarmCard
                key={`${alarm.description}-${chunkIndex}-${index}`}
                alarm={alarm}
                isEditing={isEditing}
                onDelete={() => {
                  setAlarmChunks((currentChunks) => {
                    const flatAlarms = currentChunks.flat();
                    const realIndex =
                      currentChunks
                        .slice(0, chunkIndex)
                        .reduce((total, chunk) => total + chunk.length, 0) +
                      index;
                    const nextAlarms = flatAlarms.filter(
                      (_, itemIndex) => itemIndex !== realIndex
                    );

                    return [nextAlarms];
                  });
                  setPages(
                    buildInitialPages(
                      1,
                      activityChunks.length,
                      Boolean(sourceReport.photos?.length)
                    )
                  );
                }}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No alarms reported.</p>
        )}
      </Section>
    );
  }

  function renderPhotosPage() {
    return (
      <Section icon={FaCamera} title="Photo Evidence">
        {sourceReport.photos && sourceReport.photos.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {sourceReport.photos.map((photo, index) => (
              <figure
                key={photo.id || photo.filename || index}
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
                    Pic {index + 1}: <EditableText>{photo.filename || `Photo ${index + 1}`}</EditableText>
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
  }

  function renderSection(sectionId: SectionId) {
    if (sectionId.startsWith("alarms-")) {
      const chunkIndex = Number(sectionId.replace("alarms-", ""));
      return renderAlarmPage(alarmChunks[chunkIndex] || [], chunkIndex);
    }

    if (sectionId.startsWith("activities-")) {
      const chunkIndex = Number(sectionId.replace("activities-", ""));
      return renderActivityPage(activityChunks[chunkIndex] || [], chunkIndex);
    }

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
          <Section icon={FaClipboardCheck} title="Maintenance Information">
            <div className="grid gap-x-4 md:grid-cols-2">
              <InfoRow label="Service Order No." value={report.serviceOrder} />
              <InfoRow label="Project Manager" value={report.projectManager} />
              <InfoRow label="Date" value={report.date} />
              <InfoRow label="Location" value={report.location} />
              <InfoRow label="Service Engineer" value={report.engineer} />
              <InfoRow label="Report Type" value="Machine Maintenance" />
              <InfoRow label="Machine Status" value={report.machineStatus} />
              <InfoRow label="Alarm Status" value={report.alarmStatus} />
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
                <InfoRow label="Starter Type" value={report.equipment.starterType} />
                <InfoRow label="Compressor Type" value={report.equipment.compressorType} />
                <InfoRow label="Machine Type" value={report.equipment.systemType} />
                <InfoRow label="Mfg" value={report.equipment.manufacturer} />
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

      case "photos":
        return renderPhotosPage();

      case "furtherAction":
        return (
          <Section icon={FaClipboardCheck} title="Further Action Required">
            <EditableText multiline className="block text-sm leading-6 text-slate-800">
              {report.furtherActionRequired}
            </EditableText>
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
      className={`${isPrintPreview ? "bg-neutral-300 p-4 md:p-8" : "bg-slate-100 p-4 md:p-8"} min-h-screen text-slate-900 print:bg-white print:p-0`}
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

      <div className="mx-auto mb-4 flex max-w-[225mm] items-center justify-between border-b border-t border-slate-300 bg-white px-4 py-3 print:hidden">
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
          {isPrintPreview && (
            <button
              type="button"
              onClick={async () => {
                await handleUploadCustomerReport();
                window.print();
              }}
              disabled={isUploadingReport}
              className="border border-[#003594] bg-[#003594] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#00266b] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isUploadingReport ? "Saving..." : "Save as PDF"}
            </button>
          )}
        </div>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <main
          ref={reportRef}
          id="machine-maintenance-report-print-area"
          className={`${isPrintPreview ? "max-w-[210mm]" : "max-w-[225mm]"} report-print-area mx-auto space-y-6 print:max-w-[210mm] print:space-y-0`}
        >
          {pages.map((page, pageIndex) => (
            <section
              key={page.id}
              className={`${isPrintPreview ? "w-[210mm]" : "w-full"} report-page mx-auto flex h-[297mm] flex-col overflow-hidden bg-white p-[10mm] shadow-none print:mx-0 print:h-[297mm] print:w-[210mm] print:p-[10mm]`}
            >
              <DroppablePageBody
                pageId={page.id}
                bodyRef={(node) => {
                  pageBodyRefs.current[page.id] = node;
                }}
              >
                {pageIndex === 0 && (
                  <ReportHeader
                    report={report}
                    isPrintPreview={isPrintPreview}
                    hasActiveAlarm={hasActiveAlarm}
                  />
                )}

                {page.sections.map((sectionId) => {
                  const isFixedSection = sectionId === "vessel" || sectionId === "service";

                  if (isFixedSection) {
                    return <div key={sectionId}>{renderSection(sectionId)}</div>;
                  }

                  return (
                    <DraggableSection
                      key={sectionId}
                      id={sectionId}
                      isEditing={isEditing}
                    >
                      {renderSection(sectionId)}
                    </DraggableSection>
                  );
                })}
              </DroppablePageBody>

              {pageIndex === pages.length - 1 && <SignatureBlock report={report} />}

              <ReportFooter pageNumber={pageIndex + 1} totalPages={pages.length} />
            </section>
          ))}
        </main>
      </DndContext>
    </div>
  );
}
