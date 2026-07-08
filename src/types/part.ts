export type PartPayload = {
  jciPartNumber: string;
  manufacturerModel: string;
  manufacturerCode: string;
  tag: string;
  machinesModelHavingIt: string[];
  description: string;
};

export type Part = PartPayload & {
  id: string;
  partPhotoId: string | null;
  partPhotoPreviewUrl: string | null;
};
