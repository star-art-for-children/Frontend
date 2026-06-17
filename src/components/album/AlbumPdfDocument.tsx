import {
  Document,
  Page,
  View,
  Text,
  Image,
  Font,
  Svg,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Ellipse,
  Line,
  Path,
  Polygon,
  G,
  StyleSheet,
} from '@react-pdf/renderer';

// @react-pdf 기본 폰트엔 한글이 없어 등록하지 않으면 제목·작가명이 깨진다(□□□).
// woff2는 지원하지 않으므로 ttf(나눔고딕)를 public/fonts에 넣어 등록한다.
Font.register({
  family: 'NanumGothic',
  fonts: [
    { src: '/fonts/NanumGothic-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/NanumGothic-Bold.ttf', fontWeight: 'bold' },
  ],
});

// 단어 단위 줄바꿈만으로는 긴 한글/URL이 페이지를 넘칠 수 있어 글자 단위 분절 허용
Font.registerHyphenationCallback((word) => [word]);

export type AlbumArtwork = {
  id: string;
  title: string;
  artist: string;
  exhibitionTitle: string;
  imageUrl: string;
  createdAt: string; // ISO
};

export type AlbumMeta = {
  childName: string;
  artworkCount: number;
  periodStart: string | null; // ISO, 가장 오래된 작품
  periodEnd: string | null; // ISO, 가장 최근 작품
};

const COLORS = {
  bg: '#fdf8ef',
  ink: '#4a4036',
  sub: '#a59c8f',
  amber: '#f5b333',
  coral: '#ff7a5c',
  green: '#7cc486',
  pink: '#f6a8c0',
  yellow: '#ffd84d',
  purple: '#b79ae0',
  line: '#efe6d5',
  grid: '#f3ebdb',
  card: '#ffffff',
};

// A4(pt)
const PAGE_W = 595;
const PAGE_H = 842;
// 중앙 메모 카드
const CARD_W = 412;
const CARD_H = 600;
const CARD_X = (PAGE_W - CARD_W) / 2; // 91.5
const CARD_Y = (PAGE_H - CARD_H) / 2; // 121

const styles = StyleSheet.create({
  cover: {
    fontFamily: 'NanumGothic',
    backgroundColor: COLORS.bg,
    color: COLORS.ink,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.card,
    paddingHorizontal: 40,
    paddingVertical: 44,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    fontSize: 11,
    color: COLORS.amber,
    letterSpacing: 3,
    fontWeight: 'bold',
    marginBottom: 22,
  },
  titleName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.amber,
    textAlign: 'center',
    marginBottom: 6,
  },
  titleMain: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.coral,
    textAlign: 'center',
    lineHeight: 1.15,
  },
  dottedDivider: {
    marginTop: 26,
    marginBottom: 18,
  },
  tagline: {
    fontSize: 12.5,
    color: COLORS.ink,
    textAlign: 'center',
    lineHeight: 1.7,
    marginBottom: 30,
  },
  taglineAccent: {
    color: COLORS.coral,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaItem: {
    alignItems: 'center',
    paddingHorizontal: 26,
  },
  metaValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.ink,
  },
  metaLabel: {
    fontSize: 10.5,
    color: COLORS.sub,
    marginTop: 5,
  },
  metaSep: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.line,
  },
  handle: {
    position: 'absolute',
    bottom: 30,
    fontSize: 10,
    color: COLORS.sub,
    letterSpacing: 1,
  },
  // 표지 마스코트 (카드 상단에 얹힘)
  mascot: {
    position: 'absolute',
    top: 28,
    left: (PAGE_W - 132) / 2,
    width: 132,
    height: 132,
    objectFit: 'contain',
  },

  // 작품 페이지
  page: {
    fontFamily: 'NanumGothic',
    backgroundColor: COLORS.bg,
    color: COLORS.ink,
    paddingTop: 54,
    paddingBottom: 56,
    paddingHorizontal: 46,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  pageDecor: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  bigIndex: {
    position: 'absolute',
    top: 30,
    right: 42,
    fontSize: 78,
    fontWeight: 'bold',
    color: '#f4ecdc',
  },
  artHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 42,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.coral,
    marginRight: 7,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.sub,
    letterSpacing: 1,
  },
  indexPill: {
    backgroundColor: '#fff1e6',
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  indexPillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#e8843f',
  },
  imageCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  image: {
    maxHeight: 350,
    objectFit: 'contain',
  },
  // 사진 모서리에 대각으로 걸치는 마스킹 테이프 (트림된 PNG 비율 유지)
  tapeImg: {
    position: 'absolute',
    objectFit: 'contain',
  },
  tapeTL: {
    width: 72,
    height: 78, // tape1 비율 112:121
    top: -32,
    left: -30,
  },
  tapeBR: {
    width: 84,
    height: 72, // tape2 비율 126:108
    bottom: -32,
    right: -30,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.amber,
    marginRight: 9,
  },
  artTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  metaLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  metaLineLabel: {
    width: 52,
    fontSize: 11,
    color: COLORS.coral,
    fontWeight: 'bold',
  },
  metaLineValue: {
    flex: 1,
    fontSize: 12,
    color: COLORS.ink,
  },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 46,
    right: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.amber,
    marginRight: 6,
  },
  footerText: {
    fontSize: 9,
    color: COLORS.sub,
  },
});

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

