export const pluginChapterStyle = `
.artplayer-plugin-chapter .art-control-progress-inner {
    height: 100% !important;
    background-color: transparent !important;
}
.artplayer-plugin-chapter .art-control-progress-inner > .art-progress-hover,
.artplayer-plugin-chapter .art-control-progress-inner > .art-progress-loaded,
.artplayer-plugin-chapter .art-control-progress-inner > .art-progress-played {
    display: none !important;
}
.artplayer-plugin-chapter .art-control-thumbnails {
    bottom: calc(var(--art-bottom-gap) + 64px) !important;
}
.artplayer-plugin-chapter .art-chapters {
    position: absolute;
    z-index: 0;
    inset: 0;
    display: flex;
    align-items: center;
    gap: 0;
    height: 100%;
}
.artplayer-plugin-chapter .art-chapters .art-chapter {
    display: flex;
    align-items: center;
    height: 100%;
}
.artplayer-plugin-chapter .art-chapters .art-chapter .art-chapter-inner {
    position: relative;
    cursor: pointer;
    width: 100%;
    height: 100%;
    border-radius: 999px;
    overflow: hidden;
    background-color: rgb(255 255 255 / 0.28);
}
.artplayer-plugin-chapter .art-chapters .art-progress-played {
    background: var(--art-theme, #f47521);
}
.artplayer-plugin-chapter .art-chapters .art-progress-loaded {
    background: rgb(255 255 255 / 0.42);
}
.artplayer-plugin-chapter .art-chapter-title {
    display: none;
    position: absolute;
    z-index: 70;
    top: -50px;
    left: 0;
    padding: 3px 5px;
    line-height: 1;
    font-size: 14px;
    border-radius: var(--art-border-radius);
    white-space: nowrap;
    background-color: var(--art-tip-background);
}
`;
