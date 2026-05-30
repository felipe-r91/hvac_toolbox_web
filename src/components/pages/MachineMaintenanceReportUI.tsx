import React from "react";
import {
  FaCamera,
  FaCheckCircle,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaFileAlt,
  FaShieldAlt,
  FaShip,
  FaTools,
} from "react-icons/fa";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { API_BASE_URL } from "../../api/config";
import { uploadCustomerReportPdf } from "../../api/customerReportApi";

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
  maintenanceSummary: string;
  alarms: Required<MaintenanceAlarmItem>[];
  activities: Required<MaintenanceActivityItem>[];
  recommendations: string[];
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
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
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
      </div>
      <div className="p-4">{children}</div>
    </section>
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

function StatusPill({ status }: { status?: string }) {
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

function ReportHeader({
  report,
  hasActiveAlarm,
}: {
  report: NormalizedMaintenanceReport;
  hasActiveAlarm: boolean;
}) {
  return (
    <header className="mb-3 border-b-4 border-[#003594] pb-3">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#003594]">
            {report.company}
          </p>
          <h1 className="mt-2 text-2xl font-black uppercase tracking-wide text-slate-950">
            <EditableText>{report.title}</EditableText>
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-600">
            <EditableText>{report.subtitle}</EditableText>
          </p>
        </div>

        <div className="min-w-[58mm] border border-slate-300 text-xs">
          <div className="bg-[#003594] px-3 py-2 font-bold uppercase tracking-wide text-white">
            Report Control
          </div>
          <div className="grid grid-cols-[28mm_1fr] border-t border-slate-300">
            <div className="border-r border-slate-300 px-2 py-1 font-bold text-slate-500">
              Report No.
            </div>
            <div className="px-2 py-1 font-semibold">
              <EditableText>{report.reportNo}</EditableText>
            </div>
          </div>
          <div className="grid grid-cols-[28mm_1fr] border-t border-slate-300">
            <div className="border-r border-slate-300 px-2 py-1 font-bold text-slate-500">
              Date
            </div>
            <div className="px-2 py-1 font-semibold">
              <EditableText>{report.date}</EditableText>
            </div>
          </div>
          <div className="grid grid-cols-[28mm_1fr] border-t border-slate-300">
            <div className="border-r border-slate-300 px-2 py-1 font-bold text-slate-500">
              Status
            </div>
            <div className="px-2 py-1 font-semibold">
              {hasActiveAlarm ? "Action Required" : report.machineStatus}
            </div>
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
    <footer className="mt-3 border-t border-slate-300 pt-2 text-[10px] text-slate-500">
      <div className="flex items-center justify-between">
        <span>Johnson Controls Marine & Navy</span>
        <span>
          Page {pageNumber} of {totalPages}
        </span>
      </div>
    </footer>
  );
}

function SignatureBlock({ report }: { report: NormalizedMaintenanceReport }) {
  return (
    <div className="px-4 pb-20 pt-6">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            <EditableText>Service Engineer</EditableText>
          </p>
          <div className="mr-24 mt-8 border-t border-slate-400 pt-2 text-sm font-bold text-[#003594]">
            <EditableText>{report.engineer || "-"}</EditableText>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            <EditableText>Customer Representative</EditableText>
          </p>
          <div className="mt-8 border-t border-slate-400 pt-2 text-sm font-bold text-[#003594]">
            <EditableText>Signature / Vessel Stamp</EditableText>
          </div>
        </div>
      </div>
    </div>
  );
}

function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks.length > 0 ? chunks : [[]];
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

  return activities.map((activity) => ({
    category: activity.category || "-",
    task: activity.task || "-",
    tool: activity.tool || "",
    status: activity.status || "",
    notes: activity.notes || "",
    measuredValue: activity.measuredValue || "",
    unit: activity.unit || "",
    completedAt: activity.completedAt || "",
    photos: activity.photos || [],
  }));
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
}: {
  activity: Required<MaintenanceActivityItem>;
  index: number;
  sourceReport: SourceMachineMaintenanceReport;
}) {
  const matchedPhotos = activity.photos
    .map((photo) => matchPhotoReference(photo, sourceReport))
    .filter((photo): photo is SourceMaintenancePhoto => Boolean(photo));

  const unmatchedPhotoRefs = activity.photos.filter(
    (photo) => !matchPhotoReference(photo, sourceReport)
  );

  return (
    <article className="avoid-break border border-slate-300 bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-slate-300 bg-slate-50 px-3 py-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#003594]">
            Activity {index + 1} - <EditableText>{activity.category}</EditableText>
          </p>
          <h3 className="mt-1 text-sm font-bold text-slate-950">
            <EditableText>{activity.task}</EditableText>
          </h3>
        </div>
        <StatusPill status={activity.status} />
      </div>

      <div className="grid gap-x-4 px-3 py-2 md:grid-cols-3">
        <InfoRow label="Tool" value={activity.tool} />
        <InfoRow
          label="Measured Value"
          value={`${activity.measuredValue || ""} ${activity.unit || ""}`.trim()}
        />
        <InfoRow label="Completed At" value={activity.completedAt} />
      </div>

      <div className="border-t border-slate-300 px-3 py-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
          Notes
        </p>
        <EditableText multiline className="mt-1 block text-xs leading-5 text-slate-700">
          {activity.notes || "No notes provided."}
        </EditableText>
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
    </article>
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
    maintenanceSummary: aiReport.maintenanceSummary || "",
    alarms:
      aiReport.alarms?.map((alarm) => ({
        description: alarm.description || "Alarm / abnormal finding",
        status: alarm.status || "",
      })) || [],
    activities: normalizeActivities(aiReport.activities, sourceReport.tasks),
    recommendations: aiReport.recommendations || [],
    furtherActionRequired: aiReport.furtherActionRequired || "",
    ehsStatement:
      aiReport.ehsStatement ||
      "All work was conducted in compliance with vessel safety requirements, applicable regulations, and company Environment, Health & Safety procedures. Hazard awareness and safe work practices were observed at all times. No safety incidents were reported during the execution of the work.",
  };

  const [isPrintPreview, setIsPrintPreview] = React.useState(false);
  const [isUploadingReport, setIsUploadingReport] = React.useState(false);
  const reportRef = React.useRef<HTMLElement | null>(null);
  const activityChunks = chunkItems(report.activities, 5);
  const totalPages = 4 + activityChunks.length + (sourceReport.photos?.length ? 1 : 0);
  const hasActiveAlarm = report.alarms.some(
    (alarm) => alarm.status.toLowerCase() !== "solved"
  );

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

  function renderFirstPage() {
    return (
      <>
        <ReportHeader report={report} hasActiveAlarm={hasActiveAlarm} />
        <div className="space-y-3">
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
              <InfoRow label="Fault Count" value={String(sourceReport.faultCount ?? 0)} />
              <InfoRow label="Skipped Count" value={String(sourceReport.skippedCount ?? 0)} />
            </div>
          </Section>
        </div>
      </>
    );
  }

  function renderEquipmentPage() {
    return (
      <div className="space-y-3">
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

        <Section icon={FaFileAlt} title="Executive Summary">
          <div className="border-l-4 border-[#003594] bg-[#EAF6FB] p-4">
            <EditableText multiline className="block text-sm leading-6 text-slate-800">
              {report.executiveSummary}
            </EditableText>
          </div>
        </Section>

        <Section icon={FaClipboardCheck} title="Maintenance Summary">
          <EditableText multiline className="block text-sm leading-6 text-slate-800">
            {report.maintenanceSummary}
          </EditableText>
        </Section>
      </div>
    );
  }

  function renderAlarmPage() {
    return (
      <div className="space-y-3">
        <Section icon={FaExclamationTriangle} title="Alarms / Abnormal Findings">
          {report.alarms.length > 0 ? (
            <ul className="space-y-2">
              {report.alarms.map((alarm, index) => (
                <li
                  key={`${alarm.description}-${index}`}
                  className="avoid-break flex items-start justify-between gap-3 border border-slate-300 bg-white p-3"
                >
                  <EditableText multiline className="block text-sm leading-5 text-slate-800">
                    {alarm.description}
                  </EditableText>
                  <StatusPill status={alarm.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No alarms reported.</p>
          )}
        </Section>

        <Section icon={FaCheckCircle} title="Recommendations">
          {report.recommendations.length > 0 ? (
            <ol className="space-y-2">
              {report.recommendations.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="avoid-break flex gap-3 border border-slate-300 bg-white p-3"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#003594] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <EditableText multiline className="block text-sm leading-5 text-slate-800">
                    {item}
                  </EditableText>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-slate-500">No recommendations provided.</p>
          )}
        </Section>
      </div>
    );
  }

  function renderActivityPage(activityChunk: Required<MaintenanceActivityItem>[], chunkIndex: number) {
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
                index={chunkIndex * 5 + index}
                sourceReport={sourceReport}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No maintenance activities provided.</p>
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

  function renderFinalPage() {
    return (
      <div className="space-y-3">
        <Section icon={FaClipboardCheck} title="Further Action Required">
          <EditableText multiline className="block text-sm leading-6 text-slate-800">
            {report.furtherActionRequired}
          </EditableText>
        </Section>

        <Section icon={FaShieldAlt} title="Environment, Health & Safety">
          <EditableText multiline className="block text-sm leading-6 text-slate-800">
            {report.ehsStatement}
          </EditableText>
        </Section>

        <SignatureBlock report={report} />
      </div>
    );
  }

  const pages = [
    renderFirstPage(),
    renderEquipmentPage(),
    renderAlarmPage(),
    ...activityChunks.map((chunk, index) => renderActivityPage(chunk, index)),
    ...(sourceReport.photos?.length ? [renderPhotosPage()] : []),
    renderFinalPage(),
  ];

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

      <main
        ref={reportRef}
        id="machine-maintenance-report-print-area"
        className={`${isPrintPreview ? "max-w-[210mm]" : "max-w-[225mm]"} report-print-area mx-auto space-y-6 print:max-w-[210mm] print:space-y-0`}
      >
        {pages.map((page, pageIndex) => (
          <section
            key={pageIndex}
            className={`${isPrintPreview ? "w-[210mm]" : "w-full"} report-page mx-auto flex h-[297mm] flex-col overflow-hidden bg-white p-[10mm] shadow-none print:mx-0 print:h-[297mm] print:w-[210mm] print:p-[10mm]`}
          >
            <div className="flex-1 space-y-3 overflow-hidden bg-white">{page}</div>
            <ReportFooter pageNumber={pageIndex + 1} totalPages={totalPages} />
          </section>
        ))}
      </main>
    </div>
  );
}
