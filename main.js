import { closeAllMenus, updateSceneDropdown } from "./domUtils.js";
import {
  Tag,
  DoorTag,
  InfoTag,
  PhotoTag,
  tagsByScene,
  VideoTag,
} from "./tags.js";
import {
  scenes,
  createSceneElement,
  displayScene,
  displayDefaultScene,
  saveAllScenes,
  loadScenesFromJson,
} from "./sceneManager.js";

// Exécute le code une fois que le DOM est complètement chargé
document.addEventListener("DOMContentLoaded", function () {
  // Récupère les éléments du DOM
  const sceneDropdown = document.getElementById("sceneDropdown");
  const fileInput = document.getElementById("fileInput");
  const createSceneBtn = document.getElementById("createSceneBtn");
  const editSceneForm = document.getElementById("editSceneForm");
  const sceneNameInput = document.getElementById("sceneNameInput");
  const editFileInput = document.getElementById("editFileInput");
  const saveSceneBtn = document.getElementById("saveSceneBtn");
  const deleteSceneBtn = document.getElementById("deleteSceneBtn");
  const deleteModal = document.getElementById("deleteModal");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const customFileInputBtn = document.getElementById("customFileInputBtn");
  const fileName = document.getElementById("fileName");
  const OpenTagMenuText = document.getElementById("OpenTagMenuText");
  const createDoorBtn = document.getElementById("createDoorTagBtn");
  const createInfoBtn = document.getElementById("createTagBtnText");
  const menuRight = document.getElementById("menuRight");
  const leftHand = document.getElementById("leftHand");
  const rightHand = document.getElementById("rightHand");
  const infoToggle = document.getElementById("info-toggle");
  const infoToggleDoor = document.getElementById("info-toggle-door");
  const infoTogglePhoto = document.getElementById("info-toggle-photo");
  const popup = document.getElementById("popup");
  const closePopup = document.getElementById("close-popup");
  const createVideoTagBtn = document.getElementById("createVideoTagBtn");

  // Tableau pour stocker les boutons de tag et leurs conteneurs associés
  let tagButtons = [
    { button: OpenTagMenuText, containerId: "textTagFormContainer" },
    { button: OpenTagMenuDoor, containerId: "doorTagFormContainer" },
    { button: OpenTagMenuPhoto, containerId: "photoTagFormContainer" },
    { button: OpenTagMenuVideo, containerId: "videoTagFormContainer" },
  ];
  let tagsByScene = [];
  let selectedDoor = null;
  let associatedBox = null;
  let selectedImage = null;
  let selectedVideoTag = null;

  // Ajoute des écouteurs d'événements pour les boutons d'information
  infoToggle.addEventListener("click", function (event) {
    event.preventDefault();
    popup.classList.toggle("hidden");
  });

  infoToggleDoor.addEventListener("click", function (event) {
    event.preventDefault();
    popup.classList.toggle("hidden");
  });

  infoTogglePhoto.addEventListener("click", function (event) {
    event.preventDefault();
    popup.classList.toggle("hidden");
  });

  closePopup.addEventListener("click", function (event) {
    event.preventDefault();
    popup.classList.add("hidden");
  });

  // Ajoute des écouteurs d'événements pour les mains gauche et droite
  leftHand.addEventListener("triggerdown", () => {
    const intersectedEl = leftHand.components.raycaster.intersectedEls[0];
    if (intersectedEl && intersectedEl.classList.contains("door")) {
      intersectedEl.emit("click");
    }
  });

  rightHand.addEventListener("triggerdown", () => {
    const intersectedEl = rightHand.components.raycaster.intersectedEls[0];
    if (intersectedEl && intersectedEl.classList.contains("door")) {
      intersectedEl.emit("click");
    }
  });

  // Ajoute des écouteurs d'événements pour les portes
  const doors = document.querySelectorAll(".door");
  doors.forEach((door) => {
    door.addEventListener("click", () => {
      const targetSceneId = door.getAttribute("data-target-scene");
      if (targetSceneId) {
        changeScene(targetSceneId);
      }
    });
  });

  // Ajoute un écouteur d'événements pour la sélection des images et des portes
  document.addEventListener("click", function (event) {
    if (event.target.tagName === "A-IMAGE") {
      if (selectedImage) {
        selectedImage.classList.remove("selected");
      }
      selectedImage = event.target;
    }
    if (event.target.tagName === "A-SPHERE") {
      if (selectedDoor) {
        selectedDoor.classList.remove("selected");
        if (associatedBox) {
          associatedBox.classList.remove("selected");
        }
      }

      selectedDoor = event.target;
      selectedDoor.classList.add("selected");

      const boxId = selectedDoor.getAttribute("id");
      associatedBox = document.querySelector(`a-box[id="${boxId}"]`);

      if (associatedBox) {
        associatedBox.classList.add("selected");
      }
    }
    if (event.target.tagName === "A-VIDEO") {
      if (selectedVideoTag) {
        selectedVideoTag.classList.remove("selected");
      }
      selectedVideoTag = event.target;
      selectedVideoTag.classList.add("selected");
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Delete") {
      const selectedTag = document.querySelector(".tag.selected");
      if (selectedTag) {
        const tagId = selectedTag.getAttribute("data-tag-id");
        removeTag(tagId);
      }
    }
  });

  // Ajoute un écouteur d'événements pour le bouton de téléchargement de JSON
  document.getElementById("uploadJsonBtn").addEventListener("click", () => {
    document.getElementById("uploadJsonInput").click();
  });

  // Ajoute un écouteur d'événements pour le téléchargement de JSON
  document
    .getElementById("uploadJsonInput")
    .addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const scenesJson = JSON.parse(e.target.result); // Parse le texte en JSON
          loadScenesFromJson(scenesJson);
        };
        reader.readAsText(file);
      }
    });

  // Ajoute un écouteur d'événements pour le bouton de sauvegarde de l'expérience
  document.getElementById("saveExperienceBtn").addEventListener("click", async () => {
    await saveAllScenes();
  });

  // Ajoute des écouteurs d'événements pour les boutons de tag
  tagButtons.forEach((menu) => {
    menu.button.addEventListener("click", function () {
      closeAllMenus();
      const formContainer = document.getElementById(menu.containerId);
      formContainer.classList.toggle("hidden");
    });
  });

  tagButtons.forEach(({ button }) => {
    button.addEventListener("click", function () {
      menuRight.classList.remove("hidden");
    });
  });

  // Ajoute un écouteur d'événements pour le bouton de création de scène
  createSceneBtn.addEventListener("click", function () {
    fileInput.click();
  });

  // Ajoute un écouteur d'événements pour le téléchargement de fichier de scène
  fileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const sceneId = `scene-${scenes.length + 1}`;
        scenes.push({
          id: sceneId,
          name: `Scène ${scenes.length + 1}`,
          src: e.target.result,
        });

        const option = document.createElement("option");
        option.value = sceneId;
        option.textContent = `Scène ${scenes.length}`;
        sceneDropdown.appendChild(option);

        createSceneElement(sceneId, e.target.result);
        sceneDropdown.value = sceneId;
        displayScene(sceneId);
        editSceneForm.classList.remove("hidden");
        sceneNameInput.value = `Scène ${scenes.length}`;
      };
      reader.readAsDataURL(file);
    }
  });

  // Ajoute un écouteur d'événements pour le changement de scène
  sceneDropdown.addEventListener("change", function () {
    const selectedSceneId = sceneDropdown.value;
    if (selectedSceneId) {
      displayScene(selectedSceneId);
      updateTagSelectorDoor(selectedSceneId);
      const selectedScene = scenes.find(
        (scene) => scene.id === selectedSceneId
      );
      if (selectedScene) {
        sceneNameInput.value = selectedScene.name;
        fileName.textContent = selectedScene.fileName || "";
        editSceneForm.classList.remove("hidden");
      }
    } else {
      editSceneForm.classList.add("hidden");
      fileName.textContent = "";
    }
  });

  // Ajoute un écouteur d'événements pour le bouton de sauvegarde de scène
  saveSceneBtn.addEventListener("click", function () {
    const selectedSceneId = sceneDropdown.value;
    const selectedScene = scenes.find((scene) => scene.id === selectedSceneId);
    if (selectedScene) {
      selectedScene.name = sceneNameInput.value;
      const option = sceneDropdown.querySelector(
        `option[value="${selectedSceneId}"]`
      );
      if (option) {
        option.textContent = selectedScene.name;
      }

      const file = editFileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          selectedScene.src = e.target.result;
          selectedScene.fileName = file.name;
          const skyElement = document.querySelector(
            `#${selectedSceneId} a-sky`
          );
          if (skyElement) {
            skyElement.setAttribute("src", selectedScene.src);
          }
          fileName.textContent = file.name;
        };
        reader.readAsDataURL(file);
      }
    }
  });

  // Ajoute un écouteur d'événements pour le bouton de suppression de scène
  deleteSceneBtn.addEventListener("click", function () {
    deleteModal.classList.add("show");
  });

  // Ajoute un écouteur d'événements pour le bouton d'annulation de suppression
  cancelDeleteBtn.addEventListener("click", function () {
    deleteModal.classList.remove("show");
  });

  // Ajoute un écouteur d'événements pour le bouton de confirmation de suppression
  confirmDeleteBtn.addEventListener("click", function () {
    const selectedSceneId = sceneDropdown.value;
    deleteScene(selectedSceneId);
    deleteModal.classList.remove("show");
  });

  // Ajoute un écouteur d'événements pour le bouton de sélection de fichier personnalisé
  customFileInputBtn.addEventListener("click", function () {
    editFileInput.click();
  });

  // Ajoute un écouteur d'événements pour le changement de fichier d'édition
  editFileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      fileName.textContent = file.name;
    } else {
      fileName.textContent = "";
    }
  });

  // Ajouter des gestionnaires d'événements à tous les tags existants
  document.querySelectorAll(".tag").forEach((tag) => {
    tag.addEventListener("click", handleTagSelection);
  });

  // Ajouter un gestionnaire d'événements pour les nouveaux tags créés dynamiquement
  document.addEventListener("tagCreated", (event) => {
    const newTag = event.detail.tagElement;
    newTag.addEventListener("click", handleTagSelection);
  });

  // Ajoute un écouteur d'événements pour la mise à jour du nom de la scène
  document
    .getElementById("sceneNameInput")
    .addEventListener("input", function (event) {
      const sceneId = document.getElementById("sceneDropdown").value;
      const newName = event.target.value;
      if (sceneId) {
        updateSceneName(sceneId, newName);
      }
    });

  // TAGS

  // Écouteurs d'événements pour les boutons de création de tags
  createVideoTagBtn.addEventListener("click", (e) => {
    e.preventDefault();
    createVideoTag();
  });

  createDoorBtn.addEventListener("click", (e) => {
    e.preventDefault();
    createDoorTag();
  });

  createInfoBtn.addEventListener("click", (e) => {
    e.preventDefault();
    createInfoTag();
  });

  document
    .getElementById("createPhotoTagBtn")
    .addEventListener("click", (e) => {
      e.preventDefault();
      createPhotoTag();
    });

  // Ajoute un écouteur d'événement pour le sélecteur de tags de porte
  const tagSelectorDoor = document.getElementById("tagSelectorDoor");
  tagSelectorDoor.addEventListener("change", function () {
    const selectedTagId = tagSelectorDoor.value;
    const selectedSceneId = sceneDropdown.value;
    if (selectedTagId && tagsByScene[selectedSceneId]) {
      for (let i = 0; i < tagsByScene[selectedSceneId].length; i++) {
        if (tagsByScene[selectedSceneId][i] === selectedTagId) {
          const tagInfo = tagsByScene[selectedSceneId][i];
          document.getElementById("tagIdInput").value = tagInfo;
          document.getElementById("doorTagName").value = name;
          document.getElementById("doorTagRange").value = depth;
        }
      }
    }
  });

  displayDefaultScene();
  updateSceneDropdown();
});

