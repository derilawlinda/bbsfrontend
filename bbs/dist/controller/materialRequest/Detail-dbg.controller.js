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
				path: "/MR/" + window.decodeURIComponent(oEvent.getParameter("arguments").materialRequestID),
				model: "materialRequest"
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