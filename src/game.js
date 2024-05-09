window.addEventListener('DOMContentLoaded', function(){
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true);

    // ------------------------------ DÉBUT DU CODE DU JEU ------------------------------
    // ------------------------------ DÉBUT DU CODE DU JEU ------------------------------
    // ------------------------------ DÉBUT DU CODE DU JEU ------------------------------

    var createScene = function () {
        var scene = new BABYLON.Scene(engine);
    
        // Initialisation de la caméra
        var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0), scene);
        camera.attachControl(canvas, true);
    
        // Ajout de la lumière hémisphérique
        var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.4; // Intensité de la lumière
    
    
        // Ajout d'un sol
        var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 1000, height: 1000}, scene);
        var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        var textureUrl = "https://2.bp.blogspot.com/-SBfckA3bX_k/U7UFkyH4AII/AAAAAAAAFcI/jNg05ZHvSCE/s1600/(GRASS+3)+seamless+turf+lawn+green+ground+field+texture.jpg"
        groundMaterial.diffuseTexture = new BABYLON.Texture(textureUrl, scene);
        ground.material = groundMaterial;
        ground.position.y = -50; // Baisser le sol 
    
        // Ajout d'une skybox pour le ciel
        var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skybox.material = skyboxMaterial;
    
        // Ajout de lumière ambiante
        var ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), scene);
        ambientLight.intensity = 0.7;
    
        var targetDistance = 70; // La distance du mur invisible (et des cibles de Tic-Tac-Toe)
        
        // Création du mur invisible à la distance de la grille Tic-Tac-Toe
        var invisibleWall = BABYLON.MeshBuilder.CreatePlane("invisibleWall", {width: 100, height: 100}, scene);
        invisibleWall.position.z = targetDistance;
        invisibleWall.visibility = 0; // Le mur est invisible
    
        // Création de la grille Tic-Tac-Toe
        var grid = createTicTacToeGrid(scene, targetDistance, 2); // Taille des carrés ajustée à 2
    
        // Initialisation de l'arc
        var bow = BABYLON.MeshBuilder.CreateBox("bow", {height: 0.5, width: 1, depth: 0.1}, scene);
        bow.position.z = 1;
    
        var bowMaterial = new BABYLON.StandardMaterial("bowMaterial", scene);
        bowMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
        bow.material = bowMaterial;
    
        scene.onPointerDown = function () {
            // Tir de la flèche en utilisant le mur invisible pour déterminer la trajectoire
            var pickResult = scene.pick(scene.pointerX, scene.pointerY, function(mesh) { return mesh === invisibleWall; });
            if (pickResult.hit) {
                var arrow = shootArrow(scene, bow, bowMaterial, pickResult.pickedPoint, grid);
            }
        };
    
        return scene;
    };
    
    function createTicTacToeGrid(scene, distance, size) {
        var grid = [];
        var spacing = size + size/8 ; // Espacement entre les carrés
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                var square = BABYLON.MeshBuilder.CreateBox("square" + (i + 1) * 3 + (j + 1), {size: size, height: 0.1}, scene);
                square.position = new BABYLON.Vector3(j * spacing, i * spacing, distance);
                square.rotation.x = Math.PI / 2; // Ajustement pour face à la caméra
                var material = new BABYLON.StandardMaterial("squareMat" + (i + 1) * 3 + (j + 1), scene);
                material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
                square.material = material;
                grid.push(square);
            }
        }
        return grid;
    }
    
    function shootArrow(scene, bow, material, targetPoint, grid) {
        var arrow = BABYLON.MeshBuilder.CreateBox("arrow", {height: 0.1, width: 0.5, depth: 0.1}, scene);
        arrow.position = bow.position.clone();
        arrow.material = material;
        arrow.lookAt(targetPoint);
    
        // Marquer la flèche pour la détection de collision
        arrow.isArrow = true;
    
        // Animation de la flèche
        var animArrow = new BABYLON.Animation("animArrow", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        var keysArrow = [{ frame: 0, value: arrow.position }, { frame: 100, value: targetPoint }];
        animArrow.setKeys(keysArrow);
        arrow.animations.push(animArrow);
        scene.beginAnimation(arrow, 0, 100, false);
    
        // Vérification continue des collisions
        arrow.checkCollisions = true; // Activer les collisions pour la flèche
        scene.registerBeforeRender(() => {
            if (arrow.isArrow) {
                grid.forEach(square => {
                    if (arrow.intersectsMesh(square, false)) {
                        // Changement de couleur du carré en une couleur aléatoire
                        square.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
                        // Marquer la flèche pour éviter des détections répétées
                        arrow.isArrow = false;
                        arrow.dispose(); // Optionnel, supprimer la flèche après collision
                    }
                });
            }
        });
        
    }    
    
        

    // ------------------------------ FIN DU CODE DU JEU ------------------------------
    // ------------------------------ FIN DU CODE DU JEU ------------------------------
    // ------------------------------ FIN DU CODE DU JEU ------------------------------
    
    const scene = createScene();

    engine.runRenderLoop(function(){
        scene.render();
    });

    window.addEventListener('resize', function(){
        engine.resize();
    });
});