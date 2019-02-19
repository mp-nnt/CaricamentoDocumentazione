sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/pabz/PresentazioneDomanda/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("com.pabz.PresentazioneDomanda.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");

			// get WF task data ---> solo se richiamato nella inbox

			if (this.getComponentData() !== undefined) {
				var startupParameters = this.getComponentData().startupParameters;
				var taskModel = startupParameters.taskModel;
				var taskData = taskModel.getData();
				this.taskId = taskData.InstanceID;
				this.instanceId = sap.ui.controller("com.pabz.CaricamentoDocumentazione.controller.Main").getInstanceIdFromTask(this.taskId);

				//add actions ---> valido solo nella inbox => andranno aggiunte direttamente nell'applicazione 
				startupParameters.inboxAPI.addAction({
					action: "Confirm",
					label: "Conferma"
				}, function (button) {
					sap.ui.controller("com.pabz.PresentazioneDomanda.controller.Main").onConfirm();
					this._refreshTask();
				}, this);
				startupParameters.inboxAPI.addAction({
					action: "Save",
					label: "Salva Bozza"
				}, function (button) {
					sap.ui.controller("com.pabz.PresentazioneDomanda.controller.Main").onSave();
					this._refreshTask();
				}, this);

			} else {

				this.instanceId = sap.ui.controller("com.pabz.PresentazioneDomanda.controller.Main").getInstanceIdParam();
				this.taskId = sap.ui.controller("com.pabz.PresentazioneDomanda.controller.Main").getTaskId(this.instanceId);

			}

			// initialize WF model

			if (this.instanceId === null) {

				// creo nuovo wf	
				var sPath = "model/emptyModel.json";
				this.setModel(new sap.ui.model.json.JSONModel(sPath));

			} else {

				// carico dati wf 
				var contextModel = new sap.ui.model.json.JSONModel("/bpmworkflowruntime/rest/v1/task-instances/" + this.taskId + "/context");
				contextModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
				this.setModel(contextModel);
			}

		},

		_refreshTask: function () {
			this.getComponentData().startupParameters.inboxAPI.updateTask("NA", this.taskId);
		}
	});
});