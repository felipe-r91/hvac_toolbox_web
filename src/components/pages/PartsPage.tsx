import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaBoxOpen,
  FaImage,
  FaPlus,
  FaSave,
  FaSearch,
  FaSpinner,
  FaSyncAlt,
  FaTimes,
  FaTrash,
  FaUpload,
} from "react-icons/fa";
import {
  createPart,
  deletePart,
  getPartById,
  getParts,
  resolvePartPhotoUrl,
  updatePart,
  uploadPartPicture,
} from "../../api/partsApi";
import type { Part, PartPayload } from "../../types/part";

type PartDraft = {
  id?: string;
  isNew: boolean;
  jciPartNumber: string;
  manufacturerModel: string;
  manufacturerCode: string;
  tag: string;
  machinesModelHavingItText: string;
  description: string;
  partPhotoPreviewUrl: string | null;
};

type Notice = {
  tone: "success" | "error";
  message: string;
};

function createEmptyDraft(): PartDraft {
  return {
    isNew: true,
    jciPartNumber: "",
    manufacturerModel: "",
    manufacturerCode: "",
    tag: "",
    machinesModelHavingItText: "",
    description: "",
    partPhotoPreviewUrl: null,
  };
}

function partToDraft(part: Part): PartDraft {
  return {
    id: part.id,
    isNew: false,
    jciPartNumber: part.jciPartNumber,
    manufacturerModel: part.manufacturerModel,
    manufacturerCode: part.manufacturerCode,
    tag: part.tag,
    machinesModelHavingItText: part.machinesModelHavingIt.join("\n"),
    description: part.description,
    partPhotoPreviewUrl: part.partPhotoPreviewUrl,
  };
}

function parseMachineModels(value: string) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function draftToPayload(draft: PartDraft): PartPayload {
  return {
    jciPartNumber: draft.jciPartNumber.trim(),
    manufacturerModel: draft.manufacturerModel.trim(),
    manufacturerCode: draft.manufacturerCode.trim(),
    tag: draft.tag.trim(),
    machinesModelHavingIt: parseMachineModels(draft.machinesModelHavingItText),
    description: draft.description.trim(),
  };
}

function validateDraft(draft: PartDraft): string | null {
  const payload = draftToPayload(draft);

  if (!payload.jciPartNumber) return "JCI part number is required.";
  if (!payload.manufacturerModel) return "Manufacturer model is required.";
  if (!payload.manufacturerCode) return "Manufacturer code is required.";
  if (!payload.tag) return "Tag is required.";
  if (payload.machinesModelHavingIt.length === 0) {
    return "Add at least one machine model.";
  }
  if (!payload.description) return "Description is required.";

  return null;
}

function matchesPartSearch(part: Part, search: string) {
  const term = search.trim().toLowerCase();
  if (!term) return true;

  return [
    part.jciPartNumber,
    part.manufacturerModel,
    part.manufacturerCode,
    part.tag,
    part.description,
    ...part.machinesModelHavingIt,
  ]
    .join(" ")
    .toLowerCase()
    .includes(term);
}

