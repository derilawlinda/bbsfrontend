sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/model/json/JSONModel","sap/ui/model/odata/v4/ODataModel"],function(e,t,o,n){"use strict";var i;var r;var s=[];return e.extend("frontend.bbs.controller.budgeting.List",{onInit:function(){var e=jQuery.sap.storage(jQuery.sap.storage.Type.local);var t=e.get("jwt");var i=new n({groupId:"$direct",synchronizationMode:"None",serviceUrl:backendUrl,httpHeaders:{Authorization:"Bearer "+t}});console.log(i);this.getView().setModel(i,"budgeting");var r=new o(sap.ui.require.toUrl("frontend/bbs/model/budgeting_accounts.json"));this.getView().setModel(r,"budgeting_accounts")},search:function(e,t){if(t!=i){s=[]}if(!Array.isArray(e))return s;var o=this;e.forEach(function(e){if(e.subheader===t){const o=e.nodes&&Array.isArray(e.nodes)?e.nodes.filter(e=>e.value===t):[];s.push(e)}else{o.search(e.nodes,t)}i=t});return s},onCreateButtonClick:function(e){if(!this.createBudgetingDialog){this.createBudgetingDialog=this.loadFragment({name:"frontend.bbs.view.budgeting.CreateForm"})}this.createBudgetingDialog.then(function(e){this.oDialog=e;this.oDialog.open();var t=new sap.ui.model.json.JSONModel;var o=[];t.setData(o);this.getView().setModel(t,"budgetingDetailModel");var n=new sap.ui.model.json.JSONModel;this.getView().setModel(n,"new_budgeting_accounts");this.getView().getModel("new_budgeting_accounts").setProperty("/accountRow",[])}.bind(this))},onSaveButtonClick:function(e){console.log(e)},getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},_closeDialog:function(){this.oDialog.close()},buttonFormatter:function(e){if(e=="Approved"){return"Accept"}else if(e=="Pending"){return"Attention"}else{return"Reject"}},onNavBack:function(e){var o,n;o=t.getInstance();n=o.getPreviousHash();if(n!==undefined){window.history.go(-1)}else{this.getRouter().navTo("login",{},true)}},onPress:function(e){var t=this.getOwnerComponent().getRouter();var o=e.getSource().getBindingContextPath();var n=o.split("/").slice(-1).pop();t.navTo("budgetingDetail",{budgetID:n})},onAddPress:function(e){const t=this.getView().getModel("new_budgeting_accounts");const o=console.log(this.getView().getModel("accounts"));var n=t.getData();var i={account_code:"",account_name:"",amount:""};n.accountRow.push(i);var r=new sap.ui.model.json.JSONModel(n);this.getView().setModel(r,"new_budgeting_accounts");r.refresh()}})});