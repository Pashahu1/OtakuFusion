const CLOUDINARY_HOST = 'res.cloudinary.com';
const UPLOAD_MARKER = '/upload/';

function hasCloudinaryTransformPrefix(segment: string): boolean {
  return (
    segment.includes(',') ||
    /^(w_|h_|c_|q_|f_|a_|b_|e_|o_|t_|l_|d_|x_|y_|g_|u_|v_)/.test(segment)
  );
}

export function cloudinaryAvatarUrl(
  url: string | null | undefined,
  displayCssPx: number
): string {
  if (!url || typeof url !== 'string') return '';
  if (!url.includes(CLOUDINARY_HOST)) return url;

  const markerIndex = url.indexOf(UPLOAD_MARKER);
  if (markerIndex === -1) return url;

  const afterUpload = url.slice(markerIndex + UPLOAD_MARKER.length);
  const firstSegment = afterUpload.split('/')[0] ?? '';
  if (!firstSegment || hasCloudinaryTransformPrefix(firstSegment)) {
    return url;
  }

  const edge = Math.min(512, Math.ceil(displayCssPx * 2));
  const transform = `w_${edge},h_${edge},c_fill,q_auto,f_auto`;

  return `${url.slice(0, markerIndex + UPLOAD_MARKER.length)}${transform}/${afterUpload}`;
}
