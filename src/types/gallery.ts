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
  galleryPreset: FormDataEntryValue | null;
};

export type WAllType = {
  color: string;
  pos: [number, number, number];
  boxSize: [number, number, number];
  rot?: [number, number, number];
  direction?: string;
  isInterior?: boolean;
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

export type GalleryUIArtworkProps = {
  id: string;
  title: string;
  artist_name: string;
  description: null | string;
  image_url: string;
  likes: number;
  likesByMe: boolean;
};
