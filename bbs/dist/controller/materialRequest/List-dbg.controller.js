sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/m/library",
	"sap/m/MessageToast",
	"frontend/bbs/model/PagingJSONModel",
	"sap/ui/core/library",
	'sap/ui/core/Fragment',
	'sap/ui/Device',
	"sap/ui/model/odata/v4/ODataModel",
	'frontend/bbs/libs/lodash',
 ], function (Controller,History, mobileLibrary, MessageToast, JSONModel,coreLibrary,Fragment,Device,ODataModel) {
    "use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	var ValueState = coreLibrary.ValueState;
    return Controller.extend("frontend.bbs.controller.materialRequest.List", {
       onInit: async function () {
		this.getView().byId("materialRequestTableID").setBusy(true);
		this._mViewSettingsDialogs = {};
		var currentRoute = this.getRouter().getHashChanger().getHash();
		var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		this.oJWT = oStore.get("jwt");
		this.company = oStore.get("company");
		var oModel = new JSONModel();

		var oPillarConfigurationModel = new sap.ui.model.json.JSONModel(); 
			oPillarConfigurationModel.loadData(backendUrl+"main/getPillar", {
				company : this.company
			}, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			var oCompanyModel = new sap.ui.model.json.JSONModel();

		oPillarConfigurationModel.dataLoaded().then(function(){
			var pillarJson = oPillarConfigurationModel.getData();
			oCompanyModel.setData(pillarJson);
			
		});

		this.getView().setModel(oCompanyModel, "companies");


		oModel.loadData(backendUrl+"materialRequest/getMaterialRequests", {
			company : this.company
		}, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		this.getView().setModel(oModel,"materialRequest");
		oModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
			this.getView().byId("materialRequestTableID").setBusy(false);
			console.log(oModel.oData["@odata.count"]);
		}.bind(this));

		var oSalesOrderModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/sales_order.json"));
		this.getView().setModel(oSalesOrderModel,"salesOrder");
	
		var oItemsModel = new JSONModel();
		this.getView().setModel(oItemsModel,"items");
		var viewModel = new sap.ui.model.json.JSONModel({
			showCreateButton : true,
			is_approver : false
		});
		this.getView().setModel(viewModel,"viewModel");
		var budgetRequestHeader = new sap.ui.model.json.JSONModel({
			U_RemainingBudget : 0
		});
		this.getView().setModel(budgetRequestHeader,"budgetHeader");
		var _oBudgetingModel = new JSONModel();
		_oBudgetingModel.setSizeLimit(1000);
		_oBudgetingModel.loadData(backendUrl+"budget/getApprovedBudget", {
			company : this.company,
		}, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		this.getView().setModel(_oBudgetingModel,"MRbudgets");

		//NEW MR ITEM MODEL
		var oNewMaterialRequestItems = new sap.ui.model.json.JSONModel();
		this.getView().setModel(oNewMaterialRequestItems,"new_mr_items");
		this.getView().getModel("new_mr_items").setProperty("/MATERIALREQLINESCollection", []);

		var userModel = this.getOwnerComponent().getModel("userModel");
		if(userModel === undefined){
			const bus = this.getOwnerComponent().getEventBus();
			bus.subscribe("username", "checktoken", this.toggleCreateButton, this);
		}else{
			var userData = userModel.getData();
			var a = { "userName" : userData.user.name,
			  "roleId" : userData.user.role_id,
			  "roleName" : userData.role[0].name,
			  "status" : "success"
			};
			this.toggleCreateButton("username","checkToken",a);
		}
		
		

       },
	   onGrowingStarted: function () {
			//API calls to fetch more data
		},

	   toggleCreateButton : function(channelId, eventId, parametersMap){
			if(parametersMap.roleId == 4 || parametersMap.roleId == 5){
				this.getView().getModel("viewModel").setProperty("/showCreateButton",false)
				this.getView().getModel("viewModel").setProperty("/is_approver",true)
			}
	   },
	   onCreateButtonClick : function(oEvent) {
		if (!this.createMaterialRequestDialog) {
			this.createMaterialRequestDialog = this.loadFragment({
				name: "frontend.bbs.view.materialRequest.CreateForm"
			});
		}
		this.createMaterialRequestDialog.then(function (oDialog) {
			let oBudgetHeader = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oBudgetHeader,"budgetHeader");
			let newMRItems = new sap.ui.model.json.JSONModel();
			this.getView().setModel(newMRItems,"new_mr_items");
			let oMaterialRequestHeader = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oMaterialRequestHeader,"materialRequestHeader");
			var oCreateFragmentViewModel = new sap.ui.model.json.JSONModel({
				Date : new Date()
			});
			this.getView().setModel(oCreateFragmentViewModel,"createFragmentViewModel");
			this.oDialog = oDialog;
			this.oDialog.open();
			var oMaterialRequestDetailModel = new sap.ui.model.json.JSONModel();
			var dynamicProperties = [];
			oMaterialRequestDetailModel.setData(dynamicProperties);
			this.getView().setModel(oMaterialRequestDetailModel,"materialRequestgDetailModel");
			this.getView().getModel("new_mr_items").setProperty("/MATERIALREQLINESCollection", []);

		}.bind(this));
	   },

	   onAccountCodeChange : async function(oEvent){
		var oSelectedItem = oEvent.getSource().getSelectedKey(); //Get Selected Item
		var oSelectedRow = oEvent.getSource().getParent(); //Selected Row.
		oSelectedRow.getCells()[1].setBusy(true);
		oSelectedRow.getCells()[1].setSelectedKey("");
		oSelectedRow.getCells()[1].setEnabled(true);
		oSelectedRow.getCells()[1].setEnabled(true);

		

		var oItemModel = this.getView().getModel("items");
		oItemModel.setSizeLimit(10000);
		var oItemData = oItemModel.getData();
		if(!(oSelectedItem in oItemData)){
			var oItemByAccountModel = new JSONModel();
			oItemByAccountModel.setSizeLimit(10000);
			await oItemByAccountModel.loadData(backendUrl+"items/getItemsByAccount", {
				accountCode : oSelectedItem,
				company : this.company
 			}, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			var oItemByAccountData = oItemByAccountModel.getData();
			oItemData[oSelectedItem] = oItemByAccountData;
			var i = new sap.ui.model.json.JSONModel(oItemData);
			i.setSizeLimit(10000);
			this.getView().setModel(i, 'items');
			i.refresh();
		}

		oSelectedRow.getCells()[1].bindAggregation("items", {
			path: 'items>/'+ oSelectedItem,
			template: new sap.ui.core.Item({
				key: "{items>ItemCode}",
				text: "{items>ItemCode} - {items>ItemName}"
			})
		});
		oSelectedRow.getCells()[1].setBusy(false);

		
	},
	    getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
       onNavBack: function (oEvent) {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("login", {}, true /*no history*/);
			}
		},
		getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		_closeDialog: function () {
			this.oDialog.close();
		},
		onPress: function (oEvent) {
			var oRouter = this.getOwnerComponent().getRouter();
			var oRow = oEvent.getSource();
			var id = oRow.getCells()[0].getText();
			oRouter.navTo("materialRequestDetail",{
				materialRequestID : id
			});
			
		},
		objectFormatter: function(sStatus) {
			if(sStatus == 1 ){
				return 'Warning';
			}else if(sStatus == 2){
				return 'Information';
			}
			else if(sStatus == 3){
				return 'Success';
			}else{
				return 'Error';
			}
		  },
		  textFormatter : function(sStatus){
			if(sStatus == 1){
				return 'Pending'
			}else if(sStatus == 2){
				return 'Approved by Manager'
			}else if(sStatus == 3){
				return 'Approved by Director'
			}else{
				return 'Rejected'
			}
		  
		},
		  onBudgetChange : async function(oEvent){
			var oValidatedComboBox = oEvent.getSource(),
				sSelectedKey = oValidatedComboBox.getSelectedKey(),
				sValue = oValidatedComboBox.getValue();

			if (!sSelectedKey && sValue) {
				oValidatedComboBox.setValueState(ValueState.Error);
				oValidatedComboBox.setValueStateText("Please enter a valid Budget Code");
			} else {
				oValidatedComboBox.setValueState(ValueState.None);
			}
			if(oValidatedComboBox.getValueState() == ValueState.None){
				this.getView().byId("createMRForm").setBusy(true);
				this.getView().byId("MRItemsTableID").setBusy(true);
				this.getView().getModel("new_mr_items").setProperty("/MATERIALREQLINESCollection", []);
				var selectedID = parseInt(oEvent.getParameters('selectedItem').value);
				var budgetingModel = new JSONModel();
				await budgetingModel.loadData(backendUrl+"budget/getBudgetById?", {
					code : selectedID,
					company : this.company
				}, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				var accountModel = new JSONModel();
				await accountModel.loadData(backendUrl+"coa/getCOAsByBudget", {
					budgetCode : selectedID,
					company : this.company
				}, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				this.getView().setModel(accountModel,"accounts");
				var budgetingData = budgetingModel.getData();
				var approvedBudget = budgetingData.U_TotalAmount;
				var usedBudget = budgetingData.BUDGETUSEDCollection;
				let sumUsedBudget = 0;
				for (let i = 0; i < usedBudget.length; i++ ) {
					sumUsedBudget += usedBudget[i]["U_Amount"];
				};
				budgetingData.U_RemainingBudget = approvedBudget - sumUsedBudget;
				var budgetRequestHeader = this.getView().getModel("budgetHeader");
				budgetRequestHeader.setData(budgetingData);
				this.getView().byId("createMRForm").setBusy(false);
				this.getView().byId("MRItemsTableID").setBusy(false);
			}
		  },
		  onSaveButtonClick : function(oEvent) {
			var materialRequest = new Array();
			var oDialog = this.oDialog;
			oDialog.setBusy(true);
			const oModel = this.getView().getModel("materialRequestHeader");
			var company = this.getView().byId("companyText").getText();
			const oModelAccounts = this.getView().getModel("new_mr_items");
			var materialRequestModel = this.getView().getModel("materialRequest");
			oModel.setProperty("/MATERIALREQLINESCollection", oModelAccounts.getData().MATERIALREQLINESCollection);
			var oProperty = oModel.getProperty("/");
			var view = this.getView();
			var oJWT = this.oJWT;
		
			$.ajax({
				type: "POST",
				data: JSON.stringify({
					company : company,
					oProperty : oProperty
				}),
				crossDomain: true,
				headers: { 'Authorization': 'Bearer ' + oJWT },
				url: backendUrl+'materialRequest/createMaterialRequest',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					oDialog.setBusy(false);
					oDialog.close();
					materialRequestModel.loadData(backendUrl+"materialRequest/getMaterialRequests", {
						company : company
					}, true, "GET",false,false,{
						'Authorization': 'Bearer ' + oJWT
					});
					MessageToast.show("Material Request created");
					$(".sapMMessageToast").css({"background-color": "#256f3a", "color": "white"});

					view.getModel('materialRequest').refresh();
					
				},
				error: function (jqXHR, textStatus, errorThrown) {
				  	console.log("Got an error response: " + textStatus + errorThrown);
				}
			  });
			// console.log(JSON.stringify(oProperty));
	   },
		  onAddPress : function(oEvent){
			const oModel = this.getView().getModel("new_mr_items");
			var oModelData = oModel.getData();
			var oNewObject = {
				"U_AccountCode": "",
				"U_ItemCode": "",
				"U_Qty": "",
				"U_Description" : ""
			};
			oModelData.MATERIALREQLINESCollection.push(oNewObject);
			var f = new sap.ui.model.json.JSONModel(oModelData);
			this.getView().setModel(f, 'new_mr_items');
			f.refresh();
		
		},
		onDelete: function(oEvent){
			var row = oEvent.getParameters().row;
			var iIdx = row.getIndex();
			var oModel = this.getView().getModel("new_mr_items");
			var oModelLineData = oModel.getData().MATERIALREQLINESCollection;
			oModelLineData.splice(iIdx, 1);
			oModel.setProperty("/MATERIALREQLINESCollection",oModelLineData);
			oModel.refresh();
		},
		textFormatter : function(sStatus){
			if(sStatus == 1){
				return 'Pending'
			}else if(sStatus == 2){
				return 'Approved by Manager'
			}else if(sStatus == 3){
				return 'Approved by Director'
			}else{
				return 'Rejected'
			}
		  
		},
		dateFormatter : function(date){
			var unformattedDate = new Date(date);
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "YYYY-MM-dd" });   
			var dateFormatted = dateFormat.format(unformattedDate);
			return dateFormatted;
		},
		handleFilterButtonPressed: function () {
			this.getViewSettingsDialog("frontend.bbs.view.materialRequest.FilterForm")
				.then(function (oViewSettingsDialog) {
					oViewSettingsDialog.open();
				});
		},
		getViewSettingsDialog: function (sDialogFragmentName) {
			var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];

			if (!pDialog) {
				pDialog = Fragment.load({
					id: this.getView().getId(),
					name: sDialogFragmentName,
					controller: this
				}).then(function (oDialog) {
					if (Device.system.desktop) {
						oDialog.addStyleClass("sapUiSizeCompact");
					}
					return oDialog;
				});
				this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
			}
			return pDialog;
		},

		onSearch : function(oEvent){
			var mParamas = oEvent.getParameters();
			if(mParamas.filterKeys){
				var statusFilter = Object.keys(mParamas.filterKeys).toString();
			}else{
				var statusFilter = "";
			}
			this.getView().byId("materialRequestTableID").setBusy(true);
			var search = this.getView().byId("searchField").getValue();
			var oJWT = this.oJWT;
			var oModel = new JSONModel();
			oModel.loadData(backendUrl+"materialRequest/getMaterialRequests", {
				"search" : search,
				"status" : statusFilter,
				"company" : this.company
			}, true, "GET",false,false,{
				'Authorization': 'Bearer ' + oJWT
			});
			oModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
				this.getView().byId("materialRequestTableID").setBusy(false);
			}.bind(this));
			this.getView().setModel(oModel,"materialRequest");

		}
    });
 });