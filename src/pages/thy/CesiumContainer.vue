<template>
  <div id="cesiumContainer"></div>
</template>

<script>

//导入模块函数

export default {
  name: 'CesiumContainer',
  data() {  
    return {

    };
  },
  mounted() {

    //创建viewer动画控件、地址搜索控件、图层选择控件，操作指南控件
    var viewer = new Cesium.Viewer("cesiumContainer", {
      animate:false,//动画控件
      baseLayerPicker:true,//图层选择控件
      geocoder:false,//地址搜索控件
      navigationHelpButton:false,//操作指南控件
      timeline:false,//时间轴
      infoBox: false,
      selectionIndicator: false,
      animation:false,//时间
      vrButton:false,//vr按钮
      fullscreenButton:false,//全屏

      shadows: false,
      shouldAnimate: true,

      terrainProvider: new Cesium.CesiumTerrainProvider({
          url : "/api/assets/terrain/taohuayuan/terrain_tiles",
        }),
      imageryProvider:new Cesium.ArcGisMapServerImageryProvider({
                url: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",//arcgis底图
            }),
      });

      //显示帧率
      viewer.scene.debugShowFramesPerSecond = true;

      //加载tileset
      var tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
        // url: "/api/assets/taohuayuan/THY1_3dtile/tileset.json",
        url: "/api/assets/taohuayuan/Taohuayuan1_out_3DTile_UTM_N49/tileset.json",
        maximumScreenSpaceError: 2, //最大的屏幕空间误差
        maximumNumberOfLoadedTiles: 1000, //最大加载瓦片个数
        modelMatrix: Cesium.Matrix4.fromArray([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),//形状矩阵
      }));

      viewer.camera.setView({
          destination : Cesium.Cartesian3.fromDegrees(111.4227640,28.7799561,200),
          orientation: {
            heading : Cesium.Math.toRadians(90.0), // east, default value is 0.0 (north)
            pitch : Cesium.Math.toRadians(-90),    // default value (looking down)
            roll : 0.0                             // default value
          }
      });
  },
  methods:{
  },
  // 1.2 资源销毁
  beforeDestroy() {

  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#cesiumContainer {
  width: 100%;
  height: 100%;
}
</style>
