import { useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export const Env = ({ background = "#efe7da", fog = null as null | [string, number, number] }) => {
  const { gl, scene } = useThree();
  const env = useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const t = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    return t;
  }, [gl]);
  useLayoutEffect(() => {
    gl.toneMapping = THREE.NoToneMapping; // tone mapping happens in the composer
    gl.shadowMap.type = THREE.VSMShadowMap;
    scene.environment = env;
    scene.environmentIntensity = 0.42;
    scene.background = new THREE.Color(background);
    scene.fog = fog ? new THREE.Fog(fog[0], fog[1], fog[2]) : null;
  }, [env, scene, gl, background, fog]);
  return null;
};

export const CameraRig = ({ pos, target, fov = 32 }: { pos: [number, number, number]; target: [number, number, number]; fov?: number }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...pos);
    (camera as THREE.PerspectiveCamera).fov = fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    camera.lookAt(...target);
  });
  return null;
};

export const Sun = ({ target = [0, 0, 0] as [number, number, number], size = 14, intensity = 2.4 }) => {
  const light = useMemo(() => {
    const l = new THREE.DirectionalLight("#fff4e0", intensity);
    l.castShadow = true;
    l.shadow.mapSize.set(2048, 2048);
    l.shadow.bias = -0.0006;
    l.shadow.normalBias = 0.03;
    l.shadow.radius = 9;
    l.shadow.blurSamples = 20;
    return l;
  }, [intensity]);
  useLayoutEffect(() => {
    light.position.set(target[0] + 10, target[1] + 12, target[2] + 6);
    light.target.position.set(...target);
    light.target.updateMatrixWorld();
    const cam = light.shadow.camera as THREE.OrthographicCamera;
    cam.left = -size;
    cam.right = size;
    cam.top = size;
    cam.bottom = -size;
    cam.near = 0.5;
    cam.far = 60;
    cam.updateProjectionMatrix();
  });
  return (
    <>
      <primitive object={light} />
      <primitive object={light.target} />
      <hemisphereLight args={["#ffffff", "#b8a88c", 0.5]} />
    </>
  );
};
