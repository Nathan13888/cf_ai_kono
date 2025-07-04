export function isChatInputValid(input: string): boolean {
  return input.trim().length > 0;
}

export function formatChatInput(input: string): string {
  // TODO: Do extra things like closing quotes, etc.
  return input.trim();
}