function formatPeriod(start: string | null, end: string | null): string {
  if (!start || !end) return '';
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return '';
  const fmt = (d: Date) => `${d.getFullYear()}.${d.getMonth() + 1}`;
  const a = fmt(s);
  const b = fmt(e);
  return a === b ? a : `${a} ~ ${b}`;
}

/* ───────────── 벡터 낙서 도형들 ───────────── */

// n개 꼭짓점 별/반짝이 좌표
function polyStar(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  spikes: number
): string {
  const pts: string[] = [];
  const total = spikes * 2;
  for (let i = 0; i < total; i++) {
    const ang = (Math.PI / spikes) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    pts.push(
      `${(cx + r * Math.cos(ang)).toFixed(2)},${(cy + r * Math.sin(ang)).toFixed(2)}`
    );
  }
  return pts.join(' ');
}

function Star({ cx, cy, s, fill }: Doodle & { s: number }) {
  return <Polygon points={polyStar(cx, cy, s, s * 0.42, 5)} fill={fill} />;
}

function Sparkle({ cx, cy, s, fill }: Doodle & { s: number }) {
  return <Polygon points={polyStar(cx, cy, s, s * 0.28, 4)} fill={fill} />;
}

function Heart({ cx, cy, s, fill }: Doodle & { s: number }) {
  const d = `M ${cx},${cy + s * 0.35}
    C ${cx},${cy + s * 0.05} ${cx - s},${cy - s * 0.1} ${cx - s},${cy - s * 0.5}
    C ${cx - s},${cy - s * 0.95} ${cx - s * 0.35},${cy - s} ${cx},${cy - s * 0.45}
    C ${cx + s * 0.35},${cy - s} ${cx + s},${cy - s * 0.95} ${cx + s},${cy - s * 0.5}
    C ${cx + s},${cy - s * 0.1} ${cx},${cy + s * 0.05} ${cx},${cy + s * 0.35} Z`;
  return <Path d={d} fill={fill} />;
}

// 5장 꽃잎 꽃
function Flower({
  cx,
  cy,
  s,
  petal,
  center,
}: {
  cx: number;
  cy: number;
  s: number;
  petal: string;
  center: string;
}) {
  const petals = [];
  for (let i = 0; i < 5; i++) {
    const ang = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    petals.push(
      <Circle
        key={i}
        cx={cx + s * 0.72 * Math.cos(ang)}
        cy={cy + s * 0.72 * Math.sin(ang)}
        r={s * 0.52}
        fill={petal}
      />
    );
  }
  return (
    <G>
      {petals}
      <Circle cx={cx} cy={cy} r={s * 0.42} fill={center} />
    </G>
  );
}

