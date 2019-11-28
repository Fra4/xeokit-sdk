import {ModelStructureTreeView} from "./ModelStructureTreeView.js";
import {Plugin} from "../../viewer/Plugin.js";

/**
 * @desc A {@link Viewer} plugin that provides an HTML tree view that represents the structural hierarchy of models.
 *
 * <a href="https://xeokit.github.io/xeokit-sdk/examples/#BIMOffline_StructureTreeViewPlugin_Hospital" style="border: 1px solid black;"><img src="http://xeokit.io/img/docs/StructureTreeViewPlugin/StructureTreeViewPlugin.png"></a>
 *
 * [[Run this example](https://xeokit.github.io/xeokit-sdk/examples/#BIMOffline_StructureTreeViewPlugin_Hospital)]
 *
 * ## Usage
 *
 * In the example below we'll create a structural tree view using StructureTreeViewPlugin. Then we'll use an [XKTLoaderPlugin]() to
 * load the Schependomlaan model from an [.xkt file](https://github.com/xeokit/xeokit-sdk/tree/master/examples/models/xkt/schependomlaan), along
 * with an accompanying JSON [IFC metadata file](https://github.com/xeokit/xeokit-sdk/tree/master/examples/metaModels/schependomlaan). When the
 * model has loaded, we'll add it to the StructureTreeViewPlugin.
 *
 * [[Run this example](https://xeokit.github.io/xeokit-sdk/examples/#BIMOffline_StructureTreeViewPlugin_Schependomlaan)]
 *
 * ````javascript
 * import {Viewer} from "../src/viewer/Viewer.js";
 * import {XKTLoaderPlugin} from "../src/plugins/XKTLoaderPlugin/XKTLoaderPlugin.js";
 * import {StructureTreeViewPlugin} from "../src/plugins/StructureTreeViewPlugin/StructureTreeViewPlugin.js";
 *
 * const viewer = new Viewer({
 *      canvasId: "myCanvas",
 *      transparent: true
 * });
 *
 * viewer.camera.eye = [-2.56, 8.38, 8.27];
 * viewer.camera.look = [13.44, 3.31, -14.83];
 * viewer.camera.up = [0.10, 0.98, -0.14];
 *
 * const xktLoader = new XKTLoaderPlugin(viewer);
 *
 * const model = xktLoader.load({
 *     id: "myModel",
 *     src: "./models/xkt/schependomlaan/schependomlaan.xkt",
 *     metaModelSrc: "./metaModels/schependomlaan/metaModel.json",
 *     edges: true
 * });
 *
 * const treeView = new StructureTreeViewPlugin(viewer, {
 *      containerElement: document.getElementById("myTreeViewContainer");
 * });
 *
 * model.on("loaded", () => {
 *      treeView.addModel(model.id);
 * });
 * ````
 * @class StructureTreeViewPlugin
 */
class StructureTreeViewPlugin extends Plugin {

    /**
     * @constructor
     *
     * @param {Viewer} viewer The Viewer.
     * @param {*} cfg Plugin configuration.
     * @param {HTMLElement} cfg.containerElement DOM element to contain the StructureTreeViewPlugin.
     * @param {Boolean} [cfg.autoAddModels=false] Set ````true```` to automatically add each model as it's created.
     */
    constructor(viewer, cfg = {}) {
        super("StructureTreeViewPlugin", viewer);
        if (!cfg.containerElement) {
            this.error("Config expected: containerElement");
            return;
        }
        this._containerElement = cfg.containerElement;
        this._modelTreeViews = {};
        this._autoAddModels = !!cfg.autoAddModels;

        if (this._autoAddModels) {

            // TODO: Add existing models
            // TODO: Option to order models alphabetically?

            this.viewer.scene.on("modelLoaded", (modelId) =>{
                this.addModel(modelId);
            });
        }
    }

    /**
     * Adds a model to this StructureTreeViewPlugin.
     *
     * The model will be automatically removed when destroyed.
     *
     * To automatically add each model as it's created, instead of manually calling this method each time,
     * provide a ````autoAddModels: true```` to the StructureTreeViewPlugin constructor.
     *
     * @param {String} modelId ID of a model {@link Entity} in {@link Scene#models}.
     */
    addModel(modelId) {
        if (!this._containerElement) {
            return;
        }
        const model = this.viewer.scene.models[modelId];
        if (!model) {
            throw "Model not found: " + modelId;
        }
        const metaModel = this.viewer.metaScene.metaModels[modelId];
        if (!metaModel) {
            this.error("MetaModel not found: " + modelId);
            return;
        }
        if (this._modelTreeViews[modelId]) {
            this.warn("Model already added: " + modelId);
            return;
        }
        this._modelTreeViews[modelId] = new ModelStructureTreeView(this.viewer, model, metaModel, {
            containerElement: this._containerElement
        });
        model.on("destroyed", () => {
            this.removeModel(model.id);
        });
    }

    /**
     * Removes a model from this StructureTreeViewPlugin.
     *
     * @param {String} modelId ID of a model {@link Entity} in {@link Scene#models}.
     */
    removeModel(modelId) {
        if (!this._containerElement) {
            return;
        }
        const modelTreeView = this._modelTreeViews[modelId];
        if (!modelTreeView) {
            this.warn("Model not added: " + modelId);
            return;
        }
        modelTreeView.destroy();
        delete this._modelTreeViews[modelId];
    }

    /**
     * Destroys this StructureTreeViewPlugin.
     */
    destroy() {
        if (!this._containerElement) {
            return;
        }
        for (let modelId in this._modelTreeViews) {
            if (this._modelTreeViews.hasOwnProperty(modelId)) {
                this._modelTreeViews[modelId].destroy();
            }
        }
        this._modelTreeViews = {};
        super.destroy();
    }
}

export {StructureTreeViewPlugin};