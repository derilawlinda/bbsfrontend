sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
	"sap/m/library",
	"frontend/bbs/model/PagingJSONModel",
	"sap/m/MessageToast",
	"sap/ui/core/library",
	'frontend/bbs/libs/lodash'
	
 ], function (Controller,History,mobileLibrary, JSONModel,MessageToast,coreLibrary) {
    "use strict";

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;
	var ValueState = coreLibrary.ValueState;
    return Controller.extend("frontend.bbs.controller.materialIssue.Index", {
       onInit: async function  () {
		this.getView().byId("materialIssueTableID").setBusy(true);
		var currentRoute = this.getRouter().getHashChanger().getHash();
		var oStore = jQuery.sap.storage(jQuery.sap.storage.Type.local);
		this.oJWT = oStore.get("jwt");
		
		var oModel = new JSONModel();
		oModel.loadData(backendUrl+"materialIssue/getMaterialIssues", null, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		this.getView().setModel(oModel,"materialIssue");
		oModel.dataLoaded().then(function() { // Ensuring data availability instead of assuming it.
			this.getView().byId("materialIssueTableID").setBusy(false);
		}.bind(this));

		var oItemModel = new JSONModel();
		this.getView().setModel(oItemModel,"items");

		var viewModel = new sap.ui.model.json.JSONModel({
			showCreateButton : true,
			is_approver : false
		});
		this.getView().setModel(viewModel,"viewModel");
		
		//GET BUDGET DATA
		var budgetRequestHeader = new sap.ui.model.json.JSONModel({
			U_RemainingBudget : 0
		});
		this.getView().setModel(budgetRequestHeader,"budgetHeader");
		var oBudgetingModel = new JSONModel();
		oBudgetingModel.loadData(backendUrl+"budget/getApprovedBudget", null, true, "GET",false,false,{
			'Authorization': 'Bearer ' + this.oJWT
		});
		this.getView().setModel(oBudgetingModel,"budgeting");

		//NEW MATERIAL ISSUE MODEL
		var oNewMaterialIssueAccounts = new sap.ui.model.json.JSONModel();
		this.getView().setModel(oNewMaterialIssueAccounts,"new_mi_items");
		this.getView().getModel("new_mi_items").setProperty("/MATERIALISSUELINESCollection", []);

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
		if(parametersMap.roleId == 4 || parametersMap.roleId == 5){
			this.getView().getModel("viewModel").setProperty("/showCreateButton",false)
			this.getView().getModel("viewModel").setProperty("/is_approver",true)
			}
   		},
	    getRouter : function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		buttonFormatter: function(sStatus) {
			if(sStatus == 'Issued'){
				return 'Accept'
			}else{
				return 'Attention'
			}
		},
		objectFormatter: function(sStatus) {
			if(sStatus == 2 || sStatus == 3){
				return 'Success'
			}else if(sStatus == 1){
				return 'Warning'
			}else{
				return 'Error'
			}
		  },
		onPress: function (oEvent) {
			var oRouter = this.getOwnerComponent().getRouter();
			var oRow = oEvent.getSource();
			var id = oRow.getCells()[0].getText();
			oRouter.navTo("materialIssueDetail",{
				ID : id
			});

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
		onBudgetChange : async function(oEvent){
			this.getView().getModel("budgetHeader").setProperty("/", []);
			this.getView().getModel("new_mi_items").setProperty("/MATERIALISSUELINESCollection", []);
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
				this.getView().byId("createMIForm").setBusy(true);
				this.getView().byId("MIItemsTableID").setBusy(true);
				var selectedID = parseInt(oEvent.getParameters('selectedItem').value);
				var budgetingModel = new JSONModel();
				await budgetingModel.loadData(backendUrl+"budget/getBudgetById?code="+selectedID, null, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				var accountModel = new JSONModel();
				await accountModel.loadData(backendUrl+"coa/getCOAsByBudget?budgetCode="+selectedID, null, true, "GET",false,false,{
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
				this.getView().byId("createMIForm").setBusy(false);
				this.getView().byId("MIItemsTableID").setBusy(false);
			}
		  },
		onAccountCodeChange : async function(oEvent){
			
			var oSelectedItem = oEvent.getSource().getSelectedKey(); //Get Selected Item
			var oSelectedRow = oEvent.getSource().getParent(); //Selected Row.
			oSelectedRow.getCells()[1].setBusy(true);
			oSelectedRow.getCells()[1].setSelectedKey("");
			oSelectedRow.getCells()[1].setEnabled(true);
			oSelectedRow.getCells()[1].setEnabled(true);

			

			var oItemModel = this.getView().getModel("items");
			var oItemData = oItemModel.getData();
			if(!(oSelectedItem in oItemData)){
				var oItemByAccountModel = new JSONModel();
				await oItemByAccountModel.loadData(backendUrl+"items/getItemsByAccount?accountCode="+oSelectedItem+"", null, true, "GET",false,false,{
					'Authorization': 'Bearer ' + this.oJWT
				});
				var oItemByAccountData = oItemByAccountModel.getData();
				oItemData[oSelectedItem] = oItemByAccountData;
				var i = new sap.ui.model.json.JSONModel(oItemData);
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
		onCreateButtonClick : function(oEvent) {
			if (!this.createMaterialIssueDialog) {
				this.createMaterialIssueDialog = this.loadFragment({
					name: "frontend.bbs.view.materialIssue.CreateForm"
				});
			}
			this.createMaterialIssueDialog.then(function (oDialog) {
				var oCreateFragmentViewModel = new sap.ui.model.json.JSONModel({
					Date : new Date()
				});
				var oMaterialIssueHeader = new sap.ui.model.json.JSONModel();
			
				this.getView().setModel(oMaterialIssueHeader,"materialIssueHeader");
				this.getView().setModel(oCreateFragmentViewModel,"createFragmentViewModel");
				this.oDialog = oDialog;
				this.oDialog.open();
				var oMaterialIssueDetailModel = new sap.ui.model.json.JSONModel();
				var budgetRequestHeader = this.getView().getModel("budgetHeader");


				var dynamicProperties = [];
				oMaterialIssueDetailModel.setData(dynamicProperties);
				budgetRequestHeader.setData(dynamicProperties);

				this.getView().setModel(oMaterialIssueDetailModel,"materialIssueDetailModel");
				this.getView().getModel("new_mi_items").setProperty("/MATERIALISSUELINESCollection", []);


	
			}.bind(this));
		   },
		_closeDialog: function () {
			this.oDialog.close();
		},
		onAddPress : function(oEvent){
			const oModel = this.getView().getModel("new_mi_items");
			var oModelData = oModel.getData();
			var oNewObject = {
				"U_AccountCode": "",
				"U_ItemCode": "",
				"U_Qty": ""
			};
			oModelData.MATERIALISSUELINESCollection.push(oNewObject);
			var f = new sap.ui.model.json.JSONModel(oModelData);
			this.getView().setModel(f, 'new_mi_items');
			f.refresh();
		
		},
		onSaveButtonClick : function(oEvent) {
			var oDialog = this.oDialog;
			oDialog.setBusy(true);
			const oModel = this.getView().getModel("materialIssueHeader");
			const oModelItems = this.getView().getModel("new_mi_items");
			var materialIssueModel = this.getView().getModel("materialIssue");
			oModel.setProperty("/MATERIALISSUELINESCollection", oModelItems.getData().MATERIALISSUELINESCollection);
			var oProperty = oModel.getProperty("/");
			var view = this.getView();
			
			var oJWT = this.oJWT;

			$.ajax({
				type: "POST",
				data: JSON.stringify(oProperty),
				crossDomain: true,
				headers: { 'Authorization': 'Bearer ' + oJWT },
				url: backendUrl+'materialIssue/createMaterialIssue',
				contentType: "application/json",
				success: function (res, status, xhr) {
					  //success code
					oDialog.setBusy(false);
					oDialog.close();
					materialIssueModel.loadData(backendUrl+"materialIssue/getMaterialIssues", null, true, "GET",false,false,{
						'Authorization': 'Bearer ' + oJWT
					});
					MessageToast.show("Material Issue created");
					$(".sapMMessageToast").css({"background-color": "#256f3a", "color": "white"});
					
					view.getModel('materialIssue').refresh();
				},
				error: function (jqXHR, textStatus, errorThrown) {
				  	console.log("Got an error response: " + textStatus + errorThrown);
				}
			  });
			// alert(JSON.stringify(oProperty));
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
		buttonFormatter: function(sStatus) {
			if(sStatus == 2 || sStatus == 3){
				return 'Accept'
			}else if(sStatus == 1){
				return 'Attention'
			}else{
				return 'Reject'
			}
		  },
		
		  onDelete: function(oEvent){

			var row = oEvent.getParameters().row;
			var iIdx = row.getIndex();
			var oModel = this.getView().getModel("new_mi_items");
			var oModelLineData = oModel.getData().MATERIALISSUELINESCollection;
			oModelLineData.splice(iIdx, 1);
			oModel.setProperty("/MATERIALISSUELINESCollection",oModelLineData);
			oModel.refresh();
		}
    });
 });