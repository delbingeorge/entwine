import { gsap } from "gsap";

import { createScene, hexToRgb, loadTextures, transitionModes } from "./morph-slider-scene";
import { MorphTrack } from "./morph-slider-track";

import type { MorphItem, MorphOptions, MorphUniforms } from "./morph-slider-scene";

interface EngineSetup {
  getOptions: () => MorphOptions;
  items: MorphItem[];
  onIndexChange: (index: number) => void;
  reducedMotion: boolean;
  startIndex: number;
}

export class MorphEngine {
  private readonly container: HTMLElement;
  private readonly setup: EngineSetup;
  private readonly scene: ReturnType<typeof createScene>;
  private readonly uniforms: MorphUniforms;
  private readonly track: MorphTrack;
  private readonly resizeObserver: ResizeObserver;

  private frame = 0;
  private dragDir = 0;
  private tween: gsap.core.Tween | null = null;
  private isAnimating = false;
  private isDragging = false;

  constructor(container: HTMLElement, setup: EngineSetup) {
    this.container = container;
    this.setup = setup;

    this.scene = createScene(container, setup.getOptions(), setup.reducedMotion);
    this.uniforms = this.scene.uniforms;
    this.track = new MorphTrack(
      this.scene.gl,
      setup.items,
      this.uniforms,
      setup.startIndex,
      setup.onIndexChange,
    );

    this.scene.canvas.addEventListener("webglcontextlost", this.onContextLost);
    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    this.resizeObserver.observe(container);
    this.resize();

    loadTextures(this.scene.gl, setup.items, (index, texture, size) => {
      this.track.receive(index, texture, size);
    });

    this.frame = requestAnimationFrame(this.loop);
  }

  private readonly onContextLost = (event: Event) => {
    event.preventDefault();
    cancelAnimationFrame(this.frame);
  };

  private readonly loop = (now: number) => {
    this.uniforms.uTime.value = now * 0.001;

    if (!this.isDragging && !this.isAnimating) {
      this.syncOptions();
    }

    this.scene.renderer.render({ scene: this.scene.mesh });
    this.frame = requestAnimationFrame(this.loop);
  };

  private resize() {
    const rect = this.container.getBoundingClientRect();
    this.scene.renderer.setSize(Math.max(rect.width, 1), Math.max(rect.height, 1));
    this.uniforms.uResolution.value = [this.scene.canvas.width, this.scene.canvas.height];
  }

  private syncOptions() {
    const options = this.setup.getOptions();
    this.uniforms.uMode.value = transitionModes[options.transition];
    this.uniforms.uIntensity.value = options.intensity;
    this.uniforms.uScale.value = options.scale;
    this.uniforms.uAberration.value = options.aberration;
    this.uniforms.uDrift.value = options.drift;
    this.uniforms.uOverlay.value = hexToRgb(options.overlayColor);
  }

  private settle(value: number, duration: number, ease: string, onDone: () => void) {
    this.isAnimating = true;
    this.tween = gsap.to(this.uniforms.uProgress, {
      duration,
      ease,
      onComplete: () => {
        this.tween = null;
        this.isAnimating = false;
        onDone();
      },
      value,
    });
  }

  goTo(direction: number) {
    const options = this.setup.getOptions();

    if (this.isAnimating || this.isDragging || this.track.count < 2) {
      return;
    }

    if (this.track.isBlocked(direction, options.loop)) {
      return;
    }

    this.syncOptions();
    this.uniforms.uProgress.value = 0;

    const target = this.track.prepare(direction);
    this.track.announce(target);

    this.settle(
      1,
      this.setup.reducedMotion ? Math.min(options.duration, 0.4) : options.duration,
      options.ease,
      () => {
        this.track.commit(target);
      },
    );
  }

  setPointer(x: number, y: number) {
    this.uniforms.uPointer.value = [x, y];
  }

  beginDrag() {
    if (this.isAnimating || this.track.count < 2) {
      return false;
    }

    this.isDragging = true;
    this.dragDir = 0;
    this.syncOptions();

    return true;
  }

  drag(offset: number) {
    if (!this.isDragging) {
      return;
    }

    const direction = offset < 0 ? 1 : -1;

    if (this.track.isBlocked(direction, this.setup.getOptions().loop)) {
      this.uniforms.uProgress.value = 0;

      return;
    }

    if (direction !== this.dragDir) {
      this.dragDir = direction;
      this.track.prepare(direction);
    }

    const progress = Math.min(Math.abs(offset), 1);
    this.uniforms.uProgress.value = progress;
    this.track.announce(
      progress > 0.5 ? this.track.wrap(this.track.current + direction) : this.track.current,
    );
  }

  endDrag() {
    if (!this.isDragging) {
      return;
    }

    this.isDragging = false;

    if (this.dragDir === 0) {
      return;
    }

    const target = this.track.wrap(this.track.current + this.dragDir);
    const settles = this.uniforms.uProgress.value > 0.4;
    this.track.announce(settles ? target : this.track.current);

    this.settle(settles ? 1 : 0, this.setup.reducedMotion ? 0.3 : 0.5, "power2.out", () => {
      if (settles) {
        this.track.commit(target);
      }
    });
  }

  destroy() {
    cancelAnimationFrame(this.frame);
    this.tween?.kill();
    this.resizeObserver.disconnect();
    this.scene.canvas.removeEventListener("webglcontextlost", this.onContextLost);
    this.track.dispose(this.scene.gl);
    this.scene.gl.getExtension("WEBGL_lose_context")?.loseContext();
    this.scene.canvas.remove();
  }
}
