AFRAME.registerComponent('resize-on-click', {
    schema: {
      target: { type: 'selector' }, // L'élément à redimensionner (le `backgroundPlane`)
      textTitle: { type: 'selector' }, // Sélecteur du texte du titre à redimensionner
      textDescription: { type: 'selector' }, // Sélecteur du texte de la description à redimensionner
      defaultWidth: { type: 'number', default: 5 }, // Largeur par défaut du `backgroundPlane`
      defaultHeight: { type: 'number', default: 3 }, // Hauteur par défaut du `backgroundPlane`
      reducedWidth: { type: 'number', default: 2 }, // Largeur réduite
      reducedHeight: { type: 'number', default: 1.2 }, // Hauteur réduite
      defaultTitleScale: { type: 'vec3', default: { x: 2.4, y: 2.4, z: 2.4 } }, // Taille par défaut du texte du titre
      reducedTitleScale: { type: 'vec3', default: { x: 1.2, y: 1.2, z: 1.2 } }, // Taille réduite du texte du titre
      defaultDescriptionScale: { type: 'vec3', default: { x: 2.0, y: 2.0, z: 2.0 } }, // Taille par défaut du texte de la description
      reducedDescriptionScale: { type: 'vec3', default: { x: 1.0, y: 1.0, z: 1.0 } } // Taille réduite du texte de la description
    },
  
    init: function () {
      this.isExpanded = true; // État initial : l'élément est agrandi
  
      this.el.addEventListener('click', () => {
        if (this.data.target) {
          // Alterner entre les dimensions d'origine et réduites pour le `backgroundPlane`
          const newWidth = this.isExpanded ? this.data.reducedWidth : this.data.defaultWidth;
          const newHeight = this.isExpanded ? this.data.reducedHeight : this.data.defaultHeight;
  
          // Modifier la largeur et la hauteur de l'élément cible (`backgroundPlane`)
          this.data.target.setAttribute('width', newWidth);
          this.data.target.setAttribute('height', newHeight);
  
          // Alterner entre les dimensions d'origine et réduites pour le texte du titre (si spécifié)
          if (this.data.textTitle) {
            const newTitleScale = this.isExpanded ? this.data.reducedTitleScale : this.data.defaultTitleScale;
            this.data.textTitle.setAttribute('scale', newTitleScale);
          }
  
          // Alterner entre les dimensions d'origine et réduites pour le texte de la description (si spécifié)
          if (this.data.textDescription) {
            const newDescriptionScale = this.isExpanded ? this.data.reducedDescriptionScale : this.data.defaultDescriptionScale;
            this.data.textDescription.setAttribute('scale', newDescriptionScale);
          }
  
          // Inverser l'état
          this.isExpanded = !this.isExpanded;
        }
      });
    }
  });
  