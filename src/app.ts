import profchistLogoUrl from './assets/profchist-logo.svg';
import { AnimationController } from './animation/AnimationController';
import { WashingMachine } from './machine/WashingMachine';
import { createScene } from './scene/createScene';

const APP_MARKUP = (logoUrl: string) => `
  <div class="app-shell">
    <div class="scene-card">
      <div class="scene-viewport" data-viewport></div>

      <section class="scene-copy">
        <div class="brand-chip">
          <img class="brand-chip__logo" src="${logoUrl}" alt="Логотип Профчист" />
        </div>
        <span class="scene-copy__eyebrow">Three.js / Vite / TypeScript</span>
        <h1>Фирменная 3D-сцена</h1>
        <p>
          Вращайте сцену мышкой, используйте колесо для приближения,
          ставьте анимацию на паузу и меняйте скорость барабана в реальном времени.
        </p>
      </section>

      <div class="scene-note">Потяните мышкой для вращения. Колесо для зума.</div>

      <section class="control-panel" data-panel data-running="true">
        <div class="control-panel__header">
          <div>
            <div class="control-panel__label">Анимация</div>
            <div class="control-panel__status" data-status>Запущена</div>
          </div>
          <div class="control-panel__hint">Один canvas, OrbitControls и живая анимация воды.</div>
        </div>

        <div class="button-row">
          <button class="control-button control-button--primary" type="button" data-action="toggle">
            Пауза
          </button>
          <button class="control-button control-button--secondary" type="button" data-action="reset">
            Сброс
          </button>
        </div>

        <label class="slider-field">
          <div class="slider-field__meta">
            <span>Скорость барабана</span>
            <strong data-speed-value>1.20x</strong>
          </div>
          <input
            type="range"
            min="0.20"
            max="2.50"
            step="0.05"
            value="1.20"
            data-speed
          />
        </label>

        <button
          class="control-button control-button--secondary control-button--toggle"
          type="button"
          data-action="water"
          data-active="true"
        >
          Вода включена
        </button>
      </section>
    </div>
  </div>
`;

export function mountApp(root: HTMLElement): () => void {
  root.innerHTML = APP_MARKUP(profchistLogoUrl);

  const viewport = root.querySelector<HTMLElement>('[data-viewport]');
  const panel = root.querySelector<HTMLElement>('[data-panel]');
  const statusLabel = root.querySelector<HTMLElement>('[data-status]');
  const toggleButton = root.querySelector<HTMLButtonElement>('[data-action="toggle"]');
  const resetButton = root.querySelector<HTMLButtonElement>('[data-action="reset"]');
  const waterButton = root.querySelector<HTMLButtonElement>('[data-action="water"]');
  const speedSlider = root.querySelector<HTMLInputElement>('[data-speed]');
  const speedValue = root.querySelector<HTMLElement>('[data-speed-value]');

  if (
    !viewport ||
    !panel ||
    !statusLabel ||
    !toggleButton ||
    !resetButton ||
    !waterButton ||
    !speedSlider ||
    !speedValue
  ) {
    throw new Error('App UI could not be initialized.');
  }

  const sceneContext = createScene(viewport);
  const washingMachine = new WashingMachine();

  sceneContext.scene.add(washingMachine.root);

  const animator = new AnimationController(sceneContext, washingMachine);
  animator.start();

  const syncUi = () => {
    panel.dataset.running = String(animator.isRunning);
    statusLabel.textContent = animator.isRunning ? 'Запущена' : 'На паузе';
    toggleButton.textContent = animator.isRunning ? 'Пауза' : 'Старт';
    waterButton.textContent = animator.isWaterEnabled ? 'Вода включена' : 'Вода выключена';
    waterButton.dataset.active = String(animator.isWaterEnabled);
    speedSlider.value = animator.speed.toFixed(2);
    speedValue.textContent = `${animator.speed.toFixed(2)}x`;
  };

  const handleToggle = () => {
    animator.toggleRunning();
    syncUi();
  };

  const handleReset = () => {
    animator.reset();
    sceneContext.controls.reset();
    syncUi();
  };

  const handleWaterToggle = () => {
    animator.toggleWater();
    syncUi();
  };

  const handleSpeedInput = () => {
    animator.setSpeed(Number(speedSlider.value));
    syncUi();
  };

  const stopSliderGesture = (event: Event) => {
    event.stopPropagation();
  };

  toggleButton.addEventListener('click', handleToggle);
  resetButton.addEventListener('click', handleReset);
  waterButton.addEventListener('click', handleWaterToggle);
  speedSlider.addEventListener('input', handleSpeedInput);
  speedSlider.addEventListener('pointerdown', stopSliderGesture);
  speedSlider.addEventListener('pointermove', stopSliderGesture);
  speedSlider.addEventListener('mousedown', stopSliderGesture);
  speedSlider.addEventListener('touchstart', stopSliderGesture, { passive: true });
  speedSlider.addEventListener('touchmove', stopSliderGesture, { passive: true });

  syncUi();

  return () => {
    toggleButton.removeEventListener('click', handleToggle);
    resetButton.removeEventListener('click', handleReset);
    waterButton.removeEventListener('click', handleWaterToggle);
    speedSlider.removeEventListener('input', handleSpeedInput);
    speedSlider.removeEventListener('pointerdown', stopSliderGesture);
    speedSlider.removeEventListener('pointermove', stopSliderGesture);
    speedSlider.removeEventListener('mousedown', stopSliderGesture);
    speedSlider.removeEventListener('touchstart', stopSliderGesture);
    speedSlider.removeEventListener('touchmove', stopSliderGesture);
    animator.dispose();
    root.innerHTML = '';
  };
}
