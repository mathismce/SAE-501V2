// Composant pour suivre la position de la sphère
AFRAME.registerComponent('follow-sphere', {
    schema: {
      target: { type: 'selector' } 
    },
    tick: function () {
      var spherePosition = this.data.target.getAttribute('position'); 
      this.el.setAttribute('position', { x: spherePosition.x, y: spherePosition.y + 1.5, z: spherePosition.z });
  
  
      var camera = document.getElementById('camera');
      var cameraPosition = camera.getAttribute('position');

      var cameraVector = new THREE.Vector3(cameraPosition.x, cameraPosition.y, cameraPosition.z);
  
      this.el.object3D.lookAt(cameraVector);
    }
  });