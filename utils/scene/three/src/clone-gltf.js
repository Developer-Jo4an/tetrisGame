export function cloneGltf(gltfScene) {
  const scene = gltfScene.clone(true);
   scene.animations = gltfScene.animations.map(animationClip => animationClip.clone());

  const skinnedMeshes = {};

  scene.traverse(node => {
    if (node.isSkinnedMesh) {
      skinnedMeshes[node.name] = node;
    }
  });

  const cloneBones = {};
  const cloneSkinnedMeshes = {};

  scene.traverse(node => {
    if (node.isBone) {
      cloneBones[node.name] = node;
    }

    if (node.isSkinnedMesh) {
      cloneSkinnedMeshes[node.name] = node;
    }
  });

  for (let name in skinnedMeshes) {
    const skinnedMesh = skinnedMeshes[name];
    const skeleton = skinnedMesh.skeleton;
    const cloneSkinnedMesh = cloneSkinnedMeshes[name];

    const orderedCloneBones = [];

    for (let i = 0; i < skeleton.bones.length; ++i) {
      const cloneBone = cloneBones[skeleton.bones[i].name];
      orderedCloneBones.push(cloneBone);
    }

    const cloneSkeleton = new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses);

    cloneSkinnedMesh.bind(
      cloneSkeleton,
      cloneSkinnedMesh.matrixWorld);
  }

  return scene;
}
