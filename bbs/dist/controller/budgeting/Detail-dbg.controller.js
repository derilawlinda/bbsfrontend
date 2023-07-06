sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
], function (Controller, History, JSONModel) {
	"use strict";

	return Controller.extend("frontend.bbs.controller.budgeting.Detail", {

		onInit: function () {
			var oOwnerComponent = this.getOwnerComponent();
			var oSalesOrderModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/sales_order.json"));
			this.getView().setModel(oSalesOrderModel,"salesOrder");
			this.oRouter = oOwnerComponent.getRouter();
			this.oModel = oOwnerComponent.getModel();
			this.oRouter.getRoute("budgetingDetail").attachPatternMatched(this._onObjectMatched, this);
			var oCompaniesModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/companies.json"));
			this.getView().setModel(oCompaniesModel,"companies");
		},
		_onObjectMatched: function (oEvent) {
			this.getView().bindElement({
				path: "/data/" + window.decodeURIComponent(oEvent.getParameter("arguments").budgetID),
				model: "budgeting"
			});
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