import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pane } from "tweakpane";

// initialize pane
const pane = new Pane();

// initialize the scene
const scene = new THREE.Scene();

//add textures
const textureLoader = new THREE.TextureLoader()
const sunTexture = textureLoader.load('/textures/2k_sun.jpg')
const mercuryTexture = textureLoader.load("/textures/2k_mercury.jpg");
const venusTexture = textureLoader.load("/textures/2k_venus_surface.jpg");
const earthTexture = textureLoader.load("/textures/2k_earth_daymap.jpg");
const marsTexture = textureLoader.load("/textures/2k_mars.jpg");
const moonTexture = textureLoader.load("/textures/2k_moon.jpg");

// add materials
const sunMaterial = new THREE.MeshBasicMaterial({
  map: sunTexture,
});
const mercuryMaterial = new THREE.MeshStandardMaterial({
  map: mercuryTexture,
});
const venusMaterial = new THREE.MeshStandardMaterial({
  map: venusTexture,
});
const earthMaterial = new THREE.MeshStandardMaterial({
  map: earthTexture,
});
const marsMaterial = new THREE.MeshStandardMaterial({
  map: marsTexture,
});
const moonMaterial = new THREE.MeshStandardMaterial({
  map: moonTexture,
});

//add background
const cubeTextureLoader = new THREE.CubeTextureLoader()
const backgroundTexture = cubeTextureLoader.load([
  '/textures/cubeMap/px.png',
  '/textures/cubeMap/nx.png',
  '/textures/cubeMap/py.png',
  '/textures/cubeMap/ny.png',
  '/textures/cubeMap/pz.png',
  '/textures/cubeMap/nz.png',
])
scene.background = backgroundTexture

// add stuff here
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)

const sun = new THREE.Mesh(
  sphereGeometry,
  sunMaterial
)

sun.scale.setScalar(5.1)
scene.add(sun)

const planets = [
  {
    name: "Mercury",
    radius: 0.5,
    distance: 10,
    speed: 0.01,
    material: mercuryMaterial,
    moons: [],
  },
  {
    name: "Venus",
    radius: 0.8,
    distance: 15,
    speed: 0.007,
    material: venusMaterial,
    moons: [],
  },
  {
    name: "Earth",
    radius: 1,
    distance: 20,
    speed: 0.005,
    material: earthMaterial,
    moons: [
      {
        name: "Moon",
        radius: 0.3,
        distance: 3,
        speed: 0.015,
      },
    ],
  },
  {
    name: "Mars",
    radius: 0.7,
    distance: 25,
    speed: 0.003,
    material: marsMaterial,
    moons: [
      {
        name: "Phobos",
        radius: 0.1,
        distance: 2,
        speed: 0.02,
      },
      {
        name: "Deimos",
        radius: 0.2,
        distance: 3,
        speed: 0.015,
        color: 0xffffff,
      },
    ],
  },
];

const planetMeshes = planets.map((eachPlanet) => {
  //create the mesh
  const planetMesh = new THREE.Mesh(
    sphereGeometry,
    eachPlanet.material
  )
  planetMesh.scale.setScalar(eachPlanet.radius)
  planetMesh.position.x = eachPlanet.distance

  //add it to the scene
  scene.add(planetMesh)

  //loop through each moon and add moon to its parent planet
  eachPlanet.moons.forEach((moon) => {
    const moonMesh = new THREE.Mesh(
      sphereGeometry,
      moonMaterial
    )
    moonMesh.scale.setScalar(moon.radius)
    moonMesh.position.x = moon.distance
    planetMesh.add(moonMesh)
  })
  
  return planetMesh;
})

//add lighting
const pointLight = new THREE.PointLight(
  0xffffff,
  2
)
const ambientLight = new THREE.AmbientLight(
  0xffffff,
  0.3
)
scene.add(pointLight, ambientLight)

// initialize the camera
const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  400
);
camera.position.z = 100;
camera.position.y = 5;

// initialize the renderer
const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// add controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 200;
controls.minDistance = 20

// add resize listener
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// render loop
const renderloop = () => {
  //rotation animation
  planetMeshes.forEach((eachPlanet, index)=> {
    eachPlanet.rotation.y += planets[index].speed
    eachPlanet.position.x = Math.sin(eachPlanet.rotation.y) * planets[index].distance
    eachPlanet.position.z = Math.cos(eachPlanet.rotation.y) * planets[index].distance
    eachPlanet.children.forEach((moon, moonIndex) => {
      moon.rotation.y += planets[index].moons[moonIndex].speed
      moon.position.x = Math.sin(moon.rotation.y) * planets[index].moons[moonIndex].distance
      moon.position.z = Math.cos(moon.rotation.y) * planets[index].moons[moonIndex].distance
    })
  })

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(renderloop);
};


renderloop();
