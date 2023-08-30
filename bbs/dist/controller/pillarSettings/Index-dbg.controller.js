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
			this.getView().byId("Tree").setBusy(true);
			this.oSemanticPage = this.byId("_IDSemanticPage1");
			this.oEditAction = this.byId("editAction");
			var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			var company = oStore.get("company");
			this.company = company;

			this.oJWT = oStore.get("jwt");
			var oModel = new JSONModel();
			oModel.setSizeLimit(1000);
			oModel.loadData(backendUrl+"main/getPillar", {
				company : company
			}, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			oModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
				this.getView().byId("Tree").setBusy(false);
			}.bind(this));
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

			this.oPillarModel = new JSONModel();
			this.oPillarModel.setSizeLimit(200);
			this.oPillarModel.loadData(backendUrl+"profitCenter/getPillars", {
				company : company
			}, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});

			this.oClassificationModel = new JSONModel();
			this.oClassificationModel.setSizeLimit(200);
			this.oClassificationModel.loadData(backendUrl+"profitCenter/getClassifications", {
				company : company
			}, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});

			this.oSubClassModel = new JSONModel();
			this.oSubClassModel.setSizeLimit(200);
			this.oSubClassModel.loadData(backendUrl+"profitCenter/getSubClass", {
				company : company
			}, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});

			this.oSubClass2Model = new JSONModel();
			this.oSubClass2Model.setSizeLimit(9999);
			this.oSubClass2Model.loadData(backendUrl+"profitCenter/getSubClass2", {
				company : company
			}, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});




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
			var tree = this.getView().byId("Tree");
			tree.setBusy(true);
			this.showFooter(false);
			this.oEditAction.setVisible(true);
			var oViewModel = this.getView().getModel("viewConfig");
			oViewModel.setProperty("/addButtonVisibility", false);
			oViewModel.setProperty("/removeButtonVisibility", false);
			var oModel = this.getView().getModel();

			$.ajax({
				type: "POST",
				data: JSON.stringify({
					company : this.company,
					data : oModel.getData()
				}),
				crossDomain: true,
				headers: { 'Authorization': 'Bearer ' + this.oJWT },
				url: backendUrl+'main/saveJSONPillar',
				contentType: "application/json",
				success: function (res, status, xhr) {
					//success code
					tree.setBusy(false);
					MessageToast.show("Pillar data saved");
					$(".sapMMessageToast").css({"background-color": "#256f3a", "color": "white"});
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log("Got an error response: " + textStatus + errorThrown);
				}
			});
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
			oModel.setProperty("/bindingPath",_sBindingPath);
			oModel.setProperty("/aData",aData);
			var windowText;
			
			if(aData.subheader == 'Company'){
				windowText = 'Pillar';
				this.getView().setModel(this.oPillarModel,"nodes");
			}else if(aData.subheader == 'Pillar'){
				windowText = 'Classification';
				this.getView().setModel(this.oClassificationModel,"nodes");
			}else if(aData.subheader == 'Classification'){
				windowText = 'Subclass';
				this.getView().setModel(this.oSubClassModel,"nodes");
			}else if(aData.subheader == 'Subclass'){
				windowText = 'Subclass2'
				this.getView().setModel(this.oSubClass2Model,"nodes");

			}
			this.windowText = windowText;

			oModel.setProperty("/windowText", windowText);
			if (!this.createTileDialog) {
				this.createTileDialog = this.loadFragment({
					name: "frontend.bbs.view.pillarSettings.addNode"
				});
			}
			this.createTileDialog.then(function (oDialog) {
				this.oDialog = oDialog;
				this.oDialog.open();
			}.bind(this));

    		
			
		   },
		onAddNode : function(oEvent){
			var _oModel = this.getView().getModel();
			var oModel = this.getView().getModel("viewConfig");
			var oModelData = oModel.getData();
			var aData = oModelData.aData;
			var _sBindingPath = oModelData.bindingPath;
			var _oChildNodes = [];
			if (aData.nodes !== undefined) {
				_oChildNodes = aData.nodes; 
			} else {
				aData.nodes = _oChildNodes;
			}
			var is_editable = true;

			var newData = {
				"text": this.getView().byId("nodeCombo").getValue(),
				"subheader": this.windowText,
				"is_editable": true,
				"code": this.getView().byId("nodeCombo").getSelectedKey()
			};
			console.log(newData);
			_oChildNodes.push(newData);
			_oModel.setProperty(_sBindingPath, aData);
			this.oDialog.close();

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