import { updateSceneDropdown } from './domUtils.js';
import { checkScenesAndToggleSubMenu } from './main.js';

// Tableau pour stocker les scènes
export const scenes = [];

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
export function saveAllScenes() {
  const allScenes = document.querySelectorAll('a-scene');
  const scenesData = [];

  allScenes.forEach(scene => {
    const sceneId = scene.getAttribute('id');
    const skyElement = scene.querySelector('a-sky');
    const src = skyElement ? skyElement.getAttribute('src') : '';

    const entities = [];
    scene.querySelectorAll('a-entity, a-image, a-sphere').forEach(entity => {
      const entityData = {
        tagName: entity.tagName,
        attributes: {}
      };
      Array.from(entity.attributes).forEach(attr => {
        entityData.attributes[attr.name] = attr.value;
      });
      entities.push(entityData);
    });

    scenesData.push({
      id: sceneId,
      src: src,
      entities: entities
    });
  });

  const scenesJson = JSON.stringify(scenesData);
  return scenesJson;
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