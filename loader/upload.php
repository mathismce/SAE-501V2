<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['file'])) {
        // Vérifier s'il y a des erreurs d'upload
        if ($_FILES['file']['error'] === UPLOAD_ERR_OK) {
            // Définir le répertoire de base pour l'upload
            $uploadDir = '/var/www/portfolio/viewer/visite/';
            $zipFile = $uploadDir . basename($_FILES['file']['name']);

            // Créer le répertoire uploads si nécessaire
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            // Déplacer le fichier uploadé
            if (move_uploaded_file($_FILES['file']['tmp_name'], $zipFile)) {
                echo "Fichier ZIP uploadé avec succès.<br>";

                // Extraction du fichier ZIP dans un dossier unique
                $zip = new ZipArchive;
                if ($zip->open($zipFile) === TRUE) {
                    $uniqueDirName = 'scene_' . time();  // Nom unique basé sur l'horodatage
                    $extractPath = $uploadDir . $uniqueDirName;

                    if ($zip->extractTo($extractPath)) {
                        echo "Fichier extrait à $extractPath.<br>";
                        $zip->close();

                        // Générer l'URL publique
                        $publicURL = 'https://www.m-micheau.mmi-limoges.fr/viewer/visite/' . $uniqueDirName . '/';
                        echo "<p>Votre scène 3D est prête : <a href='" . $publicURL . "'>Accéder à la scène</a></p>";
                    } else {
                        echo "Erreur lors de l'extraction du fichier ZIP.<br>";
                    }
                } else {
                    echo "Erreur lors de l'ouverture du fichier ZIP.<br>";
                }
            } else {
                echo "Erreur lors de l'upload du fichier.<br>";
            }
        } else {
            echo "Erreur d'upload : " . $_FILES['file']['error'] . "<br>";
        }
    } else {
        echo "Aucun fichier sélectionné.<br>";
    }
}
?>
