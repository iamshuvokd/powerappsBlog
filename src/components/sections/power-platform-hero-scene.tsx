import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import powerAutomateLogoSvg from "@/assets/icons/power-automate.svg?raw";
import powerAppsLogoSvg from "@/assets/icons/powerapps.svg?raw";

type IconKind = "powerapps" | "automate" | "sharepoint";
type ScenePlacement = "desktop" | "inline";

const logoTextureSize = 2048;

const iconPalette: Record<IconKind, { base: string; glow: string; accent: string }> = {
  powerapps: { base: "#7f3ff2", glow: "#c869ff", accent: "#f4b6ff" },
  automate: { base: "#0087ff", glow: "#4fd5ff", accent: "#b8f2ff" },
  sharepoint: { base: "#008f87", glow: "#43ddb8", accent: "#c8fff0" },
};

// Tilt applied to the LOGO only (not the halo), so each ring stays a true
// circle facing the camera while the logo keeps its subtle 3D angle.
const iconTilt: Record<IconKind, [number, number, number]> = {
  powerapps: [-0.14, 0.34, -0.12],
  automate: [0.08, -0.08, 0.08],
  sharepoint: [-0.12, -0.18, 0.12],
};

export function PowerPlatformHeroScene({
  className = "absolute inset-0 z-0 h-full w-full",
  mediaQuery,
  placement = "inline",
}: {
  className?: string;
  mediaQuery?: string;
  placement?: ScenePlacement;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(() => !mediaQuery);

  useEffect(() => {
    if (!mediaQuery) return;

    const query = window.matchMedia(mediaQuery);
    const update = () => setEnabled(query.matches);
    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, [mediaQuery]);

  useEffect(() => {
    if (!enabled) return;

    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.2, 8.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const root = new THREE.Group();
    scene.add(root);

    const ambient = new THREE.AmbientLight(0xffffff, 1.7);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 4.2);
    key.position.set(2.8, 4.4, 5.2);
    scene.add(key);

    const rim = new THREE.PointLight(0x48d7ff, 16, 18);
    rim.position.set(-4.5, -1.6, 3.4);
    scene.add(rim);

    const powerApps = createIcon("powerapps");
    const automate = createIcon("automate");
    const sharePoint = createIcon("sharepoint");

    powerApps.position.set(-1.78, 0.62, 0.05);
    powerApps.scale.setScalar(0.98);

    automate.position.set(0, -0.42, 0.48);
    automate.scale.setScalar(0.94);

    sharePoint.position.set(1.78, 0.62, 0.72);
    sharePoint.scale.setScalar(0.86);

    const artwork = new THREE.Group();
    artwork.add(powerApps, automate, sharePoint, createConnectors());
    root.add(artwork, createParticles());

    const artworkBox = new THREE.Box3().setFromObject(artwork);
    const artworkSize = new THREE.Vector3();
    const artworkCenter = new THREE.Vector3();
    artworkBox.getSize(artworkSize);
    artworkBox.getCenter(artworkCenter);

    const animatedIcons = [powerApps, automate, sharePoint].map((icon) => ({
      icon,
      position: icon.position.clone(),
      rotation: icon.rotation.clone(),
    }));

    const cursor = new THREE.Vector2();
    const target = new THREE.Vector2();
    const clock = new THREE.Clock();
    let frame = 0;

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      const compact = placement === "inline" && width < 640;
      const aspect = width / Math.max(height, 1);
      const fit = getArtworkFit({
        aspect,
        compact,
        fov: camera.fov,
        height,
        placement,
        size: artworkSize,
        width,
      });

      renderer.setSize(width, height); // updateStyle=true: canvas CSS matches container (responsive)
      camera.aspect = aspect;
      camera.position.z = fit.cameraZ;
      root.scale.setScalar(fit.scale);
      root.position.set(
        fit.target.x - artworkCenter.x * fit.scale,
        fit.target.y - artworkCenter.y * fit.scale,
        0,
      );
      camera.updateProjectionMatrix();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      target.y = -(((event.clientY - rect.top) / rect.height - 0.5) * 2);
    };

    mount.addEventListener("pointermove", onPointerMove);

    let visible = !document.hidden;
    const onVisibility = () => {
      visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const animate = () => {
      frame = window.requestAnimationFrame(animate);
      if (!visible) return; // pause rendering while the tab is hidden
      const elapsed = clock.getElapsedTime();

      cursor.lerp(target, 0.045);
      root.rotation.y = cursor.x * 0.08;
      root.rotation.x = cursor.y * 0.045;

      animatedIcons.forEach(({ icon, position, rotation }, index) => {
        icon.position.y = position.y + Math.sin(elapsed * 1.4 + index * 1.7) * 0.035;
        icon.rotation.z = rotation.z + Math.sin(elapsed * 0.85 + index) * 0.018;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      mount.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      disposeObject(scene);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [enabled, placement]);

  return <div ref={mountRef} aria-hidden="true" className={className} />;
}

function getArtworkFit({
  aspect,
  compact,
  fov,
  height,
  placement,
  size,
  width,
}: {
  aspect: number;
  compact: boolean;
  fov: number;
  height: number;
  placement: ScenePlacement;
  size: THREE.Vector3;
  width: number;
}) {
  const safe =
    placement === "desktop"
      ? {
          centerX: 0.72,
          centerY: height < 780 ? 0.46 : 0.44,
          height: 0.58,
          width: 0.44,
        }
      : {
          centerX: 0.5,
          centerY: compact ? 0.55 : 0.53,
          height: compact ? 0.76 : 0.72,
          width: compact ? 0.86 : 0.8,
        };
  const scale =
    placement === "desktop"
      ? THREE.MathUtils.clamp(width / 1900, 0.62, 0.84)
      : THREE.MathUtils.clamp(width / 980, compact ? 0.54 : 0.62, compact ? 0.64 : 0.76);
  const halfVerticalFov = Math.tan(THREE.MathUtils.degToRad(fov) / 2);
  const paddedWidth = size.x * scale * 1.16;
  const paddedHeight = size.y * scale * 1.2;
  const viewHeight = Math.max(
    paddedHeight / safe.height,
    paddedWidth / (safe.width * Math.max(aspect, 0.1)),
  );
  const cameraZ = THREE.MathUtils.clamp(viewHeight / (2 * halfVerticalFov), 6.4, 18);
  const target = new THREE.Vector2(
    (safe.centerX - 0.5) * viewHeight * aspect,
    (0.5 - safe.centerY) * viewHeight,
  );

  return { cameraZ, scale, target };
}

function createIcon(kind: IconKind) {
  const palette = iconPalette[kind];
  const group = new THREE.Group();

  // Halo ring stays in the (untilted) group so it always faces the camera.
  group.add(createLogoHalo(palette));

  const logo =
    kind === "powerapps"
      ? createPowerAppsLogo()
      : kind === "automate"
        ? createPowerAutomateLogo()
        : createSharePointLogo();
  logo.rotation.set(...iconTilt[kind]);
  group.add(logo);

  return group;
}

function createLogoHalo(palette: (typeof iconPalette)[IconKind]) {
  const halo = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.2, 1.33, 96),
    new THREE.MeshBasicMaterial({
      color: palette.glow,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    }),
  );

  ring.position.z = 0.3; // near the logo plane (z≈0.36) so the logo stays centered in the ring (no depth parallax)
  halo.add(ring);
  return halo;
}

function createPowerAppsLogo() {
  const group = new THREE.Group();
  const logo = createSvgLogoPlane(powerAppsLogoSvg, 2.1, 2.1);
  logo.position.z = 0.36;
  logo.renderOrder = 4;
  group.add(logo);

  return group;
}

function createPowerAutomateLogo() {
  const group = new THREE.Group();
  const logo = createSvgLogoPlane(powerAutomateLogoSvg, 2.08, 2.08);
  logo.position.z = 0.32;
  logo.renderOrder = 4;
  group.add(logo);

  return group;
}

function createSharePointLogo() {
  const group = new THREE.Group();
  const logo = createLogoPlane(drawSharePointLogo, 2.05, 2.05);
  logo.position.z = 0.42;
  logo.renderOrder = 4;
  group.add(logo);

  const depth = new THREE.Mesh(
    roundedRectGeometry(1.2, 1.2, 0.18, 0.12),
    new THREE.MeshBasicMaterial({ color: "#0b837f", transparent: true, opacity: 0.2 }),
  );
  depth.position.set(-0.24, -0.04, 0.08);
  group.add(depth);

  return group;
}

function createLogoPlane(
  draw: (context: CanvasRenderingContext2D, size: number) => void,
  width: number,
  height: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = logoTextureSize;
  canvas.height = logoTextureSize;
  const context = canvas.getContext("2d");

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    draw(context, canvas.width);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;
  texture.needsUpdate = true;

  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
}

function createSvgLogoPlane(svgMarkup: string, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = logoTextureSize;
  canvas.height = logoTextureSize;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 8;

  const image = new Image();
  image.decoding = "async";
  image.onload = () => {
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, logoTextureSize, logoTextureSize);
    context.drawImage(image, 0, 0, logoTextureSize, logoTextureSize);
    texture.needsUpdate = true;
  };
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;

  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
}

function drawSharePointLogo(context: CanvasRenderingContext2D, size: number) {
  const unit = size / 512;
  context.save();
  context.scale(unit, unit);

  context.fillStyle = "#087a78";
  context.beginPath();
  context.arc(260, 134, 136, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#21a0a4";
  context.beginPath();
  context.arc(354, 274, 116, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#43c6cb";
  context.globalAlpha = 0.94;
  context.beginPath();
  context.arc(232, 368, 96, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;

  context.fillStyle = "rgba(0, 70, 72, 0.34)";
  roundedCanvasRect(context, 74, 150, 214, 220, 18);
  context.fill();
  context.fillStyle = "rgba(0, 70, 72, 0.22)";
  roundedCanvasRect(context, 88, 164, 214, 220, 18);
  context.fill();

  context.fillStyle = "#087f7d";
  roundedCanvasRect(context, 50, 142, 214, 220, 18);
  context.fill();

  context.fillStyle = "#ffffff";
  context.font = "bold 172px Arial, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("S", 158, 254);
  context.restore();
}

function roundedCanvasRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
}

function logoMaterial(color: string, glow: string, emissiveIntensity: number) {
  return new THREE.MeshPhysicalMaterial({
    color,
    emissive: new THREE.Color(glow),
    emissiveIntensity,
    roughness: 0.24,
    metalness: 0.04,
    clearcoat: 0.72,
  });
}

function createDisc(radius: number, color: string, glow: string, emissiveIntensity: number) {
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 0.16, 80),
    logoMaterial(color, glow, emissiveIntensity),
  );
  disc.rotation.x = Math.PI / 2;
  return disc;
}

function createTextPlane(text: string, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");

  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.font = "bold 172px Inter, Arial, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, 128, 132);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true }),
  );
}

function chevronGeometry(width: number, height: number, depth: number) {
  const shape = new THREE.Shape();
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const notch = width * 0.24;

  shape.moveTo(-halfWidth, halfHeight);
  shape.lineTo(halfWidth - notch, halfHeight);
  shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth, halfHeight - notch);
  shape.lineTo(notch, 0);
  shape.lineTo(halfWidth, -halfHeight + notch);
  shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth - notch, -halfHeight);
  shape.lineTo(-halfWidth, -halfHeight);
  shape.quadraticCurveTo(-halfWidth - 0.18, -halfHeight, -halfWidth - 0.02, -halfHeight + notch);
  shape.lineTo(-notch, 0);
  shape.lineTo(-halfWidth - 0.02, halfHeight - notch);
  shape.quadraticCurveTo(-halfWidth - 0.18, halfHeight, -halfWidth, halfHeight);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 12,
    bevelSize: 0.055,
    bevelThickness: 0.045,
  });
  geometry.center();
  return geometry;
}

