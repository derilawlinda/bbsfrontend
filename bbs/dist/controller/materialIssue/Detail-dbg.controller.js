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
		_onObjectMatched: function (oEvent) {
			this.getView().bindElement({
				path: "/MI/" + window.decodeURIComponent(oEvent.getParameter("arguments").ID),
				model: "materialIssue"
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