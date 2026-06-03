import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  FaSave,
  FaSpinner,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import {
  deleteTaskPlanTemplate,
  getTaskPlanTemplates,
  saveTaskPlanTemplate,
} from "../../api/taskPlansApi";
import type {
  MaintenanceTemplateType,
  TaskPlanKind,
  TaskPlanPayload,
  TaskPlanTask,
  TaskPlanTemplate,
} from "../../types/taskPlan";

type DraftTask = {
  id: string;
  category: string;
  task: string;
  tool: string;
  unit: string;
  required: boolean;
  measurable: boolean;
  photoRequiredOnFault: boolean;
  photoRequiredOnAttention: boolean;
};

type TaskPlanDraft = {
  kind: TaskPlanKind;
  isNew: boolean;
  originalCode?: string;
  code: string;
  name: string;
  templateType: MaintenanceTemplateType;
  notes: string;
  tasks: DraftTask[];
};

type Notice = {
  tone: "success" | "error";
  message: string;
};

const kindLabels: Record<TaskPlanKind, string> = {
  maintenance: "Maintenance plans",
  "health-check": "Health-check plans",
};

const taskGridColumns =
  "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2.1fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.9fr)_3rem]";

const emptyTask = (): DraftTask => ({
  id: "",
  category: "",
  task: "",
  tool: "",
  unit: "",
  required: true,
  measurable: false,
  photoRequiredOnFault: true,
  photoRequiredOnAttention: true,
});

function taskToDraft(task: TaskPlanTask): DraftTask {
  return {
    id: task.taskCode || task.id || "",
    category: task.category || "",
    task: task.task || "",
    tool: task.tool || "",
    unit: task.unit || "",
    required: task.required ?? true,
    measurable: task.measurable ?? false,
    photoRequiredOnFault: task.photoRequiredOnFault ?? true,
    photoRequiredOnAttention: task.photoRequiredOnAttention ?? true,
  };
}

function planToDraft(kind: TaskPlanKind, plan: TaskPlanTemplate): TaskPlanDraft {
  return {
    kind,
    isNew: false,
    originalCode: plan.code,
    code: plan.code,
    name: plan.name,
    templateType: plan.templateType === "STARTER" ? "STARTER" : "MACHINE",
    notes: plan.notes || "",
    tasks: plan.tasks.length > 0 ? plan.tasks.map(taskToDraft) : [emptyTask()],
  };
}

function createDraft(kind: TaskPlanKind): TaskPlanDraft {
  return {
    kind,
    isNew: true,
    code: "",
    name: "",
    templateType: "MACHINE",
    notes: "",
    tasks: [emptyTask()],
  };
}

function taskFromDraft(task: DraftTask): TaskPlanTask {
  return {
    id: task.id.trim(),
    category: task.category.trim(),
    task: task.task.trim(),
    tool: task.tool.trim() || null,
    unit: task.unit.trim() || null,
    required: task.required,
    measurable: task.measurable,
    photoRequiredOnFault: task.photoRequiredOnFault,
    photoRequiredOnAttention: task.photoRequiredOnAttention,
  };
}

function buildPlanCode(name: string) {
  return (
    name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "TASK_PLAN"
  );
}

function draftToPayload(draft: TaskPlanDraft): TaskPlanPayload {
  return {
    code: draft.code.trim() || buildPlanCode(draft.name),
    name: draft.name.trim(),
    notes: draft.notes.trim(),
    templateType:
      draft.kind === "maintenance" ? draft.templateType : undefined,
    tasks: draft.tasks.map(taskFromDraft),
  };
}

function validateDraft(draft: TaskPlanDraft): string | null {
  if (!draft.name.trim()) return "Plan name is required.";
  if (draft.tasks.length === 0) return "Add at least one task.";

  const invalidTaskIndex = draft.tasks.findIndex(
    (task) => !task.id.trim() || !task.task.trim()
  );

  if (invalidTaskIndex >= 0) {
    return `Task ${invalidTaskIndex + 1} needs a code and description.`;
  }

  return null;
}

