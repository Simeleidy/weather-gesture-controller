# Controlador de Gestos del Tiempo

Controla efectos meteorológicos con la mano usando la webcam (MediaPipe Hand Landmarker + Canvas).

## Ejecutar
Los módulos ES y la cámara necesitan un servidor local:

    python -m http.server 8000

Abre http://localhost:8000 (requiere internet para cargar MediaPipe y el modelo).

## Gestos
| Gesto | Efecto |
|---|---|
| Puño | Lluvia |
| Mano abierta | Sol (sigue la palma) |
| Dedo índice | Nublado |
| Dos manos juntas | Despejado |
| Dos índices | Modo estrella |

## Estructura
    index.html          Estructura de la página
    css/styles.css      Estilos
    js/config.js        URLs, umbrales y textos
    js/handTracker.js   Cámara, MediaPipe y esqueleto de la mano
    js/gestures.js      Clasificación de gestos y suavizado
    js/effects.js       Efectos del canvas (lluvia, sol, nubes, estrellas)
    js/main.js          Bucle principal y eventos de la interfaz
