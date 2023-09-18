sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/library",
	'sap/ui/core/Fragment',
	'sap/ui/Device',
 ], function (Controller,History,mobileLibrary, MessageToast, JSONModel,coreLibrary,Fragment,Device) {
    "use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;
	var ValueState = coreLibrary.ValueState;
    return Controller.extend("frontend.bbs.controller.advanceEmployee.List", {
       onInit: function () {
		this.getView().byId("advanceEmployeeTableID").setBusy(true);
		var currentRoute = this.getRouter().getHashChanger().getHash();
		var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		this.oJWT = oStore.get("jwt");
		this.company = oStore.get("company");
		this._mViewSettingsDialogs = {};

		var oModel = new JSONModel();
		oModel.setSizeLimit(1000);
		oModel.loadData(backendUrl+"advanceRequest/getAdvanceRequests", {
			company : this.company
		}, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		this.getOwnerComponent().setModel(oModel,"advanceRequests");
		oModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
			this.getView().byId("advanceEmployeeTableID").setBusy(false);
		}.bind(this));

		var oItemModel = new JSONModel();
		this.getView().setModel(oItemModel,"items");
		this.getView().getModel("items").setProperty("/data", []);
		var oAdvanceRequestHeader = new sap.ui.model.json.JSONModel();
		var viewModel = new sap.ui.model.json.JSONModel({
			showCreateButton : true,
			is_approver : false
		});
		this.getView().setModel(viewModel,"viewModel");
		// var dynamicProperties = [];
		// oBudgetingDetailModel.setData(dynamicProperties);
		
		this.getView().setModel(oAdvanceRequestHeader,"advanceRequestHeader");
		var budgetRequestHeader = new sap.ui.model.json.JSONModel({
			U_RemainingBudget : 0
		});
		this.getView().setModel(budgetRequestHeader,"budgetHeader");
		var oBudgetingModel = new JSONModel();
		oBudgetingModel.setSizeLimit(500);
		oBudgetingModel.loadData(backendUrl+"budget/getApprovedBudget", {
			company : this.company
		}, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		this.getView().setModel(oBudgetingModel,"budgeting");

		

		//NEW AR ITEM MODEL
		var oNewAdvanceRequestItems = new sap.ui.model.json.JSONModel();
		this.getView().setModel(oNewAdvanceRequestItems,"new_ar_items");
		this.getView().getModel("new_ar_items").setProperty("/ADVANCEREQLINESCollection", []);

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
			if(parametersMap.roleId == 4 || parametersMap.roleId == 5 || parametersMap.roleId == 2){
				this.getView().getModel("viewModel").setProperty("/showCreateButton",false)
				this.getView().getModel("viewModel").setProperty("/is_approver",true)
			}
	   },
	   onCreateButtonClick : function(oEvent) {
		if (!this.createEmployeeAdvanceDialog) {
			this.createEmployeeAdvanceDialog = this.loadFragment({
				name: "frontend.bbs.view.advanceEmployee.CreateForm"
			});
		}
		this.createEmployeeAdvanceDialog.then(function (oDialog) {
			var oCreateFragmentViewModel = new sap.ui.model.json.JSONModel({
				Date : new Date()
			});
			this.getView().setModel(oCreateFragmentViewModel,"createFragmentViewModel");
			var budgetRequestHeader = this.getView().getModel("budgetHeader");
			budgetRequestHeader.setData([]);
			var oAdvanceRequestHeader = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oAdvanceRequestHeader,"advanceRequestHeader");
			var oNewAdvanceEmployeeItems = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oNewAdvanceEmployeeItems,"new_ar_items");
			this.getView().getModel("new_ar_items").setProperty("/ADVANCEREQLINESCollection", []);
			this.oDialog = oDialog;
			this.oDialog.open();

			

		}.bind(this));
	   },
	    getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
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
		_closeDialog: function () {
			this.oDialog.close();
		},
		buttonFormatter: function(sStatus) {
			if(sStatus == 2 || sStatus == 3){
				return 'Accept'
			}else if(sStatus == 1){
				return 'Attention'
			}else{
				return 'Reject'
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
			}else if(sStatus == 5){
				return 'Information';
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
			}else if(sStatus == 5){
				return 'Transferred'
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
		onBudgetChange : async function(oEvent){
			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();

			if (!sSelectedKey && sValue) {
				oValidatedComboBox.setValueState(ValueState.Error);
				oValidatedComboBox.setValueStateText("Please enter a valid Budget Code");
			} else {
				oValidatedComboBox.setValueState(ValueState.None);
			}

			if(oValidatedComboBox.getValueState() == ValueState.None){
				this.getView().byId("createARForm").setBusy(true);
				this.getView().byId("ARItemsTableID").setBusy(true);
				this.getView().getModel("new_ar_items").setProperty("/ADVANCEREQLINESCollection", []);
				var selectedID = parseInt(oEvent.getParameters('selectedItem').value);
				var budgetingModel = new JSONModel();
				await budgetingModel.loadData(backendUrl+"budget/getBudgetById", {
					code : selectedID,
					company : this.company
				}, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				var accountModel = new JSONModel();
				await accountModel.loadData(backendUrl+"coa/getCOAsByBudget", {
					budgetCode : selectedID,
					company : this.company
				}, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				this.getView().setModel(accountModel,"accounts");
				
				var budgetingModel = new JSONModel();
				await budgetingModel.loadData(backendUrl+"budget/getBudgetById", {
					code : selectedID,
					company : this.company
				}, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				var budgetingData = budgetingModel.getData();
				var approvedBudget = budgetingData.U_TotalAmount;
				var usedBudget = budgetingData.BUDGETUSEDCollection;
				let sumUsedBudget = 0;
				for (let i = 0; i < usedBudget.length; i++ ) {
					sumUsedBudget += usedBudget[i]["U_Amount"];
				};
				budgetingData.U_RemainingBudget = approvedBudget - sumUsedBudget;
				var budgetRequestHeader = this.getView().getModel("budgetHeader");
				budgetRequestHeader.setData(budgetingData);
				this.getView().byId("createARForm").setBusy(false);
				this.getView().byId("ARItemsTableID").setBusy(false);
			}
		  },
		onPress: function (oEvent) {

			var oRouter = this.getOwnerComponent().getRouter();
			var oRow = oEvent.getSource();
			var id = oRow.getCells()[0].getText();
			var path = oRow.getBindingContext("advanceRequests").getPath();
			this.getOwnerComponent().getModel("globalModel").setData({
				AEPath : path
			});
			oRouter.navTo("advanceEmployeeDetail",{
				ID : id
			});

		},
		onAccountCodeChange : async function(oEvent){
			
			var oSelectedItem = oEvent.getSource().getSelectedKey(); //Get Selected Item
			var oSelectedRow = oEvent.getSource().getParent(); //Selected Row.
			oSelectedRow.getCells()[1].setBusy(true);
			oSelectedRow.getCells()[1].setSelectedKey("");
			oSelectedRow.getCells()[1].setEnabled(true);
			oSelectedRow.getCells()[1].setEnabled(true);

			var oItemModel = this.getView().getModel("items");
			var oItemData = oItemModel.getData();
			if(!(oSelectedItem in oItemData)){
				var oItemByAccountModel = new JSONModel();
				await oItemByAccountModel.loadData(backendUrl+"items/getItemsByAccount", {
					accountCode : oSelectedItem,
					company : this.company
				}, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				var oItemByAccountData = oItemByAccountModel.getData();
				oItemData[oSelectedItem] = oItemByAccountData;
				var i = new sap.ui.model.json.JSONModel(oItemData);
				this.getView().setModel(i, 'items');
				i.refresh();
			}

			oSelectedRow.getCells()[1].bindAggregation("items", {
				path: 'items>/'+ oSelectedItem,
				template: new sap.ui.core.Item({
					key: "{items>ItemCode}",
					text: "{items>ItemCode} - {items>ItemName}"
				})
			});
			oSelectedRow.getCells()[1].setBusy(false);

			
		},
		onAddPress : function(oEvent){
			const oModel = this.getView().getModel("new_ar_items");
			var oModelData = oModel.getData();
			var oNewObject = {
				"U_AccountCode": "",
				"U_ItemCode": "",
				"U_Amount": "",
				"U_Description": ""
			};
			oModelData.ADVANCEREQLINESCollection.push(oNewObject);
			var f = new sap.ui.model.json.JSONModel(oModelData);
			this.getView().setModel(f, 'new_ar_items');
			f.refresh();
		
		},
		onDelete: function(oEvent){

			var row = oEvent.getParameters().row;
			var iIdx = row.getIndex();
			var oModel = this.getView().getModel("new_ar_items");
			var oModelLineData = oModel.getData().ADVANCEREQLINESCollection;
			oModelLineData.splice(iIdx, 1);
			oModel.setProperty("/ADVANCEREQLINESCollection",oModelLineData);
			oModel.refresh();
			this.onAmountChange();
		},
		onSaveButtonClick : function(oEvent) {
			var oDialog = this.oDialog;
			oDialog.setBusy(true);
			var advanceRequestModel = this.getView().getModel("advanceRequests");
			const oModel = this.getView().getModel("advanceRequestHeader");
			const oModelItems = this.getView().getModel("new_ar_items");
			oModel.setProperty("/ADVANCEREQLINESCollection", oModelItems.getData().ADVANCEREQLINESCollection);
			var oProperty = oModel.getProperty("/");
			var company = this.company;
			var view = this.getView();
			var oJWT = this.oJWT;

			$.ajax({
				type: "POST",
				data: JSON.stringify({
					company : company,
					oProperty : oProperty
				}),
				crossDomain: true,
				headers: { 'Authorization': 'Bearer ' + oJWT },
				url: backendUrl+'advanceRequest/createAdvanceRequest',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					oDialog.setBusy(false);
					oDialog.close();
					advanceRequestModel.loadData(backendUrl+"advanceRequest/getAdvanceRequests", {
						company : company
					}, true, "GET",false,false,{
						'Authorization': 'Bearer ' + oJWT
					});
					MessageToast.show("Advance Request created");
					$(".sapMMessageToast").css({"background-color": "#256f3a", "color": "white"});
					view.getModel('advanceRequests').refresh();
				},
				error: function (jqXHR, textStatus, errorThrown) {
				  	console.log("Got an error response: " + textStatus + errorThrown);
				}
			  });
			// alert(JSON.stringify(oProperty));
	   },
		onAmountChange : function(event){
			const oModel = this.getView().getModel("new_ar_items");
			var oModelData = oModel.getData().ADVANCEREQLINESCollection;
			const viewModel = this.getView().getModel("createFragmentViewModel");
			var oBudgetingData = this.getView().getModel("budgetHeader").getData();
			const oModelHeader = this.getView().getModel("advanceRequestHeader");
			let sum = 0;
			for (let i = 0; i < oModelData.length; i++ ) {
				sum += oModelData[i]["U_Amount"];
			}
			oModelHeader.setProperty("/U_Amount", sum);
			var budgetAmount = oBudgetingData.U_RemainingBudget;
			if(sum > budgetAmount){
				viewModel.setProperty("/is_amountExceeded",true);
				viewModel.setProperty("/createButtonEnabled",false);
				viewModel.setProperty("/amountExceeded","Advance Amount exceeded Budget!");
			}else{
				viewModel.setProperty("/is_amountExceeded",false);
				viewModel.setProperty("/createButtonEnabled",true);
				viewModel.setProperty("/amountExceeded","");

			}

		},
		handleFilterButtonPressed: function () {
			this.getViewSettingsDialog("frontend.bbs.view.advanceEmployee.FilterForm")
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

		onSearch : function(oEvent){
			var mParamas = oEvent.getParameters();
			if(mParamas.filterKeys){
				var statusFilter = Object.keys(mParamas.filterKeys).toString();
			}else{
				var statusFilter = "";
			}
			this.getView().byId("advanceEmployeeTable").setBusy(true);
			var search = this.getView().byId("searchField").getValue();
			var oJWT = this.oJWT;
			var oModel = new JSONModel();
			oModel.loadData(backendUrl+"advanceRequest/getAdvanceRequests", {
				"search" : search,
				"status" : statusFilter,
				"company" : this.company
			}, true, "GET",false,false,{
				'Authorization': 'Bearer ' + oJWT
			});
			oModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
				this.getView().byId("advanceEmployeeTable").setBusy(false);
			}.bind(this));
			this.getView().setModel(oModel,"advanceRequests");

		}
    });
 });