<script setup>
// 渲染在 <TresCanvas> 内部的无界面子组件：逐帧做「视野裁剪 + 距离 LOD」。
// - 仅在放大比例 ≥ 80% 时开启 3D 地形层；
// - 视锥（frustum）内的瓦片才渲染 → 仅显示摄像头范围内；
// - 距镜头目标过远（> near）的瓦片隐藏，露出下方扁平世界地图（近似「远景高斯模糊/无需精细化渲染」）。
import { useLoop, useTresContext } from '@tresjs/core'
import * as THREE from 'three'
import { useZoom } from '../composables/useZoom'

const props = defineProps({
  tileGroup: { type: Object, required: true },
  centers: { type: Array, required: true },
  near: { type: Number, default: 200 },
  radius: { type: Number, default: 45 },
})

const { z } = useZoom()
const { camera } = useTresContext()

const frustum = new THREE.Frustum()
const m = new THREE.Matrix4()
const sphere = new THREE.Sphere(new THREE.Vector3(), 1)
const target = new THREE.Vector3()

const { onLoop } = useLoop()
onLoop(() => {
  const on = z.level >= 0.8
  props.tileGroup.visible = on
  if (!on) return
  const cam = camera.value
  if (!cam) return

  target.set(z.panX, 0, z.panY)
  m.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse)
  frustum.setFromProjectionMatrix(m)

  const children = props.tileGroup.children
  const centers = props.centers
  sphere.radius = props.radius
  for (let i = 0; i < centers.length; i++) {
    sphere.center.copy(centers[i])
    const inView = frustum.intersectsSphere(sphere)
    const nearOk = centers[i].distanceTo(target) < props.near
    children[i].visible = inView && nearOk
  }
})
</script>

<template></template>
