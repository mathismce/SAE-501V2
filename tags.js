import { changeScene } from "./main.js";

// Objet pour stocker les tags par scène
export let tagsByScene = {};

// Classe de base pour les tags
class Tag {
  constructor(sceneId, title, position) {
    this.sceneId = sceneId; // ID de la scène à laquelle le tag appartient
    this.title = title; // Titre du tag
    this.position = position; // Position du tag dans la scène
    this.id = `${Date.now()}`; // ID unique pour le tag basé sur le timestamp actuel
  }

  // Méthode pour créer un élément HTML avec des attributs spécifiés
  createElement(type, attributes) {
    const element = document.createElement(type);
    for (const key in attributes) {
      element.setAttribute(key, attributes[key]);
    }
    return element;
  }

  // Méthode pour ajouter des éléments à une scène
  appendToScene(scene, elements) {
    elements.forEach(element => scene.appendChild(element));
  }


  // Méthode pour sélectionner un tag
  select() {
    // Retirer la classe 'selected' de tous les tags
    document.querySelectorAll('.tag').forEach(tag => {
      tag.classList.remove('selected');
    });

    // Ajouter la classe 'selected' au tag actuel
    const tagElement = document.getElementById(this.id);
    if (tagElement) {
      tagElement.classList.add('selected');
    }
  }
}

// Classe pour les tags de type porte
class DoorTag extends Tag {
  constructor(sceneId, title, position, targetSceneId) {
    super(sceneId, title, position);
    this.targetSceneId = targetSceneId;
  }

  // Méthode pour créer un tag de type porte
  create() {
    const scene = document.getElementById(this.sceneId);
    const newSphere = this.createElement("a-sphere", {
      position: this.position,
      id: this.id,
      radius: "0.35",
      color: "#EF2D5E",
      dragndrop: "",
      "look-at-camera": "",
      "data-tag-id": this.id,
      class: "tag"
    });

    const infoBox = document.createElement("a-entity");
    const infoBoxOffset = { x: -2, y: 4, z: 0 }; 
    infoBox.setAttribute("position", {
      x: this.position.x + infoBoxOffset.x,
      y: this.position.y + infoBoxOffset.y,
      z: this.position.z + infoBoxOffset.z,
    });

    infoBox.setAttribute("follow-mover", { target: newSphere });
    infoBox.setAttribute("look-at-camera", "");

    const newBox = this.createElement("a-box", {
      position: "1 -2 0",
      color: "#4CC3D9",
      id: `${this.id}-box`,
      width: "2",
      height: "4",
      depth: "0.5",
      "look-at-camera": "",
      class: "door",
      "data-tag-id": this.id,
      class: "tag"
    });
    infoBox.appendChild(newBox);

    newBox.addEventListener("click", () => {
      if (this.targetSceneId) {
        changeScene(this.targetSceneId);
      }
    });

    this.appendToScene(scene, [newSphere, infoBox]);
  }

  // Méthode pour supprimer un tag de type porte
  remove() {
    const tagElement = document.getElementById(this.id);
    const boxElement = document.getElementById(`${this.id}-box`);
    if (tagElement) {
      tagElement.parentNode.removeChild(tagElement);
    } 
    if (boxElement) {
      boxElement.parentNode.removeChild(boxElement);
    }
  }
}

// Classe pour les tags de type information
class InfoTag extends Tag {
  constructor(sceneId, title, position, description) {
    super(sceneId, title, position);
    this.description = description; // Description du tag
  }

