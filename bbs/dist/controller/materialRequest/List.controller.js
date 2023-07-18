sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/core/Fragment","sap/ui/layout/HorizontalLayout","sap/ui/layout/VerticalLayout","sap/m/Dialog","sap/m/Button","sap/m/Label","sap/m/library","sap/m/MessageToast","sap/m/Text","sap/m/TextArea","sap/ui/model/json/JSONModel","frontend/bbs/libs/lodash"],function(e,t,o,a,n,r,i,s,l,u,g,d,m){"use strict";var c=l.ButtonType;var p=l.DialogType;return e.extend("frontend.bbs.controller.materialRequest.List",{onInit:async function(){var e=new m(sap.ui.require.toUrl("frontend/bbs/model/material_request.json"));this.getOwnerComponent().setModel(e,"materialRequest");var t=new m(sap.ui.require.toUrl("frontend/bbs/model/sales_order.json"));this.getView().setModel(t,"salesOrder");var o=new m(sap.ui.require.toUrl("frontend/bbs/model/companies.json"));this.getView().setModel(o,"companies");var a=new m;var n=jQuery.sap.storage(jQuery.sap.storage.Type.local);var r=n.get("jwt");a.loadData(backendUrl+"getBudget",null,true,"GET",false,false,{Authorization:"Bearer "+r});this.getOwnerComponent().setModel(a,"budgeting");var i=new sap.ui.model.json.JSONModel;this.getView().setModel(i,"new_mr_items");this.getView().getModel("new_mr_items").setProperty("/MATERIALREQLINESCollection",[])},onCreateButtonClick:function(e){console.log(this.getView().getModel("budgeting"));if(!this.createMaterialRequestDialog){this.createMaterialRequestDialog=this.loadFragment({name:"frontend.bbs.view.materialRequest.CreateForm"})}this.createMaterialRequestDialog.then(function(e){var t=new sap.ui.model.json.JSONModel({Date:new Date});this.getView().setModel(t,"createFragmentViewModel");t.setProperty("/Date",new Date);console.log(t);this.oDialog=e;this.oDialog.open();var o=new sap.ui.model.json.JSONModel;var a=[];o.setData(a);this.getView().setModel(o,"budgetingDetailModel");this.getView().getModel("new_mr_items").setProperty("/itemRow",[])}.bind(this))},getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},onNavBack:function(e){var o,a;o=t.getInstance();a=o.getPreviousHash();if(a!==undefined){window.history.go(-1)}else{this.getRouter().navTo("login",{},true)}},getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},_closeDialog:function(){this.oDialog.close()},onPress:function(e){var t=this.getOwnerComponent().getRouter();var o=e.getSource().getBindingContextPath();var a=o.split("/").slice(-1).pop();t.navTo("materialRequestDetail",{materialRequestID:a})},buttonFormatter:function(e){if(e=="Approved"){return"Accept"}else if(e=="Pending"){return"Attention"}else{return"Reject"}},onBudgetChange:function(e){var t=this.getView().getModel("budgeting");var o=t.getData().value;var a=parseInt(e.getParameters("selectedItem").value);let n=_.find(o,function(e){if(e.Code==a){return true}});var r=new sap.ui.model.json.JSONModel(n);this.getView().setModel(r,"materialRequestHeader")},onAddPress:function(e){const t=this.getView().getModel("new_mr_items");var o=t.getData();var a={account_code:"",item_name:"",amount:""};o.MATERIALREQLINESCollection.push(a);var n=new sap.ui.model.json.JSONModel(o);this.getView().setModel(n,"new_mr_items");n.refresh()}})});