import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js';
import { FontLoader } from 'https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.179.1/examples/jsm/geometries/TextGeometry.js';

const stage = document.getElementById('three-canvas');

if (stage) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e0b3d);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 1.5, 13);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    stage.appendChild(renderer.domElement);

    const sceneGroup = new THREE.Group();
    scene.add(sceneGroup);
    const textGroup = new THREE.Group();
    const shardGroup = new THREE.Group();
    sceneGroup.add(textGroup, shardGroup);

    scene.add(new THREE.AmbientLight(0xffffff, 2.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 4);
    keyLight.position.set(-4, 7, 8);
    scene.add(keyLight);
    const cyanLight = new THREE.PointLight(0x5edcff, 18, 12);
    cyanLight.position.set(-4, 2, 5);
    scene.add(cyanLight);
    const warmLight = new THREE.PointLight(0xdcae42, 14, 10);
    warmLight.position.set(4, 1, 3);
    scene.add(warmLight);

    const gridSize = 32;
    const divisions = 48;
    const gridGeometry = new THREE.PlaneGeometry(gridSize, gridSize, divisions, divisions);
    gridGeometry.rotateX(-Math.PI / 2.35);
    const originalGridPositions = new Float32Array(gridGeometry.attributes.position.array);
    const gridMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7
    });
    const gridLinePositions = new Float32Array(divisions * (divisions + 1) * 4 * 3);
    const gridLineGeometry = new THREE.BufferGeometry();
    gridLineGeometry.setAttribute('position', new THREE.BufferAttribute(gridLinePositions, 3));
    const grid = new THREE.LineSegments(gridLineGeometry, gridMaterial);
    grid.position.set(0, -2.4, -1.2);
    sceneGroup.add(grid);

    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 128;
    textureCanvas.height = 128;
    const textureContext = textureCanvas.getContext('2d');
    textureContext.fillStyle = '#f7fbff';
    textureContext.fillRect(0, 0, 128, 128);
    textureContext.strokeStyle = 'rgba(24, 83, 138, 0.22)';
    textureContext.lineWidth = 2;
    for (let line = -128; line < 256; line += 16) {
        textureContext.beginPath();
        textureContext.moveTo(line, 0);
        textureContext.lineTo(line + 128, 128);
        textureContext.stroke();
    }
    const textTexture = new THREE.CanvasTexture(textureCanvas);
    textTexture.colorSpace = THREE.SRGBColorSpace;
    textTexture.wrapS = THREE.RepeatWrapping;
    textTexture.wrapT = THREE.RepeatWrapping;
    textTexture.repeat.set(2, 2);

    const textMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textTexture,
        bumpMap: textTexture,
        bumpScale: 0.045,
        roughness: 0.32,
        metalness: 0.22,
        emissive: 0x123a64,
        emissiveIntensity: 0.2
    });

    const addText = (font) => {
        const textGeometry = new TextGeometry('Paul.dev', {
            font,
            size: 1.5,
            depth: 0.34,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.06,
            bevelSize: 0.035,
            bevelSegments: 3
        });
        textGeometry.center();
        const text = new THREE.Mesh(textGeometry, textMaterial);
        text.position.set(0, 0.25, 0.4);
        text.rotation.x = -0.08;
        textGroup.add(text);
    };

    new FontLoader().load(
        'https://cdn.jsdelivr.net/npm/three@0.179.1/examples/fonts/helvetiker_bold.typeface.json',
        addText
    );

    const shardMaterials = [
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.22, metalness: 0.3 }),
        new THREE.MeshStandardMaterial({ color: 0x5edcff, roughness: 0.2, metalness: 0.4 }),
        new THREE.MeshStandardMaterial({ color: 0xdcae42, roughness: 0.25, metalness: 0.35 })
    ];
    const shardGeometry = new THREE.TetrahedronGeometry(0.16, 0);
    const shardPositions = [
        [-3.8, 1.2, 0.2], [-2.9, -0.1, 0.8], [-2.2, 1.4, -0.5],
        [2.2, 1.25, -0.2], [3.2, 0.15, 0.6], [4, 1.5, -0.6],
        [-3.3, -0.9, 0.1], [2.8, -0.8, 0.4], [0.8, 1.8, -0.8]
    ];
    const shards = shardPositions.map(([x, y, z], index) => {
        const shard = new THREE.Mesh(shardGeometry, shardMaterials[index % shardMaterials.length]);
        shard.position.set(x, y, z);
        shard.rotation.set(index * 0.7, index * 0.45, index * 0.3);
        shard.userData = { baseX: x, baseY: y, baseZ: z, phase: index * 0.8 };
        shardGroup.add(shard);
        return shard;
    });

    const pointer = new THREE.Vector2(0, 0);
    const targetPointer = new THREE.Vector2(0, 0);
    const pointerWorld = new THREE.Vector3();
    const textTarget = new THREE.Vector3();
    const dragStart = new THREE.Vector2();
    const dragStartRotation = new THREE.Euler();
    const dragRotation = new THREE.Vector3();
    const neutralRotation = new THREE.Vector3();
    let isDragging = false;
    let hasDragged = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const updatePointer = (event) => {
        const bounds = stage.getBoundingClientRect();
        targetPointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        targetPointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    };

    stage.addEventListener('pointerdown', (event) => {
        isDragging = true;
        hasDragged = true;
        dragStart.set(event.clientX, event.clientY);
        dragStartRotation.copy(textGroup.rotation);
        dragRotation.set(textGroup.rotation.x, textGroup.rotation.y, textGroup.rotation.z);
        stage.setPointerCapture(event.pointerId);
        updatePointer(event);
    });

    stage.addEventListener('pointermove', (event) => {
        updatePointer(event);
        if (!isDragging || reducedMotion) return;

        const horizontalDrag = event.clientX - dragStart.x;
        const verticalDrag = event.clientY - dragStart.y;
        dragRotation.x = dragStartRotation.x + verticalDrag * 0.012;
        dragRotation.y = dragStartRotation.y + horizontalDrag * 0.012;
        dragRotation.z = dragStartRotation.z + (event.shiftKey ? horizontalDrag * 0.012 : 0);
        textGroup.rotation.set(dragRotation.x, dragRotation.y, dragRotation.z);
    });

    const stopDragging = (event) => {
        isDragging = false;
        if (stage.hasPointerCapture(event.pointerId)) {
            stage.releasePointerCapture(event.pointerId);
        }
    };

    stage.addEventListener('pointerup', stopDragging);
    stage.addEventListener('pointercancel', stopDragging);
    stage.addEventListener('pointerleave', () => targetPointer.set(0, 0));

    const resize = () => {
        const { width, height } = stage.getBoundingClientRect();
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
    };

    const deformGrid = (time) => {
        pointer.lerp(targetPointer, reducedMotion ? 1 : 0.09);
        pointerWorld.set(pointer.x * 7.5, 0, -pointer.y * 5.5);

        const positions = gridGeometry.attributes.position;
        for (let index = 0; index < positions.count; index += 1) {
            const sourceIndex = index * 3;
            const x = originalGridPositions[sourceIndex];
            const y = originalGridPositions[sourceIndex + 1];
            const z = originalGridPositions[sourceIndex + 2];
            const distance = Math.hypot(x - pointerWorld.x, z - pointerWorld.z);
            const influence = Math.max(0, 1 - distance / 3.2);
            const smoothInfluence = Math.exp(-(distance * distance) / 5.5);
            const spread = reducedMotion ? 0 : smoothInfluence * smoothInfluence * 1.8;
            const directionX = x - pointerWorld.x;
            const directionZ = z - pointerWorld.z;
            const length = Math.hypot(directionX, directionZ) || 1;
            const curve = reducedMotion ? 0 : Math.sin(
                (x - pointerWorld.x) * 1.45 +
                (z - pointerWorld.z) * 0.9 +
                time * 0.0025
            ) * smoothInfluence * 0.5;

            positions.setXYZ(
                index,
                x + (directionX / length) * spread + curve * 0.2,
                y + smoothInfluence * 0.7 + curve,
                z + (directionZ / length) * spread + curve * 0.12
            );
        }
        positions.needsUpdate = true;

        let lineIndex = 0;
        const vertexIndex = (row, column) => row * (divisions + 1) + column;
        const writeLine = (start, end) => {
            for (const vertex of [start, end]) {
                gridLinePositions[lineIndex] = positions.getX(vertex);
                gridLinePositions[lineIndex + 1] = positions.getY(vertex);
                gridLinePositions[lineIndex + 2] = positions.getZ(vertex);
                lineIndex += 3;
            }
        };

        for (let row = 0; row <= divisions; row += 1) {
            for (let column = 0; column < divisions; column += 1) {
                writeLine(vertexIndex(row, column), vertexIndex(row, column + 1));
            }
        }
        for (let column = 0; column <= divisions; column += 1) {
            for (let row = 0; row < divisions; row += 1) {
                writeLine(vertexIndex(row, column), vertexIndex(row + 1, column));
            }
        }
        gridLineGeometry.attributes.position.needsUpdate = true;

        textTarget.set(pointer.x * 0.45, pointer.y * 0.2, 0);
        textGroup.position.lerp(textTarget, reducedMotion ? 1 : 0.06);
        if (isDragging) {
            textGroup.rotation.set(dragRotation.x, dragRotation.y, dragRotation.z);
        } else if (hasDragged) {
            dragRotation.lerp(neutralRotation, 0.018);
            textGroup.rotation.set(dragRotation.x, dragRotation.y, dragRotation.z);
            if (dragRotation.length() < 0.008) {
                dragRotation.set(0, 0, 0);
                hasDragged = false;
            }
        } else {
            textGroup.rotation.y = (reducedMotion ? 0 : Math.sin(time * 0.00042) * 0.18) + pointer.x * 0.12;
            textGroup.rotation.x = -pointer.y * 0.07;
        }

        shards.forEach((shard) => {
            const { baseX, baseY, baseZ, phase } = shard.userData;
            const drift = reducedMotion ? 0 : time * 0.0007 + phase;
            shard.position.x = baseX + Math.sin(drift) * 0.16 + pointer.x * 0.22;
            shard.position.y = baseY + Math.cos(drift * 1.15) * 0.18 + pointer.y * 0.16;
            shard.position.z = baseZ + Math.sin(drift * 0.8) * 0.12;
            shard.rotation.x += reducedMotion ? 0 : 0.006;
            shard.rotation.y += reducedMotion ? 0 : 0.009;
        });
    };

    const animate = (time) => {
        deformGrid(time);
        sceneGroup.rotation.y = Math.sin(time * 0.00025) * 0.035;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(animate);
}