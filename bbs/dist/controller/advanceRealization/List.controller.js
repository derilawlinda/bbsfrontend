sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/core/Fragment","sap/m/library","sap/ui/model/json/JSONModel","sap/ui/Device"],function(e,t,n,r,a,i){"use strict";var o=r.ButtonType;var s=r.DialogType;return e.extend("frontend.bbs.controller.advanceRealization.List",{onInit:function(){this.getView().byId("advanceRealizationTableID").setBusy(true);var e=this.getRouter().getHashChanger().getHash();var t=jQuery.sap.storage(jQuery.sap.storage.Type.local);this.oJWT=t.get("jwt");this.company=t.get("company");var n=new a;this._mViewSettingsDialogs={};var r=new sap.ui.model.json.JSONModel({is_approver:false});this.getView().setModel(r,"viewModel");n.loadData(backendUrl+"advanceRequest/getAdvanceRealizations",{company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getOwnerComponent().setModel(n,"advanceRealization");n.dataLoaded().then(function(){this.getView().byId("advanceRealizationTableID").setBusy(false)}.bind(this));var i=this.getOwnerComponent().getModel("userModel");if(i===undefined){const e=this.getOwnerComponent().getEventBus();e.subscribe("username","checktoken",this.toggleCreateButton,this)}else{var o=i.getData();var s={userName:o.user.name,roleId:o.user.role_id,roleName:o.role[0].name,status:"success"};this.toggleCreateButton("username","checkToken",s)}},toggleCreateButton:function(e,t,n){if(n.roleId==4||n.roleId==5||n.roleId==2){this.getView().getModel("viewModel").setProperty("/is_approver",true)}},onCreateButtonClick:function(e){if(!this.createBudgetingDialog){this.createBudgetingDialog=this.loadFragment({name:"frontend.bbs.view.budgeting.CreateForm"})}this.createBudgetingDialog.then(function(e){this.oDialog=e;this.oDialog.open();var t=new sap.ui.model.json.JSONModel;var n=[];t.setData(n);this.getView().setModel(t,"budgetingDetailModel");this._oMessageManager.registerObject(this.oView.byId("formContainer"),true)}.bind(this))},getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},onNavBack:function(e){var n,r;n=t.getInstance();r=n.getPreviousHash();if(r!==undefined){window.history.go(-1)}else{this.getRouter().navTo("login",{},true)}},_closeDialog:function(){this.oDialog.close()},handleFilterButtonPressed:function(){this.getViewSettingsDialog("frontend.bbs.view.advanceRealization.FilterForm").then(function(e){e.open()})},getViewSettingsDialog:function(e){var t=this._mViewSettingsDialogs[e];if(!t){t=n.load({id:this.getView().getId(),name:e,controller:this}).then(function(e){if(i.system.desktop){e.addStyleClass("sapUiSizeCompact")}return e});this._mViewSettingsDialogs[e]=t}return t},onSearch:function(e){var t=e.getParameters();if(t.filterKeys){var n=Object.keys(t.filterKeys).toString()}else{var n=""}this.getView().byId("advanceRealizationTableID").setBusy(true);var r=this.getView().byId("searchField").getValue();var i=this.oJWT;var o=new a;o.loadData(backendUrl+"advanceRequest/getAdvanceRealizations",{search:r,status:n,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+i});o.dataLoaded().then(function(){this.getView().byId("advanceRealizationTableID").setBusy(false)}.bind(this));this.getView().setModel(o,"advanceRealization")},buttonFormatter:function(e){if(e==2||e==3){return"Accept"}else if(e==1){return"Attention"}else{return"Reject"}},objectFormatter:function(e){if(e==1){return"Warning"}else if(e==2){return"Information"}else if(e==3){return"Success"}else if(e==5){return"Information"}else{return"Error"}},textFormatter:function(e){if(e==1){return"Pending"}else if(e==2){return"Approved by Manager"}else if(e==3){return"Approved by Director"}else if(e==5){return"Transferred"}else{return"Rejected"}},realizationButtonFormatter:function(e){if(e==3||e==4){return"Success"}else if(e==1||e==2){return"Warning"}else{return"Error"}},realizationObjectFormatter:function(e){if(e==1){return"Information"}else if(e==2){return"Warning"}else if(e==3){return"Success"}else if(e==4){return"Information"}else if(e==6){return"Success"}else{return"Error"}},relizationTextFormatter:function(e){if(e==1){return"Unrealized"}else if(e==2){return"Submitted"}else if(e==3){return"Approved by Manager"}else if(e==4){return"Approved by Director"}else if(e==6){return"Realized"}else{return"Rejected"}},onPress:function(e){var t=this.getOwnerComponent().getRouter();var n=e.getSource();var r=n.getCells()[0].getText();var a=n.getBindingContext("advanceRealization").getPath();this.getOwnerComponent().getModel("globalModel").setData({RealizationPath:a});t.navTo("advanceRealizationDetail",{ID:r})},dateFormatter:function(e){if(e){var t=new Date(e);var n=sap.ui.core.format.DateFormat.getDateInstance({pattern:"YYYY-MM-dd"});var r=n.format(t);return r}else{return"-"}}})});