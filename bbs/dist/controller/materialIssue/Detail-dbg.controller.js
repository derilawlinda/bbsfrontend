sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
], function (Controller, History, JSONModel) {
	"use strict";

	return Controller.extend("frontend.bbs.controller.materialIssue.Detail", {

		onInit: async function () {
			var oOwnerComponent = this.getOwnerComponent();
			this.oRouter = oOwnerComponent.getRouter();
			this.oRouter.getRoute("materialIssueDetail").attachPatternMatched(this._onObjectMatched, this);

        },
		_onObjectMatched: async function (oEvent) {
			
			var viewModel = new JSONModel();
			this.getView().setModel(viewModel,"viewModel");
			this.getView().byId("materialIssuePage").setBusy(true);
			var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			this.oJWT = oStore.get("jwt");

			var oUserModel = new JSONModel();
			oUserModel.loadData(backendUrl+"checkToken", null, true, "POST",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			oUserModel.dataLoaded().then(function() {
				var userData = oUserModel.getData();
				if(userData.user.role_id == 3 ){
					viewModel.setProperty("/editable", true);
				}else{
					viewModel.setProperty("/editable", false);
				}
				console.log(viewModel);
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
				var materialIssueDetailData = this.getView().getModel("materialIssueDetailModel").getData();
				
				const oBudgetModel = new JSONModel();
				oBudgetModel.loadData(backendUrl+"budget/getBudgetById?code="+materialIssueDetailData.U_BudgetCode, null, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				this.getOwnerComponent().setModel(oBudgetModel,"budget");
				oBudgetModel.dataLoaded().then(function() {
					this.getView().byId("materialIssuePage").setBusy(false);

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
		}
	});
});