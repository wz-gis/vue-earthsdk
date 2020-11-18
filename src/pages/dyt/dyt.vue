<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="../../assets/logo.png">
    <h1>一颗数据小白菜</h1> -->
    <DytPart1/>
  </div>
</template>

<script>
import DytPart1  from "./DytPart1";
export default {
  name: 'app',
    components: {
      DytPart1

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