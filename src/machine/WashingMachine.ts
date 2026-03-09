import * as THREE from 'three';
import profchistLogoUrl from '../assets/profchist-logo.svg';

export interface WashingMachineUpdateOptions {
  delta: number;
  elapsed: number;
  drumSpeed: number;
  waterEnabled: boolean;
  isPlaying: boolean;
}

export class WashingMachine {
  readonly root = new THREE.Group();

  private readonly drumGroup = new THREE.Group();
  private readonly waterPivot = new THREE.Group();
  private waterGeometry!: THREE.SphereGeometry;
  private waterMesh!: THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhysicalMaterial>;
  private waterBasePositions!: Float32Array;
  private frontWaterGeometry!: THREE.SphereGeometry;
  private frontWaterMesh!: THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhysicalMaterial>;
  private frontWaterBasePositions!: Float32Array;

  constructor() {
    this.root.name = 'WashingMachine';

    this.root.add(this.createBody());
    this.root.add(this.createDoor());

    const interiorGroup = new THREE.Group();
    interiorGroup.position.set(0, -0.35, 0.08);
    this.root.add(interiorGroup);

    interiorGroup.add(this.createOuterTub());
    interiorGroup.add(this.waterPivot);
    interiorGroup.add(this.drumGroup);

    this.waterPivot.add(this.createWater());
    this.waterPivot.add(this.createWaterFrontBulge());
    this.drumGroup.add(this.createDrum());

    this.root.traverse((child: any) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    this.waterMesh.castShadow = false;
    this.waterMesh.receiveShadow = false;
    this.frontWaterMesh.castShadow = false;
    this.frontWaterMesh.receiveShadow = false;
  }

  update({
    delta,
    elapsed,
    drumSpeed,
    waterEnabled,
    isPlaying,
  }: WashingMachineUpdateOptions): void {
    if (isPlaying) {
      this.drumGroup.rotation.z += delta * drumSpeed * 1.8;
    }

    this.waterMesh.visible = waterEnabled;
    this.frontWaterMesh.visible = waterEnabled;

    if (waterEnabled && isPlaying) {
      this.animateWater(elapsed, drumSpeed);
    }
  }

  reset(): void {
    this.drumGroup.rotation.set(0, 0, 0);
    this.waterPivot.rotation.set(0, 0, 0);
    this.restoreWaterGeometry();
    this.restoreFrontWaterGeometry();
    this.waterMesh.visible = true;
    this.frontWaterMesh.visible = true;
  }

  private createBody(): THREE.Group {
    const group = new THREE.Group();

    const shellMaterial = new THREE.MeshStandardMaterial({
      color: 0xf6f8fb,
      roughness: 0.52,
      metalness: 0.08,
    });

    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0xdde5ee,
      roughness: 0.44,
      metalness: 0.12,
    });

    const darkMaterial = new THREE.MeshStandardMaterial({
      color: 0x394350,
      roughness: 0.62,
      metalness: 0.28,
    });

    const shellPanels = [
      { size: [0.16, 4.15, 3.02], position: [-1.62, 0, 0] },
      { size: [0.16, 4.15, 3.02], position: [1.62, 0, 0] },
      { size: [3.4, 0.18, 3.02], position: [0, 2, 0] },
      { size: [3.4, 0.22, 3.02], position: [0, -2.03, 0] },
      { size: [3.4, 4.15, 0.12], position: [0, 0, -1.5] },
    ] as const;

