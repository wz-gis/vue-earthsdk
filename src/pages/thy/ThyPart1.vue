<template>
    <div style="width: 100%; height: 100%">
      <div id="float-box">
          <ul>
              <li>
                  <h4>浏览路线</h4>
                  <div>
                      <input type="text" placeholder="请输入路线" id="search-input"><button id="search-btn">搜索</button>
                  </div>
                  <div id="tree-data-box">
                      <span id="close-x">X</span>
                      <div id="test1" class="demo-tree-more"></div>
                  </div>
              </li>
          </ul>
      </div>

        <div ref="earthContainer" style="width: 100%; height: 100%">
        </div>

        <div class="box" style="position: absolute; left: 400px; top: 18px; color: white; background: rgba(0, 0, 0, 0.6); padding: 20px; border-radius: 25px;min-width:150px; font-size:24px; font-family: 宋体;">
                <div class="defultbtn"  @click="measureMentType = 'POINT'">位置测量</div>
                <div class="defultbtn"  @click="measureMentType = 'SPACE_DISTANCE'">距离测量</div>
                <div class="defultbtn"  @click="measureMentType = 'TRIANGLE_DISTANCE'">三角测量</div>
                <div class="defultbtn"  @click="measureMentType = 'SPACE_AREA'">面积测量</div>
                <div class="defultbtn"  @click="clearResults">清空测量结果</div>
                <div class="defultbtn"  @click = showTown>小镇展示</div>
        </div>

        <div id="funBox" v-if="showNavigation" class="box" style="position: absolute; right: 18px; top: 18px; color: white; background: rgba(0, 0, 0, 0.6); padding: 20px; border-radius: 25px;min-width:350px; font-size:24px; font-family: 宋体;">
                <div class="defultbtn" :class="{'btnon':playing}" @click = getOffClick>停车</div>  
                <span>当前速度: {{ currentSpeed }}m/s</span><br/>
                <span >当前位置：{{currentD | numFilter}}米</span> 
                <span><input type="range" min="0" max="100" step="1" v-model.number="currentSpeed"></span><br/>
                <div id="videoshow">
                    <video src="http://www.earthsdk.com/v/last/XbsjEarthUI/assets/demo.mp4"  autoplay loop style="width:200px"></video>
                </div>
                
        </div>

        <div id="infoBox" v-if="showInfo" class="box" style="position:fixed; top:20px;right:20px;width:300px;height:90%;; color: white; background: rgba(0, 0, 0, 0.6); padding: 20px; border-radius: 25px;min-width:350px; font-size:24px; font-family: 宋体;">
            <p>名称：{{poiname}}</p> 
            <p>简介：{{poidescription}}</p> 
            <div><img v-bind:src= imgpath  style="float:left;zoom:1;overflow:hidden;width:300px;height:300px;margin-left:3px;"/></div>
        </div>
  </div> 

</template>

<script>
    // // 设置token
    // var myAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MTdlYjg0OS01YWNhLTRjN2MtYTE5ZS0wMmE1Y2NmYjA4OWIiLCJpZCI6MzE4MTcsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTYwMTAzMTZ9.P7IJONY_5JeOt5XkylhWO0hoZq6MheMTd8sG6qZZW6k"
    // Cesium.Ion.defaultAccessToken = myAccessToken;
