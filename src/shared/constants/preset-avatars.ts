export interface PresetAvatar {
  id: string;
  src: `/avatars/${string}`;
  label: string;
}

export interface PresetAvatarGroup {
  id: string;
  title: string;
  avatars: readonly PresetAvatar[];
}

export const PRESET_AVATAR_GROUPS: readonly PresetAvatarGroup[] = [
  {
    id: 'gachiakuta',
    title: 'Gachiakuta',
    avatars: [
      {
        id: '01',
        src: '/avatars/avatar_695f2cc68e96dbc4dd8f70ea_1767937818111.png',
        label: 'Riyo',
      },
      {
        id: '02',
        src: '/avatars/avatar_695f2cc68e96dbc4dd8f70ea_1767937870049.png',
        label: 'Zanka',
      },
    ],
  },
  {
    id: 'jjk',
    title: 'Jujutsu Kaisen',
    avatars: [
      { id: '03', src: '/avatars/gojo.jpg', label: 'Gojo' },
      { id: '04', src: '/avatars/geto.jpg', label: 'Geto' },
    ],
  },
  {
    id: 'one-piece',
    title: 'One Piece',
    avatars: [
      { id: '05', src: '/avatars/luffy.webp', label: 'Luffy' },
      { id: '06', src: '/avatars/zoro.jpg', label: 'Zoro' },
    ],
  },
  {
    id: 'naruto',
    title: 'Naruto',
    avatars: [
      { id: '07', src: '/avatars/naruto.webp', label: 'Naruto' },
      { id: '08', src: '/avatars/sasuke.jpg', label: 'Sasuke' },
    ],
  },
] as const;

export const PRESET_AVATARS: readonly PresetAvatar[] = PRESET_AVATAR_GROUPS.flatMap(
  (group) => group.avatars,
);

const PRESET_SRC_SET = new Set(PRESET_AVATARS.map((item) => item.src));

export function isPresetAvatarSrc(src: string): boolean {
  return PRESET_SRC_SET.has(src as PresetAvatar['src']);
}

export function resolvePresetAvatarSrc(presetId: string): PresetAvatar['src'] | null {
  const match = PRESET_AVATARS.find((item) => item.id === presetId);
  return match?.src ?? null;
}

export function presetIdFromSrc(src: string): string | null {
  const match = PRESET_AVATARS.find((item) => item.src === src);
  return match?.id ?? null;
}

export function presetLabelFromSrc(src: string): string | null {
  const match = PRESET_AVATARS.find((item) => item.src === src);
  return match?.label ?? null;
}
