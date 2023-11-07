sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/Text",
	"sap/ui/core/library",
	"sap/m/MessageToast",
	'sap/ui/core/Fragment',
	'sap/ui/Device',
	"sap/m/MessageBox"
 ], function (Controller, History, JSONModel,Dialog,Button,mobileLibrary,Text,coreLibrary,MessageToast,Fragment,Device,MessageBox) {
    "use strict";
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

    return Controller.extend("frontend.bbs.controller.reimbursement.List", {
       onInit: async function () {
		this.getView().byId("reimbursementTableID").setBusy(true);
		var currentRoute = this.getRouter().getHashChanger().getHash();
		var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		this.oJWT = oStore.get("jwt");
		this.company = oStore.get("company");
		var oModel = new JSONModel();
		this._mViewSettingsDialogs = {};
		oModel.setSizeLimit(500);
		oModel.loadData(backendUrl+"reimbursement/getReimbursements", {
			company : this.company
		}, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		
		this.getOwnerComponent().setModel(oModel,"reimbursements");
		oModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
			this.getView().byId("reimbursementTableID").setBusy(false);
		}.bind(this));

		var oCompaniesModel = new JSONModel(sap.ui.require.toUrl("frontend/bbs/model/companies.json"));
		this.getView().setModel(oCompaniesModel,"companies");
		var oItemModel = new JSONModel();
		this.getView().setModel(oItemModel,"items");
		this.getView().getModel("items").setProperty("/data", []);
		var viewModel = new sap.ui.model.json.JSONModel({
			showCreateButton : true,
			is_approver : false,
			NPWP: [
				{"Name" : 0},
				{"Name" : 2.5},
				{"Name" : 3}
			]
		});
		this.getView().setModel(viewModel,"viewModel");
		// var dynamicProperties = [];
		// oBudgetingDetailModel.setData(dynamicProperties);
		
		var budgetRequestHeader = new sap.ui.model.json.JSONModel({
			U_RemainingBudget : 0
		});
		this.getView().setModel(budgetRequestHeader,"budgetHeader");
		var oBudgetingModel = new JSONModel();
		oBudgetingModel.setSizeLimit(500);
		oBudgetingModel.loadData(backendUrl+"budget/getApprovedBudget", {
			company : this.company
		}, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		this.getView().setModel(oBudgetingModel,"budgeting");

		//NEW REIMBURSEMENT MODEL
		var oNewReimbursementItems = new sap.ui.model.json.JSONModel();
		this.getView().setModel(oNewReimbursementItems,"new_re_items");
		this.getView().getModel("new_re_items").setProperty("/REIMBURSEMENTLINESCollection", []);

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
	   toggleCreateButton : function(channelId, eventId, parametersMap){
			if(parametersMap.roleId == 4 || parametersMap.roleId == 5 || parametersMap.roleId == 2){
				this.getView().getModel("viewModel").setProperty("/showCreateButton",false)
				this.getView().getModel("viewModel").setProperty("/is_approver",true)
			}
	   },
	   onAmountChange : function(event){
			const oModel = this.getView().getModel("new_re_items");
			var oModelData = oModel.getData().REIMBURSEMENTLINESCollection;
			const viewModel = this.getView().getModel("createFragmentViewModel");
			const oModelHeader = this.getView().getModel("reimbursementHeader");
			var oBudgetingData = this.getView().getModel("budgetHeader").getData();
			let sum = 0;
			for (let i = 0; i < oModelData.length; i++ ) {
				sum += oModelData[i]["U_Amount"];
			}
			oModelHeader.setProperty("/U_TotalAmount", sum);
			var budgetAmount = oBudgetingData.U_RemainingBudget;
			if(sum > budgetAmount){
				viewModel.setProperty("/is_amountExceeded",true);
				viewModel.setProperty("/createButtonEnabled",false);
				viewModel.setProperty("/amountExceeded","Advance Amount exceeded Budget!");
			}else{
				viewModel.setProperty("/is_amountExceeded",false);
				viewModel.setProperty("/createButtonEnabled",true);
				viewModel.setProperty("/amountExceeded","");

			}

		},

	   search : function (arr, term) {
		
		if(term != endTerm){
			matches = [];
		};
		if (!Array.isArray(arr)) return matches;
		
		var that = this;
		arr.forEach(function(i) {
			
			if (i.subheader === term) {
			 const filterData =  (i.nodes && Array.isArray(i.nodes))? i.nodes.filter(subheader => subheader.value ===term):[];
				matches.push(i);
			} else {
				that.search(i.nodes, term);
			}
		endTerm = term;

		})
		return matches;
	},

	   onCreateButtonClick : function(oEvent) {
		if (!this.createBudgetingDialog) {
			this.createBudgetingDialog = this.loadFragment({
				name: "frontend.bbs.view.reimbursement.CreateForm"
			});
		}
		this.createBudgetingDialog.then(function (oDialog) {
			var oCreateFragmentViewModel = new sap.ui.model.json.JSONModel({
				Date : new Date()
			});
			this.getView().setModel(oCreateFragmentViewModel,"createFragmentViewModel");
			var budgetRequestHeader = this.getView().getModel("budgetHeader");
			budgetRequestHeader.setData([]);
			var oReimbursementHeader = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oReimbursementHeader,"reimbursementHeader");
			var oNewAdvanceEmployeeItems = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oNewAdvanceEmployeeItems,"new_re_items");
			this.getView().getModel("new_re_items").setProperty("/REIMBURSEMENTLINESCollection", []);
			this.oDialog = oDialog;
			this.oDialog.open();

		}.bind(this));
	   },
	//    onAccountCodeChange : async function(oEvent){
	// 	var oSelectedItem = oEvent.getSource().getSelectedKey(); //Get Selected Item
	// 	var oSelectedRow = oEvent.getSource().getParent(); //Selected Row.
	// 	oSelectedRow.getCells()[1].setBusy(true);
	// 	oSelectedRow.getCells()[1].setSelectedKey("");
	// 	oSelectedRow.getCells()[1].setEnabled(true);
	// 	oSelectedRow.getCells()[1].setEnabled(true);

	// 	var oItemModel = this.getView().getModel("items");
	// 	var oItemData = oItemModel.getData();
	// 	if(!(oSelectedItem in oItemData)){
	// 		var oItemByAccountModel = new JSONModel();
	// 		await oItemByAccountModel.loadData(backendUrl+"items/getItemsByAccount", {
	// 			company : this.company,
	// 			accountCode : oSelectedItem
	// 		}, true, "GET",false,false,{
	// 			'Authorization': 'Bearer ' + this.oJWT
	// 		});
	// 		var oItemByAccountData = oItemByAccountModel.getData();
	// 		oItemData[oSelectedItem] = oItemByAccountData;
	// 		var i = new sap.ui.model.json.JSONModel(oItemData);
	// 		this.getView().setModel(i, 'items');
	// 		i.refresh();
	// 	}

	// 	oSelectedRow.getCells()[1].bindAggregation("items", {
	// 		path: 'items>/'+ oSelectedItem,
	// 		template: new sap.ui.core.Item({
	// 			key: "{items>ItemCode}",
	// 			text: "{items>ItemCode} - {items>ItemName}"
	// 		})
	// 	});
	// 	oSelectedRow.getCells()[1].setBusy(false);

		
	// },
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
			this.getView().byId("createReimbursementForm").setBusy(true);
			this.getView().byId("ReimbursementItemsTableID").setBusy(true);
			this.getView().getModel("new_re_items").setProperty("/REIMBURSEMENTLINESCollection", []);
			var selectedID = parseInt(oEvent.getParameters('selectedItem').value);
		
			var accountModel = new JSONModel();
			await accountModel.loadData(backendUrl+"coa/getCOAsByBudget", {
				budgetCode : selectedID,
				company : this.company
			}, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});
			this.getView().setModel(accountModel,"accounts");
			
			var budgetingModel = new JSONModel();
			await budgetingModel.loadData(backendUrl+"budget/getBudgetById", {
				code : selectedID,
				company : this.company
			}, true, "GET",false,false,{
				'Authorization': 'Bearer ' + this.oJWT
			});

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
			this.getView().byId("createReimbursementForm").setBusy(false);
			this.getView().byId("ReimbursementItemsTableID").setBusy(false);
		}
	  },
	   onSaveButtonClick : function(oEvent) {
			var oDialog = this.oDialog;
			oDialog.setBusy(true);
			var reimbursementModel = this.getView().getModel("reimbursements");
			const oModel = this.getView().getModel("reimbursementHeader");
			const oModelItems = this.getView().getModel("new_re_items");
			oModel.setProperty("/REIMBURSEMENTLINESCollection", oModelItems.getData().REIMBURSEMENTLINESCollection);
			var oProperty = oModel.getProperty("/");
			var view = this.getView();
			var oJWT = this.oJWT;
			var company = this.company;

			$.ajax({
				type: "POST",
				data: JSON.stringify({
					oProperty : oProperty,
					company : this.company
				}),
				crossDomain: true,
				headers: { 'Authorization': 'Bearer ' + oJWT },
				url: backendUrl+'reimbursement/createReimbursement',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					oDialog.setBusy(false);
					oDialog.close();
					reimbursementModel.loadData(backendUrl+"reimbursement/getReimbursements", {
						company : company
					}, true, "GET",false,false,{
						'Authorization': 'Bearer ' + oJWT
					});
					MessageToast.show("Reimbursement Request created");
					$(".sapMMessageToast").css({"background-color": "#256f3a", "color": "white"});
					view.getModel('reimbursements').refresh();
				},
				error: function (jqXHR, textStatus, errorThrown) {
					oDialog.setBusy(false);
					MessageBox.error(jqXHR.responseJSON.msg);
				}
			  });
	   },
	    getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		_closeDialog: function () {
			this.oDialog.close();
		},
		buttonFormatter: function(sStatus) {
			if(sStatus == 2 || sStatus == 3 || sStatus == 4){
				return 'Accept'
			}else if(sStatus == 1){
				return 'Attention'
			}else{
				return 'Reject'
			}
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
		onPress: function (oEvent) {
			var oRouter = this.getOwnerComponent().getRouter();
			var oRow = oEvent.getSource();
			var id = oRow.getCells()[0].getText();
			var path = oRow.getBindingContext("reimbursements").getPath();
			this.getOwnerComponent().getModel("globalModel").setData({
				ReimbursementPath : path
			});
			oRouter.navTo("reimbursementDetail",{
				ID : id
			});
			
		},
		onAddPress : function(oEvent){
			
			const oModel = this.getView().getModel("new_re_items");
			var oModelData = oModel.getData();
			var oNewObject = {
				"U_AccountCode": "",
				"U_ItemCode": "",
				"U_NPWP": "",
				"U_Amount": 0,
				"U_Description": "",
			};
			oModelData.REIMBURSEMENTLINESCollection.push(oNewObject);
			var f = new sap.ui.model.json.JSONModel(oModelData);
			this.getView().setModel(f, 'new_re_items');
			f.refresh();
		
		},
		onSearch : function(oEvent){
			var mParamas = oEvent.getParameters();
			if(mParamas.filterKeys){
				var statusFilter = Object.keys(mParamas.filterKeys).toString();
			}else{
				var statusFilter = "";
			}
			this.getView().byId("reimbursementTable").setBusy(true);
			var search = this.getView().byId("searchField").getValue();
			var oJWT = this.oJWT;
			var oModel = new JSONModel();
			oModel.loadData(backendUrl+"reimbursement/getReimbursements", {
				"search" : search,
				"status" : statusFilter,
				"company" : this.company
			}, true, "GET",false,false,{
				'Authorization': 'Bearer ' + oJWT
			});
			oModel.dataLoaded().then(function() { 
				this.getView().byId("reimbursementTable").setBusy(false);
			}.bind(this));
			this.getView().setModel(oModel,"reimbursements");

		},
		handleFilterButtonPressed: function () {
			this.getViewSettingsDialog("frontend.bbs.view.reimbursement.FilterForm")
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
		onDelete: function(oEvent){
			var row = oEvent.getParameters().row;
			var iIdx = row.getIndex();
			var oModel = this.getView().getModel("new_re_items");
			var oModelLineData = oModel.getData().REIMBURSEMENTLINESCollection;
			oModelLineData.splice(iIdx, 1);
			oModel.setProperty("/REIMBURSEMENTLINESCollection",oModelLineData);
			oModel.refresh();
			this.onAmountChange();
		},
		dateFormatter : function(date){
			if(date){
				var unformattedDate = new Date(date);
				var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "YYYY-MM-dd" });   
				var dateFormatted = dateFormat.format(unformattedDate);
			}else{
				var dateFormatted = '-';
			}
			
			return dateFormatted;
		},
		objectFormatter: function(sStatus) {
			if(sStatus == 1 ){
				return 'Warning';
			}else if(sStatus == 2){
				return 'Information';
			}
			else if(sStatus == 3){
				return 'Success';
			}else if(sStatus == 5){
				return 'Information';
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
			}else if(sStatus == 5){
				return 'Transferred'
			}else{
				return 'Rejected'
			}
		  
		},
		onSelectionChange : function(oEvent){

			console.log(oEvent.getParameters("selected"));
		}
    });
 });