export type UIFormProps = {
  galleryName: string;
  galleryDesc: string;
  galleryImg: File | null;
  guideLines: string | null;
  startDate: string;
  endDate: string | null;
};

export type FormValidation = {
  title: FormDataEntryValue | null;
  description: FormDataEntryValue | null;
  thumbnailImg: FormDataEntryValue | null;
  startDateRaw: FormDataEntryValue | null;
  endDateRaw: FormDataEntryValue | null;
  guidelines: FormDataEntryValue | null;
};

export type WAllType = {
  color: string;
  pos: [number, number, number];
  boxSize: [number, number, number];
  rot?: [number, number, number];
  direction?: string;
};
export type PaintingType = {
  id: number;
  paintingUrl: string;
  title: string;
  author: string;
  desc: string;
};
export type Cell = {
  x: number;
  z: number;
  visited: boolean;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
};