    for (const panel of shellPanels) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(...panel.size),
        shellMaterial,
      );
      mesh.position.set(...panel.position);
      group.add(mesh);
    }

    const frontFrame = this.createFrontFrame(shellMaterial);
    frontFrame.position.z = 1.43;
    group.add(frontFrame);

    const doorSeal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.08, 1.08, 0.42, 72, 1, true),
      darkMaterial,
    );
    doorSeal.rotation.x = Math.PI / 2;
    doorSeal.position.set(0, -0.35, 1.1);
    group.add(doorSeal);

    const detergentDrawer = new THREE.Mesh(
      new THREE.BoxGeometry(1.02, 0.44, 0.09),
      accentMaterial,
    );
    detergentDrawer.position.set(-0.82, 1.18, 1.56);
    group.add(detergentDrawer);

    const drawerHandle = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.03, 0.03),
      darkMaterial,
    );
    drawerHandle.position.set(-0.82, 1.16, 1.62);
    group.add(drawerHandle);

    const display = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.4, 0.04),
      new THREE.MeshStandardMaterial({
        color: 0x152432,
        emissive: 0x0b1f33,
        emissiveIntensity: 0.45,
        roughness: 0.3,
        metalness: 0.08,
      }),
    );
    display.position.set(0.12, 1.18, 1.585);
    group.add(display);

    const statusLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0x6fd4ff,
        emissive: 0x6fd4ff,
        emissiveIntensity: 1.4,
      }),
    );
    statusLight.position.set(0.42, 1.18, 1.62);
    group.add(statusLight);

    const dialBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.33, 0.33, 0.08, 48),
      accentMaterial,
    );
    dialBase.rotation.x = Math.PI / 2;
    dialBase.position.set(1.08, 1.18, 1.56);
    group.add(dialBase);

    const dialKnob = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.14, 48),
      darkMaterial,
    );
    dialKnob.rotation.x = Math.PI / 2;
    dialKnob.position.set(1.08, 1.18, 1.61);
    group.add(dialKnob);

    const dialIndicator = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.11, 0.03),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.25,
        metalness: 0.05,
      }),
    );
    dialIndicator.position.set(1.08, 1.34, 1.66);
    group.add(dialIndicator);

    const brandMark = this.createBrandMark();
    group.add(brandMark);

    const toeKick = new THREE.Mesh(
      new THREE.BoxGeometry(2.78, 0.24, 0.08),
      accentMaterial,
    );
    toeKick.position.set(0, -1.78, 1.55);
    group.add(toeKick);

    const footPositions = [
      [-1.1, -2.18, 1.1],
      [1.1, -2.18, 1.1],
      [-1.1, -2.18, -1.1],
      [1.1, -2.18, -1.1],
    ] as const;

    for (const [x, y, z] of footPositions) {
      const foot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.13, 0.18, 24),
        darkMaterial,
      );
      foot.position.set(x, y, z);
      group.add(foot);
    }

    return group;
  }

  private createBrandMark(): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
    const texture = new THREE.TextureLoader().load(profchistLogoUrl);
    texture.colorSpace = THREE.SRGBColorSpace;

    const logo = new THREE.Mesh(
      new THREE.PlaneGeometry(0.64, 0.17),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.04,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    logo.position.set(-0.82, 1.62, 1.61);
    logo.renderOrder = 7;

    return logo;
  }

  private createFrontFrame(material: THREE.MeshStandardMaterial): THREE.Mesh {
    const width = 3.4;
    const height = 4.15;

    const frameShape = new THREE.Shape();
    frameShape.moveTo(-width / 2, -height / 2);
    frameShape.lineTo(width / 2, -height / 2);
    frameShape.lineTo(width / 2, height / 2);
    frameShape.lineTo(-width / 2, height / 2);
    frameShape.closePath();

    const opening = new THREE.Path();
    opening.absellipse(0, -0.35, 1.08, 1.08, 0, Math.PI * 2, false, 0);
    frameShape.holes.push(opening);

    const geometry = new THREE.ExtrudeGeometry(frameShape, {
      depth: 0.18,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.03,
      bevelThickness: 0.04,
      curveSegments: 72,
    });

    geometry.translate(0, 0, -0.09);

    return new THREE.Mesh(geometry, material);
  }

  private createDoor(): THREE.Group {
    const group = new THREE.Group();
    group.position.set(0, -0.35, 1.56);

    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xe4ebf3,
      roughness: 0.38,
      metalness: 0.16,
    });

    const hingeMaterial = new THREE.MeshStandardMaterial({
      color: 0x55606f,
      roughness: 0.52,
      metalness: 0.34,
    });

    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.16, 0.13, 28, 96),
      ringMaterial,
    );
    outerRing.position.z = 0.02;
    group.add(outerRing);

    const glassFrame = new THREE.Mesh(
      new THREE.CylinderGeometry(0.98, 0.98, 0.22, 72, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0x8591a1,
        roughness: 0.38,
        metalness: 0.55,
      }),
    );
    glassFrame.rotation.x = Math.PI / 2;
    glassFrame.position.z = -0.03;
    group.add(glassFrame);

    const glass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 0.28, 72),
      new THREE.MeshPhysicalMaterial({
        color: 0xf6fbff,
        transparent: true,
        opacity: 0.24,
        transmission: 0.92,
        thickness: 0.28,
        roughness: 0.04,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        ior: 1.18,
      }),
    );
    glass.rotation.x = Math.PI / 2;
    glass.position.z = 0.01;
    glass.castShadow = false;
    glass.receiveShadow = false;
    group.add(glass);

    const innerTrim = new THREE.Mesh(
      new THREE.TorusGeometry(0.92, 0.045, 24, 96),
      new THREE.MeshStandardMaterial({
        color: 0x626d7c,
        roughness: 0.46,
        metalness: 0.22,
      }),
    );
    innerTrim.position.z = -0.12;
    group.add(innerTrim);

    const hingeBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.64, 0.12),
      hingeMaterial,
    );
    hingeBar.position.set(-1.12, 0, -0.08);
    group.add(hingeBar);

    return group;
  }

  private createOuterTub(): THREE.Group {
    const tubGroup = new THREE.Group();

    const shell = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.2, 2.02, 72, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0xe5ebf1,
        roughness: 0.78,
        metalness: 0.08,
      }),
    );
    shell.rotation.x = Math.PI / 2;
    tubGroup.add(shell);

    const frontLip = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.05, 20, 96),
      new THREE.MeshStandardMaterial({
        color: 0xc8d2dd,
        roughness: 0.62,
        metalness: 0.12,
      }),
    );
    frontLip.position.z = 1.01;
    tubGroup.add(frontLip);

    const backLip = frontLip.clone();
    backLip.position.z = -1.01;
    tubGroup.add(backLip);

    return tubGroup;
  }

  private createDrum(): THREE.Group {
    const group = new THREE.Group();

    const drumMaterial = new THREE.MeshStandardMaterial({
      color: 0xb9c3cf,
      roughness: 0.28,
      metalness: 1,
    });

    const shell = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 1.74, 72, 1, true),
      drumMaterial,
    );
    shell.rotation.x = Math.PI / 2;
    group.add(shell);

    const frontRim = new THREE.Mesh(
      new THREE.TorusGeometry(1.01, 0.05, 20, 96),
      drumMaterial,
    );
    frontRim.position.z = 0.87;
    group.add(frontRim);

    const backRim = frontRim.clone();
    backRim.position.z = -0.87;
    group.add(backRim);

    const backPlate = new THREE.Mesh(
      new THREE.CircleGeometry(0.98, 72),
      new THREE.MeshStandardMaterial({
        color: 0xaab5c2,
        roughness: 0.35,
        metalness: 0.95,
      }),
    );
    backPlate.position.z = -0.87;
    group.add(backPlate);

    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.18, 32),
      new THREE.MeshStandardMaterial({
        color: 0x8190a0,
        roughness: 0.24,
        metalness: 1,
      }),
    );
    hub.rotation.x = Math.PI / 2;
    hub.position.z = -0.78;
    group.add(hub);

    for (let index = 0; index < 3; index += 1) {
      const angle = (index / 3) * Math.PI * 2;
      const paddle = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.24, 1.5),
        new THREE.MeshStandardMaterial({
          color: 0xd7e0e8,
          roughness: 0.36,
          metalness: 0.55,
        }),
      );

      paddle.position.set(Math.cos(angle) * 0.74, Math.sin(angle) * 0.74, 0);
      paddle.rotation.z = angle;
      group.add(paddle);
    }

    const perforationMaterial = new THREE.MeshStandardMaterial({
      color: 0x93a0af,
      roughness: 0.45,
      metalness: 0.86,
    });

    for (let ring = 0; ring < 4; ring += 1) {
      const z = -0.58 + ring * 0.38;

      for (let index = 0; index < 14; index += 1) {
        const angle = (index / 14) * Math.PI * 2 + ring * 0.12;
        const perforation = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16),
          perforationMaterial,
        );

        perforation.rotation.x = Math.PI / 2;
        perforation.position.set(Math.cos(angle) * 0.88, Math.sin(angle) * 0.88, z);
        group.add(perforation);
      }
    }

    return group;
  }

  private createWater(): THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhysicalMaterial> {
    const geometry = new THREE.SphereGeometry(1, 56, 34);
    geometry.scale(1.08, 0.58, 0.92);
    geometry.translate(0, -0.45, 0.08);

    const material = new THREE.MeshPhysicalMaterial({
      color: 0x76f1ff,
      transparent: true,
      opacity: 0.96,
      transmission: 0.01,
      thickness: 0.88,
      roughness: 0.08,
      metalness: 0,
      clearcoat: 0.86,
      clearcoatRoughness: 0.1,
      emissive: 0x42e7ff,
      emissiveIntensity: 0.72,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 1;

    this.waterGeometry = geometry;
    this.waterMesh = mesh;
    this.waterBasePositions = Float32Array.from(
      geometry.attributes.position.array as ArrayLike<number>,
    );

    return mesh;
  }

  private createWaterFrontBulge(): THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhysicalMaterial> {
    const geometry = new THREE.SphereGeometry(0.9, 48, 28);
    geometry.scale(0.98, 0.42, 0.2);
    geometry.translate(0, -0.58, 1.13);

    const material = new THREE.MeshPhysicalMaterial({
      color: 0x8af6ff,
      transparent: true,
      opacity: 0.92,
      transmission: 0.01,
      thickness: 0.72,
      roughness: 0.08,
      metalness: 0,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
      emissive: 0x52f0ff,
      emissiveIntensity: 0.6,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 2;

    this.frontWaterGeometry = geometry;
    this.frontWaterMesh = mesh;
    this.frontWaterBasePositions = Float32Array.from(
      geometry.attributes.position.array as ArrayLike<number>,
    );

    return mesh;
  }

  private animateWater(elapsed: number, drumSpeed: number): void {
    const positions = this.waterGeometry.attributes.position.array as Float32Array;
    const frontPositions = this.frontWaterGeometry.attributes.position.array as Float32Array;
    const amplitude = 0.035 + drumSpeed * 0.018;

    this.waterPivot.rotation.z =
      Math.sin(elapsed * 1.8) * 0.14 +
      Math.sin(this.drumGroup.rotation.z * 0.85) * 0.08;
    this.waterPivot.rotation.x = Math.cos(elapsed * 1.2) * 0.014;

    for (let index = 0; index < positions.length; index += 3) {
      const ox = this.waterBasePositions[index];
      const oy = this.waterBasePositions[index + 1];
      const oz = this.waterBasePositions[index + 2];

      const angle = Math.atan2(oz, ox);
      const radius = Math.sqrt(ox * ox + oz * oz);
      const surfaceInfluence = THREE.MathUtils.clamp((oy + 1.05) * 0.9, 0, 1);

      const crest =
        Math.sin(angle * 3 + elapsed * 2.6 + radius * 5.2) * amplitude;
      const secondary =
        Math.cos(oz * 4.5 - elapsed * 1.7 + angle) * amplitude * 0.42;

      positions[index] =
        ox + Math.cos(angle + elapsed * 1.4) * 0.014 * surfaceInfluence;
      positions[index + 1] = oy + (crest + secondary) * surfaceInfluence;
      positions[index + 2] =
        oz + Math.sin(angle * 2 - elapsed * 1.9) * 0.008 * surfaceInfluence;
    }

    for (let index = 0; index < frontPositions.length; index += 3) {
      const ox = this.frontWaterBasePositions[index];
      const oy = this.frontWaterBasePositions[index + 1];
      const oz = this.frontWaterBasePositions[index + 2];
      const influence = THREE.MathUtils.clamp((oz - 1.02) * 4, 0, 1);
      const ripple = Math.sin(elapsed * 2.2 + ox * 4.8) * 0.004 * influence;
      const sway = Math.cos(elapsed * 1.8 + (oy + 0.55) * 4.2) * 0.003 * influence;

      frontPositions[index] = ox + ripple * 0.3;
      frontPositions[index + 1] = oy + sway;
      frontPositions[index + 2] = oz + ripple * 0.35;
    }

    this.waterGeometry.attributes.position.needsUpdate = true;
    this.frontWaterGeometry.attributes.position.needsUpdate = true;
    this.waterGeometry.computeVertexNormals();
    this.frontWaterGeometry.computeVertexNormals();
  }

  private restoreWaterGeometry(): void {
    const positions = this.waterGeometry.attributes.position.array as Float32Array;
    positions.set(this.waterBasePositions);
    this.waterGeometry.attributes.position.needsUpdate = true;
    this.waterGeometry.computeVertexNormals();
  }

  private restoreFrontWaterGeometry(): void {
    const positions = this.frontWaterGeometry.attributes.position.array as Float32Array;
    positions.set(this.frontWaterBasePositions);
    this.frontWaterGeometry.attributes.position.needsUpdate = true;
    this.frontWaterGeometry.computeVertexNormals();
  }
}






