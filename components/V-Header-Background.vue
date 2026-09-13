<script setup>
// prettier-ignore
import { Renderer, Transform, Camera, Plane, Program, Vec2, Color, Mesh } from 'ogl';

import fragmentShader from '~/assets/shaders/fragment.glsl';
import vertexShader from '~/assets/shaders/vertex.glsl';

import { WhitePinkGreen as pallet } from '~/assets/shaders/colors';
import { MAX_DPR } from '~/lib/constants';

const { $smoothScroll } = useNuxtApp();
const { gsap } = useGsap();
const emitter = useEmitter();
const prefersReducedMotion = useReducedMotion();

const canvas = ref(null);

let isShaderRunning = false;
let camera = null;
let scene = null;
let renderer = null;
let gl = null;
let object = null;
let aspect = 16 / 9;

function getDimensions() {
  const container = canvas.value?.parentElement;
  if (!container) {
    return { width: window.innerWidth, height: window.innerHeight };
  }
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  return { width, height };
}

function resize() {
  if (!renderer || !object || !camera || !gl) return;
  const { width, height } = getDimensions();
  if (!width || !height) return;

  renderer.setSize(width, height);
  camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });

  object.program.uniforms.resolution.value.set(width, height);

  object.updateMatrix();
  camera.updateMatrix();
}

function render() {
  if (!isShaderRunning || !renderer || !scene || !camera || !object) return;

  if (canvas.value?.closest?.('.header')) {
    const scrollY = $smoothScroll?.scrollY?.() ?? window.scrollY ?? 0;
    if (scrollY + 20 > window.innerHeight) return;
  }

  const nextTime = prefersReducedMotion.value ? 0 : 0.0085;
  object.program.uniforms.time.value += nextTime;

  renderer.render({ scene, camera });
}

function createBackground() {
  if (!canvas.value) return;
  const { width, height } = getDimensions();
  aspect = width / Math.max(1, height);

  const clearColor = pallet.color1.dark.map((number) => number / 255);

  renderer = new Renderer({
    canvas: canvas.value,
    dpr: Math.min(window.devicePixelRatio, MAX_DPR),
    alpha: false,
    depth: false,
    width,
    height,
    powerPreference: 'high-performance',
  });

  gl = renderer.gl;

  gl.clearColor(...clearColor, 1);

  camera = new Camera(gl, { fov: 70, aspect, near: 0.5, far: 1.5 });
  camera.position.set(0, 0, 1);

  scene = new Transform();

  const objectSize = 2;
  const objectGeometry = new Plane(gl, {
    width: objectSize * aspect,
    height: objectSize,
  });
  const objectMaterial = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    transparent: false,
    depthTest: false,
    depthWrite: false,
    cullFace: false,
    uniforms: {
      time: { value: 0.0 },
      randomSeed: { value: Math.random() },
      objectOpacity: { value: 0.0 },
      noisePower: { value: 1.0 },
      pixelRatio: { value: window.devicePixelRatio },
      resolution: {
        value: new Vec2(width, height),
      },
      color1: {
        value: new Color(pallet.color1.dark),
      },
      color2: {
        value: new Color(pallet.color2.dark),
      },
      color3: {
        value: new Color(pallet.color3.dark),
      },
    },
  });

  object = new Mesh(gl, {
    geometry: objectGeometry,
    program: objectMaterial,
  });
  object.setParent(scene);

  isShaderRunning = true;

  object.matrixAutoUpdate = false;
  camera.matrixAutoUpdate = false;

  const observer = new ResizeObserver(resize);
  if (canvas.value.parentElement) {
    observer.observe(canvas.value.parentElement);
  }
  window.addEventListener('resize', resize);

  // NOTE: try to use only one requestAnimationFrame
  // this will improve overall performance
  const callbackTicker = gsap.ticker.add(render);

  gsap.to(object.program.uniforms.objectOpacity, {
    value: 1,
    duration: 1,
    delay: 0.4,
    onComplete: () => emitter.emit('shader:running'),
  });

  onBeforeUnmount(() => {
    gsap.ticker.remove(callbackTicker);
    observer.disconnect();
    window.removeEventListener('resize', resize);
    isShaderRunning = false;
  });
}

onMounted(() => {
  nextTick(() => {
    createBackground();
  });
});
</script>

<template>
  <canvas ref="canvas" />
</template>
