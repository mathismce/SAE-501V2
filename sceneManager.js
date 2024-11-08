import { updateSceneDropdown } from './domUtils.js';
import { checkScenesAndToggleSubMenu } from './main.js';


// Tableau pour stocker les scènes
export const scenes = [];
export const zip = new JSZip();

// Fonction pour créer un élément de scène
export function createSceneElement(sceneId, src) {
  // Crée un élément de scène A-Frame
  const sceneElement = document.createElement('a-scene');
  sceneElement.setAttribute('id', sceneId);
  sceneElement.setAttribute('embedded', '');
  sceneElement.setAttribute('cursor', 'rayOrigin: mouse');
  sceneElement.style.display = 'none';

  const assets = document.createElement('a-assets');
  
  const imageAsset = document.createElement('img');
  imageAsset.setAttribute('id', 'icon-grab');
  imageAsset.setAttribute('src', 'asset/grab-icon.png'); 
  imageAsset.setAttribute('width', '2'); 
  assets.appendChild(imageAsset);
  sceneElement.appendChild(assets);

  // Crée une entité caméra et l'ajoute à la scène
  const cameraEntity = document.createElement('a-entity');
  cameraEntity.setAttribute('camera', '');
  cameraEntity.setAttribute('wasd-controls', 'enabled: false');
  cameraEntity.setAttribute('look-controls', 'enabled: true; reverseMouseDrag: true; reverseTouchDrag: true; reverseY: true;');
  cameraEntity.setAttribute('id', 'camera-' + sceneId);
  sceneElement.appendChild(cameraEntity);

  // Crée un élément ciel et l'ajoute à la scène
  const skyElement = document.createElement('a-sky');
  skyElement.setAttribute('src', src);
  skyElement.style.transform = 'scaleX(-1)';
  sceneElement.appendChild(skyElement);

  // Crée un pointeur et l'ajoute à la scène
  const pointer = document.createElement('a-sphere');
  pointer.setAttribute('position', '0 1.5 -3');
  pointer.setAttribute('radius', '0.02');
  pointer.setAttribute('color', '#FFFFFF');
  pointer.setAttribute('follow-camera', '');  
  sceneElement.appendChild(pointer);

  // Crée une entité pour la main gauche et l'ajoute à la scène
  const leftHand = document.createElement('a-entity');
  leftHand.setAttribute('id', 'leftHand');
  leftHand.setAttribute('laser-controls', 'hand: left');
  leftHand.setAttribute('super-hands', '');
  leftHand.setAttribute('raycaster', 'objects: .door');
  sceneElement.appendChild(leftHand);

  // Crée une entité pour la main droite et l'ajoute à la scène
  const rightHand = document.createElement('a-entity');
  rightHand.setAttribute('id', 'rightHand');
  rightHand.setAttribute('laser-controls', 'hand: right');
  rightHand.setAttribute('super-hands', '');
  rightHand.setAttribute('raycaster', 'objects: .door');
  sceneElement.appendChild(rightHand);

  // Ajoute la scène au conteneur de scènes
  document.getElementById('sceneContainer').appendChild(sceneElement);

  // Met à jour le menu déroulant des scènes et vérifie les scènes pour afficher le sous-menu
  updateSceneDropdown();
  checkScenesAndToggleSubMenu();
}

// Fonction pour afficher une scène spécifique
export function displayScene(sceneId) {
  const scene = document.getElementById(sceneId); 
  // Cache toutes les scènes
  const allScenes = document.querySelectorAll('a-scene');
  allScenes.forEach(s => s.style.display = 'none');
  // Affiche la scène spécifiée
  scene.style.display = 'block';
  document.getElementById('sceneDropdown').value = sceneId; 
  // Redimensionne la fenêtre pour s'assurer que la scène est correctement affichée
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event('resize'));
  });
}

// Fonction pour afficher la scène par défaut
export function displayDefaultScene() {
  const allScenes = document.querySelectorAll('a-scene');
  allScenes.forEach(scene => {
    scene.style.display = 'none';
  });

  const defaultScene = document.getElementById('defaultScene');
  if (defaultScene) {
    defaultScene.style.display = 'block';
  }
}


