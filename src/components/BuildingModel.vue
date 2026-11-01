<script setup>
// 地区建筑低多边形白模（预制的“白模”：无贴图、浅色、flatShading 呈现低面数质感）
// 后续可把每类建筑替换成正式建模资产；此处保证在 iQOO Z5x(Mali-G68) 上轻量可跑。
defineProps({
  position: { type: Array, default: () => [0, 0, 0] },
  type: { type: String, default: 'factory' },
})

// 旋转常量（模板内不能直接用 Math）
const FLAT = [-Math.PI / 2, 0, 0]
// 统一白模材质色（浅米白），低饱和，贴近 HOI4 战略地图建筑占位
const WHITE = '#e9e6d8'
const WHITE2 = '#dedac9'
const WHITE3 = '#d2cdba'
</script>

<template>
  <TresGroup :position="position">
    <!-- 公共地基：轻微下沉的方形台座 -->
    <TresMesh :position="[0, 0.1, 0]" :rotation="FLAT">
      <TresPlaneGeometry :args="[10, 10]" />
      <TresMeshStandardMaterial :color="WHITE3" :flat-shading="true" />
    </TresMesh>

    <!-- 工厂：主厂房 + 附楼 + 烟囱 -->
    <template v-if="type === 'factory'">
      <TresMesh :position="[0, 1.8, 0]">
        <TresBoxGeometry :args="[6, 3.6, 4]" />
        <TresMeshStandardMaterial :color="WHITE" :flat-shading="true" />
      </TresMesh>
      <TresMesh :position="[3, 2.6, -0.5]">
        <TresBoxGeometry :args="[2.4, 2, 3]" />
        <TresMeshStandardMaterial :color="WHITE2" :flat-shading="true" />
      </TresMesh>
      <TresMesh :position="[-3, 4, 0]">
        <TresCylinderGeometry :args="[0.6, 0.8, 4.4, 8]" />
        <TresMeshStandardMaterial :color="WHITE2" :flat-shading="true" />
      </TresMesh>
    </template>

    <!-- 筒仓：圆柱仓体 + 锥顶 -->
    <template v-else-if="type === 'silo'">
      <TresMesh :position="[0, 2.2, 0]">
        <TresCylinderGeometry :args="[1.7, 1.9, 4.4, 10]" />
        <TresMeshStandardMaterial :color="WHITE" :flat-shading="true" />
      </TresMesh>
      <TresMesh :position="[0, 4.8, 0]">
        <TresConeGeometry :args="[1.9, 1.8, 10]" />
        <TresMeshStandardMaterial :color="WHITE2" :flat-shading="true" />
      </TresMesh>
    </template>

    <!-- 仓库：两栋错落箱体 -->
    <template v-else-if="type === 'depot'">
      <TresMesh :position="[-1.6, 1.2, 0]">
        <TresBoxGeometry :args="[3.2, 2.4, 3.2]" />
        <TresMeshStandardMaterial :color="WHITE" :flat-shading="true" />
      </TresMesh>
      <TresMesh :position="[1.9, 1.5, 1]">
        <TresBoxGeometry :args="[2.6, 3, 2.6]" />
        <TresMeshStandardMaterial :color="WHITE2" :flat-shading="true" />
      </TresMesh>
    </template>

    <!-- 机场：跑道 + 塔台 -->
    <template v-else-if="type === 'airfield'">
      <TresMesh :position="[0, 0.25, 0]" :rotation="FLAT">
        <TresPlaneGeometry :args="[16, 5]" />
        <TresMeshStandardMaterial :color="WHITE3" :flat-shading="true" />
      </TresMesh>
      <TresMesh :position="[0, 1.6, 3.4]">
        <TresBoxGeometry :args="[1.4, 3.2, 1.4]" />
        <TresMeshStandardMaterial :color="WHITE" :flat-shading="true" />
      </TresMesh>
      <TresMesh :position="[0, 3.4, 3.4]">
        <TresBoxGeometry :args="[2, 1, 2]" />
        <TresMeshStandardMaterial :color="WHITE2" :flat-shading="true" />
      </TresMesh>
    </template>
  </TresGroup>
</template>
