sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/pabz/CaricamentoDocumentazione/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("com.pabz.CaricamentoDocumentazione.Component", {

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

			// get WF task data
			var startupParameters = this.getComponentData().startupParameters;
			var taskModel = startupParameters.taskModel;
			var taskData = taskModel.getData();
			var taskId = taskData.InstanceID;

			// initialize WF model
			var contextModel = new sap.ui.model.json.JSONModel("/bpmworkflowruntime/rest/v1/task-instances/" + taskId + "/context");
			contextModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			this.setModel(contextModel);

			//add actions
			startupParameters.inboxAPI.addAction({
				action: "Confirm",
				label: "Conferma"
			}, function (button) {
				this._completeTask(taskId, true);
			}, this);
			startupParameters.inboxAPI.addAction({
				action: "Save",
				label: "Salva Bozza"
			}, function (button) {
				this._completeTask(taskId, false);
			}, this);

		},

		_completeTask: function (taskId, approvalStatus) {
			var token = this._fetchToken();
			var oModel = this.getModel();
			oModel.setProperty("/confirm", approvalStatus);

			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/task-instances/" + taskId,
				method: "PATCH",
				contentType: "application/json",
				async: false,
				data: JSON.stringify({
					status: "COMPLETED",
					context: oModel.getData()
				}),
				headers: {
					"X-CSRF-Token": token
				}
			});
			this._refreshTask(taskId);
		},

		_fetchToken: function () {
			var token;
			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/xsrf-token",
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": "Fetch"
				},
				success: function (result, xhr, data) {
					token = data.getResponseHeader("X-CSRF-Token");
				}
			});
			return token;
		},

		_refreshTask: function (taskId) {
			this.getComponentData().startupParameters.inboxAPI.updateTask("NA", taskId);
		}

	});
});