// Fonction pour sauvegarder toutes les scènes en JSON
export async function saveAllScenes() {
  const zip = new JSZip();
  const allScenes = Array.from(document.querySelectorAll("a-scene")).filter(
    scene => scene.getAttribute("id") !== "defaultScene"
  );
  const scenesData = [];

  for (const scene of allScenes) {
    const sceneId = scene.getAttribute("id");
    const skyElement = scene.querySelector("a-sky");
    let skySrc = "";

    // Gestion de l'élément `a-sky` et téléchargement de l'image de fond
    if (skyElement) {
      const skyUrl = skyElement.getAttribute("src");
      if (skyUrl) {
        skySrc = `assets/${extractFileName(skyUrl)}`;
        await downloadAndAddToZip(zip, skyUrl, skySrc);
      }
    }

    const entities = [];
    // Boucle `for...of` pour gérer les entités de manière asynchrone
    for (const entity of scene.querySelectorAll("a-entity, a-image, a-video, a-sphere, a-sky, a-box, a-text, a-plane")) {
      const entityData = {
        tagName: entity.tagName,
        attributes: {},
      };

      // Extraction des attributs de l'entité
      Array.from(entity.attributes).forEach(attr => {
        try {
          // Tente de parser l'attribut comme JSON si complexe
          const value = JSON.parse(attr.value);
          entityData.attributes[attr.name] = value;
        } catch {
          // Sinon, enregistre la valeur brute
          entityData.attributes[attr.name] = attr.name === "src" && entity.tagName === "A-SKY" ? skySrc : attr.value;
        }
      });

      // téléchargement de l'image
      if (entity.tagName === "A-IMAGE") {
        const imageUrl = entity.getAttribute("src");
        if (imageUrl) {
          const imageSrc = `assets/${extractFileName(imageUrl)}`;
          await downloadAndAddToZip(zip, imageUrl, imageSrc);
          entityData.attributes.src = imageSrc; // Met à jour le `src` dans les données exportées
        }
      }

      if (entity.tagName === "A-VIDEO") {
        const videoUrl = entity.getAttribute("src");
        if (videoUrl) {
          const videoSrc = `assets/${extractFileNameVideo(videoUrl)}`;
          await downloadAndAddToZip(zip, videoUrl, videoSrc);
          entityData.attributes.src = videoSrc;
        }
      }

      // Extraction de la position de l'entité
      const position = entity.getAttribute("position");
      if (position) {
        entityData.attributes.position = position;
      }

      // Vérifie si l'entité a un attribut `data-tag-id` et si une sphère correspond
      const tagId = entity.getAttribute("data-tag-id");
      if (tagId) {
        const sphere = scene.querySelector(`a-sphere[data-tag-id="${tagId}"]`);
        if (sphere) {
          const spherePosition = sphere.getAttribute("position");
          if (spherePosition) {
            // Applique la position de la sphère à l'entité correspondante
            const updatedPosition = applySpherePositionToInfoboxElements(position, spherePosition);
            entityData.attributes.position = updatedPosition;
          }
        }
      }

      entities.push(entityData);
    }

    // Ajout des données de la scène
    scenesData.push({
      id: sceneId,
      entities: entities,
    });
  }

  // Ajoute le fichier JSON des scènes dans le ZIP
  const scenesJson = JSON.stringify(scenesData, null, 2);
  zip.file("scenes.json", scenesJson);

  const indexHtmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scène 3D</title>
    <script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
</head>
<body>
    <a-scene id="scene">
        <a-camera id="camera-scene"></a-camera>
    </a-scene>
    <script>
        AFRAME.registerComponent('look-at-camera', {
            tick: function () {
                var camera = document.getElementById('camera-scene');
                var cameraPosition = camera.object3D.position;
                this.el.object3D.lookAt(cameraPosition);
            }
        });

        function loadSceneFromJSON(url) {
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    const scene = document.getElementById('scene');
                    data.forEach(entityGroup => {
                        entityGroup.entities.forEach(subEntity => {
                            const el = document.createElement(subEntity.tagName);
                            Object.keys(subEntity.attributes).forEach(attr => {
                                el.setAttribute(attr, subEntity.attributes[attr]);
                            });
                            scene.appendChild(el);
                        });
                    });
                })
                .catch(error => console.error('Erreur lors du chargement du fichier JSON:', error));
        }

        loadSceneFromJSON('scenes.json');
    </script>
</body>
</html>
`;
  // Ajout de l'index.html au ZIP
  zip.file("index.html", indexHtmlContent);
  
  // Génère et télécharge le fichier ZIP
  zip.generateAsync({ type: "blob" }).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scenes.zip";
    a.click();
    URL.revokeObjectURL(url);
  });
}



// Fonction pour appliquer la position de la sphère aux éléments avec `data-tag-id`
function applySpherePositionToInfoboxElements(entityPosition, spherePosition) {
  // Vérifie que spherePosition est bien un objet avec les propriétés x, y, z
  const sphereX = spherePosition.x || 0;
  const sphereY = spherePosition.y || 0;
  const sphereZ = spherePosition.z || 0;

  // Applique la position relative de la sphère aux éléments
  const updatedX = entityPosition.x + sphereX;
  const updatedY = entityPosition.y + sphereY;
  const updatedZ = entityPosition.z + sphereZ;

  // Retourne la nouvelle position sous forme d'objet
  return {
    x: updatedX,
    y: updatedY,
    z: updatedZ
  };
}


// Fonction pour extraire le nom de fichier
function extractFileName(src) {
  return `image_${Math.random().toString(36).substring(2, 15)}.png`;
}

function extractFileNameVideo(src) {
  return `video_${Math.random().toString(36).substring(2, 15)}.mp4`;
}

// Fonction pour télécharger l'image et l'ajouter dans le zip
async function downloadAndAddToZip(zip, url, path) {
  const response = await fetch(url);
  const blob = await response.blob();
  zip.file(path, blob);
}



// Fonction pour charger des scènes à partir d'un JSON
export function loadScenesFromJson(scenesJson) {
  const scenesData = JSON.parse(scenesJson);

  scenesData.forEach(sceneData => {
    const { id, src, entities } = sceneData;
    createSceneElement(id, src);

    const sceneElement = document.getElementById(id);
    entities.forEach(entityData => {
      const entity = document.createElement(entityData.tagName);
      Object.keys(entityData.attributes).forEach(attrName => {
        entity.setAttribute(attrName, entityData.attributes[attrName]);
      });
      sceneElement.appendChild(entity);
    });
  });

  updateSceneDropdown();
  checkScenesAndToggleSubMenu();
}