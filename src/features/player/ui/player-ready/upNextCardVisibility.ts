export function shouldShowUpNextCard(hasModel: boolean, pinned: boolean, hovering: boolean): boolean {
  return hasModel && (pinned || hovering);
}
