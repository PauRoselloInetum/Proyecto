try {
    docker info > $null 2>&1
} catch {
    Write-Output "Docker no está en ejecución. Por favor, inicia Docker e intenta de nuevo."
    exit
}

$allContainers = docker ps -a --format "{{.Names}}"
$runningContainers = docker ps --format "{{.Names}}"

if ($allContainers -contains "mongodb_container") {
    if ($runningContainers -contains "mongodb_container") {
        docker stop mongodb_container
    }
    docker rm mongodb_container
} else {
    Write-Output "Contenedor mongodb_container no encontrado."
}

Write-Output "Operacion completada."