// 1 创建Earth的vue组件
var ThyPart1 = {
      data() {
        return {
          _earth: undefined, // 注意：Earth和Cesium的相关变量放在vue中，必须使用下划线作为前缀！
          _tileset: undefined,
          _carModel:undefined,
          _lableshow1:undefined,
          _lableshow2:undefined,
          _carshow1:undefined,
          _carshow2:undefined,
          _carpin:undefined,
          _path1:undefined,
          crossCoord:undefined,

          playing: true,//控制是否播放路径
          cameraAttached: false,//控制相机绑定小车
          _cameraAttachedUnbind:undefined,
          _playingUnbind:undefined,
          _currentSpeedUnbind:undefined,
          currentD:0,
          currentSpeed: 0,
          showNavigation:false,
          showInfo:false,

          poiname:undefined,
          poidescription:undefined,
          imgpath:undefined,

          measureMentType:"NONE",
          hello:1,
        };
      },
  // 1.1 资源创建
      mounted() {
        var _this = this;

        var searchBtn,searchInput,nowCheckNode,treeDataBox,closeX,closevideox;
        searchInput = document.getElementById('search-input');
        searchBtn = document.getElementById('search-btn');
        treeDataBox = document.getElementById('tree-data-box');
        closeX = document.getElementById('close-x');
        // closevideox =document.getElementById('close-video-x');
        // videobox=document.getElementById("video-box");

        //设置前端交互按钮
        layui.use(['tree', 'util'], function(){
            var tree = layui.tree,layer = layui.layer,util = layui.util;
            var data1 = [{
            title: '湖南',
            id: 1,
            children: [{
                title: '桃花源',
                id: 1000,
                children: [{
                    title: '导览',
                    id: 10001,
                    children:[
                        {
                            title:"伏波楼",
                            id: 100014,
                        },{
                            title:"沙滩乐园",
                            id: 100011,
                        },{
                            title:"射击竞技馆",
                            id: 100012,
                        },{
                            title:"桃源故事客栈",
                            id: 100013,
                        },
                    ]
                },{
                    title: '导航',
                    id: 10002,
                    children: [{
                        title: '路线1',
                        id: 100021
                    },{
                        title: '路线2',
                        id: 100022
                    }]
                },

                ]
            }]
            }]

            tree.render({
                elem: '#test1', //默认是点击节点可进行收缩
                data: data1,
                accordion: true ,
                click: function(obj){
                    nowCheckNode = obj.data;
                    if(obj.data.id==100011){
                        _this.clearAllWindow();
                        _this.flyToAround(0);
                    }
                    if(obj.data.id==100012){
                        _this.clearAllWindow();
                        _this.flyToAround(1);
                    }
                    if(obj.data.id==100013){
                        _this.clearAllWindow();
                        _this.flyToAround(2);
                    }
                    if(obj.data.id==100014){
                        _this.clearAllWindow();
                        _this.flyToAround(3);

                    }
                    if(obj.data.id==100021){
                        _this.clearAllWindow();
                        var pathUrl = "./myFile/data/path.geojson";

                        _this.creatCarModel();
                        // _this._path1.show = true;
                        // console.log(_this._path1)
                        // createCarModel(_this._earth,_this._path1,_this.cameraAttached,_this.playing,_this.currentD,_this.currentSpeed,_this.showInfo,_this.showNavigation,
                        // _this._carshow1,_this._carshow2,_this._cameraAttachedUnbind,_this._playingUnbind,_this._currentDUnbind,_this._currentSpeedUnbind,_this._carpin,_this._carModel);
                        // _this.showInfo = false;
                        // _this.showNavigation = true;

                        _this.spotDisplay();
                    }
                    if(obj.data.id==100022){
                        // _this.creatFltModel()
                    }
                }
            });
        })        
        searchBtn.onclick = function(){
            treeDataBox.style.display = 'block';
        }
        closeX.onclick = function(){
            treeDataBox.style.display = 'none';
        }
        // closevideox.onclick = function(){
        //     videobox.style.display = 'none';
        // }
        _this.startup();

        //参数获取解析
        {
            var guidePoint = this.getQueryVariable("guide-point");
            if(guidePoint){
                _this.flyToAround(guidePoint);
            }


            var navigationRoute = this.getQueryVariable("navigation-route")
            if(navigationRoute == 1){
                _this.clearAllWindow();
                _this.creatCarModel();
                _this.spotDisplay();
            }
           
        }

      },
      filters: {
        numFilter(value) {
          // 截取当前数据到小数点后五位
          let realVal = parseFloat(value).toFixed(5)
          return realVal
        },
        numFilter2(value) {
          // 截取当前数据到小数点后两位
          let realVal = parseFloat(value).toFixed(2)
          return realVal
        }
      },
      methods:{
        startup:function() {
            var _this = this;
            var earth = new XE.Earth(this.$refs.earthContainer);
            earth.interaction.picking.enabled = true; // 开启拾取操作
            earth.weather.atmosphere.enabled = false;

            const bloom = earth.postProcess.bloom;
                  bloom.enabled = true;
                  bloom.glowOnly = false;
                  bloom.contrast = 119;
                  bloom.brightness = -0.4;
                  bloom.delta = 0.9;
                  bloom.sigma = 3.78;
                  bloom.stepSize = 5;
                  bloom.isSelected = false;
            var fsBody = `
                float vtxf_a11 = fract(czm_frameNumber / 120.0) * 3.14159265 * 2.0;
                float vtxf_a12 = v_elevationPos.z / 60.0 + sin(vtxf_a11) * 0.1;
                gl_FragColor *= vec4(vtxf_a12, vtxf_a12, vtxf_a12, 1.0);

                float vtxf_a13 = fract(czm_frameNumber / 360.0);
                float vtxf_h = clamp(v_elevationPos.z / 300.0, 0.0, 1.0);
                vtxf_a13 = abs(vtxf_a13 - 0.5) * 2.0;
                float vtxf_diff = step(0.005, abs(vtxf_h - vtxf_a13));
                gl_FragColor.rgb += gl_FragColor.rgb * (1.0 - vtxf_diff);
                `;
            //读取geojson文件，坐标使用弧度 linestring 
            var pathPosition = null;
            var pathUrl = "./myFile/data/path.geojson";

            $.ajax({
                type: "GET",
                url: pathUrl,
                async: false,
                dataType: "json",
                success: function(data) {
                    pathPosition = data.geometry.coordinates;  
                    
            //         var objConfig = {
            //           "ref": 'path1',
            //           "czmObject": {
            //               "xbsjType": "Path",
            //               "name": "路线1",
            //               "positions":pathPosition,
            //             //   "rotations":pathRotation,
            //               "show": false, // 显示路径
            //               "loop": false, // 是否为环线
            //               "showDirection": false, // 显示方向(默认为true) 
            //             //  "slices":20,
            //               "currentSpeed":20,
            //               "targetPicking":true,
            //               "alwaysAlongThePath":true,
            //               "playing": true, // 飞行
            //               // 是否循环播放 如果为false，则playing设置为true时，会从当前位置播放到最后一个关键点，并停止播放，此时playing属性会自动变成false。 若此属性为true时，播放到最后一个关键点以后，将自动重第一个关键点继续播放。
            //               "loopPlay": true
            //           }
            //         };
            //         var path = new XE.Obj.Path(earth);  
            //         path.xbsjFromJSON(objConfig);
            //         // XE.SceneTree.Leaf是场景树的叶子节点类
            //         earth.sceneTree.root.children.push(new XE.SceneTree.Leaf(path));  
            //         _this._path1 = path;
                                 
                }
            });
            // console.log(_this._path1);
            // _this.$axios({
            //     methods: "GET",
            //     url: pathUrl,
            //     dataType: "json"
            // }).then(response =>{
            //     // console.log(response);
            //     pathPosition = response.data.geometry.coordinates;  
            // })

            //加载数据
            earth.sceneTree.root = {
                "children": [
                    {
                        "czmObject": {
                            "xbsjType": "Terrain", 
                            "xbsjGuid": "7c427dfe-8c66-4555-85f0-291685fb6d59",
                            "name": "桃花源地形",
                            "xbsjTerrainProvider": {
                                "type": "XbsjCesiumTerrainProvider",
                                "XbsjEllipsoidTerrainProvider": {},
                                "XbsjCesiumTerrainProvider": {
                                    "url": "/api/assets/terrain/taohuayuan/terrain_tiles",
                                    "requestVertexNormals": true,
                                    "requestWaterMask": true
                                },
                                "GoogleEarthEnterpriseTerrainProvider": {}
                            }
                        }
                    },
                    {
                        "ref": 'tileset',
                        "czmObject": {
                            "name": '桃花源',
                            "xbsjType": "Tileset",
                            "xbsjGuid": "77a8aefc-873b-4573-b073-d43ad27c69fc",
                            "url": '/api/assets/taohuayuan/THY1_3dtile/tileset.json',
                            // "url": "assets/taohuayuan/Taohuayuan1_out_3DTile_UTM_N49/tileset.json",

                            "xbsjUseOriginTransform": false,
                            "skipLevelOfDetail": false,
                            // "xbsjPosition":[111.419581* Math.PI / 180,28.776353* Math.PI / 180, -52.54],
                            // "xbsjPosition":[111.419581* Math.PI / 180,28.776353* Math.PI / 180, 0],

                        },
                    },
                    {
                        "ref": 'tileset2',
                        "czmObject": {
                            "name": '桃花源',
                            "xbsjType": "Tileset",
                            // "xbsjGuid": "77a8aefc-873b-4573-b073-d43ad27c69fc",
                            "url": './api/assets/taohuayuan/THY2_3dtile/tileset.json',
                            "xbsjUseOriginTransform": false,
                            "skipLevelOfDetail": false,
                            // "xbsjPosition":[111.419581* Math.PI / 180,28.776353* Math.PI / 180, -52.54],
                            // "xbsjPosition":[111.419581* Math.PI / 180,28.776353* Math.PI / 180, 0],

                        },
                    }, 
                    {
                      "ref": 'path1',
                      "czmObject": {
                          "xbsjType": "Path",
                          "name": "路线1",
                          "positions":pathPosition,
                        //   "rotations":pathRotation,
                          "show": false, // 显示路径
                          "loop": false, // 是否为环线
                          "showDirection": false, // 显示方向(默认为true) 
                        //  "slices":20,
                          "currentSpeed":20,
                          "targetPicking":true,
                          "alwaysAlongThePath":true,
                          "playing": true, // 飞行
                          // 是否循环播放 如果为false，则playing设置为true时，会从当前位置播放到最后一个关键点，并停止播放，此时playing属性会自动变成false。 若此属性为true时，播放到最后一个关键点以后，将自动重第一个关键点继续播放。
                          "loopPlay": true
                      }
                    },
                    {
                    "czmObject": {
                        "xbsjType": "ClassificationPolygon",
                        "xbsjGuid": "96c9c62f-ae4d-4b03-a7cb-a5046ecd626d",
                        "name": "伏波楼",
                        "positions": [
                            1.944692934149655,
                            0.5023081886637675,
                            1.9446913947667048,
                            0.502305451976635,
                            1.9446958024641863,
                            0.5023035066777177,
                            1.9446973619795962,
                            0.5023062162471017
                        ],
                        "height": 71.34632645768764,
                        "extrudedHeight": 48.24929059344757,
                        "outline": {},
                        "color" :[0,0,0,0]
                    },
                    "ref": "single1",
                }
                ]
            };
            
            //加载poi点
            var poiPosition = null;
            var poiUrl = './myFile/data/poi.json'
            // $.ajax({
            //     type: "GET",
            //     url: poiUrl,
            //     async: false,
            //     dataType: "json",
            //     success: function(data) {
            //         poiPosition = data.poiPosition; 
            //         for (var i=0;i<poiPosition.length;i++){
            //             earth.sceneTree.root.children.push(poiPosition[i]);
            //         }         
            //     }
            // });
            _this.$axios({
                methods: 'GET',
                url: poiUrl,
                dataType: "json",                
            })
            .then(response =>{
                    console.log(response)
                    poiPosition = response.data.poiPosition; 
                    console.log(poiPosition)
                    for (var i=0;i<poiPosition.length;i++){
                        earth.sceneTree.root.children.push(poiPosition[i]);
                    }      
            })

        

            //添加bing底图
            {
                var viewer = earth.czm.viewer;
                var imageryProvider =  new Cesium.WebMapTileServiceImageryProvider({
                    url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=ebf64362215c081f8317203220f133eb",
                    layer: "tdtBasicLayer",
                    style: "default",
                    format: "image/jpeg",
                    tileMatrixSetID: "GoogleMapsCompatible",
                    show: false
                });
                viewer.imageryLayers.addImageryProvider(imageryProvider);
            }
            var tileset = earth.sceneTree.$refs.tileset.czmObject;
            var path1 = earth.sceneTree.$refs.path1.czmObject;
            var single1 = earth.sceneTree.$refs.single1.czmObject;//单体化

            //单体点击事件          
            single1.onclick = pickedObject => {
                single1.color = [1,0,0,0.4];
                this.showNavigation=false;
                this.showInfo = true;

                this.poiname = "伏波楼";
                this.poidescription = "伏波是古代帝王对颇有建树的将军封号。中国古代最著名的伏波将军是东汉光武帝时的马援。当时，马援南征时驻扎过桃源，并留下了许多脍炙人口的故事，一直流传到今天。为纪念这位军功卓著的将军，特兴建了这座巍峨的伏波楼和宽敞明亮的广场。"
                this.imgpath = './myFile/images/fbl.jpg'
            };

            // 测量api调用
            // disposers 用来收集资源销毁函数，并在析构时自动调用！
            {
                this._disposers = [];
                this._disposers.push(XE.MVVM.bind(this, 'measureMentType', earth.analyzation.measurement, 'type'));
                // tileset.flyTo();
                
                // this.getModelHeight(viewer,111.4227640,28.7799561)                          
            }

            //数据绑定
            // {
            //     //双向绑定的属性，如果一方发生变化，另一方同样会跟随变化
            //     this._cameraAttachedUnbind = XE.MVVM.bind(this, 'cameraAttached', this._carModel, 'cameraAttached');
            //     this._playingUnbind = XE.MVVM.bind(this, 'playing', this._path1, 'playing');
            //     this._currentDUnbind = XE.MVVM.bind(this, 'currentD', this._path1, 'currentD');
            //     this._currentSpeedUnbind = XE.MVVM.bind(this, 'currentSpeed', this._path1, 'currentSpeed');
            // }

            

            //测试用
            window.tileset = tileset;
            
            earth.camera.flyAround([111.419581 * Math.PI / 180,28.776353 * Math.PI / 180,0], 2000, [0, -Math.PI / 5, 0], 5, 3.14/50);
            
            this._earth = earth;
            this._tileset = tileset;
            this._path1 = path1;


            // this.changehello()
            // console.log(this.hello)
            // changehello(this.hello)
            // console.log(this.hello)
        },

        //创建车辆
        creatCarModel:function(){
            var _this = this;
            var earth = this._earth;
            var objConfig = {
                "name": 'model1',
                "xbsjType": "Model",
                // "url": "../assets/GroundVehicle/feiji.glb",
                // "url": "../assets/GroundVehicle/GroundVehicle.glb",
                "url": "./myFile/model/CesiumMilkTruck/CesiumMilkTruck.glb",
                // "url": "../assets/CesiumMan/Cesium_Man.glb",

                "minimumPixelSize": 128,
                "maximumScale": 5,
               
            };
            var model = new XE.Obj.Model(earth);  
            model.xbsjFromJSON(objConfig);
            // XE.SceneTree.Leaf是场景树的叶子节点类
            earth.sceneTree.root.children.push(new XE.SceneTree.Leaf(model));
            

            var  path1 = earth.sceneTree.$refs.path1.czmObject;
            // var path1 = _this._path1.czmObject;
            // path1.directionAlongThePath();
            path1.show = true;

            var p = new XE.Obj.Pin(earth);
            p.show = false;
            
            this._carshow1=XE.MVVM.watch(path1, 'currentPosition', position => {
                model.xbsjPosition = [...position];
                });
            this._carshow2=XE.MVVM.watch(path1, 'currentRotation', rotation => {
                    var cp = [...rotation];
                    model.xbsjRotation = [cp[0]-Math.PI*0.5, cp[1], cp[2]];
                
            });
            //双向绑定的属性，如果一方发生变化，另一方同样会跟随变化
            this._cameraAttachedUnbind = XE.MVVM.bind(this, 'cameraAttached', model, 'cameraAttached');
            this._playingUnbind = XE.MVVM.bind(this, 'playing', path1, 'playing');
            this._currentDUnbind = XE.MVVM.bind(this, 'currentD', path1, 'currentD');
            this._currentSpeedUnbind = XE.MVVM.bind(this, 'currentSpeed', path1, 'currentSpeed');


            this._carpin=p;
            this._carModel=model;
            var videobox=document.getElementById("video-box");
            //  <video src="http://www.earthsdk.com/v/last/XbsjEarthUI/assets/demo.mp4" controls autoplay style="width:200px"></video>
            this._carModel.onclick = pickedObject => {
                this.showInfo = false;
                this.showNavigation = true;

                 model.cameraAttached=true;
                 model.cameraAttachedOffsetPosition =[0,0,0]
                 model.cameraAttachedOffsetRotation=[0, -Math.PI/10,0] 
                };
               
            //    console.log(model)

        },

      //获取起点终点的差值位置数据
      getAlongPosition:function(start, end, count){
        var _this = this;
        
        var earth = _this._earth;

        var start = new Cesium.Cartesian3.fromDegrees(start[0],start[1],start[2]);
        var end = new Cesium.Cartesian3.fromDegrees(end[0],end[1],end[2]);

        var cartesians = new Array(count);
        for (var i = 0; i < count; i++) {
            var offset = i / (count - 1);
            var cartesian3=Cesium.Cartesian3.lerp(
                start,
                end,
                offset,
                new Cesium.Cartesian3()
                );
            var cartographic = new Cesium.Cartographic.fromCartesian(cartesian3)
            var lat=Cesium.Math.toDegrees(cartographic.latitude);
            var lng=Cesium.Math.toDegrees(cartographic.longitude);
            var alt=cartographic.height;
            cartesians[i] = [lat,lng,alt];
        }
        return cartesians;
         
      },
      
      //下车，停止播放且解除相机绑定
      getOffClick(){
        this.playing = !this.playing;
        this.cameraAttached = !this.cameraAttached;

      },
      
    
      //输入起始点弧度position，获取距离
      getDistance:function(satrt,end){
                var geodesic = new Cesium.EllipsoidGeodesic();
                geodesic.setEndPoints(satrt, end);
                var distance = geodesic.surfaceDistance;
              
                return distance;
      },

      //路过显示地标
      spotDisplay:function(){
            var earth = this._earth;
            var  path1 = earth.sceneTree.$refs.path1.czmObject;
            // var path1 = this._path1.czmObject;
            XE.MVVM.watch(path1, 'currentPosition', position => {

            var spots =[
            [1.9446489205742052,0.5023170890578174,69.40281306308577,"37649dca-8ceb-4686-880a-b418de8a8364"],
            [1.9445826301048745,0.5022044880454387,42.42206708214432,"8934fb25-1c8b-4bfc-aae8-681f5d7fece6"],
            ];
            spots.forEach(([p,c,s,guid]) => {
                var start={longitude:[...position][0], latitude:[...position][1], height: 0}
                var end={longitude:p, latitude:c, height: 0}
                var distance= this.getDistance(start,end)
               if(distance<100){
                var icon = earth.getObject(guid);
                // console.log(icon);
                icon.show = true;
               }
               else{
                //    console.log("超出距离")
                var icon = earth.getObject(guid);
                // console.log("icon");
                icon.show = false;
               }
               
           });
 
            });
      },

    //飞行环绕
    flyToAround:function(i){
        var latlngheight = [
            [111.4150208,28.7768517,41.81,"100001"],
            [111.4215946,28.7775722,57.03,"100002"],
            [111.4183951,28.7781003,54.04,"100003"],
            [111.4227640,28.7799561,67.88,"100004"],
        ];
        // var icon = this._earth.getObject(latlngheight[i][3]);
        // // console.log(icon);
        // icon.show = true;
        this._earth.camera.flyAround([latlngheight[i][0]* Math.PI / 180,latlngheight[i][1] * Math.PI / 180,latlngheight[i][2]], 100, [0, -Math.PI / 5, 0], 2, 3.14/50);
        },

    //视角返回小镇全局
    showTown:function(){
        this.cameraAttached = false;
        this.showInfo = false;
        this.showNavigation = false;
        this._earth.camera.flyAround([111.419581 * Math.PI / 180,28.776353 * Math.PI / 180,0], 2000, [0, -Math.PI / 5, 0], 5, 3.14/50);
    },

    //清除布局
    clearAllWindow:function(){
        this.showInfo= false;
        this.showNavigation=false;
    },
    //清除测量内容
    clearResults:function() {
        this._earth && this._earth.analyzation.measurement.clearResults();
    },
    //输入经纬度得到高程
    getModelHeight:function(viewer,lon,lat){
        var position = new Cesium.Cartographic.fromDegrees(lon, lat);
        console.log(viewer.scene.sampleHeightSupported)
        if(viewer.scene.sampleHeightSupported){
            var height = viewer.scene.sampleHeight(position);
            console.log(height);
        }
    },
    changehello(){
        this.hello = 2
    },

    //开启导航功能一系列监听
    startNavigationListen(){

    },

    //获取url参数
    getQueryVariable(variable)
    {   
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
    }

      },
      // 1.2 资源销毁
      beforeDestroy() {
        // vue程序销毁时，需要清理相关资源
        this._tileset = this._tileset && this._tileset.destroy();
        this._earth = this._earth && this._earth.destroy();
        this._carModel = this._carModel && this._carModel.destroy();
        this._carpin = this._carpin && this._carpin.destroy();
        this._carshow1 = this._carshow1 && this._carshow1.destroy();
        this._carshow2 = this._carshow2 && this._carshow2.destroy();
        this._lableshow1 = this._lableshow1 && this._lableshow1.destroy();
        this._lableshow2 = this._lableshow2 && this._lableshow2.destroy();
        this._cameraAttachedUnbind = this._cameraAttachedUnbind && this._cameraAttachedUnbind.destroy();
        this._playingUnbind = this._playingUnbind && this._playingUnbind.destroy();
        this._currentDUnbind = this._currentDUnbind && this._currentDUnbind.destroy();
        this._currentSpeedUnbind = this._currentSpeedUnbind && this._currentSpeedUnbind();
        this._disposers.forEach(d => d());
        this._disposers.length = 0;
      }
};

export default ThyPart1;
</script>