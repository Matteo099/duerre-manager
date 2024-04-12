# Duerre Manager


## BUILD
1. accendere docker
2. aprire 'x64 Native Tools Command Prompt for VS 2022' come **amministratore** (C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Visual Studio 2022\Visual Studio Tools\VC)
3. navigare nella cartella del progetto quarkus che si vuole buildare (cd D:\Desktop\Matteo\QuarkusWorkspace\duerre-manager)
4. quarkus build --native
5. l'eseguibile è disponibile nella cartella target (\target\duerre-manager-1.0.0.exe)

[link guida](https://quarkus.io/guides/building-native-image#producing-a-native-executable)

## TODO

- 2D CAD js library:
    - https://maker.js.org/
    - https://github.com/benardt/JScad2d
    - https://konvajs.org/

- Editor:
    - http://fabricjs.com/custom-controls-polygon
    - https://stackoverflow.com/questions/62367880/fabricjs-how-can-i-update-the-custom-control-point-of-a-polygon-after-zoom-or-pa

- Shape matching:
    - https://stackoverflow.com/questions/55529371/opencv-shape-matching-between-two-similar-shapes

- OpenCV
    - https://github.com/quarkiverse/quarkus-opencv
    - -XX:MaxDirectMemorySize=128m

- Konvajs:
    - [ ] edit polygon: https://codepen.io/akitanak/pen/wEMQvL
    - [NEXT] guidelines: https://konvajs.org/docs/sandbox/Objects_Snapping.html#How-to-snap-draggable-shapes-to-each-other
        - snap to grid :checkmark:
        - snap to vertex + highlight available vertices
        - snap to horizontal/vertical/oblique (45°) of vertex
    - [x] grid: https://konvajs.org/docs/
    - [-] canvas scroll (pan - second example): https://konvajs.org/docs/sandbox/Canvas_Scrolling.html
        - quando disegni è sei su un bordo la canvas dovrebbe spostarsi in quella direzione
    - [ ] load: https://konvajs.org/docs/data_and_serialization/Simple_Load.html
    - [ ] save json: https://konvajs.org/docs/data_and_serialization/Serialize_a_Stage.html
    - [ ] save png: https://konvajs.org/docs/data_and_serialization/Stage_Data_URL.html
    - [-] draw / erase: https://konvajs.org/docs/sandbox/Free_Drawing.html
    - [ ] context menu (right click/long tap): https://konvajs.org/docs/sandbox/Canvas_Context_Menu.html#sidebar
    - [-] zoom in/out: https://konvajs.org/docs/sandbox/Zooming_Relative_To_Pointer.html#sidebar
        - aggiustare la griglia in base allo zoom (quando lo zoom è al massimo si vedono i centimetri con i quadrati della griglia enormi, mentre se stiamo ai millimetri la griglia è più fitta ma non troppo)
        - aggiungere più step all agriglia in base allo zoom (es x1 => quadrati grandi x1.5 => quadrati grandi con linee più sottili che indicano la metà...)
    - [ ] resize canvas:
    - [ ] undo/redo: https://konvajs.org/docs/react/Undo-Redo.html#sidebar
    - [-] text measurement over lines/segments: https://konvajs.org/docs/sandbox/Simple_Window_Frame.html 
    - [x] edit text measurement inline (& update points): https://konvajs.org/docs/sandbox/Editable_Text.html (complex demo...)

- mentre tracci la line scrivere la misura (solo testo, senza info freccia etc)
- zoom: in centimetri quadrati enormi, man mano che zoommi quadrati più piccoli
- label sui lati di uno stapo (possibilità di aggiungere delle annotazioni sui lati)

- Angular dynamic baseUrl: https://www.technouz.com/5125/changing-angular-environment-variables-at-runtime/


## PRIORITA'
- [x] nome stampo univoco
- [x] (NON opz, 1 selezione) monocolore, bicolore, tricolore
- [x] (NON opz, multi selezione) TPU / PVC / TR / POLIETILENE
- [x] (NON opz) altezza, larghezza totale, larghezza solo scarpetta, larghezza cresta
- [x] ricerca per h x w + ricerca combinata con disegno
- [x] implementare la ricerca (https://www.mongodb.com/docs/manual/core/link-text-indexes/)
- [] possibilità di tracciare linee (rette) interne allo stampo (per delimitare le fasi dello stampo / i colori)
- [x] vista dettagliata dello stampo

## FEATURES
- rimpiazare Konva.Layer con VirtualLayer (Konva warning: The stage has 6 layers. Recommended maximum number of layers is 3-5. Adding more layers into the stage may drop the performance. Rethink your tree structure, you can use Konva.Group.)
- warning quando viene chiamato il metodo zoom appena si crea un'istanza di EditorManager (Konva warning: Pointer position is missing and not registered by the stage. Looks like it is outside of the stage container. You can set it manually from event: stage.setPointersPositions(event);)
- eliminare bezier line & line => creare un unico strumento linea che internamente crea una curva di bezier retta
- aggiungere bevel sui vertici

