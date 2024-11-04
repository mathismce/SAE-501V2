AFRAME.registerComponent('follow-camera', {
    tick: function () {
        var sceneId = this.el.sceneEl.id;
        var camera = document.getElementById('camera-' + sceneId);
        var cameraDirection = new THREE.Vector3();
        camera.object3D.getWorldDirection(cameraDirection);
        var distance = -4;
        var followerPosition = new THREE.Vector3();
        followerPosition.copy(camera.object3D.position).addScaledVector(cameraDirection, distance);
        this.el.object3D.position.copy(followerPosition);

    }
});