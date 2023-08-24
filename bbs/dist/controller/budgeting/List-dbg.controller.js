sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"frontend/bbs/model/PagingJSONModel",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/m/MessageToast",
	"frontend/bbs/model/models",
	"sap/ui/core/library",
	"sap/m/MessageBox",
	"frontend/bbs/utils/Validator",
	'sap/ui/core/Fragment',
	'sap/ui/Device'

 ], function (Controller,History,JSONModel,ODataModel,MessageToast,Models,coreLibrary,MessageBox,Validator,Fragment,Device) {
    "use strict";
	var endTerm;
	var startTerm;
	var matches = [];

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

    return Controller.extend("frontend.bbs.controller.budgeting.List", {
		
       onInit: async function () {
		this.getView().byId("idBudgetTable").setBusy(true);
		var currentRoute = this.getRouter().getHashChanger().getHash();
		var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		var company = oStore.get("company");
		this.company = company;
		this._mViewSettingsDialogs = {};
		var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		this.oJWT = oStore.get("jwt");
		var oModel = new JSONModel();
		oModel.setSizeLimit(1000);
		oModel.loadData(backendUrl+"getBudget", {
			company : company
		}, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		var viewModel = new sap.ui.model.json.JSONModel({
			showCreateButton : true,
			is_approver : false,
			is_requestor : false
		});
		this.getView().setModel(viewModel,"viewModel");

		var searchModel = new sap.ui.model.json.JSONModel({
			sortBy : "",
			filterBy : "",
		});
		this.getView().setModel(searchModel,"searchModel");

		oModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
			this.getView().byId("idBudgetTable").setBusy(false);
		}.bind(this));
		this.getView().setModel(oModel,"budgeting");

		var oProjectModel = new JSONModel();
		oProjectModel.loadData(backendUrl+"project/getProjects", {
			company : company
		}, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		this.getView().setModel(oProjectModel,"projects");

		var oAccountModel = new JSONModel();
		oAccountModel.setSizeLimit(1000);
		oAccountModel.loadData(backendUrl+"coa/getCOAs", {
			company : company
		}, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		this.getView().setModel(oAccountModel,"accounts");

		var userModel = this.getOwnerComponent().getModel("userModel");
		if(userModel === undefined){
			const bus = this.getOwnerComponent().getEventBus();
			bus.subscribe("username", "checktoken", this.toggleCreateButton, this);
		}else{
			var userData = userModel.getData();
			var a = { "userName" : userData.user.name,
			  "roleId" : userData.user.role_id,
			  "roleName" : userData.role[0].name,
			  "status" : "success"
			};
			this.toggleCreateButton("username","checkToken",a);
		}

		
	},

	toggleCreateButton : function(channelId, eventId, parametersMap){
			if(parametersMap.roleId == 4 || parametersMap.roleId == 5){
				this.getView().getModel("viewModel").setProperty("/showCreateButton",false)
				this.getView().getModel("viewModel").setProperty("/is_approver",true)
			}
	   },

	   search : function (arr, term) {
		
		if(term != endTerm){
			matches = [];
		};
		if (!Array.isArray(arr)) return matches;
		
		var that = this;
		arr.forEach(function(i) {
			
			if (i.subheader === term) {
			 const filterData =  (i.nodes && Array.isArray(i.nodes))? i.nodes.filter(subheader => subheader.value ===term):[];
				matches.push(i);
			} else {
				that.search(i.nodes, term);
			}
		endTerm = term;

		})
		return matches;
	},

	   onCreateButtonClick : function(oEvent) {

		if (!this.createBudgetingDialog) {
			this.createBudgetingDialog = this.loadFragment({
				name: "frontend.bbs.view.budgeting.CreateForm"
			});
		}
		this.createBudgetingDialog.then(function (oDialog) {
			this.getView().byId("CreateCompany").setSelectedKey(this.company);
			this.getView().byId("CreateCompany").fireSelectionChange();
			this.getView().byId("CreatePillar").setSelectedKey("");
			this.getView().byId("CreateClassification").setSelectedKey("");
			this.getView().byId("CreateSubClassification").setSelectedKey("");
			this.getView().byId("CreateSubClassification2").setSelectedKey("");

			this.getView().byId("CreateClassification").setEnabled(false);
			this.getView().byId("CreateSubClassification").setEnabled(false);
			this.getView().byId("CreateSubClassification2").setEnabled(false);

			var comboPath = this.getView().byId("CreateCompany").getSelectedItem().getBindingContext("companies").getPath();
			this.companyPath = comboPath;
			var comboPillar = this.getView().byId("CreatePillar");
			comboPillar.setEnabled(true);
			comboPillar.bindAggregation("items", {
				path: "companies>"+ comboPath + "/nodes",
				template: new sap.ui.core.Item({
					key: "{companies>code}",
					text: "{companies>text}"
				})
			});


			this.oDialog = oDialog;
			this.oDialog.open();
			var oCreateFragmentViewModel = new sap.ui.model.json.JSONModel({
				Date : new Date()
			});
			this.getView().setModel(oCreateFragmentViewModel,"createFragmentViewModel");
			var oBudgetingDetailModel = new sap.ui.model.json.JSONModel({
				U_TotalAmount : 0,
				U_Company : this.company
			});
			// var dynamicProperties = [];
			// oBudgetingDetailModel.setData(dynamicProperties);
			
			this.getView().setModel(oBudgetingDetailModel,"budgetingDetailModel");
			var oNewBudgetingAccounts = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oNewBudgetingAccounts,"new_budgeting_accounts");
			this.getView().getModel("new_budgeting_accounts").setProperty("/BUDGETREQLINESCollection", []);

		}.bind(this));
	   },
	   onSaveButtonClick : function(oEvent) {
			var table = this.byId("tableId");
			var oDialog = this.oDialog;
			const oModel = this.getView().getModel("budgetingDetailModel");
			const oModelAccounts = this.getView().getModel("new_budgeting_accounts");
			const oModelAccountData = oModelAccounts.getData();
			var budgetingModel = this.getView().getModel("budgeting");
			oModel.setProperty("/BUDGETREQLINESCollection", oModelAccounts.getData().BUDGETREQLINESCollection);
			var oProperty = oModel.getProperty("/");
			var view = this.getView();
			var oJWT = this.oJWT;
			var oModelData = oModel.getData();
			var bValidationError = false;
			var company = this.company;

			if(oModelData.BUDGETREQLINESCollection.length < 1 ){
				MessageBox.error("Account can not empty");
			}else {
				// var validator = new Validator();
				// var rows = table.getRows();
				
				// for (let i = 0; i < oModelAccountData.BUDGETREQLINESCollection.length; i++ ) {
				// 	var cells = rows[i].getCells();
				// 	for (let j = 0; j < cells.length; j++ ) {
						
				// 		validator.validate(cells[j]);
				// 		// bValidationError = this._validateInput(cells[j]) || bValidationError;
				// 	}
				// }
				// if (validator.validate(this.byId("createBudgetFormContainer"))) {
				// 	console.log("Assssss");
					oDialog.setBusy(true);
					var oProperty = oModel.getProperty("/");
					// console.log(JSON.stringify(oProperty));
					$.ajax({
						type: "POST",
						data: JSON.stringify(oProperty),
						crossDomain: true,
						headers: { 'Authorization': 'Bearer ' + oJWT },
						url: backendUrl+'budget/createBudget',
						contentType: "application/json",
						success: function (res, status, xhr) {
							//success code
							oDialog.setBusy(false);
							oDialog.close();
							MessageToast.show("Budget created");
							$(".sapMMessageToast").css({"background-color": "#256f3a", "color": "white"});
							budgetingModel.loadData(backendUrl+"getBudget", {
								company : company
							}, true, "GET",false,false,{
								'Authorization': 'Bearer ' + oJWT
							});
							view.getModel('budgeting').refresh();
							
						},
						error: function (jqXHR, textStatus, errorThrown) {
							console.log("Got an error response: " + textStatus + errorThrown);
						}
					});

				// }
			}

	   },
	   
	    getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		_closeDialog: function () {
			this.oDialog.close();
		},
		buttonFormatter: function(sStatus) {
			if(sStatus == 1 ){
				return 'Warning';
			}else if(sStatus == 2){
				return 'Information';
			}
			else if(sStatus == 3){
				return 'Success';
			}else{
				return 'Error';
			}
		  },

		  objectFormatter: function(sStatus) {
			if(sStatus == 1 ){
				return 'Warning';
			}else if(sStatus == 2){
				return 'Information';
			}
			else if(sStatus == 3){
				return 'Success';
			}else{
				return 'Error';
			}
		  },
		
		textFormatter : function(sStatus){
			if(sStatus == 1){
				return 'Pending'
			}else if(sStatus == 2){
				return 'Approved by Manager'
			}else if(sStatus == 3){
				return 'Approved by Director'
			}else{
				return 'Rejected'
			}
		  
		},
		dateFormatter : function(date){
			var unformattedDate = new Date(date);
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "YYYY-MM-dd" });   
			var dateFormatted = dateFormat.format(unformattedDate);
			return dateFormatted;
		},
       onNavBack: function (oEvent) {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("login", {}, true /*no history*/);
			}
		},
		onPress: function (oEvent) {
			
			var oRouter = this.getOwnerComponent().getRouter();
			var oRow = oEvent.getSource();
			var id = oRow.getCells()[0].getText();
			oRouter.navTo("budgetingDetail",{
				budgetID : id
			});

			
		},

		onAddPress : function(oEvent){


			var validator = new Validator();
  
            // Validate input fields against root page with id 'somePage'
          	if (validator.validate(this.byId("createBudgetForm"))) {
				const oModel = this.getView().getModel("new_budgeting_accounts");
				var oModelData = oModel.getData();
				var oNewObject = {
					"U_AccountCode": "",
					"U_Amount": 0
				};
				oModelData.BUDGETREQLINESCollection.push(oNewObject);
				var f = new sap.ui.model.json.JSONModel(oModelData);
				this.getView().setModel(f, 'new_budgeting_accounts');
				f.refresh();
          	}

			
		
		},

		onAmountChange : function(event){
			const oModel = this.getView().getModel("new_budgeting_accounts");
			var oModelData = oModel.getData().BUDGETREQLINESCollection;
			let sum = 0;
			for (let i = 0; i < oModelData.length; i++ ) {
				sum += oModelData[i]["U_Amount"];
			}
			const oModelHeader = this.getView().getModel("budgetingDetailModel");
			oModelHeader.setProperty("/U_TotalAmount", sum);

		},
		onCompanyChange : function(oEvent){
			this.getView().byId("CreatePillar").setSelectedKey("");
			this.getView().byId("CreateClassification").setSelectedKey("");
			this.getView().byId("CreateSubClassification").setSelectedKey("");
			this.getView().byId("CreateSubClassification2").setSelectedKey("");

			this.getView().byId("CreateClassification").setEnabled(false);
			this.getView().byId("CreateSubClassification").setEnabled(false);
			this.getView().byId("CreateSubClassification2").setEnabled(false);

			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();

			if (!sSelectedKey && sValue) {
				this.getView().byId("CreatePillar").setEnabled(false);
				oValidatedComboBox.setValueState(ValueState.Error);
				oValidatedComboBox.setValueStateText("Please enter a valid Company");
			} else {
				oValidatedComboBox.setValueState(ValueState.None);
				var comboPath = oEvent.oSource.getSelectedItem().getBindingContext("companies").getPath();
				this.companyPath = comboPath;
				var comboPillar = this.getView().byId("CreatePillar");
				comboPillar.setEnabled(true);
				comboPillar.bindAggregation("items", {
					path: "companies>"+ comboPath + "/nodes",
					template: new sap.ui.core.Item({
						key: "{companies>code}",
						text: "{companies>text}"
					})
				});
				comboPillar.setSelectedKey(sSelectedKey);
			}


			
		},

		onPillarChange : function(oEvent){
			var oBudgetingDetailModel = this.getView().getModel("budgetingDetailModel");
			this.getView().byId("CreateClassification").setSelectedKey("");
			this.getView().byId("CreateSubClassification").setSelectedKey("");
			this.getView().byId("CreateSubClassification2").setSelectedKey("");

			this.getView().byId("CreateSubClassification").setEnabled(false);
			this.getView().byId("CreateSubClassification2").setEnabled(false);

			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();

			if (!sSelectedKey && sValue) {
				this.getView().byId("CreateClassification").setEnabled(false);
				oValidatedComboBox.setValueState(ValueState.Error);
				oValidatedComboBox.setValueStateText("Please enter a valid Pillar");
			} else {
				oValidatedComboBox.setValueState(ValueState.None);

				var comboPath = oEvent.oSource.getSelectedItem().getBindingContext("companies").getPath();
				oBudgetingDetailModel.setProperty("/U_Pillar",sValue);
				oBudgetingDetailModel.setProperty("/U_PillarCode",sSelectedKey);
				var comboBox = this.getView().byId("CreateClassification");
				comboBox.setEnabled(true);
				comboBox.bindAggregation("items", {
					path: "companies>"+ comboPath + "/nodes",
					template: new sap.ui.core.Item({
						key: "{companies>code}",
						text: "{companies>text}"
					})
				});
			}

			
		},

		onClassificationChange : function(oEvent){

			var oBudgetingDetailModel = this.getView().getModel("budgetingDetailModel");
			this.getView().byId("CreateSubClassification").setSelectedKey("");
			this.getView().byId("CreateSubClassification2").setSelectedKey("");

			this.getView().byId("CreateSubClassification2").setEnabled(false);

			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();

			if (!sSelectedKey && sValue) {
				this.getView().byId("CreateSubClassification").setEnabled(false);
				oValidatedComboBox.setValueState(ValueState.Error);
				oValidatedComboBox.setValueStateText("Please enter a valid Classification");
			} else {
				oValidatedComboBox.setValueState(ValueState.None);
				oBudgetingDetailModel.setProperty("/U_Classification",sValue);
				oBudgetingDetailModel.setProperty("/U_ClassificationCode",sSelectedKey);
				var comboPath = oEvent.oSource.getSelectedItem().getBindingContext("companies").getPath();
				var comboBox = this.getView().byId("CreateSubClassification");
				comboBox.setEnabled(true);
				comboBox.bindAggregation("items", {
					path: "companies>"+ comboPath + "/nodes",
					template: new sap.ui.core.Item({
						key: "{companies>code}",
						text: "{companies>text}"
					})
				});
			}

			
		},
		onSubClassificationChange : function(oEvent){

			this.getView().byId("CreateSubClassification2").setSelectedKey("");
			var oBudgetingDetailModel = this.getView().getModel("budgetingDetailModel");

			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();

			if (!sSelectedKey && sValue) {
				this.getView().byId("CreateSubClassification2").setEnabled(false);
				oValidatedComboBox.setValueState(ValueState.Error);
				oValidatedComboBox.setValueStateText("Please enter a valid SubClassification");
			} else {
				oValidatedComboBox.setValueState(ValueState.None);
				oBudgetingDetailModel.setProperty("/U_SubClass",sValue);
				oBudgetingDetailModel.setProperty("/U_SubClassCode",sSelectedKey);
				var comboPath = oEvent.oSource.getSelectedItem().getBindingContext("companies").getPath();
				var comboBox = this.getView().byId("CreateSubClassification2");
				comboBox.setEnabled(true);
				comboBox.bindAggregation("items", {
					path: "companies>"+ comboPath + "/nodes",
					template: new sap.ui.core.Item({
						key: "{companies>code}",
						text: "{companies>text}"
					})
				});
			}

			
		},

		onSubClassification2Change : function(oEvent){

			var oBudgetingDetailModel = this.getView().getModel("budgetingDetailModel");

			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();

			if (!sSelectedKey && sValue) {
				oValidatedComboBox.setValueState(ValueState.Error);
				oValidatedComboBox.setValueStateText("Please enter a valid SubClassification2");
			} else {
				oValidatedComboBox.setValueState(ValueState.None);
				oBudgetingDetailModel.setProperty("/U_SubClass2",sValue);
				oBudgetingDetailModel.setProperty("/U_SubClass2Code",sSelectedKey);
			}
		},

		onProjectChange : function(oEvent){
			var oBudgetingDetailModel = this.getView().getModel("budgetingDetailModel");
			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();

			if (!sSelectedKey && sValue) {
				oValidatedComboBox.setValueState(ValueState.Error);
				oValidatedComboBox.setValueStateText("Please enter a valid Project");
			} else {
				oValidatedComboBox.setValueState(ValueState.None);
				oBudgetingDetailModel.setProperty("/U_Project",sValue);
				oBudgetingDetailModel.setProperty("/U_ProjectCode",sSelectedKey);
			}
		},

		onAccountChange : function(oEvent){
			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();
			if (!sSelectedKey && sValue) {
				oValidatedComboBox.setValueState(ValueState.Error);
				oValidatedComboBox.setValueStateText("Please enter a valid Account");
			} else {
				oValidatedComboBox.setValueState(ValueState.None);
			}
		},
		onDelete: function(oEvent){

			var row = oEvent.getParameters().row;
			var iIdx = row.getIndex();
			var oModel = this.getView().getModel("new_budgeting_accounts");
			var oModelLineData = oModel.getData().BUDGETREQLINESCollection;
			oModelLineData.splice(iIdx, 1);
			oModel.setProperty("/BUDGETREQLINESCollection",oModelLineData);
			oModel.refresh();
			this.onAmountChange();
		},

		_validateInput: function (oInput) {
			var sValueState = "None";
			var bValidationError = false;
			var oBinding = oInput.getBinding("value");
			

			try {
				oBinding.getType().validateValue(oInput.getValue());
			} catch (oException) {
				sValueState = "Error";
				bValidationError = true;
			}

			oInput.setValueState(sValueState);

			return bValidationError;
		},
		onSearch : function(oEvent){
			var mParamas = oEvent.getParameters();
			console.log(mParamas);
			if(mParamas.filterKeys){
				var statusFilter = Object.keys(mParamas.filterKeys).toString();
			}else{
				var statusFilter = "";
			}
			this.getView().byId("idBudgetTable").setBusy(true);
			var search = this.getView().byId("searchField").getValue();
			var oJWT = this.oJWT;
			var oModel = new JSONModel();
			oModel.loadData(backendUrl+"getBudget", {
				"search" : search,
				"status" : statusFilter,
				"company" : this.company
			}, true, "GET",false,false,{
				'Authorization': 'Bearer ' + oJWT
			});
			oModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
				this.getView().byId("idBudgetTable").setBusy(false);
			}.bind(this));
			this.getView().setModel(oModel,"budgeting");

		},
		handleFilterButtonPressed: function () {
			this.getViewSettingsDialog("frontend.bbs.view.budgeting.FilterForm")
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open();
				});
		},
		getViewSettingsDialog: function (sDialogFragmentName) {
			var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!pDialog) {
				pDialog = Fragment.load({
					id: this.getView().getId(),
					name: sDialogFragmentName,
					controller: this
				}).then(function (oDialog) {
					if (Device.system.desktop) {
						oDialog.addStyleClass("sapUiSizeCompact");
					}
					return oDialog;
				});
				this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
			}
			return pDialog;
		},
    });
 });