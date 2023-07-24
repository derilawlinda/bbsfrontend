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

	return Controller.extend("frontend.bbs.controller.materialRequest.Detail", {

		onInit: async function () {
			var oOwnerComponent = this.getOwnerComponent();
			this.oRouter = oOwnerComponent.getRouter();
			this.oRouter.getRoute("materialRequestDetail").attachPatternMatched(this._onObjectMatched, this);
			var oCompaniesModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/companies.json"));
			this.getView().setModel(oCompaniesModel,"companies");
			

		},
		_onObjectMatched: function (oEvent) {
			
			var viewModel = new JSONModel();
			this.getView().setModel(viewModel,"viewModel");
			this.getView().byId("materialRequestPageID").setBusy(true);
			var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			this.oJWT = oStore.get("jwt");

			
			this.materialRequestCode = oEvent.getParameter("arguments").materialRequestID;
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
				this.getView().byId("materialRequestPageID").setBusy(false);
			}
			var materialRequestCode = this.materialRequestCode;
			var viewModel = this.getView().getModel("viewModel");
			if(parametersMap.roleId == 3 ){
				viewModel.setProperty("/editable", true);
			}else{
				viewModel.setProperty("/editable", false);
			}

			if(parametersMap.roleId == 4 || parametersMap.roleId == 5 ){
				viewModel.setProperty("/is_approver", true);
				viewModel.setProperty("/is_requestor", false);
			}else if(parametersMap.roleId == 3){
				viewModel.setProperty("/is_approver", false);
				viewModel.setProperty("/is_requestor", true);
			}

			if(this.materialRequestCode === undefined){
				var url = window.location.href;
				var urlArray = url.split("/");
				this.materialRequestCode = urlArray[urlArray.length - 1];
			}
			const materialRequestDetailModel = new JSONModel();
			this.getView().setModel(materialRequestDetailModel,"materialRequestDetailModel");
			materialRequestDetailModel.loadData(backendUrl+"materialRequest/getMaterialRequestById?code="+this.materialRequestCode, null, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			
			materialRequestDetailModel.dataLoaded().then(function(){
				
				var materialRequestDetailData = this.getView().getModel("materialRequestDetailModel").getData();
				if(parametersMap.roleId == 5 && materialRequestDetailData.U_Status == 2){
					viewModel.setProperty("/showFooter", false);
				}
				if(parametersMap.roleId == 4 && materialRequestDetailData.U_Status == 3){
					viewModel.setProperty("/showFooter", false);
				}
				const budget = new JSONModel();
				this.getView().setModel(budget,"budget");
				budget.loadData(backendUrl+"budget/getBudgetById?code="+materialRequestDetailData.U_BudgetCode, null, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				var oBudgetingModel = new JSONModel();
				oBudgetingModel.loadData(backendUrl+"getBudget", null, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				this.getOwnerComponent().setModel(oBudgetingModel,"budgeting");
				oBudgetingModel.dataLoaded().then(function() {
					this.getView().byId("materialRequestPageID").setBusy(false);

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
		onApproveButtonClick : function (){
			var pageDOM = this.getView().byId("materialRequestPageID");
			var viewModel = this.getView().getModel("viewModel");
			pageDOM.setBusy(true);
			var code = this.getView().byId("_IDGenText101").getText();
			const oModel = this.getView().getModel("materialRequestDetailModel");
			var oProperty = oModel.getProperty("/");
			var view = this.getView();
			var oDialog = this.oDialog;
			var oJWT = this.oJWT;
			$.ajax({
				type: "POST",
				data: JSON.stringify(oProperty),
				headers: {"Authorization": "Bearer "+ oJWT},
				crossDomain: true,
				url: backendUrl+'materialRequest/approveMR',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					  pageDOM.setBusy(false);
					  
					  if (!this.oSuccessMessageDialog) {
						this.oSuccessMessageDialog = new Dialog({
							type: DialogType.Message,
							title: "Success",
							state: ValueState.Success,
							content: new Text({ text: "Material Request approved" }),
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
		}
	});
});