# 📋 Base de Prix — Évolutions v2.3 → v2.5

**Date de livraison :** 28 avril 2026
**Version cible :** 2.5.0
**Compatibilité :** données v2.2 → v2.5 sans migration nécessaire

---

## 🛡️ v2.3 — Sécurité & robustesse

L'objectif de cette version est d'éliminer tout risque de perte de données et de gérer proprement les modifications concurrentes par plusieurs utilisateurs.

### 🔄 Cache local + détection de conflit

Quand vous liez un fichier Excel, l'application crée maintenant une **copie locale** dans `%APPDATA%\Base de Prix\cache\`. Toutes vos modifications transitent par ce cache avant d'être poussées vers le fichier officiel. Le hash SHA-256 du fichier officiel est mémorisé au moment du lien.

**Avantages :**
- Travailler hors-ligne reste possible (le fichier officiel peut être inaccessible)
- Performance améliorée (pas besoin de re-télécharger pour chaque action)
- **Détection des modifications externes** : si quelqu'un d'autre modifie le fichier pendant que vous travaillez, l'app le détecte au moment de la sync

### ⚠️ Modale de résolution de conflit (4 options)

Lorsqu'un conflit est détecté, une modale détaillée s'affiche :
- **🔀 Fusionner intelligemment** (recommandé) : garde tout, dédoublonne par signature
- **🏆 Mes modifs sont prioritaires** : ignore les ajouts externes
- **🤝 Les modifs externes sont prioritaires** : adopte la version distante (snapshot auto avant)
- **✋ Annuler** : garde vos modifs en local, ne push rien

La modale affiche le nombre d'ajouts locaux vs externes, la liste des conflits (même repère + date + projet, prix différent) et des détails dépliables pour chaque catégorie.

### 📂 Modale de choix au lien Excel (3 options)

Au lieu d'écraser silencieusement, le lien d'un fichier Excel propose maintenant :
- **📥 Charger Excel → App** : remplace les données locales par celles du fichier
- **📤 Pousser App → Excel** : écrase le fichier avec les données locales
- **🔀 Fusion intelligente** : combine les deux (dédoublonnage par signature)

### 💾 Snapshots automatiques

