window.addEventListener('DOMContentLoaded', function(){
    const canvas = document.getElementById('renderCanvas');
    const engine = new BABYLON.Engine(canvas, true);

    // ------------------------------ DÉBUT DU CODE DU JEU ------------------------------
    // ------------------------------ DÉBUT DU CODE DU JEU ------------------------------
    // ------------------------------ DÉBUT DU CODE DU JEU ------------------------------

    let arrows = [];
    let scoreJoueur1 = 0;
    let scoreJoueur2 = 0;
    let textBlockScore;
    let tailleCible = 5;
    let VitesseTir = 100; // frames pour l'animation
    let VitesseCible = 200; // frames pour l'animation
    
    const createScene = function () {
        const scene = new BABYLON.Scene(engine);

        // Initialisation de la caméra
        const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new BABYLON.Vector3(0, 0, 0), scene);
        camera.attachControl(canvas, true);

        // Ajout de la lumière hémisphérique
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.4;
        // Ajout de lumière ambiante
        const ambientLight = new BABYLON.HemisphericLight("ambientLight", new BABYLON.Vector3(0, 1, 0), scene);
        ambientLight.intensity = 0.7;

        // Ajout d'un sol
        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 1000, height: 1000}, scene);
        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        const textureUrl = "https://2.bp.blogspot.com/-SBfckA3bX_k/U7UFkyH4AII/AAAAAAAAFcI/jNg05ZHvSCE/s1600/(GRASS+3)+seamless+turf+lawn+green+ground+field+texture.jpg";
        groundMaterial.diffuseTexture = new BABYLON.Texture(textureUrl, scene);
        ground.material = groundMaterial;
        ground.position.y = -30; // Baisser le sol 

        // Ajout d'une skybox pour le ciel
        const skybox = BABYLON.MeshBuilder.CreateBox("skybox", {size: 1000}, scene);
        const skyboxMaterial = new BABYLON.StandardMaterial("skyboxMaterial", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://www.babylonjs-playground.com/textures/TropicalSunnyDay", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skybox.material = skyboxMaterial;

        // Ajout des bruitages
        const shootSound = new BABYLON.Sound("shootSound", "./src/music/tir.mp3", scene);
        const hitSound = new BABYLON.Sound("hitSound", "./src/music/explo.mp3", scene);
        const music = new BABYLON.Sound("Music", "./src/music/musique.mp3", scene, null, {
            loop: true,
            autoplay: true,
            volume: 0.2 // 20% du volume
        });
        music.play();

        // Ajout d'un mur invisible pour les cibles de Tic-Tac-Toe
        const targetDistance = 190; // La distance du mur invisible (et des cibles de Tic-Tac-Toe)
        const invisibleWall = BABYLON.MeshBuilder.CreatePlane("invisibleWall", {width: 190, height: 50}, scene);
        invisibleWall.position.z = targetDistance;
        invisibleWall.position.y = 17; // Fait monter le mur
        invisibleWall.visibility = 0; // 0 pour Rendre le mur invisible et 1 pour le rendre visible
        
        // Importer le modèle 3D du Burger
        //BABYLON.SceneLoader.ImportMesh("", "./models/", "Garage.obj", scene, function (newMeshes) {
        BABYLON.SceneLoader.ImportMesh("", "./src/models/burgerpiz/", "scene.gltf", scene, function (newMeshes) {
            const model = newMeshes[0];
            model.scaling = new BABYLON.Vector3(1, 1, 1); // échelle du modèle
            model.position = new BABYLON.Vector3(-31, -8, 60); // position du modèle
            model.rotation = new BABYLON.Vector3(0, Math.PI, 0); // rotation du modèle
        });

        // Importer le modèle 3D du Batiment
        BABYLON.SceneLoader.ImportMesh("", "./src/models/", "Bat.glb", scene, function (newMeshes) {
            const model = newMeshes[0];
            model.scaling = new BABYLON.Vector3(1, 1, 1); // échelle du modèle
            model.position = new BABYLON.Vector3(0, -10, 200); // position du modèle
            model.rotation = new BABYLON.Vector3(0, Math.PI, 0); // rotation du modèle
        });

        // Importer le modèle 3D de l'archer
        BABYLON.SceneLoader.ImportMesh("", "./src/models/bowman/", "scene.gltf", scene, function (newMeshes) {
            const model = newMeshes[0];
            model.scaling = new BABYLON.Vector3(1.2, 1.2, 1.2); // échelle du modèle
            model.position = new BABYLON.Vector3(0.2, -1.8, 0); // position du modèle
            model.rotation = new BABYLON.Vector3(0, -Math.PI/2, 0); // rotation du modèle
            //couleur du modèle en rouge et bleu pour les joueurs

        });

        // Importer le modèle 3D de la tour
        BABYLON.SceneLoader.ImportMesh("", "./src/models/wood_tower_low-poly/", "scene.gltf", scene, function (newMeshes) {
            const model = newMeshes[0];
            model.scaling = new BABYLON.Vector3(0.61, 0.61, 0.61); // échelle du modèle
            model.position = new BABYLON.Vector3(2, -8.3, 1.65); // position du modèle
            model.rotation = new BABYLON.Vector3(0, Math.PI, 0); // rotation du modèle
        });

        // Importer le modèle 3D de la voiture
        BABYLON.SceneLoader.ImportMesh("", "./src/models/mersedes-benz_g63_amg/", "scene.gltf", scene, function (newMeshes) {
            const model = newMeshes[0];
            model.scaling = new BABYLON.Vector3(1.8, 1.8, 1.8); // échelle
            model.position = new BABYLON.Vector3(15.15, -8.17, 20); // position 
            model.rotation = new BABYLON.Vector3(0, Math.PI, 0); // rotation 
        });


        // Création de la grille Tic-Tac-Toe
        const grid = createTicTacToeGrid(scene, targetDistance, tailleCible);

        // Initialisation de l'arc
        const bow = BABYLON.MeshBuilder.CreateBox("bow", {height: 0.2, width: 0.2, depth: 0.1}, scene);
        bow.position.z = 1;
        const bowMaterial = new BABYLON.StandardMaterial("bowMaterial", scene);
        bowMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
        bow.material = bowMaterial;
        bow.visibility = 0; // 0 pour Rendre le mur invisible et 1 pour le rendre visible

        // Gestion des tours des joueurs
        let currentPlayer = 1; // 1 pour le joueur 1 (bleu), 2 pour le joueur 2 (rouge)

        // Créer une texture dynamique
        const dynamicTexture = new BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

        // Mettre un fond de couleur pour le score
        const rect2 = new BABYLON.GUI.Rectangle();
        rect2.width = 0.16;
        rect2.height = "40px";
        rect2.cornerRadius = 20;
        rect2.color = "red";
        rect2.thickness = 1.5;
        rect2.background = "white";
        rect2.top = "272px";
        rect2.left = "600px";
        dynamicTexture.addControl(rect2); // Ajouter le rectangle à la texture dynamique

        // Mettre un fond de couleur pour le score
        const rect3 = new BABYLON.GUI.Rectangle();
        rect3.width = 0.16;
        rect3.height = "40px";
        rect3.cornerRadius = 20;
        rect3.color = "blue";
        rect3.thickness = 1.5;
        rect3.background = "white";
        rect3.top = "329px";
        rect3.left = "600px";
        dynamicTexture.addControl(rect3); // Ajouter le rectangle à la texture dynamique

        // Ajouter un texte pour le score
        textBlockScore = new BABYLON.GUI.TextBlock();
        textBlockScore.text = "Score Joueur 1 : " + scoreJoueur1 + "\n\nScore Joueur 2 : " + scoreJoueur2;
        textBlockScore.color = "black";
        textBlockScore.fontSize = 24;
        textBlockScore.fontWeight = "bold";
        textBlockScore.top = "300px";
        textBlockScore.left = "600px";
        dynamicTexture.addControl(textBlockScore); // Ajouter le bloc de texte à la texture dynamique

        // Mettre une fond de couleur pour le bloc de texte
        const rect = new BABYLON.GUI.Rectangle();
        rect.width = 0.1;
        rect.height = "40px";
        rect.cornerRadius = 20;
        rect.color = "black";
        rect.thickness = 1.5;
        rect.background = "white";
        rect.top = "301px";
        rect.left = "0px";
        dynamicTexture.addControl(rect); // Ajouter le rectangle à la texture dynamique

        // Créer un bloc de texte
        const textBlock = new BABYLON.GUI.TextBlock();
        textBlock.text = "Joueur " + currentPlayer;
        textBlock.color = currentPlayer == 1 ? "red" : "blue";
        textBlock.fontSize = 24;
        textBlock.fontWeight = "bold";
        textBlock.top = "300px";
        textBlock.left = "0px";
        dynamicTexture.addControl(textBlock); // Ajouter le bloc de texte à la texture dynamique


        scene.onPointerDown = function () {
            const pickResult = scene.pick(scene.pointerX, scene.pointerY, function(mesh) { return mesh === invisibleWall; });
            if (pickResult.hit) {
                shootArrow(scene, bow, bowMaterial, pickResult.pickedPoint, grid, currentPlayer);
                shootSound.play();
                
                // Mettre à jour la couleur de l'arc pour le prochain joueur
                currentPlayer = currentPlayer == 1 ? 2 : 1;
                updateBowColor(currentPlayer, bowMaterial); // Mise à jour de la couleur de l'arc
        
                // Mettre à jour le texte et la couleur du bloc de texte
                setTimeout(function() {
                    textBlock.text = "Joueur " + currentPlayer;
                    updateTextColor(currentPlayer, textBlock); // Mise à jour de la couleur du texte
                }, 500); // Attendre 0.5 seconde avant de changer de joueur
            }
        };



        return scene;
    };

    // Crée une grille Tic-Tac-Toe avec des carrés
    function createTicTacToeGrid(scene, distance, size) {
        const grid = [];
        const spacing = size + size/8 ; // Espacement entre les carrés
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const square = BABYLON.MeshBuilder.CreateBox("square" + (i + 1) * 3 + (j + 1), {size: size, height: 0.1}, scene);
                square.position = new BABYLON.Vector3(j * spacing, i * spacing, distance);
                square.rotation.x = Math.PI / 2; // Ajustement pour face à la caméra
                const material = new BABYLON.StandardMaterial("squareMat" + (i + 1) * 3 + (j + 1), scene);
                material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
                square.material = material;
                grid.push(square);

                // Créez une animation pour la position de la cible
                const animTarget = new BABYLON.Animation("animTarget", "position", 15, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

                // Définissez les clés de l'animation pour déplacer la cible d'un point à un autre
                const keysTarget = [
                    { frame: 0, value: square.position.add(new BABYLON.Vector3(80, 15, 0)) }, // Position de départ
                    { frame: VitesseCible/2 , value: square.position.add(new BABYLON.Vector3(-80, 15, 0)) }, // Position d'arrivée
                    { frame: VitesseCible, value: square.position.add(new BABYLON.Vector3(80, 15, 0)) } // Retour à la position de départ
                ];

                animTarget.setKeys(keysTarget);

                // Ajoutez l'animation à la cible
                square.animations.push(animTarget);

                // Commencez l'animation
                scene.beginAnimation(square, 0, VitesseCible, true); // Le dernier argument à true signifie que l'animation se répète indéfiniment
            }
        }
        return grid;
    }

    // Tire une flèche vers un point cible
    function shootArrow(scene, bow, material, targetPoint, grid, currentPlayer) {
        // Crée une sphère au lieu d'un cylindre
        const arrow = BABYLON.MeshBuilder.CreateSphere("arrow", {diameter: 0.7}, scene);
        // Sons
        const deleteSound = new BABYLON.Sound("deleteSound", "./src/music/fleche.mp3", scene);
        const hitSound = new BABYLON.Sound("hitSound", "./src/music/explo.mp3", scene);
        arrow.position = bow.position.clone();
        arrow.material = material;
        arrow.lookAt(targetPoint);
        arrow.isDisposed = false;
        
        // Animation de la flèche
        const animArrow = new BABYLON.Animation("animArrow", "position", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
        const keysArrow = [{ frame: 0, value: arrow.position }, { frame: VitesseTir, value: targetPoint }]; // 100 frames pour l'animation
        animArrow.setKeys(keysArrow);
        arrow.animations.push(animArrow);
        scene.beginAnimation(arrow, 0, VitesseTir, false, 1, function() {
            deleteSound.setVolume(0.1);
            deleteSound.play();
            setTimeout(function() {
                arrow.dispose();
                arrow.isDisposed = true; // Mettez à jour la propriété lorsque la flèche est supprimée
            }, 50); // Supprimer la flèche après 0.05 seconde
        });
        
        arrow.isArrow = true;
        scene.registerBeforeRender(() => {
            if (arrow.isArrow && !arrow.isDisposed) {
            // Vérifiez si la flèche touche un carré de la grille
            grid.forEach(square => {
                if (arrow.intersectsMesh(square, false)) {
                hitSound.play();
                const color = currentPlayer == 1 ? new BABYLON.Color3(1, 0, 0) : new BABYLON.Color3(0, 0, 1);
                square.material.diffuseColor = color;
                arrow.isArrow = false;
                // Vérifier si le joueur a gagné
                if (checkVictory(grid, color)) {
                    const victoryMessage = "Player " + currentPlayer + " wins!";
                    console.log(victoryMessage);
                    alert(victoryMessage);
                    // Optionnel : Réinitialiser le jeu ou proposer de recommencer
                    resetGame(grid, scene, currentPlayer);
                }
                }
            });
            }
        });

        // Ajoutez la flèche au tableau des flèches
        arrows.push(arrow);
        
    }

    // Met à jour la couleur de l'arc en fonction du joueur actuel
    function updateBowColor(currentPlayer, bowMaterial) {
        const color = currentPlayer == 1 ? new BABYLON.Color3(0, 0, 1) : new BABYLON.Color3(1, 0, 0); // Bleu pour Joueur 1, Rouge pour Joueur 2
        bowMaterial.diffuseColor = color;
    }

    function updateTextColor(currentPlayer, textBlock) {
        const color = currentPlayer == 1 ? "red" : "blue"; // Bleu pour Joueur 1, Rouge pour Joueur 2
        textBlock.color = color;
    }

    // Vérifie si un joueur a gagné en vérifiant les combinaisons gagnantes
    function checkVictory(grid, color) {
        // Définir les combinaisons gagnantes dans la grille Tic-Tac-Toe
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Lignes
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colonnes
            [0, 4, 8], [2, 4, 6]            // Diagonales
        ];

        for (let i = 0; i < winningCombinations.length; i++) {
            const [a, b, c] = winningCombinations[i];
            if (grid[a].material.diffuseColor.equals(color) &&
                grid[b].material.diffuseColor.equals(color) &&
                grid[c].material.diffuseColor.equals(color)) {
                if (color.equals(new BABYLON.Color3(1, 0, 0))) {
                    scoreJoueur1++;
                } else {
                    scoreJoueur2++;
                }
                // Mettre à jour l'affichage du score
                textBlockScore.text = "Score Joueur 1 : " + scoreJoueur1 + "\n\nScore Joueur 2 : " + scoreJoueur2;
                return true;
            }
        }
        
        return false;
    }

    // Réinitialise le jeu
    function resetGame(grid, scene, currentPlayer) {
        // Remettre tous les carrés à une couleur neutre (blanc ici)
        grid.forEach(square => {
            square.material.diffuseColor = new BABYLON.Color3(1, 1, 10);
        });

        // Réinitialiser le joueur actuel à 1 ou à 2
        currentPlayer = 1;

        // Parcourez le tableau des flèches et supprimez chaque flèche
        arrows.forEach(arrow => arrow.dispose());
        // Réinitialisez le tableau des flèches
        arrows = [];
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