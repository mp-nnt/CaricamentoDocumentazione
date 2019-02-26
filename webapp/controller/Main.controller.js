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

		uploadJSON: {},
		ArrayId: ["CartaIdentita", "Preventivi", "Dichiarazioni", "Pagamenti", "Altro"],
		ArrayIdNew: ["CartaIdentitaNew", "PreventiviNew", "DichiarazioniNew", "PagamentiNew", "AltroNew"],
		onInit: function () {
			this.getView().setModel(new JSONModel({
				"items": []
			}), "uploadedDocument");

			this.getView().setModel(new JSONModel({
				"maximumFilenameLength": 80,
				"maximumFileSize": 10,
				"mode": MobileLibrary.ListMode.SingleSelectMaster,
				"uploadEnabled": true,
				"uploadButtonVisible": true,
				"enableEdit": true,
				"enableDelete": true,
				"visibleEdit": true,
				"visibleDelete": true,
				"listSeparatorItems": [
					MobileLibrary.ListSeparators.All,
					MobileLibrary.ListSeparators.None
				],
				"showSeparators": MobileLibrary.ListSeparators.All,
				"listModeItems": [{
					"key": MobileLibrary.ListMode.SingleSelectMaster,
					"text": "Single"
				}, {
					"key": MobileLibrary.ListMode.MultiSelect,
					"text": "Multi"
				}]
			}), "settings");

			this.getView().setModel(new JSONModel({
				"items": ["jpg", "txt", "ppt", "pptx", "doc", "docx", "xls", "xlsx", "pdf", "png"],
				"selected": ["jpg", "txt", "ppt", "pptx", "doc", "docx", "xls", "xlsx", "pdf", "png"]
			}), "fileTypes");

			// Sets the text to the label
			this.byId(this.ArrayId[0]).addEventDelegate({
				onBeforeRendering: function () {
					this.byId("attachmentTitle" + this.ArrayId[0]).setText(this.getAttachmentTitleText(this.ArrayId[0]));
				}.bind(this)
			});
			this.byId(this.ArrayId[1]).addEventDelegate({
				onBeforeRendering: function () {
					this.byId("attachmentTitle" + this.ArrayId[1]).setText(this.getAttachmentTitleText(this.ArrayId[1]));
				}.bind(this)
			});
			this.byId(this.ArrayId[2]).addEventDelegate({
				onBeforeRendering: function () {
					this.byId("attachmentTitle" + this.ArrayId[2]).setText(this.getAttachmentTitleText(this.ArrayId[2]));
				}.bind(this)
			});
			this.byId(this.ArrayId[3]).addEventDelegate({
				onBeforeRendering: function () {
					this.byId("attachmentTitle" + this.ArrayId[3]).setText(this.getAttachmentTitleText(this.ArrayId[3]));
				}.bind(this)
			});
			this.byId(this.ArrayId[4]).addEventDelegate({
				onBeforeRendering: function () {
					this.byId("attachmentTitle" + this.ArrayId[4]).setText(this.getAttachmentTitleText(this.ArrayId[4]));
				}.bind(this)
			});

			var that = this;

			$(window).bind("load", function () {

				var oModel = that.getView().getModel();
				var oDocUplModel = that.getView().getModel("uploadedDocument");
				var oDocUplModelData = oDocUplModel.getData();
				var data = oModel.getData();
				var text;
				var row;

				for (var i in data.CartaIdentità) {
					row = data.CartaIdentità[i];
					text = that.getView().getModel("i18n").getResourceBundle().getText("attachText");
					//Data di caricamento: &1 - Dimensione: &2
					text = text.replace("&1", row.fileUploadDate);
					text = text.replace("&2", row.fileDimension);
					row.Type = "Carta d'Identità";
					row.text = text;
					oDocUplModelData.items.push(row);
				}
				for (var i in data.Preventivi) {
					row = data.Preventivi[i];
					text = that.getView().getModel("i18n").getResourceBundle().getText("attachText");
					//Data di caricamento: &1 - Dimensione: &2
					text = text.replace("&1", row.fileUploadDate);
					text = text.replace("&2", row.fileDimension);
					row.Type = "Preventivo";
					row.text = text;
					oDocUplModelData.items.push(row);
				}
				for (var i in data.Dichiarazioni) {
					row = data.Dichiarazioni[i];
					text = that.getView().getModel("i18n").getResourceBundle().getText("attachText");
					//Data di caricamento: &1 - Dimensione: &2
					text = text.replace("&1", row.fileUploadDate);
					text = text.replace("&2", row.fileDimension);
					row.Type = "Dichiarazione";
					row.text = text;
					oDocUplModelData.items.push(row);
				}
				for (var i in data.Pagamenti) {
					row = data.Pagamenti[i];
					text = that.getView().getModel("i18n").getResourceBundle().getText("attachText");
					//Data di caricamento: &1 - Dimensione: &2
					text = text.replace("&1", row.fileUploadDate);
					text = text.replace("&2", row.fileDimension);
					row.Type = "Pagamenti";
					row.text = text;
					oDocUplModelData.items.push(row);
				}
				for (var i in data.Altro) {
					row = data.Altro[i];
					text = that.getView().getModel("i18n").getResourceBundle().getText("attachText");
					//Data di caricamento: &1 - Dimensione: &2
					text = text.replace("&1", row.fileUploadDate);
					text = text.replace("&2", row.fileDimension);
					row.Type = "Altro";
					row.text = text;
					oDocUplModelData.items.push(row);
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
			oModel.setProperty("/confirmDoc", false);

			if (taskId === null) {
				this._taskIdfromInstance(instanceId, token, true);
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
					sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("TaskSaved"));
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
					this.getOwnerComponent().taskId = result[result.length - 1].id;
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

		getTaskIdParam: function () {
			return jQuery.sap.getUriParameters().get("taskid");
		},

		getInstanceIdParam: function () {
			return jQuery.sap.getUriParameters().get("wfId");
		},

		getInstanceId: function (taskId) {

			var token = this._fetchToken();
			var instanceId = null;
			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/task-instances/" + taskId,
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": token
				},
				success: function (result, xhr, data) {
					instanceId = result.workflowInstanceId;
				}
			});
			return instanceId;

		},

		getTaskId: function (instanceId) {

			var token = this._fetchToken();
			var taskId = null;
			$.ajax({
				url: "/bpmworkflowruntime/rest/v1/task-instances?workflowInstanceId=" + instanceId,
				method: "GET",
				async: false,
				headers: {
					"X-CSRF-Token": token
				},
				success: function (result, xhr, data) {
					taskId = result[result.length - 1].id;
				}
			});
			return taskId;

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
				this._updateUploadedFile();
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

			entity["Guid"] = oModel.getProperty("/guid");

			var sPath = "/nuovaRichiestaSet(Guid='" + entity["Guid"] + "',ObjectId='')";

			oDataModel.update(sPath, entity, param);

		},

		_odataDocCreate: function (param) {
			var i;
			var length = this.ArrayId.length;
			var oDataModel = this.getView().getModel("oData");
			var oFileUploaded = this.getView().getModel().getData();
			for (i = 0; i < length; i++) {
				var entity;
				var property = oFileUploaded[this.ArrayIdNew[i]];
				var tipologia = this.switchTipologia(this.ArrayId[i]);
				for (var k in property) {
					entity = {};
					entity["Tipologia"] = tipologia;
					entity["Nome"] = property[k].fileName;
					entity["Mimetype"] = property[k].fileMimeType;
					entity["Estensione"] = property[k].fileExtension;
					entity["Content"] = property[k].fileContent;
					//entity["Description"] = property[k].fileId;
					//entity["Dimensione"] = property[k].fileDimension;
					//entity["DataCaricamento"] = property[k].fileUploadDate;

					oDataModel.create("/documentiRichiestaSet", entity, param);
				}
			}
		},

		_updateUploadedFile: function () {

			var i;
			var length = this.ArrayId.length;
			var oModel = this.getView().getModel();
			var oData = oModel.getData();

			for (i = 0; i < length; i++) {
				var propertyNew = oData[this.ArrayIdNew[i]];
				var property = oData[this.ArrayId[i]];
				for (var k in propertyNew) {
					property.push(propertyNew[k]);
				}
				oData[this.ArrayIdNew[i]] = [];
			}
			oModel.refresh();

			this.completeTask(false);

		},

		// ---------------------------------------------------------------------------------- End Azioni Toolbar

		// ---------------------------------------------------------------------------------- Start File Uploader

		arrayJSONStringify: function (array) {
			for (var i = 0; i < array.length; i++) {
				if (typeof array[i] !== "string") {
					array[i] = JSON.stringify(array[i]);
				}
			}
			return array;
		},

		arrayJSONParse: function (array) {
			for (var i = 0; i < array.length; i++) {
				array[i] = JSON.parse(array[i]);
			}
			return array;

		},

		switchProperty: function (oUploadCollection) {
			var property;
			var i = 0;
			var length = this.ArrayId.length;
			for (i = 0; i < length; i++) {
				if (oUploadCollection.indexOf(this.ArrayId[i]) !== -1) {
					property = this.ArrayId[i];
				}
			}
			return property;
		},

		switchPropertyNew: function (oUploadCollection) {
			var property;
			var i = 0;
			var length = this.ArrayId.length;
			for (i = 0; i < length; i++) {
				if (oUploadCollection.indexOf(this.ArrayId[i]) !== -1) {
					property = this.ArrayIdNew[i];
				}
			}
			return property;
		},

		switchTipologia: function (property) {
			var tipologia;
			switch (property) {
			case "CartaIdentita":
				tipologia = "ZDOC_IDENT";
				break;
			case "Preventivi":
				tipologia = "ZDOC_PREVE";
				break;
			case "Dichiarazioni":
				tipologia = "ZDOC_DICHI";
				break;
			case "Pagamenti":
				tipologia = "ZDOC_PAGAM";
				break;
			case "Altro":
				tipologia = "ZDOC_ALTRO";
				break;
			}
			return tipologia;
		},

		onChange: function (oEvent) {
			var that = this;
			var oUploadCollection = oEvent.getSource();
			// Header Token
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name: "x-csrf-token",
				value: "securityTokenFromModel"
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

			var reader = new FileReader();
			var file = oEvent.getParameter("files")[0];
			that.uploadJSON = {};
			that.uploadJSON.fileId = jQuery.now().toString();
			that.uploadJSON.fileName = file.name;
			that.uploadJSON.fileMimeType = file.type;
			that.uploadJSON.fileDimension = (file.size / 1000).toFixed(1) + " kB";
			that.uploadJSON.fileExtension = file.name.split(".")[1];
			that.uploadJSON.fileUploadDate = new Date(jQuery.now()).toLocaleDateString();
			reader.onload = function (e) {
				that.uploadJSON.fileContent = e.target.result.substring(5 + that.uploadJSON.fileMimeType.length + 8);
			};

			reader.onerror = function (e) {
				sap.m.MessageToast.show("Errore durante l'upload");
			};

			reader.readAsDataURL(file);

		},

		base64toBlob: function (base64Data, contentType) {
			contentType = contentType || '';
			var sliceSize = 1024;
			var byteCharacters = atob(base64Data);
			var bytesLength = byteCharacters.length;
			var slicesCount = Math.ceil(bytesLength / sliceSize);
			var byteArrays = new Array(slicesCount);

			for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
				var begin = sliceIndex * sliceSize;
				var end = Math.min(begin + sliceSize, bytesLength);
				var bytes = new Array(end - begin);

				for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
					bytes[i] = byteCharacters[offset].charCodeAt(0);
				}

				byteArrays[sliceIndex] = new Uint8Array(bytes);
			}

			return new Blob(byteArrays, {
				type: contentType
			});
		},

		onFileDeleted: function (oEvent) {
			var oUploadCollection = oEvent.getSource().getId();
			this.deleteItemById(oEvent.getParameter("documentId"), oUploadCollection);
		},

		deleteItemById: function (sItemToDeleteId, sUploadCollection) {
			var property = this.switchProperty(sUploadCollection);
			var propertyNew = this.switchPropertyNew(sUploadCollection);
			var oData = this.byId(sUploadCollection).getModel().getData();
			var aItems = jQuery.extend(true, {}, oData)[propertyNew];
			jQuery.each(aItems, function (index) {
				if (aItems[index] && aItems[index].fileId === sItemToDeleteId) {
					aItems.splice(index, 1);
				}
			});
			this.byId(sUploadCollection).getModel().getData()[propertyNew] = aItems;
			this.byId(sUploadCollection).getModel().refresh();

			this.byId("attachmentTitle" + property).setText(this.getAttachmentTitleText(property));
		},

		onFilenameLengthExceed: function () {
			MessageToast.show("La lunghezza del nome del file è troppo grande.");
		},

		onFileRenamed: function (oEvent) {
			var oUploadCollection = oEvent.getSource().getId();
			var propertyNew = this.switchPropertyNew(oUploadCollection);
			var oData = this.byId(oUploadCollection).getModel().getData();
			var aItems = jQuery.extend(true, {}, oData)[propertyNew];
			var sDocumentId = oEvent.getParameter("documentId");
			jQuery.each(aItems, function (index) {
				if (aItems[index] && aItems[index].fileId === sDocumentId) {
					aItems[index].fileName = oEvent.getParameter("item").getFileName();
				}
			});
			this.byId(oUploadCollection).getModel().getData()[propertyNew] = aItems;
			this.byId(oUploadCollection).getModel().refresh();
		},

		onFileSizeExceed: function () {
			MessageToast.show("Il file caricato è troppo grande.");
		},

		onTypeMissmatch: function () {
			MessageToast.show("Il tipo di file caricato non è supportato.");
		},

		onUploadComplete: function (oEvent) {
			var that = this;
			var oUploadCollection = oEvent.getSource().getId();
			var property = this.switchProperty(oUploadCollection);
			var propertyNew = this.switchPropertyNew(oUploadCollection);

			var oData = this.byId(oUploadCollection).getModel().getData();

			var blobForURL = this.base64toBlob(that.uploadJSON.fileContent, that.uploadJSON.fileMimeType);
			var fileURL = URL.createObjectURL(blobForURL);
			if (oData[propertyNew] === undefined) {
				this.byId(oUploadCollection).getModel().setProperty("/" + propertyNew, []);
			}
			oData[propertyNew].unshift({
				"fileId": that.uploadJSON.fileId,
				"fileName": that.uploadJSON.fileName,
				"fileMimeType": that.uploadJSON.fileMimeType,
				"fileDimension": that.uploadJSON.fileDimension,
				"fileExtension": that.uploadJSON.fileExtension,
				"fileUploadDate": that.uploadJSON.fileUploadDate,
				"fileContent": that.uploadJSON.fileContent,
				"fileThumbnailUrl": "",
				"fileURL": fileURL,
				"attributes": [{
					"title": "Data di caricamento",
					"text": that.uploadJSON.fileUploadDate,
					"active": false
				}, {
					"title": "Dimensione",
					"text": that.uploadJSON.fileDimension,
					"active": false
				}],
				"selected": false
			});
			this.byId(oUploadCollection).getModel().refresh();
			that.uploadJSON = {};

			// Sets the text to the label
			this.byId("attachmentTitle" + property).setText(this.getAttachmentTitleText(property));
		},

		onBeforeUploadStarts: function (oEvent) {
			// Header Slug
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
		},

		onSelectAllPress: function (oEvent) {
			var sUploadCollection = oEvent.getSource().getId();
			var oUploadCollection = this.byId(sUploadCollection);
			if (!oEvent.getSource().getPressed()) {
				this.deselectAllItems(oUploadCollection);
				oEvent.getSource().setPressed(false);
				oEvent.getSource().setText("Select all");
			} else {
				this.deselectAllItems(oUploadCollection);
				oUploadCollection.selectAll();
				oEvent.getSource().setPressed(true);
				oEvent.getSource().setText("Deselect all");
			}
			this.onSelectionChange(oEvent);
		},

		deselectAllItems: function (oUploadCollection) {
			var aItems = oUploadCollection.getItems();
			for (var i = 0; i < aItems.length; i++) {
				oUploadCollection.setSelectedItem(aItems[i], false);
			}
		},

		getAttachmentTitleText: function (oUploadCollection) {
			var aItems = this.byId(oUploadCollection).getItems();
			return "N° di Allegati" + " (" + aItems.length + ")";
		},

		onModeChange: function (oEvent) {
			var oSettingsModel = this.getView().getModel("settings");
			if (oEvent.getParameters().selectedItem.getProperty("key") === MobileLibrary.ListMode.MultiSelect) {
				oSettingsModel.setProperty("/visibleEdit", false);
				oSettingsModel.setProperty("/visibleDelete", false);
				this.enableToolbarItems(true);
			} else {
				oSettingsModel.setProperty("/visibleEdit", true);
				oSettingsModel.setProperty("/visibleDelete", true);
				this.enableToolbarItems(false);
			}
		},

		onSelectionChange: function (oEvent) {
			var oUploadCollection = oEvent.getSource().getId();
			var property = this.switchProperty(oUploadCollection);
			var oData = this.byId(oUploadCollection).getModel().getData();
			var aSelectedItems = this.byId(property).getSelectedItems();
			if (aSelectedItems.length !== 0) {
				var selectedItemId = aSelectedItems[0].getDocumentId();
				var length = this.ArrayId.length;
				var i;
				var k;
				for (i = 0; i < length; i++) {
					var field = oData[this.ArrayIdNew[i]];
					for (k in field) {
						if (field[k].selected === true && field[k].fileId !== selectedItemId) {
							field[k].selected = false;
						}
					}
				}
			}
		},

		onDownloadSelectedItems: function (oEvent) {
			var oUploadCollection = oEvent.getSource().getId();
			var property = this.switchProperty(oUploadCollection);
			var propertyNew = this.switchPropertyNew(oUploadCollection);
			var oData = this.byId(oUploadCollection).getModel().getData();
			var aItems = jQuery.extend(true, {}, oData)[propertyNew];
			var aSelectedItems = this.byId(property).getSelectedItems();
			if (aSelectedItems.length !== 0) {
				var downloadableContent;
				jQuery.each(aItems, function (index) {
					if (aItems[index] && aItems[index].fileId === aSelectedItems[0].getDocumentId()) {
						downloadableContent = aItems[index];
					}
				});
				var blob = this.base64toBlob(downloadableContent.fileContent, downloadableContent.fileMimeType);
				var objectURL = URL.createObjectURL(blob);

				var link = document.createElement('a');
				link.style.display = 'none';
				document.body.appendChild(link);

				link.href = objectURL;
				link.href = URL.createObjectURL(blob);
				link.download = downloadableContent.fileName;
				link.click();
			}
		},

		// ---------------------------------------------------------------------------------- End File Uploader

	});
});