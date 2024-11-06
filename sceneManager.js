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
    // Vérifie et télécharge l'image de l'a-sky
    if (skyElement) {
      const skyUrl = skyElement.getAttribute("src");
      skySrc = skyUrl ? `assets/${extractFileName(skyUrl)}` : "";
      if (skyUrl) await downloadAndAddToZip(zip, skyUrl, skySrc);
    }
    const entities = [];
    scene.querySelectorAll("a-entity, a-image, a-sphere, a-sky").forEach(entity => {
      const isController =
        entity.hasAttribute("laser-controls") ||
        entity.hasAttribute("hp-mixed-reality-controls") ||
        entity.getAttribute("id") === "camera-scene-1" ||
        entity.getAttribute("id") === "leftHand";
      if (!isController) {
        const entityData = {
          tagName: entity.tagName,
          attributes: {},
        };
        Array.from(entity.attributes).forEach(attr => {
          let value = attr.value;
          console.log(value);

          // Vérifie les attributs `src` pour les images et ajoute au zip
          if (attr.name === "src" && value.startsWith("data:image")) {
            const imagePath = `assets/${extractFileName(value)}`;
            value = imagePath;
            downloadAndAddToZip(zip, value, imagePath);
          }
          if (attr.name === "src") {
            entityData.attributes[attr.name] = skySrc;
          }
          
          });

        // Si l'entité est un a-sky, met à jour son attribut src
        if (entity.tagName === "a-sky" && skySrc) {
          entityData.attributes["src"] = skySrc;
        }

        entities.push(entityData);
      }
    });

    scenesData.push({
      id: sceneId,
      entities: entities,
    });
  }

  // Ajoute le fichier JSON des scènes dans le ZIP
  const scenesJson = JSON.stringify(scenesData, null, 2);
  zip.file("scenes.json", scenesJson);
  // Génére et télécharge le fichier ZIP
  zip.generateAsync({ type: "blob" }).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scenes.zip";
    a.click();
    URL.revokeObjectURL(url);
  });
}

// Fonction pour extraire le nom de fichier
function extractFileName(src) {
  return `image_${Math.random().toString(36).substring(2, 15)}.png`;
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