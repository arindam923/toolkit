declare module "piexifjs" {
  export interface ExifValue {
    [tagId: number]: string | number | [number, number];
  }

  export interface ExifData {
    "0th"?: ExifValue;
    "1st"?: ExifValue;
    Exif?: ExifValue;
    GPS?: ExifValue;
    Interop?: ExifValue;
    thumbnail?: string;
  }

  export function load(jpegBinary: string): ExifData;
  export function dump(exifData: ExifData): string;
  export function insert(exifBytes: string, jpegBinary: string): string;
  export function remove(jpegBinary: string): string;

  export const ImageIFD: Record<string, number>;
}
