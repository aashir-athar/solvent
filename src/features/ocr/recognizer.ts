// On-device text-recognition seam.
//
// Pasting statement text works today and runs through the same parser. Photo scanning
// needs a native text recognizer, which requires a dev client. To enable it, register a
// recognizer at startup with setTextRecognizer (e.g. backed by ML Kit text recognition
// via @react-native-ml-kit/text-recognition, or a VisionCamera frame processor). Until
// then, isPhotoScanAvailable() is false and the UI guides the user to paste instead.
// All recognition stays on-device; no image or text is ever uploaded.

export interface TextRecognizer {
  recognize(imageUri: string): Promise<string>;
}

let recognizer: TextRecognizer | null = null;

export function setTextRecognizer(next: TextRecognizer | null): void {
  recognizer = next;
}

export function isPhotoScanAvailable(): boolean {
  return recognizer !== null;
}

export async function recognizeImageText(imageUri: string): Promise<string | null> {
  if (!recognizer) return null;
  return recognizer.recognize(imageUri);
}
