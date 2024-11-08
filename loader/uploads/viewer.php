<?php
$sceneFile = isset($_GET['scene']) ? $_GET['scene'] : '';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Scène 3D</title>
    <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
</head>
<body>
    <a-scene id="scene">
        <a-camera id="camera-scene"></a-camera>
    </a-scene>

    <script>

        AFRAME.registerComponent('look-at-camera', 
        {
            tick: function () {
            var sceneId = this.el.sceneEl.id;
            // Utilisation de l'id de la caméra ajouté manuellement
            var camera = document.getElementById('camera-scene');
            var cameraPosition = camera.object3D.position;
            this.el.object3D.lookAt(cameraPosition);
            }
        });


        function loadSceneFromJSON(url) {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log("JSON reçu :", data); // Affiche le JSON complet pour vérification

                    const scene = document.getElementById('scene');

                    // Parcourt chaque objet principal du JSON
                    data.forEach((entityGroup, index) => {
                        console.log(`Entité principale #${index} :`, entityGroup);

                        // Parcourt chaque sous-entité dans 'entities'
                        entityGroup.entities.forEach((subEntity, subIndex) => {
                            console.log(`Sous-entité #${subIndex} de l'entité #${index} :`, subEntity);

                            const el = document.createElement(subEntity.tagName); // Remplace "type" par "tagName"

                            Object.keys(subEntity.attributes).forEach(attr => {
                                el.setAttribute(attr, subEntity.attributes[attr]);
                            });

                            scene.appendChild(el);
                        });
                    });
                })
                .catch(error => console.error('Erreur lors du chargement du fichier JSON:', error));
        }

        const sceneFile = "<?php echo htmlspecialchars($sceneFile); ?>";
        loadSceneFromJSON(sceneFile);
    </script>
</body>
</html>
