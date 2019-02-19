sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"jquery.sap.global",
	"sap/m/ObjectMarker",
	"sap/m/MessageToast",
	"sap/m/UploadCollectionParameter",
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/FileSizeFormat",
	'sap/m/MessageBox'
], function (Controller, jQuery, ObjectMarker, MessageToast, UploadCollectionParameter, MobileLibrary, JSONModel, FileSizeFormat,
	MessageBox) {
	"use strict";

	return Controller.extend("com.pabz.PresentazioneDomanda.controller.Main", {

		uploadJSON: {},
		ArrayId: ["CartaIdentita", "Preventivi", "Dichiarazioni", "Pagamenti", "Altro"],
		onInit: function () {

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
				that.onProcessInfo(oModel);
			});

		},

		onAfterRendering: function () {},

		// ---------------------------------------------------------------------------------- Start funzioni generiche
		onTableAChange: function (oEvent) {
			var oModel = this.getView().getModel();
			var tableA = oModel.getProperty("/tableA");
			var totalA = oModel.getProperty("/totalA");
			totalA = this._getTotal(tableA, totalA);
			oModel.setProperty("/totalA", totalA);
			this.getView().setModel(oModel);
		},

		onTableBChange: function (oEvent) {
			var oModel = this.getView().getModel();
			var table = oModel.getProperty("/tableB");
			var total = oModel.getProperty("/totalB");
			total = this._getTotal(table, total);
			oModel.setProperty("/totalB", total);
			this.getView().setModel(oModel);
		},

		_getTotal: function (table, total) {
			total = 0;
			for (var i in table) {
				if (table[i].importoEuro !== "" && !isNaN(table[i].importoEuro[0])) {

					total = total + table[i].importoEuro[0];

				}
			}
			return total;
		},

		onUserInfo: function (oEvent) {

			var oModel = this.getView().getModel();
			var data = oModel.getData();

			if (data.piva !== "" && data.fiscalCode !== "") {

				var oDataModel = this.getView().getModel("oData");
				var sPath = "/userInfoSet(Piva='" + data.piva + "',Cf='" + data.fiscalCode + "')";
				oDataModel.read(sPath, {
					"success": function (oData) {
						oModel.setProperty("/surname", oData.Cognome);
						oModel.setProperty("/name", oData.Nome);
						oModel.setProperty("/owner", oData.RagioneSociale);
						oModel.setProperty("/piva", oData.Piva);
						oModel.setProperty("/fiscalCode", oData.Cf);
						oModel.setProperty("/state", oData.Country);
						oModel.setProperty("/region", oData.Region);
						oModel.setProperty("/postcode", oData.Cap);
						oModel.setProperty("/city", oData.Citta);
						oModel.setProperty("/district", oData.Bezei);
						oModel.setProperty("/street", oData.Indirizzo);
						oModel.setProperty("/streetNumber", oData.NumeroCivico);
						oModel.setProperty("/telephone", oData.Telefono);
						oModel.setProperty("/mail", oData.Email);
						oModel.setProperty("/pec", oData.EmailPec);
						oModel.setProperty("/iban", oData.Iban);
						this.getView().setModel(oModel);
					}.bind(this),
					"error": function (err) {
						//MessageBox.error(err.message);
						console.log(err.message);
					}
				});
			}
		},

		onProcessInfo: function (oModel) {

			var data = oModel.getData();

			var oDataModel = this.getView().getModel("oData");
			var sPath = "/processInfoSet(ProcessType='" + data.processType + "')";
			oDataModel.read(sPath, {
				"success": function (oData) {

					this.getView().setModel(new JSONModel({
						"inizio": new Date(), //inizio è sempre oggi
						"fine": oData.ProcessEnd //fine è quanto arriva dal servizio
					}), "date");

				}.bind(this),
				"error": function (err) {
					//MessageBox.error(err.message);
					console.log(err.message);
				}
			});

		},

		// ---------------------------------------------------------------------------------- End funzioni generiche

		// ---------------------------------------------------------------------------------- Start funzioni WF 
		completeTask: function (approvalStatus) {

			var taskId = this.getOwnerComponent().taskId;
			var instanceId = this.getOwnerComponent().instanceId;
			var token = this._fetchToken();
			var oModel = this.getView().getModel();
			oModel.setProperty("/confirm", approvalStatus);

			if (taskId === null) {

				if (instanceId === undefined) {

					oModel.setProperty("/Azienda", oModel.getData().piva);

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
			var instanceId;
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
			var taskId;
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
			if (!this.onCheck()) {
				this.completeTask(false);
			} else {
				this.getView().setBusy(false);
				var msg = 'Dati mancanti o errati';
				MessageToast.show(msg);
			}
		},

		onConfirm: function () {
			this.getView().setBusyIndicatorDelay(0);
			this.getView().setBusy(true);
			if (!this.onCheck()) {

				//messaggio alla conferma   warning with two actions

				var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
				MessageBox.warning(
					"Confermare?", {
						actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
						styleClass: bCompact ? "sapUiSizeCompact" : "",
						onClose: function (sAction) {
							if (sAction === MessageBox.Action.OK) {
								this.completeTask(false); //inserire nell'azione in risposta al ok
								this.requestCreation(); //inserire nell'azione in risposta al ok
							} else {
								this.getView().setBusy(false);
								MessageToast.show("Operazione annullata");
							}
						}.bind(this)
					}
				);
			} else {
				this.getView().setBusy(false);
				var msg = 'Dati mancanti o errati';
				MessageToast.show(msg);
			}

		},
		requestCreation: function () {

			var oModel = this.getView().getModel("oData");
			oModel.setUseBatch(true);
			var changeSetId = "abc";
			oModel.setDeferredGroups([changeSetId]);
			var mParameters = {
				"groupId": changeSetId,
				"changeSetId": changeSetId
			};

			var batchSuccess = function (oData) {
				var reqGuid = oData.__batchResponses[0].__changeResponses[0].data.Guid;
				var reqNumProt = oData.__batchResponses[0].__changeResponses[0].data.Zzfld00000u; //
				var reqCodFasc = oData.__batchResponses[0].__changeResponses[0].data.Zzfld000019;
				this.getView().getModel().setProperty("/guid", reqGuid);
				this.getView().setBusy(false);
				this.completeTask(true);
				sap.m.MessageToast.show("Richiesta creata" + " Numero Protocollo: " + reqNumProt + " Codice Fascicolo: " + reqCodFasc);
				this.getView().byId("btn_save").setEnabled(false);
				this.getView().byId("btn_confirm").setEnabled(false);
			}.bind(this);

			var batchError = function (err) {
				this.getView().setBusy(false);
				sap.m.MessageBox.error(err.message);
			}.bind(this);

			this._odataHeaderCreate(mParameters);
			this._odataItemsCreate(mParameters);
			this._odataTextCreate(mParameters);
			this._odataDocCreate(mParameters);
			oModel.submitChanges({
				"groupId": changeSetId,
				//"changeSetId": changeSetId,
				"success": batchSuccess,
				"error": batchError
			});
		},

		_odataHeaderCreate: function (param) {

			var oModel = this.getView().getModel();
			var oDataModel = this.getView().getModel("oData");
			var entity = {};
			entity["Piva"] = oModel.getProperty("/piva");
			entity["Addetti9"] = oModel.getProperty("/until9");
			entity["ProcessType"] = "GAP";
			entity["Addetti49"] = oModel.getProperty("/between9and49");
			entity["Description"] = "Test SCP - oData";
			entity["SettoreA"] = oModel.getProperty("/craft");
			entity["SettoreI"] = oModel.getProperty("/industry");
			entity["SettoreC"] = oModel.getProperty("/trade");
			entity["SettoreS"] = oModel.getProperty("/services");
			entity["SettoreL"] = oModel.getProperty("/freelance");
			entity["Zzfld00000z"] = oModel.getProperty("/stamp_duty_id");
			if (oModel.getProperty("/stamp_duty_date") !== "") {
				entity["Zzfld000010"] = oModel.getProperty("/stamp_duty_date");
			}
			if (oModel.getProperty("/newFactory")) {
				entity["Zzfld000007"] = "X";
			}
			if (oModel.getProperty("/increaseFactory")) {
				entity["Zzfld000008"] = "X";
			}
			if (oModel.getProperty("/newGood")) {
				entity["Zzfld000009"] = "X";
			}
			if (oModel.getProperty("/newProcess")) {
				entity["Zzfld00000a"] = "X";
			}
			if (oModel.getProperty("/claim3_1")) {
				entity["Zzfld00000g"] = "X";
			}
			if (oModel.getProperty("/claim3_1")) {
				entity["Zzfld000012"] = "X";
			}
			if (oModel.getProperty("/claim3_2")) {
				entity["Zzfld000013"] = "X";
			}
			if (oModel.getProperty("/claim3_3")) {
				entity["Zzfld000014"] = "X";
			}

			// dati questionario
			if (oModel.getProperty("/score30_1")) {
				entity["Zzfld00001x"] = "X";
			}
			if (oModel.getProperty("/score30_2")) {
				entity["Zzfld00001y"] = "X";
			}
			if (oModel.getProperty("/score30_3")) {
				entity["Zzfld00001z"] = "X";
			}
			if (oModel.getProperty("/score30_4")) {
				entity["Zzfld000020"] = "X";
			}
			if (oModel.getProperty("/score30_5")) {
				entity["Zzfld000021"] = "X";
			}
			if (oModel.getProperty("/score15_1")) {
				entity["Zzfld000027"] = "X";
			}
			if (oModel.getProperty("/score15_2_1")) {
				entity["Zzfld000028"] = "X";
			}
			if (oModel.getProperty("/score15_2_2")) {
				entity["Zzfld000029"] = "X";
			}
			if (oModel.getProperty("/score15_2_3")) {
				entity["Zzfld00002a"] = "X";
			}
			if (oModel.getProperty("/score15_3")) {
				entity["Zzfld00002b"] = "X";
			}
			if (oModel.getProperty("/score10_1")) {
				entity["Zzfld00002h"] = "X";
			}
			if (oModel.getProperty("/score10_2_1")) {
				entity["Zzfld00002i"] = "X";
			}
			if (oModel.getProperty("/score10_2_4")) {
				entity["Zzfld00002j"] = "X";
			}
			if (oModel.getProperty("/score10_2_5")) {
				entity["Zzfld00002k"] = "X";
			}
			if (oModel.getProperty("/score10_2_6")) {
				entity["Zzfld00002l"] = "X";
			}
			if (oModel.getProperty("/score10_2_7")) {
				entity["Zzfld00002m"] = "X";
			}
			if (oModel.getProperty("/score10_3")) {
				entity["Zzfld00002n"] = "X";
			}

			if (oModel.getProperty("/italian")) {
				entity["Zzfld00001t"] = "I";
			}
			if (oModel.getProperty("/german")) {
				entity["Zzfld00001t"] = "D";
			}

			entity["Zzfld00002x"] = this.getOwnerComponent().instanceId;

			oDataModel.create("/nuovaRichiestaSet", entity, param);

		},

		_odataItemsCreate: function (param) {
			var oModel = this.getView().getModel();
			var oDataModel = this.getView().getModel("oData");
			var tableA = oModel.getProperty("/tableA");
			var entity;
			for (var i in tableA) {
				if (tableA[i].importoEuro !== "" && !isNaN(tableA[i].importoEuro[0])) {

					entity = {};
					entity["Description"] = tableA[i].tipologia;
					if (tableA[i].inizio !== "") {
						entity["DataInizio"] = tableA[i].inizio;
					}
					if (tableA[i].fine !== "") {
						entity["DataFine"] = tableA[i].fine;
					}
					entity["Importo"] = tableA[i].importoEuro[0].toString();
					entity["Zzfld00000e"] = "A"; //tipo investiemnto (A, B, S)

					oDataModel.create("/posizioniRichiestaSet", entity, param);
				}
			}

			var tableB = oModel.getProperty("/tableB");

			for (var i in tableB) {

				if (tableB[i].importoEuro !== "" && !isNaN(tableB[i].importoEuro[0])) {
					entity = {};
					entity["Description"] = tableB[i].tipologia;
					if (tableB[i].inizio !== "") {
						entity["DataInizio"] = tableB[i].inizio;
					}
					if (tableB[i].fine !== "") {
						entity["DataFine"] = tableB[i].fine;
					}
					entity["Importo"] = tableB[i].importoEuro[0].toString();
					entity["Zzfld000002"] = tableB[i].luogo; //luogo
					//entity["ZzinvType"] =  ; //tipo inv
					entity["Zzfld00000e"] = "B"; //tipo investiemnto (A, B, S)

					oDataModel.create("/posizioniRichiestaSet", entity, param);
				}
			}

			var tableS = oModel.getProperty("/claim3_tbl");

			for (var i in tableS) {

				if (tableS[i].importoEuro !== "") {
					entity = {};
					entity["Description"] = tableS[i].tipologia;
					entity["Zzfld00000e"] = "S"; //tipo investiemnto (A, B, S)
					if (oModel.getProperty("/claim3_3")) {
						entity["Zzfld000016"] = "X"; //sgravi
					}
					entity["Zzfld000017"] = tableS[i].importoEuro; //importo sgravi

					oDataModel.create("/posizioniRichiestaSet", entity, param);
				}
			}

		},

		_odataTextCreate: function (param) {
			var oModel = this.getView().getModel();
			var oDataModel = this.getView().getModel("oData");
			var entity;

			if (oModel.getProperty("/tableC_1") !== "") {
				entity = {};
				entity["Tdid"] = "Z001";
				entity["Text"] = oModel.getProperty("/tableC_1");
				oDataModel.create("/testiRichiestaSet", entity, param);
			}
			if (oModel.getProperty("/tableC_2") !== "") {
				entity = {};
				entity["Tdid"] = "Z002";
				entity["Text"] = oModel.getProperty("/tableC_2");
				oDataModel.create("/testiRichiestaSet", entity, param);
			}
			if (oModel.getProperty("/tableC_3") !== "") {
				entity = {};
				entity["Tdid"] = "Z003";
				entity["Text"] = oModel.getProperty("/tableC_3");
				oDataModel.create("/testiRichiestaSet", entity, param);
			}
			if (oModel.getProperty("/tableC_4") !== "") {
				entity = {};
				entity["Tdid"] = "Z004";
				entity["Text"] = oModel.getProperty("/tableC_4");
				oDataModel.create("/testiRichiestaSet", entity, param);
			}
		},

		_odataDocCreate: function (param) {
			var i;
			var length = this.ArrayId.length;
			var oDataModel = this.getView().getModel("oData");
			var oFileUploaded = this.getView().getModel().getData();
			for (i = 0; i < length; i++) {
				var entity;
				var property = oFileUploaded[this.ArrayId[i]];
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

		// ---------------------------------------------------------------------------------- End Azioni Toolbar

		formatAttribute: function (sValue) {
			if (jQuery.isNumeric(sValue)) {
				return FileSizeFormat.getInstance({
					binaryFilesize: false,
					maxFractionDigits: 1,
					maxIntegerDigits: 3
				}).format(sValue);
			} else {
				return sValue;
			}
		},

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
			var oData = this.byId(sUploadCollection).getModel().getData();
			var aItems = jQuery.extend(true, {}, oData)[property];
			jQuery.each(aItems, function (index) {
				if (aItems[index] && aItems[index].fileId === sItemToDeleteId) {
					aItems.splice(index, 1);
				}
			});
			this.byId(sUploadCollection).getModel().getData()[property] = aItems;
			this.byId(sUploadCollection).getModel().refresh();

			this.byId("attachmentTitle" + property).setText(this.getAttachmentTitleText(property));
		},

		onFilenameLengthExceed: function () {
			MessageToast.show("La lunghezza del nome del file è troppo grande.");
		},

		onFileRenamed: function (oEvent) {
			var oUploadCollection = oEvent.getSource().getId();
			var property = this.switchProperty(oUploadCollection);
			var oData = this.byId(oUploadCollection).getModel().getData();
			var aItems = jQuery.extend(true, {}, oData)[property];
			var sDocumentId = oEvent.getParameter("documentId");
			jQuery.each(aItems, function (index) {
				if (aItems[index] && aItems[index].fileId === sDocumentId) {
					aItems[index].fileName = oEvent.getParameter("item").getFileName();
				}
			});
			this.byId(oUploadCollection).getModel().getData()[property] = aItems;
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
			var oData = this.byId(oUploadCollection).getModel().getData();

			var blobForURL = this.base64toBlob(that.uploadJSON.fileContent, that.uploadJSON.fileMimeType);
			var fileURL = URL.createObjectURL(blobForURL);
			oData[property].unshift({
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
					var field = oData[this.ArrayId[i]];
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
			var oData = this.byId(oUploadCollection).getModel().getData();
			var aItems = jQuery.extend(true, {}, oData)[property];
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

		onParentClicked: function (oEvent) {
			var bSelected = oEvent.getParameter("selected");
			var bId = oEvent.getParameter("id");
			var oModel = this.getView().getModel();

			if (bId === this.createId("_score15")) {
				oModel.setProperty("/score15_2_1", bSelected);
				oModel.setProperty("/score15_2_2", bSelected);
				oModel.setProperty("/score15_2_3", bSelected);
			}

			if (bId === this.createId("_score10")) {

				oModel.setProperty("/score10_2_1", bSelected);
				oModel.setProperty("/score10_2_2", bSelected);
				oModel.setProperty("/score10_2_3", bSelected);
				oModel.setProperty("/score10_2_4", bSelected);
				oModel.setProperty("/score10_2_5", bSelected);
				oModel.setProperty("/score10_2_6", bSelected);
				oModel.setProperty("/score10_2_7", bSelected);

			}
		},

		onCheck: function () {

			var p = false;

			if ((this.getView().byId("box1").getSelected()) && (this.getView().byId("tableC_1").getValue() == '')) {
				this.getView().byId("tableC_1").setValueState("Error");
				this.getView().byId("tableC_1").setValueStateText("Inserire il testo");
				p = true;
			}

			if ((this.getView().byId("box2").getSelected()) && this.getView().byId("tableC_2").getValue() == '') {
				this.getView().byId("tableC_2").setValueState("Error");
				this.getView().byId("tableC_2").setValueStateText("Inserire il testo");
				p = true;
			}

			if ((this.getView().byId("box3").getSelected()) && this.getView().byId("tableC_3").getValue() == '') {
				this.getView().byId("tableC_3").setValueState("Error");
				this.getView().byId("tableC_3").setValueStateText("Inserire il testo");
				p = true;
			}

			if ((this.getView().byId("box4").getSelected()) && this.getView().byId("tableC_4").getValue() == '') {
				this.getView().byId("tableC_4").setValueState("Error");
				this.getView().byId("tableC_4").setValueStateText("Inserire il testo");
				p = true;
			}

			if ((!this.getView().byId("box1").getSelected()) && (!this.getView().byId("box2").getSelected()) && (!this.getView().byId("box3").getSelected()) &&
				(!this.getView().byId("box4").getSelected())) {
				p = true;
				this.getView().byId("errorMessage").setVisible(true);
			}

			var oModel = this.getView().getModel();

			var tableA = oModel.getProperty("/tableA");
			var tableB = oModel.getProperty("/tableB");
			var currentDate = new Date();
			currentDate.setHours(0);
			currentDate.setMinutes(0);
			currentDate.setSeconds(0);
			var endDate = new Date('December 31, 2019 23:59:59');

			for (var i in tableA) {
				if ((tableA[i].inizio < currentDate || tableA[i].inizio >= tableA[i].fine) && tableA[i].inizio !== "") {
					tableA[i].statei = "Error";
					tableA[i].stateValuei = "Inserire data di inizio corretta";
					p = true;
				} else {
					tableA[i].statei = "None";
					tableA[i].stateValuei = "";
				}
				if (tableA[i].fine >= endDate) {
					tableA[i].statef = "Error";
					tableA[i].stateValuef = "Inserire data di fine corretta";
					p = true;
				} else {
					tableA[i].statef = "None";
					tableA[i].stateValuef = "";
				}

				if (tableA[i].inizio > tableA[i].fine) {
					tableA[i].statei = "Error";
					tableA[i].stateValuei = "Inserire data di inizio corretta";
					tableA[i].statef = "Error";
					tableA[i].stateValuef = "Inserire data di fine corretta";
					p = true;
				}
			}

			for (var j in tableB) {
				if ((tableB[j].inizio < currentDate || tableB[j].inizio >= tableB[j].fine) && tableB[j].inizio !== "") {
					tableB[j].statei = "Error";
					tableB[j].stateValuei = "Inserire data di inizio corretta";
					p = true;
				} else {
					tableB[j].statei = "None";
					tableB[j].stateValuei = "";
				}
				if (tableB[j].fine >= endDate) {

					tableB[j].statef = "Error";
					tableB[j].stateValuef = "Inserire data di fine corretta";
					p = true;
				} else {
					tableB[j].statef = "None";
					tableB[j].stateValuef = "";
				}

				if (tableB[j].inizio > tableB[j].fine) {
					tableB[j].statei = "Error";
					tableB[j].stateValuei = "Inserire data di inizio corretta";
					tableB[j].statef = "Error";
					tableB[j].stateValuef = "Inserire data di fine corretta";
					p = true;
				}
			}

			oModel.refresh();
			// fine check controllo calendario
			return p;
		},

		onPressText: function (oEvent) {
			var oModel = this.getView().getModel();

			var bSelected = oEvent.getParameter("selected");
			var bId = oEvent.getParameter("id");
			if (!bSelected) {
				if (bId === this.createId("box1")) {
					oModel.setProperty("/tableC_1", "");
				}
				if (bId === this.createId("box2")) {
					oModel.setProperty("/tableC_2", "");
				}
				if (bId === this.createId("box3")) {
					oModel.setProperty("/tableC_3", "");
				}
				if (bId === this.createId("box4")) {
					oModel.setProperty("/tableC_4", "");
				}
			}
			if (bSelected) {

				this.getView().byId("errorMessage").setVisible(false);
			}
		},

		addRows: function () {
			var oModel = this.getView().getModel(); //VARIABILE LOCALE oModel
			var Table = oModel.getProperty("/tableA");
			Table.push({
				tipologia: '',
				inizio: '',
				fine: '',
				importoEuro: '',
				statei: '',
				stateValuei: '',
				statef: '',
				stateValuef: ''
			});
			oModel.refresh();
		}
	});
});