export function TaskPlansPage() {
  const [plans, setPlans] = useState<Record<TaskPlanKind, TaskPlanTemplate[]>>({
    maintenance: [],
    "health-check": [],
  });
  const [activeKind, setActiveKind] = useState<TaskPlanKind>("maintenance");
  const [draft, setDraft] = useState<TaskPlanDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingCode, setDeletingCode] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [canScrollPlansLeft, setCanScrollPlansLeft] = useState(false);
  const [canScrollPlansRight, setCanScrollPlansRight] = useState(false);
  const planTabsRef = useRef<HTMLDivElement | null>(null);

  const activePlans = plans[activeKind];

  const selectedPlan = useMemo(() => {
    if (!draft || draft.isNew) return null;
    return plans[draft.kind].find((plan) => plan.code === draft.originalCode) || null;
  }, [draft, plans]);

  const loadPlans = async () => {
    const [maintenancePlans, healthCheckPlans] = await Promise.all([
      getTaskPlanTemplates("maintenance"),
      getTaskPlanTemplates("health-check"),
    ]);

    setPlans({
      maintenance: maintenancePlans,
      "health-check": healthCheckPlans,
    });
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setNotice(null);

        const [maintenancePlans, healthCheckPlans] = await Promise.all([
          getTaskPlanTemplates("maintenance"),
          getTaskPlanTemplates("health-check"),
        ]);

        if (!cancelled) {
          setPlans({
            maintenance: maintenancePlans,
            "health-check": healthCheckPlans,
          });

          const firstPlan = maintenancePlans[0] || healthCheckPlans[0];
          if (firstPlan) {
            const firstKind = maintenancePlans[0] ? "maintenance" : "health-check";
            setActiveKind(firstKind);
            setDraft(planToDraft(firstKind, firstPlan));
          }
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setNotice({
            tone: "error",
            message: "Failed to load task plans.",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const element = planTabsRef.current;
    if (!element) return;

    element.scrollLeft = 0;

    const updateScrollState = () => {
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      setCanScrollPlansLeft(element.scrollLeft > 0);
      setCanScrollPlansRight(element.scrollLeft < maxScrollLeft - 1);
    };

    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    element.addEventListener("scroll", updateScrollState);

    return () => {
      window.removeEventListener("resize", updateScrollState);
      element.removeEventListener("scroll", updateScrollState);
    };
  }, [activeKind, activePlans.length]);

  const scrollPlanTabs = (direction: "left" | "right") => {
    planTabsRef.current?.scrollBy({
      left: direction === "right" ? 180 : -180,
      behavior: "smooth",
    });
  };

  const selectPlan = (kind: TaskPlanKind, plan: TaskPlanTemplate) => {
    setActiveKind(kind);
    setDraft(planToDraft(kind, plan));
    setNotice(null);
  };

  const startNewPlan = (kind: TaskPlanKind) => {
    setActiveKind(kind);
    setDraft(createDraft(kind));
    setNotice(null);
  };

  const updateDraft = <K extends keyof TaskPlanDraft>(
    key: K,
    value: TaskPlanDraft[K]
  ) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const updateTask = <K extends keyof DraftTask>(
    index: number,
    key: K,
    value: DraftTask[K]
  ) => {
    setDraft((current) => {
      if (!current) return current;

      return {
        ...current,
        tasks: current.tasks.map((task, taskIndex) =>
          taskIndex === index ? { ...task, [key]: value } : task
        ),
      };
    });
  };

  const addTask = () => {
    setDraft((current) =>
      current ? { ...current, tasks: [...current.tasks, emptyTask()] } : current
    );
  };

  const removeTask = (index: number) => {
    setDraft((current) => {
      if (!current) return current;

      return {
        ...current,
        tasks: current.tasks.filter((_, taskIndex) => taskIndex !== index),
      };
    });
  };

  const saveDraft = async () => {
    if (!draft) return;

    const validationError = validateDraft(draft);
    if (validationError) {
      setNotice({ tone: "error", message: validationError });
      return;
    }

    try {
      setSaving(true);
      setNotice(null);
      const payload = draftToPayload(draft);

      await saveTaskPlanTemplate(
        draft.kind,
        payload,
        draft.isNew ? undefined : draft.originalCode
      );
      await loadPlans();

      setDraft({
        ...draft,
        code: payload.code,
        isNew: false,
        originalCode: payload.code,
      });
      setNotice({
        tone: "success",
        message: "Task plan saved.",
      });
    } catch (error) {
      console.error(error);
      setNotice({
        tone: "error",
        message: "Failed to save task plan.",
      });
    } finally {
      setSaving(false);
    }
  };

  const deletePlan = async (kind: TaskPlanKind, code: string) => {
    const confirmed = window.confirm(`Delete ${code}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeletingCode(code);
      setNotice(null);

      await deleteTaskPlanTemplate(kind, code);
      await loadPlans();

      if (draft?.kind === kind && draft.originalCode === code) {
        setDraft(null);
      }

      setNotice({
        tone: "success",
        message: "Task plan deleted.",
      });
    } catch (error) {
      console.error(error);
      setNotice({
        tone: "error",
        message: "Failed to delete task plan.",
      });
    } finally {
      setDeletingCode("");
    }
  };

  return (
    <section className="flex min-h-0 flex-col gap-4">
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-2xl bg-slate-100 p-1">
            {(["maintenance", "health-check"] as TaskPlanKind[]).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setActiveKind(kind)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeKind === kind
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {kindLabels[kind]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => startNewPlan("maintenance")}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              <FaPlus className="h-3 w-3" />
              Maintenance
            </button>

            <button
              type="button"
              onClick={() => startNewPlan("health-check")}
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white"
            >
              <FaPlus className="h-3 w-3" />
              Health check
            </button>
          </div>
        </div>

        {notice ? (
          <p
            className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${
              notice.tone === "success"
                ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                : "bg-red-50 text-red-700 ring-1 ring-red-200"
            }`}
          >
            {notice.message}
          </p>
        ) : null}
      </section>

      <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="relative shrink-0 px-4 py-3">
          {loading ? (
            <p className="px-2 py-2 text-sm text-slate-500">Loading task plans...</p>
          ) : activePlans.length > 0 ? (
            <>
              {canScrollPlansLeft ? (
                <button
                  type="button"
                  title="Scroll plans left"
                  aria-label="Scroll plans left"
                  onClick={() => scrollPlanTabs("left")}
                  className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-md ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  <FaChevronLeft className="h-3 w-3" />
                </button>
              ) : null}

              <div
                ref={planTabsRef}
                className="flex gap-2 overflow-x-auto scroll-smooth pr-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {activePlans.map((plan) => {
                  const isSelected =
                    draft?.kind === activeKind && draft.originalCode === plan.code;

                  return (
                    <article
                      key={`${activeKind}-${plan.code}`}
                      onClick={() => selectPlan(activeKind, plan)}
                      className={`flex h-11 m-0.5 min-w-44 max-w-64 shrink-0 cursor-pointer items-center justify-between gap-3 rounded-t-2xl rounded-b-md px-4 text-sm font-semibold ring-1 transition ${
                        isSelected
                          ? "bg-slate-900 text-white ring-slate-900"
                          : "bg-slate-50 text-slate-800 ring-slate-200 hover:bg-white hover:ring-slate-300"
                      }`}
                    >
                      <span className="min-w-0 truncate">{plan.name}</span>

                      <button
                        type="button"
                        title="Delete plan"
                        aria-label={`Delete ${plan.code}`}
                        disabled={deletingCode === plan.code}
                        onClick={(event) => {
                          event.stopPropagation();
                          deletePlan(activeKind, plan.code);
                        }}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full disabled:opacity-60 ${
                          isSelected
                            ? "bg-white/10 text-white hover:bg-white/20"
                            : "bg-white text-red-700 ring-1 ring-red-100 hover:bg-red-50"
                        }`}
                      >
                        {deletingCode === plan.code ? (
                          <FaSpinner className="h-3 w-3 animate-spin" />
                        ) : (
                          <FaTrash className="h-3 w-3" />
                        )}
                      </button>
                    </article>
                  );
                })}
              </div>

              {canScrollPlansRight ? (
                <button
                  type="button"
                  title="Scroll plans right"
                  aria-label="Scroll plans right"
                  onClick={() => scrollPlanTabs("right")}
                  className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-md ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  <FaChevronRight className="h-3 w-3" />
                </button>
              ) : null}
            </>
          ) : (
            <p className="px-2 py-2 text-sm text-slate-500">
              No {activeKind === "maintenance" ? "maintenance" : "health-check"} plans found.
            </p>
          )}
        </div>

        {draft ? (
          <div className="flex min-h-0 flex-col">
              <div className="border-b border-slate-200 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-semibold text-slate-900">
                      {draft.isNew ? "New task plan" : draft.name || draft.code}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                      {draft.kind === "maintenance"
                        ? "Maintenance template library"
                        : "Health-check template library"}
                      {selectedPlan?.versionNumber ? ` · Version ${selectedPlan.versionNumber}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDraft(null)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
                    >
                      <FaTimes className="h-3 w-3" />
                      Close
                    </button>

                    <button
                      type="button"
                      onClick={saveDraft}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {saving ? (
                        <FaSpinner className="h-3 w-3 animate-spin" />
                      ) : (
                        <FaSave className="h-3 w-3" />
                      )}
                      Save
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <label className="block lg:col-span-2">
                    <span className="mb-1 block text-sm font-medium text-slate-600">
                      Name
                    </span>
                    <input
                      value={draft.name}
                      onChange={(event) => updateDraft("name", event.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                    />
                  </label>

                  {draft.kind === "maintenance" ? (
                    <label className="block">
                      <span className="mb-1 block text-sm font-medium text-slate-600">
                        Plan target
                      </span>
                      <select
                        value={draft.templateType}
                        onChange={(event) =>
                          updateDraft(
                            "templateType",
                            event.target.value as MaintenanceTemplateType
                          )
                        }
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                      >
                        <option value="MACHINE">Machine model</option>
                        <option value="STARTER">Starter type</option>
                      </select>
                    </label>
                  ) : (
                    <div className="block">
                      <span className="mb-1 block text-sm font-medium text-slate-600">
                        Plan target
                      </span>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                        Health check
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="min-h-0 overflow-hidden">
                <div className="flex w-full flex-col">
                  <div
                    className={`grid ${taskGridColumns} shrink-0 bg-slate-50 text-left`}
                  >
                    <div className="min-w-0 px-3 py-3 text-sm font-semibold text-slate-700">
                      Task code
                    </div>
                    <div className="min-w-0 px-3 py-3 text-sm font-semibold text-slate-700">
                      Category
                    </div>
                    <div className="min-w-0 px-3 py-3 text-sm font-semibold text-slate-700">
                      Task
                    </div>
                    <div className="min-w-0 px-3 py-3 text-sm font-semibold text-slate-700">
                      Tool
                    </div>
                    <div className="min-w-0 px-3 py-3 text-sm font-semibold text-slate-700">
                      Unit
                    </div>
                    <div className="min-w-0 px-2 py-3 text-center text-sm font-semibold text-slate-700">
                      Required
                    </div>
                    <div className="min-w-0 px-2 py-3 text-center text-sm font-semibold text-slate-700">
                      Measurable
                    </div>
                    <div className="min-w-0 px-2 py-3 text-center text-sm font-semibold text-slate-700">
                      Fault photo
                    </div>
                    <div className="min-w-0 px-2 py-3 text-center text-sm font-semibold text-slate-700">
                      Attention photo
                    </div>
                    <div className="min-w-0 px-2 py-3 text-right text-sm font-semibold text-slate-700">
                      <button
                        type="button"
                        title="Add task"
                        aria-label="Add task"
                        onClick={addTask}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white"
                      >
                        <FaPlus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[42vh] overflow-y-auto">
                    {draft.tasks.map((task, index) => (
                      <div
                        key={index}
                        className={`grid ${taskGridColumns} border-t border-slate-200`}
                      >
                        <div className="min-w-0 px-3 py-3 align-top">
                          <input
                            value={task.id}
                            onChange={(event) =>
                              updateTask(index, "id", event.target.value)
                            }
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                          />
                        </div>
                        <div className="min-w-0 px-3 py-3 align-top">
                          <input
                            value={task.category}
                            onChange={(event) =>
                              updateTask(index, "category", event.target.value)
                            }
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                          />
                        </div>
                        <div className="min-w-0 px-3 py-3 align-top">
                          <textarea
                            value={task.task}
                            onChange={(event) =>
                              updateTask(index, "task", event.target.value)
                            }
                            rows={2}
                            className="w-full resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                          />
                        </div>
                        <div className="min-w-0 px-3 py-3 align-top">
                          <input
                            value={task.tool}
                            onChange={(event) =>
                              updateTask(index, "tool", event.target.value)
                            }
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                          />
                        </div>
                        <div className="min-w-0 px-3 py-3 align-top">
                          <input
                            value={task.unit}
                            onChange={(event) =>
                              updateTask(index, "unit", event.target.value)
                            }
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none"
                          />
                        </div>
                        {(
                          [
                            "required",
                            "measurable",
                            "photoRequiredOnFault",
                            "photoRequiredOnAttention",
                          ] as const
                        ).map((field) => (
                          <div key={field} className="min-w-0 px-2 py-3 text-center align-top">
                            <label className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-700">
                              <input
                                type="checkbox"
                                checked={task[field]}
                                onChange={(event) =>
                                  updateTask(index, field, event.target.checked)
                                }
                                className="sr-only"
                              />
                              {task[field] ? (
                                <FaCheck className="h-3 w-3 text-green-700" />
                              ) : (
                                <FaTimes className="h-3 w-3 text-slate-400" />
                              )}
                            </label>
                          </div>
                        ))}
                        <div className="min-w-0 px-2 py-3 text-right align-top">
                          <button
                            type="button"
                            title="Remove task"
                            aria-label={`Remove task ${index + 1}`}
                            onClick={() => removeTask(index)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            <FaTrash className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
        ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center p-8 text-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Select or create a task plan
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Cards open the editable task table for the selected plan.
                </p>
              </div>
            </div>
        )}
      </section>
    </section>
  );
}
