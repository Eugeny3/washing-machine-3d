import * as THREE from 'three';
import type { SceneContext } from '../scene/createScene';
import { WashingMachine } from '../machine/WashingMachine';

const DEFAULT_SPEED = 1.2;

export class AnimationController {
  private readonly clock = new THREE.Clock();
  private frameId = 0;
  private running = true;
  private drumSpeed = DEFAULT_SPEED;
  private waterEnabled = true;
  private elapsed = 0;

  constructor(
    private readonly sceneContext: SceneContext,
    private readonly machine: WashingMachine,
  ) {}

  get isRunning(): boolean {
    return this.running;
  }

  get speed(): number {
    return this.drumSpeed;
  }

  get isWaterEnabled(): boolean {
    return this.waterEnabled;
  }

  start(): void {
    this.clock.start();

    const renderFrame = () => {
      const delta = this.clock.getDelta();

      if (this.running) {
        this.elapsed += delta;
      }

      this.machine.update({
        delta,
        elapsed: this.elapsed,
        drumSpeed: this.drumSpeed,
        waterEnabled: this.waterEnabled,
        isPlaying: this.running,
      });

      this.sceneContext.controls.update();
      this.sceneContext.renderer.render(this.sceneContext.scene, this.sceneContext.camera);

      this.frameId = window.requestAnimationFrame(renderFrame);
    };

    renderFrame();
  }

  dispose(): void {
    window.cancelAnimationFrame(this.frameId);
    this.sceneContext.dispose();
  }

  toggleRunning(): boolean {
    this.running = !this.running;
    return this.running;
  }

  reset(): void {
    this.running = false;
    this.drumSpeed = DEFAULT_SPEED;
    this.waterEnabled = true;
    this.elapsed = 0;
    this.machine.reset();
    this.clock.getDelta();
  }

  setSpeed(value: number): void {
    this.drumSpeed = THREE.MathUtils.clamp(value, 0.2, 2.5);
  }

  toggleWater(): boolean {
    this.waterEnabled = !this.waterEnabled;
    return this.waterEnabled;
  }
}