export function PartsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [parts, setParts] = useState<Part[]>([]);
  const [draft, setDraft] = useState<PartDraft>(createEmptyDraft);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [retrievingId, setRetrievingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState("");
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const filteredParts = useMemo(
    () => parts.filter((part) => matchesPartSearch(part, search)),
    [parts, search]
  );

  const selectedPart = useMemo(
    () => parts.find((part) => part.id === draft.id) || null,
    [draft.id, parts]
  );

  const photoUrl =
    selectedPhotoPreview || resolvePartPhotoUrl(draft.partPhotoPreviewUrl);

  const loadParts = async (partToSelectId?: string) => {
    const data = await getParts();
    setParts(data);

    if (partToSelectId) {
      const partToSelect = data.find((part) => part.id === partToSelectId);
      if (partToSelect) {
        setDraft(partToDraft(partToSelect));
      }
      return;
    }

    if (!draft.isNew && draft.id) {
      const updatedSelection = data.find((part) => part.id === draft.id);
      if (updatedSelection) {
        setDraft(partToDraft(updatedSelection));
      }
    }
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setNotice(null);

        const data = await getParts();

        if (!cancelled) {
          setParts(data);
          if (data[0]) {
            setDraft(partToDraft(data[0]));
          }
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setNotice({ tone: "error", message: "Failed to load parts." });
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
    if (!selectedPhoto) {
      setSelectedPhotoPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedPhoto);
    setSelectedPhotoPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedPhoto]);

  const startNewPart = () => {
    setDraft(createEmptyDraft());
    setSelectedPhoto(null);
    setPhotoViewerOpen(false);
    setNotice(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const selectPart = async (partId: string) => {
    try {
      setRetrievingId(partId);
      setNotice(null);
      setSelectedPhoto(null);
      setPhotoViewerOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

      const part = await getPartById(partId);
      setDraft(partToDraft(part));
    } catch (error) {
      console.error(error);
      setNotice({ tone: "error", message: "Failed to retrieve part details." });
    } finally {
      setRetrievingId("");
    }
  };

  const updateDraft = <K extends keyof PartDraft>(
    key: K,
    value: PartDraft[K]
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const refreshParts = async () => {
    try {
      setLoading(true);
      setNotice(null);
      await loadParts();
    } catch (error) {
      console.error(error);
      setNotice({ tone: "error", message: "Failed to refresh parts." });
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    const validationError = validateDraft(draft);
    if (validationError) {
      setNotice({ tone: "error", message: validationError });
      return;
    }

    try {
      setSaving(true);
      setNotice(null);

      const payload = draftToPayload(draft);
      const savedPart = draft.isNew
        ? await createPart(payload)
        : await updatePart(draft.id || "", payload);

      const finalPart = selectedPhoto
        ? await uploadPartPicture(savedPart.id, selectedPhoto)
        : savedPart;

      await loadParts(finalPart.id);
      setSelectedPhoto(null);
      setPhotoViewerOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setNotice({
        tone: "success",
        message: draft.isNew ? "Part created." : "Part updated.",
      });
    } catch (error) {
      console.error(error);
      setNotice({ tone: "error", message: "Failed to save part." });
    } finally {
      setSaving(false);
    }
  };

  const removePart = async () => {
    if (draft.isNew || !draft.id) return;

    const confirmed = window.confirm(
      `Delete ${draft.jciPartNumber}? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      setNotice(null);

      await deletePart(draft.id);
      const data = await getParts();
      setParts(data);
      setDraft(data[0] ? partToDraft(data[0]) : createEmptyDraft());
      setSelectedPhoto(null);
      setPhotoViewerOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setNotice({ tone: "success", message: "Part deleted." });
    } catch (error) {
      console.error(error);
      setNotice({ tone: "error", message: "Failed to delete part." });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="flex h-[calc(100vh-8.5rem)] min-h-0 flex-col gap-4">
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-900">
              Parts Library
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Catalog JCI numbers, manufacturer references, fitment, and photos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={refreshParts}
              disabled={loading}
              title="Refresh parts"
              aria-label="Refresh parts"
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 disabled:opacity-60"
            >
              {loading ? (
                <FaSpinner className="h-4 w-4 animate-spin" />
              ) : (
                <FaSyncAlt className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={startNewPart}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              <FaPlus className="h-3 w-3" />
              New part
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

      <section className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(22rem,0.85fr)_minmax(0,1.35fr)]">
        <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 p-4">
            <label className="relative block">
              <FaSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search number, model, tag..."
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none"
              />
            </label>

            <p className="mt-3 text-sm text-slate-500">
              Showing {filteredParts.length} part
              {filteredParts.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {loading ? (
              <p className="p-5 text-sm text-slate-500">Loading parts...</p>
            ) : filteredParts.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {filteredParts.map((part) => {
                  const isSelected = draft.id === part.id;

                  return (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => selectPart(part.id)}
                      className={`flex w-full items-start gap-3 px-4 py-4 text-left transition ${
                        isSelected
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl ring-1 ${
                          isSelected
                            ? "bg-white/10 ring-white/15"
                            : "bg-slate-100 ring-slate-200"
                        }`}
                      >
                        {part.partPhotoPreviewUrl ? (
                          <img
                            src={resolvePartPhotoUrl(part.partPhotoPreviewUrl)}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <FaBoxOpen
                            className={`h-4 w-4 ${
                              isSelected ? "text-white" : "text-slate-500"
                            }`}
                          />
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold">
                            {part.jciPartNumber}
                          </span>
                          {retrievingId === part.id ? (
                            <FaSpinner className="h-3 w-3 shrink-0 animate-spin" />
                          ) : null}
                        </span>
                        <span
                          className={`mt-1 block truncate text-xs ${
                            isSelected ? "text-slate-200" : "text-slate-500"
                          }`}
                        >
                          {part.manufacturerModel}
                        </span>
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          <span
                            className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-xs font-medium ${
                              isSelected
                                ? "bg-white/10 text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            <span className="truncate">{part.tag}</span>
                          </span>

                          {part.machinesModelHavingIt.slice(0, 2).map((model) => (
                            <span
                              key={`${part.id}-${model}`}
                              className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-xs font-medium ${
                                isSelected
                                  ? "bg-cyan-400/15 text-cyan-50 ring-1 ring-cyan-200/20"
                                  : "bg-cyan-50 text-cyan-800 ring-1 ring-cyan-100"
                              }`}
                            >
                              <span className="truncate">{model}</span>
                            </span>
                          ))}

                          {part.machinesModelHavingIt.length > 2 ? (
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                isSelected
                                  ? "bg-white/10 text-slate-100"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              +{part.machinesModelHavingIt.length - 2}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-full min-h-56 flex-col items-center justify-center px-6 text-center">
                <FaBoxOpen className="h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-700">
                  No parts found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Clear the search or create a new part.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-semibold text-slate-900">
                  {draft.isNew
                    ? "New part"
                    : draft.jciPartNumber || selectedPart?.jciPartNumber}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {draft.isNew ? "Unsaved catalog record" : "Library record"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!draft.isNew ? (
                  <button
                    type="button"
                    onClick={removePart}
                    disabled={deleting || saving}
                    className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-100 disabled:opacity-60"
                  >
                    {deleting ? (
                      <FaSpinner className="h-3 w-3 animate-spin" />
                    ) : (
                      <FaTrash className="h-3 w-3" />
                    )}
                    Delete
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={saving || deleting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? (
                    <FaSpinner className="h-3 w-3 animate-spin" />
                  ) : (
                    <FaSave className="h-3 w-3" />
                  )}
                  {draft.isNew ? "Create" : "Save"}
                </button>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-5">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[16rem_minmax(0,1fr)]">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    if (photoUrl) setPhotoViewerOpen(true);
                  }}
                  disabled={!photoUrl}
                  title={photoUrl ? "Open larger part image" : undefined}
                  aria-label={photoUrl ? "Open larger part image" : undefined}
                  className={`flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-left ring-1 ring-slate-200 transition ${
                    photoUrl ? "cursor-zoom-in hover:opacity-90" : "cursor-default"
                  }`}
                >
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={draft.jciPartNumber || "Part"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="px-4 text-center text-sm text-slate-400">
                      <FaImage className="mx-auto mb-3 h-8 w-8" />
                      No part photo
                    </div>
                  )}
                </button>

                <label className="mt-4 block">
                  <span className="mb-1 block text-sm font-medium text-slate-600">
                    Picture
                  </span>
                  <span className="flex items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <FaUpload className="h-3 w-3 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">
                      {selectedPhoto ? selectedPhoto.name : "Choose image"}
                    </span>
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setSelectedPhoto(event.target.files?.[0] || null)
                    }
                    className="sr-only"
                  />
                </label>

                {selectedPhoto ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPhoto(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                  >
                    <FaTimes className="h-3 w-3" />
                    Clear image
                  </button>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-600">
                    JCI part number
                  </span>
                  <input
                    value={draft.jciPartNumber}
                    onChange={(event) =>
                      updateDraft("jciPartNumber", event.target.value)
                    }
                    placeholder="025-47645-000"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-600">
                    Manufacturer code
                  </span>
                  <input
                    value={draft.manufacturerCode}
                    onChange={(event) =>
                      updateDraft("manufacturerCode", event.target.value)
                    }
                    placeholder="060-124166"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-600">
                    Manufacturer model
                  </span>
                  <input
                    value={draft.manufacturerModel}
                    onChange={(event) =>
                      updateDraft("manufacturerModel", event.target.value)
                    }
                    placeholder="Danfoss KP15"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-600">
                    Tag
                  </span>
                  <input
                    value={draft.tag}
                    onChange={(event) => updateDraft("tag", event.target.value)}
                    placeholder="PRESSURE-SWITCH"
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm uppercase outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-600">
                    Machines model having it
                  </span>
                  <textarea
                    value={draft.machinesModelHavingItText}
                    onChange={(event) =>
                      updateDraft("machinesModelHavingItText", event.target.value)
                    }
                    placeholder={"YORK YK\nYORK YT"}
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                  />
                  <span className="mt-1 block text-xs text-slate-500">
                    Separate models with commas or new lines.
                  </span>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-slate-600">
                    Description
                  </span>
                  <textarea
                    value={draft.description}
                    onChange={(event) =>
                      updateDraft("description", event.target.value)
                    }
                    placeholder="Dual pressure switch for compressor protection."
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                  />
                </label>
              </div>
            </div>
          </div>
        </section>
      </section>

      {photoViewerOpen && photoUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Part image preview"
          onClick={() => setPhotoViewerOpen(false)}
        >
          <div
            className="relative flex max-h-full w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-slate-900">
                  {draft.jciPartNumber || "Part image"}
                </h2>
                <p className="mt-1 truncate text-sm text-slate-500">
                  {draft.manufacturerModel || draft.tag || "Photo preview"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPhotoViewerOpen(false)}
                title="Close image preview"
                aria-label="Close image preview"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-100 p-4">
              <img
                src={photoUrl}
                alt={draft.jciPartNumber || "Part"}
                className="max-h-[75vh] max-w-full rounded-2xl object-contain shadow-sm"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
