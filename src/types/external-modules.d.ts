declare namespace THREE {
  class Group {
    name: string;
    position: any;
    rotation: any;
    add(...objects: any[]): any;
    traverse(callback: (child: any) => void): void;
  }

  class Scene extends Group {}

  class PerspectiveCamera extends Group {
    aspect: number;
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
    updateProjectionMatrix(): void;
  }

  class WebGLRenderer {
    domElement: any;
    shadowMap: any;
    outputColorSpace: any;
    toneMapping: any;
    toneMappingExposure: number;
    constructor(parameters?: any);
    setPixelRatio(value: number): void;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    render(scene: any, camera: any): void;
    dispose(): void;
  }

  class Mesh<G = any, M = any> extends Group {
    geometry: G;
    material: M;
    castShadow: boolean;
    receiveShadow: boolean;
    renderOrder: number;
    visible: boolean;
    constructor(geometry?: G, material?: M);
    clone(): Mesh<G, M>;
  }

  class MeshStandardMaterial {
    constructor(parameters?: any);
  }

  class MeshPhysicalMaterial {
    constructor(parameters?: any);
  }

  class MeshBasicMaterial {
    constructor(parameters?: any);
  }

  class BoxGeometry {
    constructor(...args: any[]);
  }

  class CylinderGeometry {
    constructor(...args: any[]);
  }

  class SphereGeometry {
    attributes: any;
    constructor(...args: any[]);
    scale(x: number, y: number, z: number): void;
    translate(x: number, y: number, z: number): void;
    computeVertexNormals(): void;
  }

  class CircleGeometry {
    constructor(...args: any[]);
  }

  class RingGeometry {
    constructor(...args: any[]);
  }

  class TorusGeometry {
    constructor(...args: any[]);
  }

  class PlaneGeometry {
    constructor(...args: any[]);
  }

  class ExtrudeGeometry {
    constructor(shape: any, options?: any);
    translate(x: number, y: number, z: number): void;
  }

  class Shape {
    holes: any[];
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    closePath(): void;
  }

  class Path {
    absellipse(...args: any[]): void;
  }

  class HemisphereLight extends Group {
    constructor(...args: any[]);
  }

  class DirectionalLight extends Group {
    shadow: any;
    castShadow: boolean;
    constructor(...args: any[]);
  }

  class PointLight extends Group {
    constructor(...args: any[]);
  }

  class TextureLoader {
    load(url: string): any;
  }

  class Clock {
    start(): void;
    getDelta(): number;
  }

  const SRGBColorSpace: any;
  const ACESFilmicToneMapping: any;
  const PCFSoftShadowMap: any;
  const DoubleSide: any;
  const MathUtils: {
    clamp(value: number, min: number, max: number): number;
  };
}

declare module 'three' {
  export = THREE;
}

declare module 'three/examples/jsm/controls/OrbitControls.js' {
  export class OrbitControls {
    enableDamping: boolean;
    dampingFactor: number;
    minDistance: number;
    maxDistance: number;
    maxPolarAngle: number;
    target: any;
    constructor(camera: any, domElement: any);
    update(): void;
    reset(): void;
    dispose(): void;
  }
}
