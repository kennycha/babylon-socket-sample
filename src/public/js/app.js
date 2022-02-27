const targetDiv = document.querySelector('#targetDiv')
const updateDiv = document.querySelector('#updateDiv')
const renderingCanvas = document.querySelector('#renderingCanvas')

let myName
let myRoomName
let currentTransformNode
let controlTargets = []

// Socket Code
const socket = io()
socket.on('welcome', (userName, roomName) => {
  updateDiv.innerText = `${userName} joined ${roomName} room`
})
socket.on('transform', (userName, targetId, property, value, updatedAt) => {
  if (myName !== userName) {
    updateDiv.innerText = `${userName} updated at ${updatedAt}`
    const currentTarget = controlTargets.find((target) => target.id === targetId)
    switch (property) {
      case 'position':
        currentTarget.position = BABYLON.Vector3.FromArray(value)
        break
      case 'rotation':
        currentTarget.rotationQuaternion = BABYLON.Quaternion.FromArray(value)
        break
      case 'scale':
        currentTarget.scaling = BABYLON.Vector3.FromArray(value)
        break
      default:
        break
    }
  }
})

// Babylon Code
const DEFAULT_SKELETON_VIEWER_OPTION = {
  pauseAnimations: false,
  returnToRest: false,
  computeBonesUsingShaders: true,
  useAllBones: true,
  displayMode: BABYLON.SkeletonViewer.DISPLAY_SPHERE_AND_SPURS,
  displayOptions: {
    sphereBaseSize: 0.01,
    sphereScaleUnit: 15,
    sphereFactor: 0.9,
    midStep: 0.25,
    midStepFactor: 0.05,
  },
};

let gizmoMode = 'position'
let gizmoCoordinate = 'local'

