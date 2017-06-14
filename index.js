window.onload = function(){
    var camera      //相机
        , scene     //场景
        , renderer  //渲染器
    ;
    var geometry, material, mesh;
    var target = new THREE.Vector3();

    var lon = 90, lat = 0;
    var phi = 0, theta = 0;

    var touchX, touchY;

    var lock = false;

    var onOrientLon = 0, onOrientLat = 0;
    var oldLon = 90, oldLat = 0;

    init();
    animate();

    function init() {
        camera = new THREE.PerspectiveCamera(
            75,                                         //相机视角的夹角
            window.innerWidth / window.innerHeight,     //相机画幅比
            1,                                          //最近焦距
            1000                                        //最远焦距
        );

        scene = new THREE.Scene();

        var sides = [
            {
                position: [ -512, 0, 0 ],//位置
                rotation: [ 0, Math.PI / 2, 0 ]//角度
            },
            {
                position: [ 512, 0, 0 ],
                rotation: [ 0, -Math.PI / 2, 0 ]
            },
            {
                position: [ 0,  512, 0 ],
                rotation: [ Math.PI / 2, 0, Math.PI ]
            },
            {
                position: [ 0, -512, 0 ],
                rotation: [ - Math.PI / 2, 0, Math.PI ]
            },
            {
                position: [ 0, 0,  512 ],
                rotation: [ 0, Math.PI, 0 ]
            },
            {
                position: [ 0, 0, -512 ],
                rotation: [ 0, 0, 0 ]
            }
        ];

        /**
         * 根据六个面的信息，new出六个对象放入场景中
         */
        for ( var i = 0; i < sides.length; i ++ ) {
            var side = sides[ i ];

            var element = document.getElementById("surface_"+i);
            element.width = 514; // 2 pixels extra to close the gap.多余的2像素用于闭合正方体

            var object = new THREE.CSS3DObject( element );
            object.position.fromArray( side.position );
            object.rotation.fromArray( side.rotation );
            scene.add( object );
        }

        renderer = new THREE.CSS3DRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        document.addEventListener( 'mousedown', onDocumentMouseDown, false );
        document.addEventListener( 'wheel', onDocumentMouseWheel, false );
        document.addEventListener( 'touchstart', onDocumentTouchStart, false );
        document.addEventListener( 'touchmove', onDocumentTouchMove, false );
        document.addEventListener( 'touchend', onDocumentTouchEnd, false );
        window.addEventListener( 'resize', onWindowResize, false );
        //设备物理方向
        //window.addEventListener('deviceorientation', handleOrientation, false);
        //设备重力加速度
        //window.addEventListener('devicemotion', handleMotion, false);
    }

    function animate() {
        requestAnimationFrame( animate );

        //lon +=  0.1;
        lat = Math.max( - 85, Math.min( 85, lat ) );
        phi = THREE.Math.degToRad( 90 - lat );
        theta = THREE.Math.degToRad( lon );

        target.x = Math.sin( phi ) * Math.cos( theta );
        target.y = Math.cos( phi );
        target.z = Math.sin( phi ) * Math.sin( theta );

        camera.lookAt( target );
        /**
         * 通过传入的scene和camera
         * 获取其中object在创建时候传入的element信息
         * 以及后面定义的包括位置，角度等信息
         * 根据场景中的obj创建dom元素
         * 插入render本身自己创建的场景div中
         * 达到渲染场景的效果
         */
        renderer.render( scene, camera );
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function onDocumentMouseDown( event ) {
        event.preventDefault();
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
        document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    }

    function onDocumentMouseMove( event ) {
        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        lon -= movementX * 0.1;
        lat += movementY * 0.1;
    }

    function onDocumentMouseUp( event ) {
        document.removeEventListener( 'mousemove', onDocumentMouseMove );
        document.removeEventListener( 'mouseup', onDocumentMouseUp );
    }

    function onDocumentMouseWheel( event ) {
        camera.fov += event.deltaY * 0.05;
        camera.updateProjectionMatrix();
    }

    function onDocumentTouchStart( event ) {
        event.preventDefault();
        var touch = event.touches[ 0 ];
        touchX = touch.screenX;
        touchY = touch.screenY;
        //触摸时锁定陀螺仪
        lock = true;
    }
    function onDocumentTouchMove( event ) {
        event.preventDefault();
        var touch = event.touches[ 0 ];
        lon -= ( touch.screenX - touchX ) * 0.1;
        lat += ( touch.screenY - touchY ) * 0.1;
        touchX = touch.screenX;
        touchY = touch.screenY;
        //Record
        //var text = 'touchX: ' + (touch.screenX-touchX) + '\ntouchY: ' + (touch.screenY-touchY) + '\nlon: ' + lon + '\nlat: ' + lat;
        //var info = document.getElementsByClassName('touchInfo')[0];
        //info.innerText = text;
    }
    function onDocumentTouchEnd(event){
        event.preventDefault();
        //记录触摸移动后的位置
        oldLon = lon;
        oldLat = lat;
        lock = false;
    }

    var orienter = new Orienter();
    var lastUpdate = 0,
        x,
        y,
        z,
        lastX,
        lastY,
        lastZ
        ;
    function handleOrientation( e ) {
        e.preventDefault();

        //var curTime = new Date().getTime();
        //if(curTime - lastUpdate > 0){
        //    lastUpdate = curTime;
        //    x = Math.round(e.beta);
        //    y = Math.round(e.gamma);
        //    z = Math.round(e.alpha);
        //
        //    //处理角度问题
        //    if(y == 0){
        //        lastY = 'c';
        //    }
        //    if(y == 90 && lastY != 'r'){
        //        lastY = 'l';
        //    }
        //    if(y == -90 && lastY != 'l'){
        //        lastY = 'r';
        //    }
        //    //Y轴转动
        //    if(y != 90 || y != -90){
        //        lon = -y;
        //    }
        //    //Y轴超过90°或-90°继续旋转
        //    if(y < 0 && lastY == 'l'){
        //        lon = (-91) + (-(y + 90));
        //        //x = x + 180;
        //    }
        //    if(y > 0 && lastY == 'r'){
        //        lon = 91 + (90 - y);
        //        //x = x - 180;
        //    }
        //    //X轴转动
        //    //lat = x - 90;
        //}
        //console.log('absolute: ' + e.absolute);
        //console.log('alpha: ' + e.alpha);           //z轴上的旋转角度，0~360
        //console.log('beta: ' + e.beta);             //x轴上的旋转角度，-180~180
        //console.log('gamma: ' + e.gamma);           //y轴上的旋转角度，-90~90
        //lon = (y * 0.05);
        //lat = (x * 0.05);
        //phi += z * 0.05;

        //Record
        //var text = 'x: ' + x + '\ny: ' + y + '\nlon: ' + lon + '\nlat: ' + lat;
        //var info = document.getElementsByClassName('rorateInfo')[0];
        //info.innerText = text;
    }
    function handleMotion(event){
        //捕捉重力加速度
        var acceleration = event.accelerationIncludingGravity;

        //打印加速数据
        var rawAcceleration = "[" +  acceleration.x + ", " +Math.round(acceleration.y) + ", " + Math.round(acceleration.z) + "]";
        var info = document.getElementsByClassName('touchInfo')[0];
        info.innerText = rawAcceleration;
    }

    orienter.onOrient = function(obj){
        console.log(JSON.stringify(this));

        if(!lock){
            //lon = -obj.lon;
            //lat = obj.lat;
            lon = oldLon - (obj.lon - onOrientLon);
            lat = oldLat + (obj.lat - onOrientLat);
        }else{
            //记录当前陀螺仪位置
            onOrientLon = obj.lon;
            onOrientLat = obj.lat;
        }
        //Record
        //var text = 'lon: ' + obj.lon + '\nlat: ' + obj.lat;
        //var info = document.getElementsByClassName('rorateInfo')[0];
        //info.innerText = text;
    };
    orienter.init();
};