function createConnectors() {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({
    color: "#75dbff",
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
  });

  const curves = [
    // Power Apps (left) -> Power Automate (center)
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.15, 0.32, -0.1),
      new THREE.Vector3(-0.6, -0.05, 0.12),
      new THREE.Vector3(-0.05, -0.32, 0.15),
    ]),
    // Power Automate (center) -> SharePoint (right)
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, -0.32, 0.15),
      new THREE.Vector3(0.6, -0.05, 0.12),
      new THREE.Vector3(1.15, 0.32, -0.1),
    ]),
  ];

  curves.forEach((curve) => {
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.018, 12, false), material));
  });

  return group;
}

function createParticles() {
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];

  for (let index = 0; index < 90; index += 1) {
    positions.push(
      (Math.random() - 0.5) * 6.8,
      (Math.random() - 0.5) * 3.8,
      -1.4 - Math.random() * 2.5,
    );
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: "#9be8ff",
      size: 0.025,
      transparent: true,
      opacity: 0.48,
      blending: THREE.AdditiveBlending,
    }),
  );
}

function roundedRectGeometry(width: number, height: number, radius: number, depth: number) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();

  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 8,
    bevelSize: Math.min(radius * 0.22, 0.045),
    bevelThickness: 0.035,
  });

  geometry.center();
  return geometry;
}

function cylinderBetween(
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  material: THREE.Material,
) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, direction.length(), 24),
    material,
  );

  cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  cylinder.position.copy(midpoint);
  return cylinder;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    mesh.geometry?.dispose();

    const material = mesh.material;
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
    } else {
      material?.dispose();
    }
  });
}
