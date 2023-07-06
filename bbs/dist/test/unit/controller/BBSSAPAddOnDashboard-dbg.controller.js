/*global QUnit*/

sap.ui.define([
	"frontend/bbs/controller/BBSSAPAddOnDashboard.controller"
], function (Controller) {
	"use strict";

	QUnit.module("BBSSAPAddOnDashboard Controller");

	QUnit.test("I should test the BBSSAPAddOnDashboard controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
