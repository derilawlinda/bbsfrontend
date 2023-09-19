sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/core/Fragment","sap/ui/layout/HorizontalLayout","sap/ui/layout/VerticalLayout","sap/m/Dialog","sap/m/Button","sap/m/Label","sap/m/library","sap/m/MessageToast","sap/m/Text","sap/m/TextArea","sap/ui/model/json/JSONModel"],function(e,t,a,r,n,i,o,s,l,u,g,c,d){"use strict";var f=l.ButtonType;var h=l.DialogType;return e.extend("frontend.bbs.controller.advanceRealization.List",{onInit:function(){this.getView().byId("advanceRealizationTableID").setBusy(true);var e=this.getRouter().getHashChanger().getHash();var t=jQuery.sap.storage(jQuery.sap.storage.Type.local);this.oJWT=t.get("jwt");this.company=t.get("company");var a=new d;this._mViewSettingsDialogs={};var r=new sap.ui.model.json.JSONModel({is_approver:false});this.getView().setModel(r,"viewModel");a.loadData(backendUrl+"advanceRequest/getAdvanceRealizations",{company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getOwnerComponent().setModel(a,"advanceRealization");a.dataLoaded().then(function(){this.getView().byId("advanceRealizationTableID").setBusy(false)}.bind(this));var n=this.getOwnerComponent().getModel("userModel");if(n===undefined){const e=this.getOwnerComponent().getEventBus();e.subscribe("username","checktoken",this.toggleCreateButton,this)}else{var i=n.getData();var o={userName:i.user.name,roleId:i.user.role_id,roleName:i.role[0].name,status:"success"};this.toggleCreateButton("username","checkToken",o)}},toggleCreateButton:function(e,t,a){if(a.roleId==4||a.roleId==5||a.roleId==2){this.getView().getModel("viewModel").setProperty("/is_approver",true)}},onCreateButtonClick:function(e){if(!this.createBudgetingDialog){this.createBudgetingDialog=this.loadFragment({name:"frontend.bbs.view.budgeting.CreateForm"})}this.createBudgetingDialog.then(function(e){this.oDialog=e;this.oDialog.open();var t=new sap.ui.model.json.JSONModel;var a=[];t.setData(a);this.getView().setModel(t,"budgetingDetailModel");this._oMessageManager.registerObject(this.oView.byId("formContainer"),true)}.bind(this))},getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},onNavBack:function(e){var a,r;a=t.getInstance();r=a.getPreviousHash();if(r!==undefined){window.history.go(-1)}else{this.getRouter().navTo("login",{},true)}},_closeDialog:function(){this.oDialog.close()},handleFilterButtonPressed:function(){this.getViewSettingsDialog("frontend.bbs.view.advanceRealization.FilterForm").then(function(e){e.open()})},getViewSettingsDialog:function(e){var t=this._mViewSettingsDialogs[e];if(!t){t=a.load({id:this.getView().getId(),name:e,controller:this}).then(function(e){if(Device.system.desktop){e.addStyleClass("sapUiSizeCompact")}return e});this._mViewSettingsDialogs[e]=t}return t},onSearch:function(e){var t=e.getParameters();if(t.filterKeys){var a=Object.keys(t.filterKeys).toString()}else{var a=""}this.getView().byId("advanceRealizationTableID").setBusy(true);var r=this.getView().byId("searchField").getValue();var n=this.oJWT;var i=new d;i.loadData(backendUrl+"advanceRequest/getAdvanceRealizations",{search:r,status:a,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+n});i.dataLoaded().then(function(){this.getView().byId("advanceRealizationTableID").setBusy(false)}.bind(this));this.getView().setModel(i,"advanceRealization")},buttonFormatter:function(e){if(e==2||e==3){return"Accept"}else if(e==1){return"Attention"}else{return"Reject"}},objectFormatter:function(e){if(e==1){return"Warning"}else if(e==2){return"Information"}else if(e==3){return"Success"}else if(e==5){return"Information"}else{return"Error"}},textFormatter:function(e){if(e==1){return"Pending"}else if(e==2){return"Approved by Manager"}else if(e==3){return"Approved by Director"}else if(e==5){return"Transferred"}else{return"Rejected"}},realizationButtonFormatter:function(e){if(e==3||e==4){return"Success"}else if(e==1||e==2){return"Warning"}else{return"Error"}},realizationObjectFormatter:function(e){if(e==1){return"Information"}else if(e==2){return"Warning"}else if(e==3){return"Success"}else if(e==4){return"Information"}else if(e==6){return"Success"}else{return"Error"}},relizationTextFormatter:function(e){if(e==1){return"Unrealized"}else if(e==2){return"Submitted"}else if(e==3){return"Approved by Manager"}else if(e==4){return"Approved by Director"}else if(e==6){return"Realized"}else{return"Rejected"}},onPress:function(e){var t=this.getOwnerComponent().getRouter();var a=e.getSource();var r=a.getCells()[0].getText();var n=a.getBindingContext("advanceRealization").getPath();this.getOwnerComponent().getModel("globalModel").setData({RealizationPath:n});t.navTo("advanceRealizationDetail",{ID:r})},dateFormatter:function(e){if(e){var t=new Date(e);var a=sap.ui.core.format.DateFormat.getDateInstance({pattern:"YYYY-MM-dd"});var r=a.format(t);return r}else{return"-"}}})});