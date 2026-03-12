import type Artplayer from 'artplayer';
import { uploadIcon } from './PlayerIcons';

export function artplayerPluginUploadSubtitle(): (art: Artplayer) => void {
  return (art: Artplayer) => {
    type ArtUtils = { getExt: (filename: string) => string };
    const getExt = (art.constructor as unknown as { utils: ArtUtils }).utils.getExt;

    art.setting.add({
      html: `
        <div class="subtitle-upload-wrapper" style="position: relative;">
          <input 
            type="file" 
            name="subtitle-upload" 
            id="subtitle-upload" 
            style="display: none;" 
          />
          <label 
            for="subtitle-upload" 
            class="subtitle-upload-label"
            style="cursor: pointer; user-select: none;"
          >
            Upload Subtitle
          </label>
        </div>
      `,
      icon: uploadIcon,
      onClick(
        setting: { tooltip: string },
        $setting: Element
      ) {
        const $input = $setting.querySelector<HTMLInputElement>("input[name='subtitle-upload']");
        const $label = $setting.querySelector('.subtitle-upload-label');

        if (!$input || !$label) return;

        art.proxy($input, 'change', (event: Event) => {
          const target = event.target as HTMLInputElement | null;
          const file = target?.files?.[0];
          if (!file) return;

          const url = URL.createObjectURL(file);
          art.subtitle.switch(url, {
            type: getExt(file.name),
          });

          if (target) target.value = '';

          $label.textContent = file.name;
          art.notice.show = `Upload Subtitle ：${file.name}`;
          setting.tooltip = file.name;
        });
      },
    });
  };
}
