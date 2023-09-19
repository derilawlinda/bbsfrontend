sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/ui/core/Fragment",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/m/Text",
	"sap/m/TextArea",
	"sap/ui/model/json/JSONModel"
 ], function (Controller,History,Fragment,HorizontalLayout, VerticalLayout, Dialog, Button, Label, mobileLibrary, MessageToast, Text, TextArea,JSONModel) {
    "use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;
    return Controller.extend("frontend.bbs.controller.advanceRealization.List", {
       onInit: function () {
		this.getView().byId("advanceRealizationTableID").setBusy(true);
		var currentRoute = this.getRouter().getHashChanger().getHash();
		var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		this.oJWT = oStore.get("jwt");
		this.company = oStore.get("company");
		var oModel = new JSONModel();
		this._mViewSettingsDialogs = {};
		
		var viewModel = new sap.ui.model.json.JSONModel({
			is_approver : false
		});
		this.getView().setModel(viewModel,"viewModel");
		oModel.loadData(backendUrl+"advanceRequest/getAdvanceRealizations", {
			company : this.company
		}, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		this.getOwnerComponent().setModel(oModel,"advanceRealization");
		oModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
			this.getView().byId("advanceRealizationTableID").setBusy(false);
		}.bind(this));

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
				this.getView().getModel("viewModel").setProperty("/is_approver",true)
			}
   		},
	   onCreateButtonClick : function(oEvent) {
		if (!this.createBudgetingDialog) {
			this.createBudgetingDialog = this.loadFragment({
				name: "frontend.bbs.view.budgeting.CreateForm"
			});
		}
		this.createBudgetingDialog.then(function (oDialog) {
			this.oDialog = oDialog;
			this.oDialog.open();
			var oBudgetingDetailModel = new sap.ui.model.json.JSONModel();
			var dynamicProperties = [];
			oBudgetingDetailModel.setData(dynamicProperties);
			this.getView().setModel(oBudgetingDetailModel,"budgetingDetailModel");
			this._oMessageManager.registerObject(this.oView.byId("formContainer"), true);

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

		handleFilterButtonPressed: function () {
			this.getViewSettingsDialog("frontend.bbs.view.advanceRealization.FilterForm")
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
			this.getView().byId("advanceRealizationTableID").setBusy(true);
			var search = this.getView().byId("searchField").getValue();
			var oJWT = this.oJWT;
			var oModel = new JSONModel();
			oModel.loadData(backendUrl+"advanceRequest/getAdvanceRealizations", {
				"search" : search,
				"status" : statusFilter,
				"company" : this.company
			}, true, "GET",false,false,{
				'Authorization': 'Bearer ' + oJWT
			});
			oModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
				this.getView().byId("advanceRealizationTableID").setBusy(false);
			}.bind(this));
			this.getView().setModel(oModel,"advanceRealization");

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
		realizationButtonFormatter: function(sStatus) {
			if(sStatus == 3 || sStatus == 4){
				return 'Success'
			}else if(sStatus == 1 || sStatus == 2){
				return 'Warning'
			}else{
				return 'Error'
			}
		  },
		  realizationObjectFormatter: function(sStatus) {
			if(sStatus == 1 ){
				return 'Information'}
			else if(sStatus == 2){
				return 'Warning'
			}
			else if(sStatus == 3){
				return 'Success'
			}else if(sStatus == 4){
				return 'Information'
			}else if(sStatus == 6){
				return 'Success'
			}
			else{
				return 'Error'
			}
		  },
		
		relizationTextFormatter : function(sStatus){
			if(sStatus == 1){
				return 'Unrealized'
			}else if(sStatus == 2){
				return 'Submitted'
			}else if(sStatus == 3){
				return 'Approved by Manager'
			}else if(sStatus == 4){
				return 'Approved by Director'
			}else if(sStatus == 6){
				return 'Realized'
			}else{
				return 'Rejected'
			}
		  
		},
		onPress: function (oEvent) {

			var oRouter = this.getOwnerComponent().getRouter();
			var oRow = oEvent.getSource();
			var id = oRow.getCells()[0].getText();
			var path = oRow.getBindingContext("advanceRealization").getPath();
			this.getOwnerComponent().getModel("globalModel").setData({
				RealizationPath : path
			});
			oRouter.navTo("advanceRealizationDetail",{
				ID : id
			});

		},
		dateFormatter : function(date){
			if(date){
				var unformattedDate = new Date(date);
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "YYYY-MM-dd" });   
				var dateFormatted = dateFormat.format(unformattedDate);
				return dateFormatted;
			}else {
				return "-";
			}
			
		},
    });
 });