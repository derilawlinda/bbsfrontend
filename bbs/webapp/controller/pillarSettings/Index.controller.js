/* global _:true */
sap.ui.define([
	'sap/ui/core/mvc/Controller', 
    'sap/ui/model/json/JSONModel', 
    'sap/m/MessageToast',
	'sap/m/MessageBox',
	'sap/ui/model/FilterOperator',
	'frontend/bbs/libs/lodash'
], function(Controller, JSONModel, MessageToast, MessageBox,FilterOperator,Dforest) {
	"use strict";
	var PageController = Controller.extend("frontend.bbs.controller.pillarSettings.Index", {
		_viewConfigData : {
			"addButtonVisibility" : false,
			"removeButtonVisibility" : false,
		},

		onInit: function(evt) {
			// set explored app's demo model on this sample
			this.oSemanticPage = this.byId("_IDSemanticPage1");
			this.oEditAction = this.byId("editAction");
			var oModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/pillars.json"));
			var oViewConfigModel = new JSONModel(this._viewConfigData);
			this.getView().setModel(oViewConfigModel,"viewConfig");
			oModel.attachRequestCompleted(null,function() { 
				var treeData = oModel.getData();
				var flatTree = this.flattenMyTree(treeData);
				var pillarData = _.filter(flatTree, { subheader: 'Pillar' });
				var pillarModel = new sap.ui.model.json.JSONModel(pillarData);
				this.getView().setModel(pillarModel,'pillarModel');
				this.getView().setModel(oModel); 
			}, this);
			// var oItems = this.getView().byId('Tree').getBinding('items');
			// var pillarFilter = new sap.ui.model.Filter({
			// 	path: "subheader",
			// 	operator: FilterOperator.EQ,
			// 	value1: "Pillar",
			// });
			// oItems.filter(pillarFilter,sap.ui.model.FilterType.Application);
		},

		flattenMyTree : function (tree) {
			function recurse(nodes) {
				return _.flatMap(nodes, function(node) {
					return _.concat([
						_.assign({
								subheader : node.subheader,
								text: node.text
							},
							_.omit(node, 'nodes'))
						],
						recurse(node.nodes)
					);
				});
			}
			return recurse(tree);
		},

		onEdit : function() {
			this.showFooter(true);
			var oModel = this.getView().getModel("viewConfig");
			oModel.setProperty("/addButtonVisibility", true);
			oModel.setProperty("/removeButtonVisibility", true);
			this.oEditAction.setVisible(false);
		},
		showFooter: function(bShow) {
			this.oSemanticPage.setShowFooter(bShow);
		},
		onSave: function() {
			this.showFooter(false);
			this.oEditAction.setVisible(true);
			var oModel = this.getView().getModel("viewConfig");
			oModel.setProperty("/addButtonVisibility", false);
			oModel.setProperty("/removeButtonVisibility", false);
			MessageBox.alert("Successfully saved!");
		},
		onCancel: function() {
			this.showFooter(false);
			this.oEditAction.setVisible(true);
			var oModel = this.getView().getModel("viewConfig");
			oModel.setProperty("/addButtonVisibility", false);
			oModel.setProperty("/removeButtonVisibility", false);
		},

		addTile: function (oEvt) {
			var _oItem = oEvt.getSource().getParent().getParent().getParent();
			var _sBindingPath = _oItem.getBindingContextPath();
			var _oModel = this.getView().getModel();
			var aData = _oModel.getProperty(_sBindingPath);
			var oModel = this.getView().getModel("viewConfig");
			oModel.setProperty("/windowText", aData.subheader);
			if (!this.createTileDialog) {
				this.createTileDialog = this.loadFragment({
					name: "frontend.bbs.view.pillarSettings.addNode"
				});
			}
			this.createTileDialog.then(function (oDialog) {
				this.oDialog = oDialog;
				this.oDialog.open();
				// var oBudgetingDetailModel = new sap.ui.model.json.JSONModel();
				// var dynamicProperties = [];
				// oBudgetingDetailModel.setData(dynamicProperties);
				// this.getView().setModel(oBudgetingDetailModel,"budgetingDetailModel");
	
			}.bind(this));

		// 	var _oItem = oEvt.getSource().getParent().getParent().getParent();
		// 	var _sBindingPath = _oItem.getBindingContextPath();
		// 	var _oModel = this.getView().getModel();
		// 	var aData = _oModel.getProperty(_sBindingPath);
    	// 	var _oChildNodes = [];
		// 	if (aData.nodes !== undefined) {
		// 		_oChildNodes = aData.nodes; 
		// 	} else {
		// 		aData.nodes = _oChildNodes;
		// 	}

		// 	var oDialog1 = new sap.ui.commons.Dialog(); 
		// 	oDialog1.setTitle("Enter Details"); 
		// 	oDialog1.setShowCloseButton(); 
		// 	oDialog1.open();
		//    // you can hard code new child data or open a popup to get input from user
		// 	var newData = {
		// 		"text": "New",
		// 		"subheader": "New 1",
		// 		"is_editable": true
		// 	};
		// 	_oChildNodes.push(newData);
		// 	_oModel.setProperty(_sBindingPath, aData);
			
			
			
		   },
		_closeDialog: function () {
			this.oDialog.close();
		},
		removeTile: function(oEvt) {
			var _oItem = oEvt.getSource().getParent().getParent().getParent();
			var _sBindingPath = _oItem.getBindingContextPath();
			var _oModel = this.getView().getModel();
			var _aDataToDelte = _oModel.getProperty(_sBindingPath);
			var oModelData = _oModel.getData();
			this._deleteRecord(oModelData, _aDataToDelte);
			_oModel.setData(oModelData);
		},
		_deleteRecord: function(items, record) {
			if (items !== undefined) {
				for (var i = 0; i < items.length; i++) {
					if (items[i] === record) {
						items.splice(i, 1);
						break;
					} else {
						this._deleteRecord(items[i].nodes, record);
					}
				}
			}
		},

		handleButtonPress: function(evt) {
			MessageToast.show("Button pressed");
		}

	});

	return PageController;

});