const handleSceneReady = async (scene) => {
  scene.useRightHandedSystem = true
  
  const camera = new BABYLON.ArcRotateCamera('camera', 0, 6, 10, BABYLON.Vector3.Zero(), scene)
  camera.setPosition(new BABYLON.Vector3(0, 6, 10))
  camera.attachControl(renderingCanvas, false);
  camera.allowUpsideDown = false;
  camera.minZ = 0.1;
  camera.inertia = 0.5;
  camera.wheelPrecision = 50;
  camera.wheelDeltaPercentage = 0.05;
  camera.lowerRadiusLimit = 0.1;
  camera.upperRadiusLimit = 50;
  camera.pinchPrecision = 50;
  camera.panningAxis = new BABYLON.Vector3(1, 1, 0);
  camera.panningInertia = 0.5;
  camera.panningDistanceLimit = 50;
  
  const dirLight = new BABYLON.DirectionalLight('dirLight', new BABYLON.Vector3(0, 1, 0), scene)
  dirLight.position = new BABYLON.Vector3(0, 10, 10)
  dirLight.intensity = 0.1
  const hemiLight = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(0, 1, 1), scene)
  hemiLight.intensity = 0.9

  const gizmoManager = new BABYLON.GizmoManager(scene)
  gizmoManager.usePointerToAttachGizmos = false
  gizmoManager.positionGizmoEnabled = true
  
  gizmoManager.gizmos.positionGizmo.xGizmo.dragBehavior.onDragEndObservable.add(() => {
    const { x, y, z } = currentTransformNode.position
    socket.emit('transform', myRoomName, currentTransformNode.id, 'position', [x, y, z])
  })
  gizmoManager.gizmos.positionGizmo.yGizmo.dragBehavior.onDragEndObservable.add(() => {
    const { x, y, z } = currentTransformNode.position
    socket.emit('transform', myRoomName, currentTransformNode.id, 'position', [x, y, z])
  })
  gizmoManager.gizmos.positionGizmo.zGizmo.dragBehavior.onDragEndObservable.add(() => {
    const { x, y, z } = currentTransformNode.position
    socket.emit('transform', myRoomName, currentTransformNode.id, 'position', [x, y, z])
  })

  gizmoManager.positionGizmoEnabled = false
  gizmoManager.rotationGizmoEnabled = true

  gizmoManager.gizmos.rotationGizmo.xGizmo.dragBehavior.onDragEndObservable.add(() => {
    const { x, y, z, w } = currentTransformNode.rotationQuaternion
    socket.emit('transform', myRoomName, currentTransformNode.id, 'rotation', [x, y, z, w])
  })
  gizmoManager.gizmos.rotationGizmo.yGizmo.dragBehavior.onDragEndObservable.add(() => {
    const { x, y, z, w } = currentTransformNode.rotationQuaternion
    socket.emit('transform', myRoomName, currentTransformNode.id, 'rotation', [x, y, z, w])
  })
  gizmoManager.gizmos.rotationGizmo.zGizmo.dragBehavior.onDragEndObservable.add(() => {
    const { x, y, z, w } = currentTransformNode.rotationQuaternion
    socket.emit('transform', myRoomName, currentTransformNode.id, 'rotation', [x, y, z, w])
  })

  gizmoManager.rotationGizmoEnabled = false
  gizmoManager.scaleGizmoEnabled = true

  gizmoManager.gizmos.scaleGizmo.xGizmo.dragBehavior.onDragEndObservable.add(() => {
    const { x, y, z } = currentTransformNode.scaling
    socket.emit('transform', myRoomName, currentTransformNode.id, 'scale', [x, y, z])
  })
  gizmoManager.gizmos.scaleGizmo.yGizmo.dragBehavior.onDragEndObservable.add(() => {
    const { x, y, z } = currentTransformNode.scaling
    socket.emit('transform', myRoomName, currentTransformNode.id, 'scale', [x, y, z])
  })
  gizmoManager.gizmos.scaleGizmo.zGizmo.dragBehavior.onDragEndObservable.add(() => {
    const { x, y, z } = currentTransformNode.scaling
    socket.emit('transform', myRoomName, currentTransformNode.id, 'scale', [x, y, z])
  })

  gizmoManager.scaleGizmoEnabled = false
  gizmoManager.positionGizmoEnabled = true


  scene.onKeyboardObservable.add((keyboardInfo) => {
    if (keyboardInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
      switch (keyboardInfo.event.key) {
        case 'q':
        case 'Q':
          if (gizmoCoordinate === 'world') {
            gizmoCoordinate = 'local'
          } else {
            gizmoCoordinate = 'world'
          }
          if (gizmoMode === 'position') {
            gizmoManager.gizmos.positionGizmo.updateGizmoPositionToMatchAttachedMesh = gizmoCoordinate === 'local'
            gizmoManager.gizmos.positionGizmo.updateGizmoRotationToMatchAttachedMesh = gizmoCoordinate === 'local'
          } else if (gizmoMode === 'rotation') {
            gizmoManager.gizmos.rotationGizmo.updateGizmoPositionToMatchAttachedMesh = gizmoCoordinate === 'local'
            gizmoManager.gizmos.rotationGizmo.updateGizmoRotationToMatchAttachedMesh = gizmoCoordinate === 'local'
          }
          break
        case 'w':
        case 'W':
          gizmoManager.positionGizmoEnabled = true
          gizmoManager.rotationGizmoEnabled = false
          gizmoManager.scaleGizmoEnabled = false
          gizmoManager.gizmos.positionGizmo.updateGizmoPositionToMatchAttachedMesh = gizmoCoordinate === 'local'
          gizmoManager.gizmos.positionGizmo.updateGizmoRotationToMatchAttachedMesh = gizmoCoordinate === 'local'
          gizmoMode = 'position'
          break
        case 'e':
        case 'E':
          gizmoManager.positionGizmoEnabled = false
          gizmoManager.rotationGizmoEnabled = true
          gizmoManager.scaleGizmoEnabled = false
          gizmoManager.gizmos.rotationGizmo.updateGizmoPositionToMatchAttachedMesh = gizmoCoordinate === 'local'
          gizmoManager.gizmos.rotationGizmo.updateGizmoRotationToMatchAttachedMesh = gizmoCoordinate === 'local'
          gizmoMode = 'rotation'
          break
        case 'r':
        case 'R':
          gizmoManager.positionGizmoEnabled = false
          gizmoManager.rotationGizmoEnabled = false
          gizmoManager.scaleGizmoEnabled = true
          gizmoMode = 'scale'
          break
        case 'Escape':
          gizmoManager.attachToNode(null)
          targetDiv.innerText = `target: `
          break
        default:
          break
      }
    }
  })

  scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
      if (pointerInfo.event.button === 0 && pointerInfo.pickInfo.hit === false) {
        gizmoManager.attachToNode(null)
        targetDiv.innerText = `target: `
      }
    }
  })

  const loadedAssetContainer = await BABYLON.SceneLoader.LoadAssetContainerAsync("https://res.cloudinary.com/dkp8v4ni8/image/upload/v1612095825/", "DyingToGlb_fqke1a.glb", scene)
  const { meshes, geometries, skeletons, transformNodes, animationGroups } = loadedAssetContainer
  meshes.forEach((mesh) => {
    mesh.isPickable = false
    scene.addMesh(mesh)
  })
  geometries.forEach((geometry) => {
    scene.addGeometry(geometry)
  })
  skeletons.forEach((skeleton) => {
    scene.addSkeleton(skeleton)
  })
  controlTargets = transformNodes
  transformNodes.forEach((transformNode) => {
    transformNode.rotate(BABYLON.Axis.X, 0)
    scene.addTransformNode(transformNode)
  })
  animationGroups.forEach((animationGroup) => {
    animationGroup.stop()
  })

  new BABYLON.SkeletonViewer(skeletons[0], meshes[1], scene, true, meshes[1].renderingGroupId, DEFAULT_SKELETON_VIEWER_OPTION)
  skeletons[0].bones.forEach((bone) => {
    bone.id = `${bone.name}//bone`
    const transformNode = bone.getTransformNode()
    transformNode.id = `${bone.name}//transformNode`

    const joint = BABYLON.MeshBuilder.CreateSphere(bone.name, { diameter: 3 }, scene)
    joint.id = `${bone.name}//joint`
    joint.renderingGroupId = 2
    joint.attachToBone(bone, meshes[1])

    joint.actionManager = new BABYLON.ActionManager(scene)
    joint.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickDownTrigger, () => {
      currentTransformNode = transformNode
      gizmoManager.attachToNode(transformNode)
      targetDiv.innerText = `target: ${bone.name}`
    }))
    joint.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, () => {
      scene.hoverCursor = 'pointer'
    }))
  })
}

const initialize = () => {
  const engine = new BABYLON.Engine(renderingCanvas)
  const scene = new BABYLON.Scene(engine)
  scene.onReadyObservable.addOnce((scene) => {
    handleSceneReady(scene)
  })
  engine.onResizeObservable.add(() => {
    engine.resize()
  })
  engine.runRenderLoop(() => {
    scene.render()
  })

  myName = prompt('type your name')
  myRoomName = prompt('type room name')
  socket.emit('enter', myName, myRoomName)
}

window.addEventListener('load', initialize)