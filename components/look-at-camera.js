AFRAME.registerComponent('look-at-camera', {
    tick: function () {
      var sceneId = this.el.sceneEl.id; 
      var camera = document.getElementById('camera-' + sceneId);
      var cameraPosition = camera.object3D.position;
      this.el.object3D.lookAt(cameraPosition);
    }
  });