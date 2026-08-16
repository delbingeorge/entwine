import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";

import { fragmentShader, vertexShader } from "./morph-slider-shaders";

export type MorphTransition = "melt" | "ripple" | "shear" | "swirl";

export interface MorphItem {
  caption?: string;
  image: string;
}

export interface MorphOptions {
  aberration: number;
  drift: number;
  duration: number;
  ease: string;
  intensity: number;
  loop: boolean;
  overlayColor: string;
  scale: number;
  transition: MorphTransition;
}

export type Gl = Renderer["gl"];

export interface MorphUniforms {
  tCurrent: { value: Texture };
  tNext: { value: Texture };
  uAberration: { value: number };
  uCurrentSize: { value: [number, number] };
  uDir: { value: number };
  uDrift: { value: number };
  uIntensity: { value: number };
  uMode: { value: number };
  uNextSize: { value: [number, number] };
  uOverlay: { value: [number, number, number] };
  uPointer: { value: [number, number] };
  uProgress: { value: number };
  uReduce: { value: number };
  uResolution: { value: [number, number] };
  uScale: { value: number };
  uTime: { value: number };
}

export const transitionModes: Record<MorphTransition, number> = {
  melt: 0,
  ripple: 1,
  shear: 2,
  swirl: 3,
};

const maxPixelRatio = 2;

export const hexToRgb = (hex: string): [number, number, number] => {
  const compact = hex.replace("#", "");
  const full =
    compact.length === 3
      ? [...compact].map((character) => character + character).join("")
      : compact;
  const value = parseInt(full, 16);

  if (Number.isNaN(value)) {
    return [0, 0, 0];
  }

  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
};

export const placeholderTexture = (gl: Gl) => {
  const size = 4;
  const pixels = new Uint8Array(size * size * 4);

  for (let index = 0; index < size * size; index += 1) {
    pixels.set([24, 24, 28, 255], index * 4);
  }

  return new Texture(gl, { image: pixels, width: size, height: size, generateMipmaps: false });
};

export const loadTextures = (
  gl: Gl,
  items: MorphItem[],
  onReady: (index: number, texture: Texture, size: [number, number]) => void,
) => {
  items.forEach((item, index) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.addEventListener("load", () => {
      const texture = new Texture(gl, { generateMipmaps: false });
      texture.image = image;
      onReady(index, texture, [image.naturalWidth || 1, image.naturalHeight || 1]);
    });

    image.src = item.image;
  });
};

export const createScene = (
  container: HTMLElement,
  options: MorphOptions,
  reducedMotion: boolean,
) => {
  const renderer = new Renderer({
    alpha: false,
    antialias: true,
    dpr: Math.min(window.devicePixelRatio, maxPixelRatio),
  });

  const gl = renderer.gl;
  gl.clearColor(0.05, 0.05, 0.06, 1);

  const canvas = gl.canvas;
  canvas.className = "block size-full";
  container.append(canvas);

  const seed = placeholderTexture(gl);

  const uniforms: MorphUniforms = {
    tCurrent: { value: seed },
    tNext: { value: seed },
    uAberration: { value: options.aberration },
    uCurrentSize: { value: [1, 1] },
    uDir: { value: 1 },
    uDrift: { value: options.drift },
    uIntensity: { value: options.intensity },
    uMode: { value: transitionModes[options.transition] },
    uNextSize: { value: [1, 1] },
    uOverlay: { value: hexToRgb(options.overlayColor) },
    uPointer: { value: [0.5, 0.5] },
    uProgress: { value: 0 },
    uReduce: { value: reducedMotion ? 1 : 0 },
    uResolution: { value: [1, 1] },
    uScale: { value: options.scale },
    uTime: { value: 0 },
  };

  const mesh = new Mesh(gl, {
    geometry: new Triangle(gl),
    program: new Program(gl, { fragment: fragmentShader, uniforms, vertex: vertexShader }),
  });

  return { canvas, gl, mesh, renderer, uniforms };
};