// Fonction pour créer un tag vidéo
function createVideoTag() {
  const selectedSceneId = document.getElementById("sceneDropdown").value; // Ajoutez cette ligne
  const title = document.getElementById("videoTagTitle").value;
  const fileInput = document.getElementById("videoFileInput");
  const file = fileInput.files[0];

  if (!title) {
    messageError.innerText = "Erreur : Le titre est obligatoire.";
    return;
  }

  if (!file) {
    messageError.innerText = "Erreur : Veuillez sélectionner une vidéo.";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const videoUrl = event.target.result;
    const position = { x: 0, y: 1.5, z: -3 };

    const videoTag = new VideoTag(selectedSceneId, title, position, videoUrl);
    videoTag.create();

    // Ajouter le tag à tagsByScene
    if (!tagsByScene[selectedSceneId]) {
      tagsByScene[selectedSceneId] = [];
    }
    tagsByScene[selectedSceneId].push(videoTag);

    resetVideoTagForm();
  };

  reader.readAsDataURL(file);
}
// Fonction pour créer un tag de porte
function createDoorTag() {
  const selectedSceneId = sceneDropdown.value;
  const scene = document.getElementById(selectedSceneId);
  let messageError = document.getElementById("error");

  if (!scene) {
    messageError.innerText = "Erreur : Scène non trouvée.";
    return;
  }

  const doorTagTitle = document.getElementById("doorTagTitle").value;
  const doorSceneSelect = document.getElementById("doorSceneSelect");
  const targetSceneId = doorSceneSelect.value;

  // Vérifier que le titre est rempli
  if (!doorTagTitle) {
    messageError.innerText = "Erreur : Le titre est obligatoire.";
    return;
  }

  // Vérifier que la scène cible est sélectionnée
  if (!targetSceneId) {
    messageError.innerText = "Erreur : La scène cible est obligatoire.";
    return;
  }

  // Vérifier que la scène cible n'est pas la même que la scène actuelle
  if (selectedSceneId === targetSceneId) {
    messageError.innerText =
      "Erreur : La scène cible ne peut pas être la même que la scène actuelle.";
    return;
  }

  const cameraId = "camera-" + selectedSceneId;
  const camera = document.getElementById(cameraId);

  const cameraDirection = new THREE.Vector3();
  camera.object3D.getWorldDirection(cameraDirection);
  const distance = -10;
  const tagPosition = new THREE.Vector3()
    .copy(camera.object3D.position)
    .addScaledVector(cameraDirection, distance);

  const doorTag = new DoorTag(
    selectedSceneId,
    doorTagTitle,
    tagPosition,
    targetSceneId
  );
  doorTag.create();

  // Ajouter le tag à tagsByScene
  if (!tagsByScene[selectedSceneId]) {
    tagsByScene[selectedSceneId] = [];
  }
  tagsByScene[selectedSceneId].push(doorTag);

  resetDoorTagForm();
  messageError.innerText = ""; // Réinitialiser le message d'erreur
}
// Fonction pour créer un tag d'information
function createInfoTag() {
  const selectedSceneId = sceneDropdown.value;
  const scene = document.getElementById(selectedSceneId);
  let messageError = document.getElementById("error");

  if (!scene) {
    messageError.innerText = "Erreur : Scène non trouvée.";
    return;
  }

  const infoTagTitle = document.getElementById("tagTitle").value;
  const infoTagDescription = document.getElementById("tagDescription").value;

  if (!infoTagTitle) {
    messageError.innerText = "Erreur : Le titre est obligatoire.";
    return;
  }

  if (!infoTagDescription) {
    messageError.innerText = "Erreur : La description est obligatoire.";
    return;
  }

  if (infoTagTitle.length > 18) {
    messageError.innerText =
      "Erreur : Le titre ne doit pas dépasser 18 caractères.";
    return;
  }

  if (infoTagDescription.length > 300) {
    messageError.innerText =
      "Erreur : La description ne doit pas dépasser 300 caractères.";
    return;
  }

  const cameraId = "camera-" + selectedSceneId;
  const camera = document.getElementById(cameraId);

  const cameraDirection = new THREE.Vector3();
  camera.object3D.getWorldDirection(cameraDirection);
  const distance = -8;
  const tagPosition = new THREE.Vector3()
    .copy(camera.object3D.position)
    .addScaledVector(cameraDirection, distance);
  console.log(tagPosition);
  const infoTag = new InfoTag(
    selectedSceneId,
    infoTagTitle,
    tagPosition,
    infoTagDescription
  );
  infoTag.create();

  if (!tagsByScene[selectedSceneId]) {
    tagsByScene[selectedSceneId] = [];
  }
  tagsByScene[selectedSceneId].push(infoTag);

  resetInfoTagForm();
  messageError.innerText = "";
}
// Fonction pour créer un tag photo
function createPhotoTag() {
  const selectedSceneId = document.getElementById("sceneDropdown").value;
  const scene = document.getElementById(selectedSceneId);


  const title = document.getElementById("photoTagTitle").value;
  if (!title) {
    messageError.innerText = "Erreur : Le titre est obligatoire.";
    return;
  }

  const fileInput = document.getElementById("photoFileInput");
  const file = fileInput.files[0];

  if (!file) {
    messageError.innerText = "Erreur : Veuillez sélectionner une image.";
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const imageUrl = e.target.result;

    const photoTag = new PhotoTag(selectedSceneId, title, "0 1.6 -2", imageUrl);
    photoTag.create();

    if (!tagsByScene[selectedSceneId]) {
      tagsByScene[selectedSceneId] = [];
    }
    tagsByScene[selectedSceneId].push(photoTag);

    resetPhotoTagForm();
  };

  reader.readAsDataURL(file);
}
// Fonction pour réinitialiser le formulaire de tag vidéo
function resetVideoTagForm() {
  document.getElementById("videoTagTitle").value = "";
  document.getElementById("videoFileInput").value = "";
}
// Fonction pour réinitialiser le formulaire de tag photo
function resetPhotoTagForm() {
  document.getElementById("photoTagTitle").value = "";
  document.getElementById("photoFileInput").value = "";
}
// Fonction pour réinitialiser le formulaire de tag d'information
function resetInfoTagForm() {
  document.getElementById("tagTitle").value = "";
  document.getElementById("tagDescription").value = "";
}
// Fonction pour réinitialiser le formulaire de tag de porte
function resetDoorTagForm() {
  document.getElementById("doorTagTitle").value = "";
  document.getElementById("doorSceneSelect").value = "";
}
// Fonction pour supprimer une scène
function deleteScene(sceneId) {
  const selectedSceneIndex = scenes.findIndex((scene) => scene.id === sceneId);
  if (selectedSceneIndex !== -1) {
    // Rediriger les tags de porte qui mènent à cette scène vers la scène defaultScene
    Object.keys(tagsByScene).forEach((sceneKey) => {
      tagsByScene[sceneKey].forEach((tag) => {
        if (tag.targetSceneId === sceneId) {
          tag.targetSceneId = "defaultScene"; // Rediriger vers la scène defaultScene
        }
      });
    });

    scenes.splice(selectedSceneIndex, 1);
    const option = sceneDropdown.querySelector(`option[value="${sceneId}"]`);
    if (option) {
      option.remove();
    }
    const sceneElement = document.getElementById(sceneId);
    if (sceneElement) {
      sceneElement.remove();
    }
    sceneDropdown.value = "";
    editSceneForm.classList.add("hidden");
    displayDefaultScene();
    updateSceneDropdown();
    checkScenesAndToggleSubMenu();
  }
}
// Fonction pour gérer la sélection des tags
function handleTagSelection(event) {
  // Retirer la classe 'selected' de tous les tags
  document.querySelectorAll(".tag").forEach((tag) => {
    tag.classList.remove("selected");
  });

  // Ajouter la classe 'selected' au tag cliqué
  const clickedTag = event.currentTarget;
  clickedTag.classList.add("selected");
}
// Fonction pour mettre à jour le nom de la scène
function updateSceneName(sceneId, newName) {
  const sceneElement = document.getElementById(sceneId);
  if (sceneElement) {
    sceneElement.setAttribute("data-name", newName);
    const option = doorSceneSelect.querySelector(`option[value="${sceneId}"]`);
    if (option) {
      option.textContent = newName;
      option.setAttribute("data-name", newName);
    }
  }
}
// Fonction pour supprimer un tag
function removeTag(tagId) {
  const tagElement = document.querySelector(`[data-tag-id="${tagId}"]`);
  if (tagElement) {
    const tagInstance = getTagInstanceById(tagId);
    if (tagInstance) {
      tagInstance.remove();
    }
  }
}
// Fonction pour obtenir l'instance de tag par ID
function getTagInstanceById(tagId) {
  for (const sceneTags of Object.values(tagsByScene)) {
    const tagInstance = sceneTags.find((tag) => tag.id === tagId);
    if (tagInstance) {
      return tagInstance;
    }
  }
}