Avant chaque opération sensible (sync, résolution de conflit, suppression de lot, reset), un **snapshot JSON** est créé automatiquement dans `%APPDATA%\Base de Prix\snapshots\`. Les 20 derniers sont conservés.

Une nouvelle page **Historique** dans Paramètres permet de lister tous les snapshots avec date, taille et label, restaurer un snapshot d'un clic, créer un snapshot manuel à tout moment et supprimer un snapshot.

### 🚪 Confirmation de fermeture

Si vous fermez l'application avec des modifications non synchronisées, une modale propose :
- **✅ Synchroniser maintenant** (puis fermer)
- **💾 Garder en local et fermer** (sync au prochain démarrage)
- **❌ Annuler la fermeture**

Si vous n'avez aucune modif en attente, la fermeture est instantanée.

### 🌐 Mode hors-ligne automatique

Si le fichier Excel lié devient inaccessible (chantier, NAS down, OneDrive non synchronisé) :
- Bandeau orange "⚠️ Hors-ligne — sync au retour"
- L'app continue à fonctionner normalement en local
- Toutes les modifs sont mémorisées dans le cache
- Sync automatique dès que le fichier redevient accessible

### 🔍 Détection passive des modifications externes (60s)

Toutes les 60 secondes en arrière-plan (option désactivable dans Paramètres), l'app vérifie le hash du fichier officiel. Si une modification externe est détectée, le bandeau de liaison clignote en bleu pour vous alerter.

### ↩ Annulation (Ctrl+Z)

Toutes les opérations destructives (suppression, fusion, sync, résolution de conflit) sont maintenant **annulables** :
- Toast avec lien "↩ Annuler" affiché 5 secondes après l'opération
- Raccourci **Ctrl+Z** disponible partout dans l'app
- Pile de 20 niveaux d'annulation conservée par session

### 🔒 Confirmation "EFFACER" pour le reset complet

Le bouton "Réinitialiser tout" demande maintenant de **taper "EFFACER" en majuscules** pour confirmer (au lieu d'un simple OK/Annuler trop facile à cliquer par erreur). Une sauvegarde JSON automatique est créée avant la suppression.

### 💾 Sauvegarde JSON automatique au démarrage

Au démarrage de l'app, si la base contient des données, une copie JSON datée est ajoutée dans `%APPDATA%\Base de Prix\backups\`. Les 7 dernières sont conservées en rotation.

---

## 🎨 v2.4 — UX & métier

L'objectif est de rendre l'application **plus rapide à utiliser** au quotidien.

### 📊 Ratios dépliables avec détail des prix

Sur la page Ratios, cliquez sur n'importe quelle ligne pour la **déplier** et voir :
- Tous les prix qui composent le ratio (date, projet, désignation, prix, unité)
- L'**écart en %** par rapport à la moyenne (vert si <20%, orange si 20-50%, rouge si >50%)
- Stats détaillées : Min / Max / Moyenne / Médiane
- Boutons rapides ✏️ Modifier et 🗑 Supprimer pour chaque prix

Boutons globaux : "Tout déployer / Tout replier".

### 🔢 Tri des colonnes

Les colonnes des tableaux **Base** et **Ratios** sont maintenant triables (clic sur l'en-tête). Indicateurs ▲▼ visibles. Tri par défaut intelligent.

### ✏️ Édition inline dans la base

Double-cliquez sur n'importe quelle cellule éditable de la **Base** pour la modifier directement, sans ouvrir la modale d'édition. Validation par Entrée, annulation par Échap.

### 🔍 Filtres combinés

Les filtres (recherche + lot + année + projet) sont maintenant **cumulatifs** et instantanés.

### ⌨️ Raccourcis clavier

| Raccourci | Action |
|---|---|
| Ctrl+N | Ajouter un prix |
| Ctrl+F | Focus sur le champ recherche |
| Ctrl+S | Sync forcée vers Excel |
| Ctrl+Z | Annuler la dernière action |
| F2 | Édition inline du champ sélectionné |
| Échap | Fermer toutes les modales ouvertes |

### 🎯 Drag & drop fichiers

Glissez-déposez un fichier `.xlsx` ou `.xlsm` n'importe où sur la fenêtre :
- Sur la page Base → propose de lier le fichier
- Sur la page DPGF → charge le DPGF
- Overlay visuel "📁 Déposer pour..." pendant le drag

### 🔍 Détection automatique d'anomalies

Lors de la saisie d'un prix (modale ou masse), si le prix est **hors plage min-max** des prix existants pour le même repère, un indicateur ⚠️ jaune apparaît avec le détail Min/Max/Moyenne historique.

### 🎯 Suggestions intelligentes en DPGF (similarité textuelle)

Lors de l'association d'une ligne DPGF à un repère existant, l'app suggère maintenant les repères les plus proches **textuellement** (algorithme Jaccard sur les tokens de la désignation), triés par pertinence avec un indicateur ⭐.

Vous gagnez un temps considérable sur les gros DPGF (>200 lignes) car les bons repères apparaissent en tête de liste.

### 🌗 Mode sombre

Bouton 🌗 dans la barre du haut. Persistance de la préférence. Tous les modals, tableaux et formulaires sont adaptés.

### 📦 Détection de doublons à l'ajout

Lors de l'ajout d'un prix, si un prix **identique** existe déjà (même repère + date + projet + prix), l'app le détecte et propose : modifier l'existant, ajouter quand même (cas d'un vrai doublon métier), ou annuler.

---

## 🏗️ v2.5 — Personnalisation des lots

### 📋 Lots entièrement personnalisables

Les 14 lots ne sont plus codés en dur. Une nouvelle section **Paramètres → 🏗️ Gestion des lots** permet de gérer la liste complète :

#### ✏️ Renommer un lot
Migration **automatique** de tous les prix attachés. Avertissement si le lot contient des prix. Nouvelle couleur configurable.

#### ➕ Ajouter un lot
Numéro suggéré automatiquement, couleur choisie via picker, ajout immédiat dans la sidebar et les filtres.

#### 🗑 Supprimer un lot
Si le lot contient des prix, choix entre :
- **📥 Réaffecter à un autre lot** (les prix sont migrés)
- **🗑 Supprimer aussi les prix** (snapshot auto avant)

Suppression refusée s'il n'y a qu'un seul lot.

#### ⠿ Réorganiser par drag & drop
Glissez-déposez les lots pour changer leur ordre. L'ordre se reflète immédiatement dans la sidebar, les filtres et le fichier Excel généré.

#### 🎨 Recolorier un lot
Clic sur la pastille de couleur pour ouvrir le picker. Mise à jour partout instantanément.

#### 🔄 Restaurer les 14 lots par défaut
Bouton "Restaurer" en bas de la liste, avec confirmation.

### 📊 Migration et compatibilité descendante

- Les prix existants sont **migrés automatiquement** lors d'un renommage
- Le fichier Excel généré embarque une **feuille `_META`** qui contient la liste des lots et leurs couleurs
- Au lien d'un fichier Excel, l'app lit cette méta pour récupérer la définition des lots de l'autre utilisateur

---

## 🆕 Nouveaux fichiers créés à l'installation

L'application crée automatiquement le dossier suivant au premier démarrage :

```
%APPDATA%\Base de Prix\           (Windows)
├── cache\                         ← copie locale du fichier Excel lié
│   └── linked_excel.bin
├── snapshots\                     ← snapshots horodatés (20 derniers)
│   ├── snap_2026-04-28_07-12-34_demarrage.json
│   ├── snap_2026-04-28_08-45-12_avant-sync.json
│   └── ...
├── backups\                       ← backups JSON quotidiens (7 derniers)
│   └── backup_2026-04-28.json
└── logs\                          ← logs (futur)
```

Sur Mac : `~/Library/Application Support/Base de Prix/`
Sur Linux : `~/.config/Base de Prix/`

---

## ⚙️ Nouvelles préférences utilisateur

Ajoutées dans **Paramètres** :

| Préférence | Défaut | Description |
|---|---|---|
| Mode sombre | OFF | Thème sombre pour toute l'app |
| Sync auto à chaque modif | ON | Push automatique vers Excel après chaque action |
| Vérification externe (60s) | ON | Check passif du fichier officiel en arrière-plan |
| Snapshots automatiques | ON | Création de snapshots avant opérations sensibles |

---

## 🔧 Améliorations techniques sous le capot

### Architecture
- **Hash SHA-256** calculé côté Node.js pour fiabilité
- **IPC isolation** maintenue (contextBridge, pas de nodeIntegration)
- **Sécurité chemins** : `safeRelPath()` interdit les `..` et chemins absolus
- **Gestion fermeture asynchrone** : intercept de `window.close`, attente de la confirmation renderer (timeout 10s par sécurité)

### Performance
- Cache local évite la relecture complète du fichier Excel à chaque sync
- Polling externe paramétrable (60s par défaut, désactivable)
- Debounce sur les opérations de sync rapprochées

### Fiabilité
- Pile d'undo de 20 niveaux par session
- Snapshots automatiques avant toute opération destructive
- 7 backups JSON quotidiens en rotation
- Validation des paths contre l'évasion de répertoire

---

## 🚀 Migration depuis la v2.2

**Aucune action requise.** L'application v2.5 :

1. Lit votre `localStorage` v2.2 (base de prix, préférences, lots) tel quel
2. Initialise les nouveaux dossiers `cache/`, `snapshots/`, `backups/`, `logs/`
3. Si vous aviez un fichier Excel lié, fait un snapshot initial dans le cache
4. Régénère les couleurs des lots si elles manquent

**Première sync après installation** : un snapshot complet est créé avant tout push, et le hash du fichier officiel est mémorisé. Les sync suivantes utiliseront le système de détection de conflit.

---

## 📝 Reste à venir (v2.6 et suivantes)

Évolutions discutées mais reportées :
- **Mode Google Sheets** : connexion OAuth2 + sync temps réel via API Sheets (en alternative au mode Excel)
- **Coefficient d'actualisation** : facultatif, à activer manuellement par projet
- **Connecteurs OneDrive/SharePoint** natifs (au-delà du simple chemin réseau)
- **Refactoring TypeScript** + tests automatisés
- **Crash reporter** (Sentry ou équivalent)

---

## 🛠️ Build & déploiement

### Lancement en développement
```bash
cd BasePrix-v2-5
npm install
npm start
```

### Build de l'installeur Windows
```bash
npm run build
# Génère :
# - dist\Base de Prix Setup 2.5.0.exe (NSIS classique, ~100 Mo)
# - dist\Base de Prix Web Setup 2.5.0.exe (NSIS-Web, ~2 Mo + DL automatique)
```

### Publication GitHub Release (auto-update)
```bash
# Sur le repo DustProgram/Programe-ecole
git tag v2.5.0
git push origin v2.5.0
npm run publish
# Le latest.yml est généré automatiquement dans la release
# Les utilisateurs en v2.2+ recevront la notification de mise à jour
```

---

## 📄 Auteur

**Nathan RAMEDACE**
Avril 2026
