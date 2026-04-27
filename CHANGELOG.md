# Base de Prix v2.1 — Préservation 100% du fichier Excel + Menu kebab

## 🔧 Corrections de cette version (v2.1)

### 1. ✅ Mise en forme du fichier Excel — VRAIMENT préservée maintenant

**Problème en v2.0** : Même avec `xlsx-js-style`, la mise en forme se perdait.
La librairie SheetJS (et son fork) **réécrit le fichier intégralement** ce qui
fait perdre certains éléments (mise en forme conditionnelle, validations, formes,
parfois des styles).

**Solution v2.1** : J'ai abandonné l'approche SheetJS pour la sauvegarde.
À la place, j'utilise du **ZIP-patching pur** avec JSZip :

> Un fichier `.xlsx` ou `.xlsm` est en réalité un ZIP qui contient des fichiers XML.
> Au lieu de réécrire tout le fichier, on **ouvre le ZIP, on modifie uniquement
> le bloc `<sheetData>...</sheetData>` des feuilles concernées** (BASE_PRIX et
> les feuilles de lots), et on referme le ZIP.

**Tout le reste reste bit-pour-bit identique** :
- ✅ Macros (`vbaProject.bin`) : intact
- ✅ Styles (`styles.xml`) : intact → toutes les couleurs, polices, bordures conservées
- ✅ Theme (`theme1.xml`) : intact
- ✅ Mise en forme conditionnelle : intacte
- ✅ Validations de données : intactes
- ✅ Formes/boutons VBA (drawings) : intacts
- ✅ Hyperliens (menu, bouton "Ajouter prix"...) : intacts
- ✅ Autres feuilles (MENU, IMPORT_MASSE, etc.) : intactes
- ✅ Largeurs de colonnes, hauteurs de lignes
- ✅ Mise en page, marges, en-têtes/pieds de page
- ✅ Format des prix (`#,##0.00 "€"`), format des dates (`yyyy-mm-dd`)

**Comment ça marche concrètement** :
1. On lit le fichier en tant que ZIP
2. On trouve la feuille `BASE_PRIX` et les feuilles de lots
3. Pour chaque feuille modifiée :
   - On localise le bloc `<sheetData>...</sheetData>`
   - On garde toutes les lignes ≤ ligne d'en-tête (titre, en-têtes)
   - On capture la **première ligne de données comme prototype** : ses attributs
     `<row>` (hauteur, custom...) et les attributs `<c s="..." />` (style) de chaque cellule
   - On supprime toutes les anciennes lignes de données
   - On insère les nouvelles lignes en réutilisant les attributs prototypes
     (donc le style `s="..."` est conservé pour TOUTES les nouvelles lignes)
   - On met à jour `<dimension ref="A1:..."/>`
4. Les dates sont converties en numéros série Excel (pour qu'Excel applique le format date)
5. Le ZIP est refermé en respectant la compression DEFLATE

J'ai testé avec un fichier xlsx généré par ExcelJS (couleurs, formats numériques,
formats de date, hauteurs personnalisées) — **tout est préservé** après sync,
y compris les nouvelles lignes qui héritent automatiquement du style.

### 2. 🍔 Menu kebab style Google — fini le bandeau tronqué

**Problème en v2.0** : Le menu déroulant était à l'intérieur du `<nav>` qui
avait `overflow-x: auto`, ce qui le tronquait.

**Solution v2.1** :
- Bouton **« ⋮ »** (kebab) à côté du bouton « Lier fichier Excel ».
- Menu en `position: fixed` avec calcul de position en JS depuis le bouton
  (donc **plus jamais tronqué** par les containers parents).
- Animation d'apparition douce (fade + slide).
- Items avec icônes alignées et codes couleur :
  - 🟢 Vert : actions positives (synchroniser)
  - 🔴 Rouge : actions destructrices (délier)
  - Gris : actions neutres (ouvrir, afficher dossier, changer de fichier)
- Adapte les options visibles selon que c'est lié ou non.
- Ferme par : clic ailleurs, <kbd>Échap</kbd>, ou clic sur un item.

## ⚠️ À savoir

- **Premier patch d'un fichier qui n'a aucune ligne data** : si la feuille
  `BASE_PRIX` ne contient que les en-têtes au moment de la première sync, l'app
  n'aura pas de "ligne prototype" pour copier les styles cellule. Les nouvelles
  lignes auront un style par défaut (pas de couleur alternée par exemple).

  **Astuce** : pour avoir une mise en forme parfaite dès le départ, mets
  manuellement **une ligne de prix dans Excel avec la mise en forme que tu veux**,
  puis fais ta première sync — toutes les lignes suivantes hériteront de ce style.

- **Format de date** : la colonne dont l'en-tête contient le mot « Date » est
  automatiquement détectée comme colonne date → les valeurs `YYYY-MM-DD` sont
  converties en numéros série Excel. Si tu utilises un autre nom d'en-tête
  (ex. « Période »), la date sera écrite comme texte.

## 📦 Fichiers

| Fichier         | Status |
|-----------------|--------|
| `index.html`    | **Mise à jour** : ZIP-patching + menu kebab |
| `main.js`       | Inchangé depuis v2.0 (focus déjà corrigé) |
| `preload.js`    | Inchangé depuis v2.0 |
| `package.json`  | Inchangé depuis v2.0 |

Pour mettre à jour : remplacer juste `index.html` (les autres fichiers n'ont pas changé).

---

## 📜 Historique v2.0 (initial)

### Corrections initiales
- ✅ **Bug du focus clavier** dans les modals (Electron/Windows)
- ✅ **Liaison Excel** avec import des prix existants au branchement
- ✅ **Boutons inutiles supprimés** (Import Base, Export brut Dev)
- ✅ **Saisie masse refaite** en grille éditable inline avec collage Excel
- ✅ **DPGF multi-feuilles** avec détection auto et toggle d'affichage
