sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
], function (Controller, History, JSONModel) {
	"use strict";

	return Controller.extend("frontend.bbs.controller.materialRequest.Detail", {

		onInit: async function () {
			var oOwnerComponent = this.getOwnerComponent();
			this.oRouter = oOwnerComponent.getRouter();
			this.oRouter.getRoute("materialRequestDetail").attachPatternMatched(this._onObjectMatched, this);
			var oCompaniesModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/companies.json"));
			this.getView().setModel(oCompaniesModel,"companies");
			

		},
		_onObjectMatched: function (oEvent) {
			this.getView().bindElement({
				path: "/value/" + window.decodeURIComponent(oEvent.getParameter("arguments").materialRequestID),
				model: "materialRequest"
			});
			const materialRequestModel = this.getView().getModel('materialRequest');
			var value = materialRequestModel.getProperty('/value/'+window.decodeURIComponent(oEvent.getParameter("arguments").materialRequestID));
			console.log(value);
			const materialRequestDetailModel = new JSONModel(value);
			this.getView().setModel(materialRequestDetailModel,"materialRequestDetailModel");
			const budget = new JSONModel();
			this.getView().setModel(budget,"budget");
			var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			this.oJWT = oStore.get("jwt");
			budget.loadData(backendUrl+"budget/getBudgetById?code="+value.U_BudgetCode, null, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			var oBudgetingModel = new JSONModel();
			oBudgetingModel.loadData(backendUrl+"getBudget", null, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			this.getOwnerComponent().setModel(oBudgetingModel,"budgeting");
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