// 반원 무지개 (3색 아치)
function Rainbow({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const arc = (rad: number, color: string) => (
    <Path
      d={`M ${cx - rad},${cy} A ${rad},${rad} 0 0 1 ${cx + rad},${cy}`}
      stroke={color}
      strokeWidth={5}
      strokeLinecap="round"
      fill="none"
    />
  );
  return (
    <G>
      {arc(r, COLORS.coral)}
      {arc(r - 7, COLORS.amber)}
      {arc(r - 14, COLORS.green)}
    </G>
  );
}

// 작은 잎 (@react-pdf는 transform 문자열 미지원 → 회전 없이 기울인 타원으로 표현)
function Leaf({ cx, cy, s }: { cx: number; cy: number; s: number }) {
  return <Ellipse cx={cx} cy={cy} rx={s} ry={s * 0.5} fill={COLORS.green} />;
}

type Doodle = { cx: number; cy: number; fill: string };

// 점선 구분선 (카드 안)
function DottedDivider() {
  return (
    <Svg width={140} height={6} viewBox="0 0 140 6">
      <Line
        x1={2}
        y1={3}
        x2={138}
        y2={3}
        stroke={COLORS.green}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="1 8"
      />
    </Svg>
  );
}

// 노트 격자 + 카드 뒤편 낙서 (카드보다 아래 레이어)
function CoverBack() {
  const grid = [];
  for (let x = 0; x <= PAGE_W; x += 26) {
    grid.push(
      <Line
        key={`v${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={PAGE_H}
        stroke={COLORS.grid}
        strokeWidth={0.6}
      />
    );
  }
  for (let y = 0; y <= PAGE_H; y += 26) {
    grid.push(
      <Line
        key={`h${y}`}
        x1={0}
        y1={y}
        x2={PAGE_W}
        y2={y}
        stroke={COLORS.grid}
        strokeWidth={0.6}
      />
    );
  }
  return (
    <Svg
      style={styles.fullDecor}
      width={PAGE_W}
      height={PAGE_H}
      viewBox={`0 0 ${PAGE_W} ${PAGE_H}`}
    >
      {grid}
      {/* 상단 (마스코트가 중앙에 오므로 무지개·하트는 양옆으로) */}
      <Rainbow cx={150} cy={92} r={30} />
      <Heart cx={455} cy={78} s={10} fill={COLORS.pink} />
      <Heart cx={476} cy={100} s={6} fill={COLORS.coral} />
      <Sparkle cx={120} cy={58} s={9} fill={COLORS.amber} />
      <Sparkle cx={486} cy={62} s={8} fill={COLORS.amber} />
      {/* 하단 */}
      <Flower
        cx={120}
        cy={742}
        s={26}
        petal={COLORS.yellow}
        center={COLORS.coral}
      />
      <Leaf cx={150} cy={770} s={15} />
      <Flower cx={470} cy={760} s={24} petal="#ffffff" center={COLORS.pink} />
      <Flower
        cx={505}
        cy={742}
        s={16}
        petal={COLORS.pink}
        center={COLORS.yellow}
      />
      <Star cx={92} cy={700} s={9} fill={COLORS.green} />
      <Sparkle cx={520} cy={700} s={10} fill={COLORS.amber} />
    </Svg>
  );
}

// 카드 모서리에 겹치는 낙서 (카드보다 위 레이어)
function CoverFront() {
  return (
    <Svg
      style={styles.fullDecor}
      width={PAGE_W}
      height={PAGE_H}
      viewBox={`0 0 ${PAGE_W} ${PAGE_H}`}
    >
      {/* 카드 좌상단 꽃 */}
      <Flower
        cx={CARD_X + 6}
        cy={CARD_Y + 8}
        s={26}
        petal="#ffffff"
        center={COLORS.coral}
      />
      <Leaf cx={CARD_X + 34} cy={CARD_Y - 6} s={13} />
      {/* 카드 우상단 하트 */}
      <Heart
        cx={CARD_X + CARD_W - 8}
        cy={CARD_Y + 6}
        s={12}
        fill={COLORS.pink}
      />
      {/* 카드 우하단 반짝이 */}
      <Sparkle
        cx={CARD_X + CARD_W - 4}
        cy={CARD_Y + CARD_H - 10}
        s={11}
        fill={COLORS.amber}
      />
      {/* 카드 좌하단 별 */}
      <Star
        cx={CARD_X + 8}
        cy={CARD_Y + CARD_H - 6}
        s={10}
        fill={COLORS.green}
      />
    </Svg>
  );
}

// 작품 페이지 하단 작은 낙서 (전체높이 Svg는 콘텐츠 박스를 초과하므로 하단 띠로 한정)
const DECOR_H = 80;
function PageDecor({ seed }: { seed: number }) {
  // seed로 좌우 번갈아 배치해 단조로움 완화
  const left = seed % 2 === 0;
  return (
    <Svg
      style={styles.pageDecor}
      width={PAGE_W}
      height={DECOR_H}
      viewBox={`0 0 ${PAGE_W} ${DECOR_H}`}
    >
      <Flower
        cx={left ? 40 : PAGE_W - 40}
        cy={DECOR_H - 34}
        s={16}
        petal={left ? COLORS.pink : COLORS.yellow}
        center={left ? COLORS.yellow : COLORS.coral}
      />
      <Sparkle
        cx={left ? PAGE_W - 44 : 44}
        cy={DECOR_H - 48}
        s={8}
        fill={COLORS.amber}
      />
    </Svg>
  );
}

export default function AlbumPdfDocument({
  artworks,
  meta,
}: {
  artworks: AlbumArtwork[];
  meta: AlbumMeta;
}) {
  return (
    <Document
      title={`${meta.childName}의 성장 앨범`}
      author="star-art"
      creator="star-art"
    >
      {/* 표지 — wrap=false로 한 페이지 고정 */}
      <Page size="A4" style={styles.cover} wrap={false}>
        <CoverBack />

        <View style={styles.card}>
          <Text style={styles.badge}>우리 아이의 성장 앨범</Text>
          <Text style={styles.titleName}>{meta.childName} 스타님의</Text>
          <Text style={styles.titleMain}>빛나는 순간들</Text>

          <View style={styles.dottedDivider}>
            <DottedDivider />
          </View>

          <Text style={styles.tagline}>
            한 점 한 점 정성껏 그린{'\n'}
            <Text style={styles.taglineAccent}>{meta.childName}</Text> 스타님의
            소중한 그림이 이렇게 자라왔어요
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>{meta.artworkCount}</Text>
              <Text style={styles.metaLabel}>작품</Text>
            </View>
            <View style={styles.metaSep} />
            <View style={styles.metaItem}>
              <Text style={styles.metaValue}>
                {formatPeriod(meta.periodStart, meta.periodEnd) || '-'}
              </Text>
              <Text style={styles.metaLabel}>활동 기간</Text>
            </View>
          </View>
        </View>

        <CoverFront />

        {/* 마스코트 — 카드 위에 얹혀 앨범을 소개하는 느낌 */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src="/images/mascot.png" style={styles.mascot} />

        <Text style={styles.handle}>star-art</Text>
      </Page>

      {/* 작품별 페이지 (전체높이 장식 Svg가 빈 페이지를 만들지 않도록 wrap=false) */}
      {artworks.map((art, i) => (
        <Page key={art.id} size="A4" style={styles.page} wrap={false}>
          {/* 상단 그라데이션 액센트 바 */}
          <Svg style={styles.accentBar} width={PAGE_W} height={8}>
            <Defs>
              <LinearGradient id={`bar-${i}`} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={COLORS.amber} />
                <Stop offset="1" stopColor={COLORS.coral} />
              </LinearGradient>
            </Defs>
            <Rect
              x={0}
              y={0}
              width={PAGE_W}
              height={8}
              fill={`url(#bar-${i})`}
            />
          </Svg>

          <PageDecor seed={i} />

          {/* 흐린 큰 인덱스 번호 */}
          <Text style={styles.bigIndex}>{String(i + 1).padStart(2, '0')}</Text>

          <View style={styles.artHeader}>
            <View style={styles.dateChip}>
              <View style={styles.dateDot} />
              <Text style={styles.dateText}>{formatDate(art.createdAt)}</Text>
            </View>
            <View style={styles.indexPill}>
              <Text style={styles.indexPillText}>
                {i + 1} / {artworks.length}
              </Text>
            </View>
          </View>

          <View style={styles.imageCard}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={art.imageUrl} style={styles.image} />
            {/* 마스킹 테이프 — 왼쪽 위 + 오른쪽 아래 모서리에 대각으로 */}
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image
              src="/images/tape1.png"
              style={[styles.tapeImg, styles.tapeTL]}
            />
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image
              src="/images/tape2.png"
              style={[styles.tapeImg, styles.tapeBR]}
            />
          </View>

          <View style={styles.titleRow}>
            <View style={styles.titleDot} />
            <Text style={styles.artTitle}>{art.title || '제목 없음'}</Text>
          </View>
          <View style={styles.metaLineRow}>
            <Text style={styles.metaLineLabel}>작가</Text>
            <Text style={styles.metaLineValue}>{art.artist || '-'}</Text>
          </View>
          <View style={styles.metaLineRow}>
            <Text style={styles.metaLineLabel}>전시</Text>
            <Text style={styles.metaLineValue}>
              {art.exhibitionTitle || '-'}
            </Text>
          </View>
          <View style={styles.metaLineRow}>
            <Text style={styles.metaLineLabel}>날짜</Text>
            <Text style={styles.metaLineValue}>
              {formatDate(art.createdAt)}
            </Text>
          </View>

          <View style={styles.footer} fixed>
            <View style={styles.footerDot} />
            <Text style={styles.footerText}>{meta.childName}의 성장 앨범</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
}
