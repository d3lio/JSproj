
document.addEventListener('DOMContentLoaded', function() {

var hostname = document.getElementById('host-name');
hostname.value = window.location.hostname;


    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xffffff, 0, 600);

    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var clock = new Clock();
    var controls = new Controls(camera, clock);
    controls.DimensionConstants = Controls.DimensionConstants;
    controls.init(scene);


    var plane = new THREE.PlaneGeometry(1000, 1000);
    plane.rotateX(-MathConstants.PI_2);
    plane.translate(0, -controls.DimensionConstants.CAMERA_HEIGHT, 0);
    scene.add(
        new THREE.Mesh(
            plane,
            new THREE.MeshBasicMaterial({
                color: 0x3355aa
            })
        )
    );

    var lab = new Labyrinth();
    //lab.init(scene);


    var client = null;

    var loader = new THREE.FontLoader();
    loader.load('/js/fonts/helvetiker_regular.typeface.js', function(font) {
        client = new Client(scene, controls, lab, font, render);

        pointerLock(controls, client, clock);

        setInterval(function statusReport() {
            if (controls.enabled) {
                client.report();
            }
        }, 20);
    });


    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize, false);


    clock.start();


    function render() {
        requestAnimationFrame(render);

        controls.calculate(lab);

        renderer.render(scene, camera);
    };
});