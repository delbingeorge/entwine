import { placeholderTexture } from "./morph-slider-scene";

import type { Gl, MorphItem, MorphUniforms } from "./morph-slider-scene";
import type { Texture } from "ogl";

export class MorphTrack {
  private readonly textures: Texture[];
  private readonly sizes: [number, number][];
  private readonly uniforms: MorphUniforms;
  private readonly onIndexChange: (index: number) => void;
  private shownIndex: number;

  current: number;

  constructor(
    gl: Gl,
    items: MorphItem[],
    uniforms: MorphUniforms,
    startIndex: number,
    onIndexChange: (index: number) => void,
  ) {
    this.uniforms = uniforms;
    this.onIndexChange = onIndexChange;
    this.current = startIndex;
    this.shownIndex = startIndex;
    this.textures = items.map(() => placeholderTexture(gl));
    this.sizes = items.map((): [number, number] => [1, 1]);
  }

  get count() {
    return this.textures.length;
  }

  private show(index: number) {
    this.uniforms.tCurrent.value = this.textures[index] ?? this.uniforms.tCurrent.value;
    this.uniforms.uCurrentSize.value = this.sizes[index] ?? [1, 1];
  }

  wrap(index: number) {
    return ((index % this.count) + this.count) % this.count;
  }

  isBlocked(direction: number, loop: boolean) {
    if (loop) {
      return false;
    }

    const raw = this.current + direction;

    return raw < 0 || raw > this.count - 1;
  }

  receive(index: number, texture: Texture, size: [number, number]) {
    this.textures[index] = texture;
    this.sizes[index] = size;

    if (index === this.current) {
      this.show(index);
    }
  }

  prepare(direction: number) {
    const target = this.wrap(this.current + direction);
    this.show(this.current);
    this.uniforms.tNext.value = this.textures[target] ?? this.uniforms.tNext.value;
    this.uniforms.uNextSize.value = this.sizes[target] ?? [1, 1];
    this.uniforms.uDir.value = direction;

    return target;
  }

  announce(index: number) {
    if (index !== this.shownIndex) {
      this.shownIndex = index;
      this.onIndexChange(index);
    }
  }

  commit(target: number) {
    this.current = target;
    this.show(target);
    this.uniforms.uProgress.value = 0;
    this.announce(target);
  }

  dispose(gl: Gl) {
    for (const texture of this.textures) {
      gl.deleteTexture(texture.texture);
    }
  }
}
