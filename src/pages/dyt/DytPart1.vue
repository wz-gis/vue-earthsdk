<template>
            <div style="width: 100%; height: 100%">
             <div id="video-box">
                  <span id="close-video-x">X</span>
                      <div id="videoshow">
                          <!-- <-- <video src="http://www.earthsdk.com/v/last/XbsjEarthUI/assets/demo.mp4"  autoplay loop style="width:200px"></video> --> -->
                      </div>
                  <!-- </video> -->
              </div>
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

                <div id="funBox" v-if="showNavigation" class="box" style="position: absolute; right: 18px; top: 18px; color: white; background: rgba(0, 0, 0, 0.6); padding: 20px; border-radius: 25px;min-width:350px; font-size:24px; font-family: 宋体;">
                        <div class="defultbtn" :class="{'btnon':playing}" @click = getOffClick>停车</div>
                        <span>当前速度: {{ currentSpeed }}m/s</span><br/>
                        <span >当前位置：{{currentD | numFilter}}米</span>
                        <span><input type="range" min="0" max="100" step="1" v-model.number="currentSpeed"></span><br/>
                        <div id="videoshow">
                            <video src="http://www.earthsdk.com/v/last/XbsjEarthUI/assets/demo.mp4"  autoplay loop style="width:200px"></video>
                        </div>
                        
                </div>
          </div> 
</template>

<script>
    // // 设置token
    // var myAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MTdlYjg0OS01YWNhLTRjN2MtYTE5ZS0wMmE1Y2NmYjA4OWIiLCJpZCI6MzE4MTcsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTYwMTAzMTZ9.P7IJONY_5JeOt5XkylhWO0hoZq6MheMTd8sG6qZZW6k"
    // Cesium.Ion.defaultAccessToken = myAccessToken;