  // Méthode pour créer un tag de type information
  create() {
    const scene = document.getElementById(this.sceneId);
    const newSphere = this.createElement("a-sphere", {
      id: `sphere-${this.id}`, // Attribuer un ID unique à la sphère
      position: this.position,
      radius: "0.35",
      color: "#EF2D5E",
      dragndrop: "",
      "look-at-camera": "",
      "data-tag-id": this.id,
      class: "tag"
    });
    
    // Créer la boîte de réduction
    const reductionBox = this.createElement("a-box", {
      position: { x: 0.4, y: 0.4, z: 0},
      depth: "0.5",
      height: "0.5",
      width: "0.5",
      "data-tag-id": this.id,
      color: "#EF2D5E"
    });

    const infoBox = document.createElement("a-entity");
    infoBox.setAttribute("id", `infoBox-${this.id}`); // Attribuer un ID unique à l'infoBox
    
    const infoBoxOffset = { x: -2, y: 0.7, z: 0 }; // Décalage basé sur la taille du `backgroundPlane`
    infoBox.setAttribute("position", {
        x: this.position.x + infoBoxOffset.x,
        y: this.position.y + infoBoxOffset.y,
        z: this.position.z + infoBoxOffset.z,
    });

    // Ajouter les composants de suivi
    infoBox.setAttribute("follow-mover", { target: newSphere });
    infoBox.setAttribute("look-at-camera", "");

    // Créer le fond noir de la boîte
    const backgroundPlane = document.createElement("a-plane");
    backgroundPlane.setAttribute("width", "5"); // Largeur agrandie
    backgroundPlane.setAttribute("height", "3"); // Hauteur agrandie
    backgroundPlane.setAttribute("color", "#000000");
    backgroundPlane.setAttribute("material", "opacity: 0.8; transparent: true");
    backgroundPlane.setAttribute("position", "2.5 -1.5 0.05"); 
    backgroundPlane.setAttribute("data-tag-id", this.id);// Alignement ajusté avec la sphère
    backgroundPlane.setAttribute("look-at-camera", "");// 
    infoBox.appendChild(backgroundPlane);

    // Ajouter le titre avec une position ajustée et un texte plus grand
    const titleText = document.createElement("a-text");
    titleText.setAttribute("value", this.title);
    titleText.setAttribute("position", "2.5 -0.5 0.1"); // Position ajustée pour le titre
    titleText.setAttribute("width", "4.5"); // Largeur augmentée
    titleText.setAttribute("scale", "2.4 2.4 2.4"); // Taille du texte augmentée
    titleText.setAttribute("align", "center");
    titleText.setAttribute("color", "#EF2D5E");
    titleText.setAttribute("font", "https://cdn.aframe.io/fonts/mozillavr.fnt");
    titleText.setAttribute("data-tag-id", this.id);
    titleText.setAttribute("look-at-camera", "");
    infoBox.appendChild(titleText);

    // Ajouter la description stylisée avec une position ajustée et un texte plus grand
    const descriptionText = document.createElement("a-text");
    descriptionText.setAttribute("value", this.description);
    descriptionText.setAttribute("position", "2.5 -1.8 0.1"); // Position ajustée pour être en dessous du titre
    descriptionText.setAttribute("scale", "2.0 2.0 2.0"); // Taille du texte augmentée
    descriptionText.setAttribute("width", "2.4"); // Largeur augmentée pour le texte
    descriptionText.setAttribute("align", "center");
    descriptionText.setAttribute("color", "#FFFFFF");
    descriptionText.setAttribute("data-tag-id", this.id);
    descriptionText.setAttribute("look-at-camera", "");
    infoBox.appendChild(descriptionText);

    reductionBox.setAttribute("resize-on-click", {
      target: backgroundPlane,
      textTitle: titleText,
      textDescription: descriptionText,
      defaultWidth: 5, // Largeur d'origine du `backgroundPlane`
      defaultHeight: 3, // Hauteur d'origine du `backgroundPlane`
      reducedWidth: 0,  // Largeur réduite
      reducedHeight: 0, // Hauteur réduite
      defaultTitleScale: { x: 2.4, y: 2.4, z: 2.4 }, // Échelle d'origine du titre
      reducedTitleScale: { x: 0, y: 0, z: 0 }, // Échelle réduite du titre
      defaultDescriptionScale: { x: 2.0, y: 2.0, z: 2.0 }, // Échelle d'origine de la description
      reducedDescriptionScale: { x: 0, y: 0, z:0 } // Échelle réduite de la description
    });

    // Ajouter la sphère et l'infoBox dans la scène
    this.appendToScene(scene, [newSphere, infoBox]);
    newSphere.appendChild(reductionBox); // Ajouter `reductionBox` à la sphère
  }  
  
  remove() {
    const sphereElement = document.getElementById(`sphere-${this.id}`);
    const infoBoxElement = document.getElementById(`infoBox-${this.id}`);
    
    if (sphereElement) {
      sphereElement.parentNode.removeChild(sphereElement);
    }

    if (infoBoxElement) {
      infoBoxElement.parentNode.removeChild(infoBoxElement);
    } 
  }
}

// Classe pour les tags de type photo
class PhotoTag extends Tag {
  constructor(sceneId, title, position, imageUrl) {
    super(sceneId, title, position);
    this.imageUrl = imageUrl; // URL de l'image pour le tag photo
  }

  // Méthode pour créer un tag de type photo
  create() {
    const scene = document.getElementById(this.sceneId);

    const camera = scene.camera;
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const cameraPosition = camera.position.clone();
    const distance = 2; 
    const targetPosition = cameraPosition.add(cameraDirection.multiplyScalar(distance));

    const image = this.createElement("a-image", {
      id: `image-${this.id}`, // Attribuer un ID unique à l'image
      src: this.imageUrl,
      position: `${targetPosition.x} ${targetPosition.y} ${targetPosition.z}`,
      width: "2",
      height: "2",
      dragndrop: "", 
      "look-at-camera": "",
      "data-tag-id": this.id,
      class: "tag"
    });

    this.appendToScene(scene, [image]);
  }

  remove() {
    const imageElement = document.getElementById(`image-${this.id}`);
    if (imageElement) {
      imageElement.parentNode.removeChild(imageElement);
    } 
  }
}

// Classe pour les tags de type vidéo
class VideoTag extends Tag {
  constructor(sceneId, title, position, videoUrl) {
    super(sceneId, title, position);
    this.videoUrl = videoUrl; // URL de la vidéo pour le tag vidéo
  }

  // Méthode pour créer un tag de type vidéo
  create() {
    const scene = document.getElementById(this.sceneId);

    const camera = scene.camera;
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    const cameraPosition = camera.position.clone();
    const distance = 2; 
    const targetPosition = cameraPosition.add(cameraDirection.multiplyScalar(distance));

    const video = this.createElement("a-video", {
      id: `video-${this.id}`, // Attribuer un ID unique à la vidéo
      src: this.videoUrl,
      position: `${targetPosition.x} ${targetPosition.y} ${targetPosition.z}`,
      width: "4",
      height: "2.25",
      autoplay: "true",
      loop: "true",
      dragndrop: "",
      "look-at-camera": "",
      "data-tag-id": this.id,
      class: "tag"
    });

    this.appendToScene(scene, [video]);
  }

  // Méthode pour supprimer un tag de type vidéo
  remove() {
    const videoElement = document.getElementById(`video-${this.id}`);
    
    if (videoElement) {
      videoElement.parentNode.removeChild(videoElement);
    } 
  }
}

export { Tag, DoorTag, InfoTag, PhotoTag, VideoTag };