// Fonction pour mettre à jour le sélecteur de tags de porte
export function updateTagSelectorDoor(sceneId) {
  const tagSelectorDoor = document.getElementById("tagSelectorDoor");
  tagSelectorDoor.innerHTML =
    '<option value="" disabled selected>Sélectionnez un tag</option>';
  if (tagsByScene[sceneId] && tagsByScene[sceneId].length > 0) {
    tagsByScene[sceneId].forEach((tag) => {
      const option = document.createElement("option");
      option.value = tag.id;
      option.text = `Tag ${tag.id} : ${tag.name} (Profondeur: ${tag.depth}, Scene Cible: ${tag.targetScene})`;
      tagSelectorDoor.appendChild(option);
    });
  } else {
    const noTagsOption = document.createElement("option");
    noTagsOption.value = "";
    noTagsOption.text = "Aucun tag disponible pour cette scène";
    noTagsOption.disabled = true;
    tagSelectorDoor.appendChild(noTagsOption);
  }
}

// Fonction pour vérifier les scènes et afficher ou masquer le sous-menu
export function checkScenesAndToggleSubMenu() {
  const allScenes = document.querySelectorAll("a-scene");
  const subMenuCreateTag = document.getElementById("subMenuCreateTag");
  const exportSaveBtn = document.getElementById("exportSaveBtn");
  const deleteSceneBtn = document.getElementById("deleteSceneBtn");

  if (allScenes.length > 1) { // Vérifie s'il y a plus d'une scène
    subMenuCreateTag.classList.remove("hidden");
    exportSaveBtn.classList.remove("hidden");
    deleteSceneBtn.disabled = false; // Active le bouton
  } else {
    subMenuCreateTag.classList.add("hidden");
    exportSaveBtn.classList.add("hidden");
    deleteSceneBtn.disabled = true; // Désactive le bouton
  }
}

// Fonction pour changer de scène
export function changeScene(sceneId) {
  const scene = document.getElementById(sceneId);
  const allScenes = document.querySelectorAll("a-scene");
  allScenes.forEach((s) => (s.style.display = "none"));
  scene.style.display = "block";
  document.getElementById("sceneDropdown").value = sceneId;
  updateTagSelectorDoor(sceneId);
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event("resize"));
  });
}
