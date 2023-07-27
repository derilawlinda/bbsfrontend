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

	return Controller.extend("frontend.bbs.controller.materialIssue.Detail", {

		onInit: async function () {
			var oOwnerComponent = this.getOwnerComponent();
			this.oRouter = oOwnerComponent.getRouter();
			this.oRouter.getRoute("materialIssueDetail").attachPatternMatched(this._onObjectMatched, this);
			var oItemsModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/items.json"));
			this.getView().setModel(oItemsModel,"items");

        },
		_onObjectMatched: async function (oEvent) {
			
			var viewModel = new JSONModel();
			this.getView().setModel(viewModel,"viewModel");
			this.getView().byId("materialIssuePageId").setBusy(true);
			var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			this.oJWT = oStore.get("jwt");

			var oUserModel = new JSONModel();
			await oUserModel.loadData(backendUrl+"checkToken", null, true, "POST",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			oUserModel.dataLoaded().then(function() {
				var userData = oUserModel.getData();
				if(userData.user.role_id == 3 ){
					viewModel.setProperty("/editable", true);
				}else{
					viewModel.setProperty("/editable", false);
				}
			});
			

			
			this.getView().bindElement({
				path: "/value/" + window.decodeURIComponent(oEvent.getParameter("arguments").ID),
				model: "materialIssue"
			});
			var materialIssueCode = oEvent.getParameter("arguments").ID;
			if(materialIssueCode === undefined){
				var url = window.location.href;
				var urlArray = url.split("/");
				materialIssueCode = urlArray[urlArray.length - 1];
			}
			const materialIssueDetailModel = new JSONModel();
			materialIssueDetailModel.loadData(backendUrl+"materialIssue/getMaterialIssueById?code="+materialIssueCode, null, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			
			this.getView().setModel(materialIssueDetailModel,"materialIssueDetailModel");

			var oBudgetingModel = new JSONModel();
				oBudgetingModel.loadData(backendUrl+"getBudget", null, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
			});
			this.getOwnerComponent().setModel(oBudgetingModel,"budgeting");
			materialIssueDetailModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
				var userData = oUserModel.getData();
				var materialIssueDetailData = this.getView().getModel("materialIssueDetailModel").getData();
				if(userData.user.role_id == 4){
					viewModel.setProperty("/editable", false);
					viewModel.setProperty("/is_approver", true);
					viewModel.setProperty("/is_requestor", false);
					if(materialIssueDetailData.U_Status == 3){
						viewModel.setProperty("/showFooter", false);
					}
				}
				else if(userData.user.role_id == 5){
					viewModel.setProperty("/editable", false);
					viewModel.setProperty("/is_approver", true);
					viewModel.setProperty("/is_requestor", false);
					if(materialIssueDetailData.U_Status == 2){
						viewModel.setProperty("/showFooter", false);
					}
				}
				else if(userData.user.role_id == 3){
					viewModel.setProperty("/is_approver", false);
					viewModel.setProperty("/is_requestor", true);
					if(materialIssueDetailData.U_Status != 1){
						viewModel.setProperty("/showFooter", false);
						viewModel.setProperty("/editable", false);
					}
				};

				const oBudgetModel = new JSONModel();
				oBudgetModel.loadData(backendUrl+"budget/getBudgetById?code="+materialIssueDetailData.U_BudgetCode, null, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				this.getOwnerComponent().setModel(oBudgetModel,"budget");
				oBudgetModel.dataLoaded().then(function() {
					this.getView().byId("materialIssuePageId").setBusy(false);

				}.bind(this));
				
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
			var pageDOM = this.getView().byId("materialIssuePageId");
			var viewModel = this.getView().getModel("viewModel");
			pageDOM.setBusy(true);
			var code = this.getView().byId("_IDGenText101").getText();
			const oModel = this.getView().getModel("materialIssueDetailModel");
			var oProperty = oModel.getProperty("/");
			var view = this.getView();
			var oDialog = this.oDialog;
			var oJWT = this.oJWT;
			$.ajax({
				type: "POST",
				data: JSON.stringify(oProperty),
				headers: {"Authorization": "Bearer "+ oJWT},
				crossDomain: true,
				url: backendUrl+'materialIssue/approveMI',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					  pageDOM.setBusy(false);
					  
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Material Issue approved" }),
							beginButton: new Button({
								type: ButtonType.Emphasized,
								text: "OK",
								press: function () {
									this.oSuccessMessageDialog.close();
								}.bind(this)
							})
						});
						viewModel.setProperty("/showFooter", false);
					}
		
					this.oSuccessMessageDialog.open();
				},
				error: function (jqXHR, textStatus, errorThrown) {
				  	console.log("Got an error response: " + textStatus + errorThrown);
				}
			  });
		},
	});
});