<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="../../assets/logo.png">
    <h1>一颗数据小白菜</h1> -->
    <ThyPart1/>
    <!-- <CesiumContainer/> -->
  </div>
</template>

<script>
import ThyPart1 from "./ThyPart1.vue";
import CesiumContainer from './CesiumContainer'
export default {
  name: 'app',
    components: {
      ThyPart1,
      CesiumContainer

  }
}
</script>

<style>
#app {
  width: 100%;
  height: 100%; 
  background: grey;
  position: relative;
}
</style>