import base64 from 'base-64';
import { saveAs } from 'file-saver';

export enum IMAGE_EXTENSIONS {
  SVG = '.svg',
  PNG = '.png',
  JPEG = '.jpeg',
  WEBP = '.webp',
  GIF = '.gif',
}

export const IMAGE_MIME_TYPES = {
  [IMAGE_EXTENSIONS.SVG]: 'image/svg+xml',
  [IMAGE_EXTENSIONS.PNG]: 'image/png',
  [IMAGE_EXTENSIONS.JPEG]: 'image/jpeg',
  [IMAGE_EXTENSIONS.WEBP]: 'image/webp',
  [IMAGE_EXTENSIONS.GIF]: 'image/gif',
};

export const dataURItoBlob = (dataURI: string): Blob => {
  // convert base64 to raw binary data held in a string
  const byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const _ia = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    _ia[i] = byteString.charCodeAt(i);
  }

  const dataView = new DataView(arrayBuffer);
  const blob = new Blob([dataView], { type: mimeString });

  return blob;
};

/**
 * Create a blob by image url
 */
export const createImageBlobByUrl = (url: string, mimeType: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.src = url;

    image.onload = () => {
      const { width, height } = image;
      const canvas = Object.assign(document.createElement('canvas'), { width, height });
      const context = canvas.getContext('2d');

      if (context !== null) {
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);

        const dataURI = canvas.toDataURL(mimeType);
        const blob = dataURItoBlob(dataURI);

        resolve(blob);
      } else {
        reject(new Error(''));
      }
    };

    image.onerror = (error) => reject(error);
  });
};

export const createSvgBlob = (svgElement: SVGSVGElement): Blob => {
  const data = new XMLSerializer().serializeToString(svgElement);
  const blob = new Blob([data], { type: 'image/svg+xml' });

  return blob;
};

export const svgSaveAs = async (
  svgElement: SVGSVGElement,
  name: string,
  extension: IMAGE_EXTENSIONS = IMAGE_EXTENSIONS.SVG
): Promise<void> => {
  let blob = createSvgBlob(svgElement);

  if (extension !== IMAGE_EXTENSIONS.SVG) {
    const mimeType = IMAGE_MIME_TYPES[extension];
    const url = URL.createObjectURL(blob);

    blob = await createImageBlobByUrl(url, mimeType);

    URL.revokeObjectURL(url);
  }

  const filename = `${name}${extension}`;

  saveAs(blob, filename);
};

/**
 * Transform svg to png icon
 */
export async function getBase64Icon(icon: string): Promise<string> {
  const BASE64_PNG_PREFIX = 'data:image/png;base64';
  const XML_SVG_PREFIX = 'data:image/svg+xml';

  if (icon.startsWith(BASE64_PNG_PREFIX)) return icon;
  if (icon.startsWith(XML_SVG_PREFIX)) {
    // take svg string starting from '<' char up to end
    const svgUriEncodedTrimmed = icon.substring(icon.indexOf('%3C'));
    // provide width and height for original svg
    const svgUriEncoded = svgUriEncodedTrimmed.replace(
      "xmlns='http://www.w3.org/2000/svg'",
      "xmlns='http://www.w3.org/2000/svg' width='80px' height='80px' "
    );
    const svgUriDecoded = decodeURIComponent(svgUriEncoded);
    const base64SvgEncoded = base64.encode(svgUriDecoded);

    const base64SVG = `${XML_SVG_PREFIX};base64,${base64SvgEncoded}`;
    const base64PNG = base64SvgToBase64Png(base64SVG);

    return base64PNG;
  }

  return '';
}

function base64SvgToBase64Png(imgsrc: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');

    canvas.setAttribute('width', '80');
    canvas.setAttribute('height', '80');

    const context = canvas.getContext('2d');

    const image = new Image();
    image.src = imgsrc;

    image.onload = function () {
      try {
        if (context) {
          context.drawImage(image, 0, 0);
          const base64PNG = canvas.toDataURL('image/png');
          resolve(base64PNG);
        }
      } catch (e) {
        reject(e);
      }
    };
  });
}
