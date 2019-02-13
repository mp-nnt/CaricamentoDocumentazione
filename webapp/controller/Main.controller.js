sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"jquery.sap.global",
	"sap/m/ObjectMarker",
	"sap/m/MessageToast",
	"sap/m/UploadCollectionParameter",
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/FileSizeFormat"
], function (Controller, jQuery, ObjectMarker, MessageToast, UploadCollectionParameter, MobileLibrary, JSONModel, FileSizeFormat) {
	"use strict";

	return Controller.extend("com.pabz.CaricamentoDocumentazione.controller.Main", {

		onInit: function () {
			this.getView().setModel(new JSONModel({
				"items": []
			}), "uploadedDocument");

			var that = this;

			$(window).bind("load", function () {
				var oModel = that.getView().getModel();
				var oDocUplModel = that.getView().getModel("uploadedDocument");
				var oDocUplModelData = oDocUplModel.getData();
				var data = oModel.getData();

				for (var i in data.CartaIdentità) {
					data.CartaIdentità[i].Type = "Carta d'Identità";
					oDocUplModelData.items.push(data.CartaIdentità[i]);
				}
				for (var i in data.Preventivi) {
					data.Preventivi[i].Type = "Preventivo";
					oDocUplModelData.items.push(data.Preventivi[i]);
				}
				for (var i in data.Dichiarazioni) {
					data.Dichiarazioni[i].Type = "Dichiarazione";
					oDocUplModelData.items.push(data.Dichiarazioni[i]);
				}
				for (var i in data.Pagamenti) {
					data.Pagamenti[i].Type = "Pagamenti";
					oDocUplModelData.items.push(data.Pagamenti[i]);
				}
				for (var i in data.Altro) {
					data.Altro[i].Type = "Altro";
					oDocUplModelData.items.push(data.Altro[i]);
				}

				oDocUplModel.refresh();
			});
		},

		// ---------------------------------------------------------------------------------- Start funzioni generiche

		// ---------------------------------------------------------------------------------- End funzioni generiche

		// ---------------------------------------------------------------------------------- Start funzioni WF 
		completeTask: function (approvalStatus) {

			var taskId = this.getOwnerComponent().taskId;
			var instanceId = this.getOwnerComponent().instanceId;
			var token = this._fetchToken();
			var oModel = this.getView().getModel();
			oModel.setProperty("/confirmDoc", approvalStatus);

			if (taskId === null) {

				if (instanceId === undefined) {

					oModel.setProperty("/Azienda", "Azienda"); // Andrà sostituito con gruppo Azienda

					// creo il task id
					$.ajax({
						url: "/bpmworkflowruntime/rest/v1/workflow-instances",
						method: "POST",
						contentType: "application/json",
						async: false,
						data: JSON.stringify({
							definitionId: "bando",
							context: oModel.getData()
						}),
						headers: {
							"X-CSRF-Token": token
						},
						success: function (result, xhr, data) {
							this.getOwnerComponent().instanceId = result.id;
							this._taskIdfromInstance(result.id, token, true);
						}.bind(this)
					});

				} else {
					this._taskIdfromInstance(instanceId, token, true);
				}

			} else {
				this._completeTask(taskId, oModel, token);
			}

		},

		_completeTask: function (taskId, oModel, token) {

			var dataContext;

			// se chiamo la Patch devo completare il task!
			dataContext = JSON.stringify({
				status: "COMPLETED",
				context: oModel.getData()
			});

			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/task-instances/" + taskId,
				method: "PATCH",
				contentType: "application/json",
				async: false,
				data: dataContext,
				headers: {
					"X-CSRF-Token": token
				},
				success: function (result, xhr, data) {
					sap.m.MessageToast.show("Task Saved");
					this.getView().setBusy(false);
					this.getOwnerComponent().taskId = null;
				}.bind(this),
				error: function (oError) {}
			});
		},

		_taskIdfromInstance: function (instanceId, token, toComplete) {

			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/task-instances?workflowInstanceId=" + instanceId,
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": token
				},
				success: function (result, xhr, data) {
					this.taskId = result[result.length - 1].id;
					//this.getOwnerComponent().taskId = result[result.length - 1].id;
					if (toComplete) {
						var oModel = this.getView().getModel();
						this._completeTask(this.getOwnerComponent().taskId, oModel, token);
					}
				}.bind(this),
				error: function (oError) {}
			});
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

		getInstanceId: function () {

			return jQuery.sap.getUriParameters().get("wfId");

		},

		getTaskIdFromInstance: function (instanceId) {

			var token = this._fetchToken();
			this._taskIdfromInstance(instanceId, token, false);

		},

		getInstanceIdFromTask: function (taskId) {

			var token = this._fetchToken();
			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/task-instances/" + taskId,
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": token
				},
				success: function (result, xhr, data) {
					return result[0].workflowInstanceId;
				}
			});

		},

		// ---------------------------------------------------------------------------------- End funzioni WF 

		// ---------------------------------------------------------------------------------- Start Azioni Toolbar
		onSave: function () {

			this.getView().setBusy(true);

			// salvo task senza completare
			this.completeTask(false);

		},

		onConfirm: function () {

			this.getView().setBusyIndicatorDelay(0);
			this.getView().setBusy(true);

			// completo task e creo la richiesta
			this.completeTask(true);
			this.requestUpdate();

		},

		requestUpdate: function () {

			var oModel = this.getView().getModel("oData");
			oModel.setUseBatch(true);
			var changeSetId = "abc";
			oModel.setDeferredGroups([changeSetId]);
			var mParameters = {
				"groupId": changeSetId,
				"changeSetId": changeSetId
			};

			var batchSuccess = function (oData) {
				this.getView().setBusy(false);
				sap.m.MessageToast.show("Richiesta aggiornata");
				this.getView().byId("btn_save").setEnabled(false);
				this.getView().byId("btn_confirm").setEnabled(false);
			}.bind(this);

			var batchError = function (err) {
				this.getView().setBusy(false);
				sap.m.MessageBox.error(err.message);
			}.bind(this);

			this._odataHeaderUpdate(mParameters);
			this._odataDocCreate(mParameters);
			oModel.submitChanges({
				"groupId": changeSetId,
				//"changeSetId": changeSetId,
				"success": batchSuccess,
				"error": batchError
			});
		},

		_odataHeaderUpdate: function (param) {

			var oModel = this.getView().getModel();
			var oDataModel = this.getView().getModel("oData");
			var entity = {};
			entity["Guid"] = oModel.getProperty("/Guid");
			var sPath = "/nuovaRichiestaSet(Guid='" + entity["Guid"] + "')";
			oDataModel.update(sPath, entity, param);

		},

		_odataDocCreate: function (param) {
			var oDataModel = this.getView().getModel("oData");
			var entity;
			for (var i in this.fileUploaded) {

				entity = {};
				entity["Description"] = this.fileUploaded[i].fileId;
				entity["Tipologia"] = "ZDOC_ALTRO";
				entity["Nome"] = this.fileUploaded[i].fileName;
				entity["Mimetype"] = this.fileUploaded[i].fileMimeType;
				entity["Dimensione"] = this.fileUploaded[i].fileDimension;
				entity["Estensione"] = this.fileUploaded[i].fileExtension;
				entity["Content"] = this.fileUploaded[i].fileContent;

				oDataModel.create("/documentiRichiestaSet", entity, param);

			}

		},

		// ---------------------------------------------------------------------------------- End Azioni Toolbar

		// ---------------------------------------------------------------------------------- Start File Uploader

		// ---------------------------------------------------------------------------------- End File Uploader

	});
});