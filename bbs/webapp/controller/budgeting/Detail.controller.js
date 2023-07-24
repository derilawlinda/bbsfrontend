sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Text",
	"sap/ui/core/library"
], function (Controller, History, JSONModel,Dialog,Button,mobileLibrary,Text,coreLibrary) {
	"use strict";

	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	return Controller.extend("frontend.bbs.controller.budgeting.Detail", {

		
		onInit: async function () {
			this.currentRoute = this.getOwnerComponent().getRouter().getHashChanger().getHash();
			this.oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			this.oJWT = this.oStore.get("jwt");
			var oOwnerComponent = this.getOwnerComponent();
			var oSalesOrderModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/sales_order.json"));
			this.getView().setModel(oSalesOrderModel,"salesOrder");
			this.oRouter = oOwnerComponent.getRouter();
			this.userModel = oOwnerComponent.getModel("userModel");
			this.viewModel = new JSONModel();
			this.getView().setModel(this.viewModel,"viewModel");
			this.getView().setModel(this.userModel,"userModel");
			this.oRouter.getRoute("budgetingDetail").attachPatternMatched(this._onObjectMatched, this);
			var oCompaniesModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/companies.json"));
			this.getView().setModel(oCompaniesModel,"companies");
			
		},
		_onObjectMatched: function (oEvent) {
			var viewModel = new JSONModel();
			this.getView().setModel(viewModel,"viewModel");
			this.getView().byId("budgetingPageId").setBusy(true);
			this.budgetCode = oEvent.getParameter("arguments").budgetID;
			var userModel = this.getOwnerComponent().getModel("userModel");
			if(userModel === undefined){
				const bus = this.getOwnerComponent().getEventBus();
				bus.subscribe("username", "checktoken", this.buildForm, this);
			}else{
				var userData = userModel.getData();
				var a = { "userName" : userData.user.name,
				  "roleId" : userData.user.role_id,
				  "roleName" : userData.role[0].name,
				  "status" : "success"
				};
				this.buildForm("username","checkToken",a);
			}
		
			

		},

		buildForm: function(channelId, eventId, parametersMap) {
			if(parametersMap.status == "error"){
				alert("Error");
				this.getView().byId("budgetingPageId").setBusy(false);
			}
			var budgetCode = this.budgetCode;
			var viewModel = this.getView().getModel("viewModel");

			if(parametersMap.roleId == 4 || parametersMap.roleId == 5 ){
				viewModel.setProperty("/is_approver", true);
				viewModel.setProperty("/is_requestor", false);
			}else if(parametersMap.roleId == 3){
				viewModel.setProperty("/is_approver", false);
				viewModel.setProperty("/is_requestor", true);
			}

			if(budgetCode === undefined){
				var url = window.location.href;
				var urlArray = url.split("/");
				budgetCode = urlArray[urlArray.length - 1];
			}
			const budgetingDetailModel = new JSONModel();
			budgetingDetailModel.loadData(backendUrl+"budget/getBudgetById?code="+budgetCode, null, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			
			this.getView().setModel(budgetingDetailModel,"budgetingDetailModel");
			budgetingDetailModel.dataLoaded().then(function(){
				var budgetingDetailData = budgetingDetailModel.getData();
				console.log(budgetingDetailData.U_Status);
				if(parametersMap.roleId == 3){
					viewModel.setProperty("/showFooter", true);
					viewModel.setProperty("/editable", true);

					if(budgetingDetailData.U_Status != 1){
						viewModel.setProperty("/showFooter", false);
						viewModel.setProperty("/editable", false);
					}
				}

				if(parametersMap.roleId == 5 && budgetingDetailData.U_Status == 2){
					viewModel.setProperty("/showFooter", false);
				}

				if(parametersMap.roleId == 4 && budgetingDetailData.U_Status == 3){
					viewModel.setProperty("/showFooter", false);
				}
				
				this.getView().byId("budgetingPageId").setBusy(false);

			}.bind(this));
		  },

		

        onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("dashboard", {}, true);
			}
		},

		
		onApproveButtonClick : function(oEvent){
			var pageDOM = this.getView().byId("budgetingPageId");
			pageDOM.setBusy(true);
			var code = this.getView().byId("_IDGenText101").getText();
			$.ajax({
				type: "POST",
				data: {
					"Code": code
				},
				headers: {"Authorization": "Bearer "+ this.oJWT},
				crossDomain: true,
				url: backendUrl+'budget/approveBudget',
				success: function (res, status, xhr) {
					  //success code
					  pageDOM.setBusy(false);
					  
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Budget approved" }),
							beginButton: new Button({
								type: ButtonType.Emphasized,
								text: "OK",
								press: function () {
									this.oSuccessMessageDialog.close();
								}.bind(this)
							})
						});
					}
		
					this.oSuccessMessageDialog.open();
				},
				error: function (jqXHR, textStatus, errorThrown) {
				  	console.log("Got an error response: " + textStatus + errorThrown);
				}
			  });
		},
		onAmountChange : function(event){
			const oModel = this.getView().getModel("budgetingDetailModel");
			var oModelData = oModel.getData().BUDGETREQLINESCollection;
			let sum = 0;
			for (let i = 0; i < oModelData.length; i++ ) {
				sum += oModelData[i]["U_Amount"];
			}
			console.log(sum);
			const oModelHeader = this.getView().getModel("budgetingDetailModel");
			oModelHeader.setProperty("/U_TotalAmount", sum);

		}
	});
});