// 1 创建Earth的vue组件
var DytPart1 = {
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
          crossCoord:undefined,

          playing: true,//控制是否播放路径
          cameraAttached: false,//控制相机绑定小车
          _cameraAttachedUnbind:undefined,
          _playingUnbind:undefined,
          currentD:0,
          currentSpeed: 0,
          showNavigation:false,

          
        };
      },
    created(){
      let _this=this;
          window.getOffClick=_this.getOffClick;
      },
  // 1.1 资源创建
     mounted() {
        var _this = this;

        var searchBtn,searchInput,nowCheckNode,treeDataBox,closeX,closevideox,videobox;
        searchInput = document.getElementById('search-input');
        searchBtn = document.getElementById('search-btn');
        treeDataBox = document.getElementById('tree-data-box');
        closeX = document.getElementById('close-x');
        closevideox =document.getElementById('close-video-x');
        videobox=document.getElementById("video-box");

        

        //设置前端交互按钮
        layui.use(['tree', 'util'], function(){
            var tree = layui.tree,layer = layui.layer,util = layui.util;
            var data1 = [{
              title: '陕西',
              id: 1,
              children: [{
                title: '西安',
                id: 1000,
                children: [{
                    title: '路线1',
                    id: 10001
                  },{
                    title: '路线2',
                    id: 10002
                  }]
              }]
            }]

            tree.render({
                elem: '#test1', //默认是点击节点可进行收缩
                data: data1,
                accordion: true ,
                click: function(obj){
                    nowCheckNode = obj.data;
                    if(obj.data.id==10001){
                        _this.creatCarModel();
                        _this.spotDisplay();
                    }
                    if(obj.data.id==10002){
                        _this.creatFltModel()
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
        closevideox.onclick = function(){
            videobox.style.display = 'none';
        }
        _this.startup();

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

            //路径点直接使用弧度
            var tilesetHeight = 425.86;
            var pathPosition = [
                [
                    1.9016738823862547,
                    0.597279010476069,
                    420.5038147600739-tilesetHeight
                ],
                [
                    1.9016742808702323,
                    0.5972714423992059,
                    421.29583039800707-tilesetHeight
                ],
                [
                    1.901674381787162,
                    0.597269803725629,
                    421.3070298191777-tilesetHeight
                ],
                [
                    1.9016763651467896,
                    0.5972696548459383,
                    421.3831343082533-tilesetHeight
                ],
                [
                    1.9016849815229975,
                    0.5972694703345858,
                    421.56137669998776-tilesetHeight
                ],
                [
                    1.901695870532358,
                    0.5972694048099387,
                    425.6932523983086-tilesetHeight
                ],
                [
                    1.9017058277925347,
                    0.5972693817269858,
                    426.02471073330287-tilesetHeight
                ],
                [
                    1.901719005621341,
                    0.5972696733137016,
                    423.80200837945523-tilesetHeight
                ],
                [
                    1.9017270525369878,
                    0.5972696301479196,
                    424.34954577290983-tilesetHeight
                ]
            ];
            var pathRotation = [
                [
                    3.10396711528497,
                    0.02907847355268589,
                    0.00011730200487569675
                ],
                [
                    3.349342758324286,
                    -0.0001757113265361543,
                    6.282541851180174
                ],
                [
                    2.2444925372671207,
                    0.006197767209903393,
                    0.002438019108894629
                ],
                [
                    1.6447416327903985,
                    0.00359732639271515,
                    0.0031110927220989737
                ],
                [
                    1.5860630286515036,
                    0.0549331690407906,
                    0.00311456862977888
                ],
                [
                    1.5790839333760243,
                    0.032770732686836945,
                    0.0031178552047474994
                ],
                [
                    7.832203607899954,
                    -0.025982756745711155,
                    0.0031178447013360255
                ],
                [
                    7.847906889467078,
                    -0.004089980495726175,
                    0.003119554254451984
                ],
                [
                    1.5897769014810423,
                    0.029840930868278326,
                    0.0031176872501310626
                ]
            ];
            earth.sceneTree.root = {
                "children": [
                    {
                        "czmObject": {
                            "xbsjType": "Imagery",
                            "xbsjGuid": "7e67f02c-22aa-4e6b-8e2c-d76e98876c56",
                            "name": "百度影像",
                            "xbsjImageryProvider": {
                                "XbsjImageryProvider": {
                                    "url": "http://shangetu1.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46",
                                    "srcCoordType": "BD09",
                                    "dstCoordType": "WGS84",
                                    "maximumLevel": 21,
                                },
                                "UrlTemplateImageryProvider": {},
                                "WebMapTileServiceImageryProvider": {},
                                "createTileMapServiceImageryProvider": {}
                            }
                        }
                    },
                    {
                        "ref": 'tileset',
                        "czmObject": {
                            "name": '大雁塔',
                            "xbsjType": "Tileset",
                            "url": '/api/assets/dayanta/tileset.json',
                            "xbsjUseOriginTransform": false,
                            "skipLevelOfDetail": false,
                            "xbsjPosition":[108.95924* Math.PI / 180,34.21890* Math.PI / 180, 0],
                        },
                    }, 

                    {
                      "ref": 'path1',
                      "czmObject": {
                          "xbsjType": "Path",
                          "name": "路线1",
                          "positions":pathPosition,
                          "rotations":pathRotation,
                          "show": false, // 显示路径
                          "loop": false, // 是否为环线
                          "showDirection": false, // 显示方向(默认为true) 
                        //  "slices":20,
                          "currentSpeed":20,
                          "targetPicking":true,
                          "alwaysAlongThePath":true,
                          "playing": true, // 飞行
                          // 是否循环播放
                          // 如果为false，则playing设置为true时，会从当前位置播放到最后一个关键点，并停止播放，此时playing属性会自动变成false。 若此属性为true时，播放到最后一个关键点以后，将自动重第一个关键点继续播放。
                          "loopPlay": true
                      }
                    },
                    {
                        "ref": 'path2',
                        "czmObject": {
                            "xbsjType": "Path",
                            "positions": [
                                [
                                    1.9016746584889261,
                                    0.5972140444354529,
                                    115.3422462577171
                                ],
                                [
                                    1.9017267341518718,
                                    0.5972133503414322,
                                    95.1137699152557
                                ],
                                [
                                    1.9017257997179968,
                                    0.5972736030398242,
                                    103.3876170108886
                                ],
                                [
                                    1.9016747349263112,
                                    0.5972754003153069,
                                    96.087861389408
                                ]
                            ],
                            "rotations": [
                                [
                                    6.868275118748086,
                                    -0.2742692911775144,
                                    0.0016584301080495578
                                ],
                                [
                                    5.703866308921896,
                                    -0.19385405041989068,
                                    6.281509509407803
                                ],
                                [
                                    3.8005195675504133,
                                    -0.2597408290639396,
                                    6.281339310424716
                                ],
                                [
                                    2.501667530825695,
                                    -0.2173829253288364,
                                    0.001819016773946025
                                ]
                            ],
                          "show": false, // 显示路径
                          "loop": true, // 是否为环线
                          "showDirection": false, // 显示方向(默认为true) 
                          //  "slices":20,
                          "currentSpeed":20,
                          "targetPicking":true,
                          "alwaysAlongThePath":false,
                          "playing": true, // 飞行
                          // 是否循环播放
                          // 如果为false，则playing设置为true时，会从当前位置播放到最后一个关键点，并停止播放，此时playing属性会自动变成false。 若此属性为true时，播放到最后一个关键点以后，将自动重第一个关键点继续播放。
                          "loopPlay": true
                        }
                    },
                    {
                    "czmObject": {
                        "xbsjType": "Pin",
                        "xbsjGuid": "0d928412-0d8f-4774-99ea-67eca99007e5",
                        "name": "图标点",
                        "show":false,
                        "position": [
                            1.9017008792329466,
                            0.5972636795582991,
                            436.2855174888637-tilesetHeight
                        ],
                        "pinBuilder": {
                            "extText": "玄奘三藏院",
                            "makiIcon": "garden",
                            "size": 65,
                            "fillColor": [
                                0,
                                1,
                                0.7686274509803922,
                                1
                            ],
                            "outlineColor": [
                                0,
                                0.30196078431372547,
                                1,
                                1
                            ]
                        },
                        "far": 1073741824
                    }
                }

                ]
            };
            var tileset = earth.sceneTree.$refs.tileset.czmObject;
            
            this._earth = earth
            this._tileset = tileset;

            
            //测试用
            window.tileset = tileset;
            
            earth.camera.flyAround([108.95924 * Math.PI / 180, 34.21890 * Math.PI / 180,0], 1000, [0, -Math.PI / 5, 0], 0, 3.14/50);
            this.getModelHeight();
        },

        //创建车辆
        creatCarModel:function(){
            var _this = this;
            var earth = this._earth;
            var objConfig = {
                "name": 'model1',
                "xbsjType": "Model",
                // "url": "../assets/GroundVehicle/feiji.glb",
                "url": "./myFile/model/GroundVehicle/GroundVehicle.glb",
                // "url": "assets/gongjiao.glb",
                "minimumPixelSize": 128,
                "maximumScale": 5,
               
            };
            var model = new XE.Obj.Model(earth);  
            model.xbsjFromJSON(objConfig);
            // XE.SceneTree.Leaf是场景树的叶子节点类
            earth.sceneTree.root.children.push(new XE.SceneTree.Leaf(model));
            

            var  path1 = earth.sceneTree.$refs.path1.czmObject;
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
            this._carModel.onclick = pickedObject => {
                //   videobox.style.display = 'block';
                //   var videoshow=  document.getElementById("videoshow")
                //   videoshow.innerHTML="<video src='http://www.earthsdk.com/v/last/XbsjEarthUI/assets/demo.mp4' autoplay loop style='width:200px'></video>"
                //   var funbox=  document.getElementById("funBox")
                //   var stopCar=document.createElement("div");
                //   stopCar.innerHTML='</br><div class="defultbtn" :class="{"btnon":playing}" onclick="getOffClick()"> 停车 </div> ';
                //   funbox.appendChild(stopCar);
                 this.showNavigation = true
                 model.cameraAttached=true;
                 model.cameraAttachedOffsetPosition =[0,0,0]
                 model.cameraAttachedOffsetRotation=[0, -Math.PI/10,0] 
                };
               
               console.log(model)

        },
        //创建飞机
        creatFltModel:function(){
            var _this = this;
            var earth = this._earth;
            var objConfig = {
                "name": 'model2',
                "xbsjType": "Model",
                "url": "./myFile/model/CesiumBalloon.glb",
                // "url": "../assets/GroundVehicle/GroundVehicle.glb",
                "minimumPixelSize": 128,
                "maximumScale": 5,
               
            };
            var model2 = new XE.Obj.Model(earth);  
            model2.xbsjFromJSON(objConfig);
            // XE.SceneTree.Leaf是场景树的叶子节点类
            earth.sceneTree.root.children.push(new XE.SceneTree.Leaf(model2));
            

            var  path2 = earth.sceneTree.$refs.path2.czmObject;
            // path2.directionAlongThePath();
            path2.show = true;

            var p = new XE.Obj.Pin(earth);
            p.show = false;

            _lableshow2=XE.MVVM.track(p, 'position', path2, 'currentPosition');
           
            _carshow1=XE.MVVM.watch(path2, 'currentPosition', position => {
                model2.xbsjPosition = [...position];       
                });
            _carshow2=XE.MVVM.watch(path2, 'currentRotation', rotation => {
                    var cp = [...rotation];
                    model2.xbsjRotation = [cp[0]-Math.PI*0.5, cp[1], cp[2]];
                
            });
                      // XE.MVVM.bind(model2, 'cameraAttached', path2, 'cameraAttached');
            _carpin=p;
            _carModel=model2;
            _carModel.onclick = pickedObject => {
                 model2.cameraAttached=true;//相机绑定后的位置姿态偏移
                 model2.cameraAttachedOffsetPosition =[0,0,0]
                 model2.cameraAttachedOffsetRotation=[0, -Math.PI/10,0] 
                };
               
               console.log(model2)

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

      //在范围内显示图标
      spotDisplay:function(){

            var earth = this._earth;
            var  path1 = earth.sceneTree.$refs.path1.czmObject;
            XE.MVVM.watch(path1, 'currentPosition', position => {

            var spots =[[ 1.9017009441617545, 0.5972634362995854, 437.12693293692195,
                            "0d928412-0d8f-4774-99ea-67eca99007e5"]] ;
            spots.forEach(([p,c,s,guid]) => {
                var start={longitude:[...position][0], latitude:[...position][1], height: 0}
                var end={longitude:p, latitude:c, height: 0}
                var distance= this.getDistance(start,end)
               if(distance<50){
                var icon = earth.getObject(guid);
                icon.show = true;
               }
               else{
                //    console.log("超出距离")
                var icon = earth.getObject(guid);
                // console.log(icon);
                icon.show = false;
               }
               
           });
 
            });
      },

      getModelHeight:function(){
        var viewer = this._earth.czm.viewer;
        var position = new Cesium.Cartographic.fromDegrees(108.95924,34.21890);
        console.log(position)
        var height = viewer.scene.sampleHeight(position);
        console.log(height);
      }


      },      
      // 1.2 资源销毁
      beforeDestroy() {
        // vue程序销毁时，需要清理相关资源
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
      }
};

export default DytPart1;
</script>