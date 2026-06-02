import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { getArtworksByExhibitionId } from '@/lib/artwork/service';
import { getExhibitionDetails } from '@/lib/exhibition/service';
import { GalleryUIArtworkProps } from '@/types/gallery';
import { GalleryPreset } from '@/types/gallery-theme';

type ExhibitionDetails = {
  title: string;
  host: string;
};

type GalleryDataState = {
  user: User | null;
  exhibitionDetails: ExhibitionDetails;
  galleryPreset: GalleryPreset | null;
  artworks: GalleryUIArtworkProps[];
  isInitReady: boolean;
  initError: string | null;
};

export function useGalleryData(id: string): GalleryDataState {
  const [user, setUser] = useState<User | null>(null);
  const [exhibitionDetails, setExhibitionDetails] = useState<ExhibitionDetails>(
    { title: '', host: '' }
  );
  const [galleryPreset, setGalleryPreset] = useState<GalleryPreset | null>(
    null
  );
  const [artworks, setArtworks] = useState<GalleryUIArtworkProps[]>([]);
  const [isInitReady, setIsInitReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = createClient();
        const [artworksRes, userRes, details] = await Promise.all([
          getArtworksByExhibitionId(id),
          supabase.auth.getUser(),
          getExhibitionDetails(id),
        ]);

        if (artworksRes.length === 0) throw new Error('전시 작품이 없습니다.');

        setExhibitionDetails({ title: details.title, host: details.host });
        setGalleryPreset(details.galleryPreset);
        setArtworks(artworksRes);
        setUser(userRes.data.user ?? null);
        setIsInitReady(true);
      } catch (error) {
        console.error(error);
        setInitError(
          error instanceof Error
            ? error.message
            : '갤러리를 불러오지 못했습니다.'
        );
      }
    };

    run();
  }, [id]);

  return {
    user,
    exhibitionDetails,
    galleryPreset,
    artworks,
    isInitReady,
    initError,
  };
}
