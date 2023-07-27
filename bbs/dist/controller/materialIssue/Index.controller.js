sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/m/library","sap/ui/model/json/JSONModel","sap/m/MessageToast","frontend/bbs/libs/lodash"],function(e,t,a,s,r){"use strict";var o=a.ButtonType;var i=a.DialogType;return e.extend("frontend.bbs.controller.materialIssue.Index",{onInit:async function(){this.getView().byId("materialIssueTableID").setBusy(true);var e=this.getRouter().getHashChanger().getHash();var t=jQuery.sap.storage(jQuery.sap.storage.Type.local);this.oJWT=t.get("jwt");var a=new s(sap.ui.require.toUrl("frontend/bbs/model/items.json"));this.getView().setModel(a,"items");var r=new s;r.loadData(backendUrl+"materialIssue/getMaterialIssues",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getOwnerComponent().setModel(r,"materialIssue");r.dataLoaded().then(function(){this.getView().byId("materialIssueTableID").setBusy(false)}.bind(this));var o=new sap.ui.model.json.JSONModel({U_RemainingBudget:0});this.getView().setModel(o,"budgetHeader");var i=new s;i.loadData(backendUrl+"budget/getApprovedBudget",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getOwnerComponent().setModel(i,"budgeting");var n=new sap.ui.model.json.JSONModel;this.getView().setModel(n,"new_mi_items");this.getView().getModel("new_mi_items").setProperty("/MATERIALISSUELINESCollection",[])},getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},buttonFormatter:function(e){if(e=="Issued"){return"Accept"}else{return"Attention"}},onPress:function(e){var t=this.getOwnerComponent().getRouter();var a=e.getSource();var s=a.getCells()[0].getText();t.navTo("materialIssueDetail",{ID:s})},onNavBack:function(e){var a,s;a=t.getInstance();s=a.getPreviousHash();if(s!==undefined){window.history.go(-1)}else{this.getRouter().navTo("login",{},true)}},onBudgetChange:async function(e){this.getView().byId("createMIForm").setBusy(true);var t=parseInt(e.getParameters("selectedItem").value);var a=new s;await a.loadData(backendUrl+"budget/getBudgetById?code="+t,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var r=a.getData();var o=r.U_TotalAmount;var i=r.BUDGETUSEDCollection;let n=0;for(let e=0;e<i.length;e++){n+=i[e]["U_Amount"]}r.U_RemainingBudget=o-n;var l=this.getView().getModel("budgetHeader");l.setData(r);this.getView().byId("createMIForm").setBusy(false)},onCreateButtonClick:function(e){if(!this.createMaterialIssueDialog){this.createMaterialIssueDialog=this.loadFragment({name:"frontend.bbs.view.materialIssue.CreateForm"})}this.createMaterialIssueDialog.then(function(e){var t=new sap.ui.model.json.JSONModel({Date:new Date});var a=new sap.ui.model.json.JSONModel;this.getView().setModel(a,"materialIssueHeader");this.getView().setModel(t,"createFragmentViewModel");this.oDialog=e;this.oDialog.open();var s=new sap.ui.model.json.JSONModel;var r=this.getView().getModel("budgetHeader");var o=[];s.setData(o);r.setData(o);this.getView().setModel(s,"materialIssueDetailModel");this.getView().getModel("new_mi_items").setProperty("/MATERIALISSUELINESCollection",[])}.bind(this))},_closeDialog:function(){this.oDialog.close()},onAddPress:function(e){const t=this.getView().getModel("new_mi_items");var a=t.getData();var s={U_AccountCode:"",U_ItemCode:"",U_Qty:""};a.MATERIALISSUELINESCollection.push(s);var r=new sap.ui.model.json.JSONModel(a);this.getView().setModel(r,"new_mi_items");r.refresh()},onSaveButtonClick:function(e){var t=this.oDialog;t.setBusy(true);const a=this.getView().getModel("materialIssueHeader");const s=this.getView().getModel("new_mi_items");var o=this.getView().getModel("materialIssue");a.setProperty("/MATERIALISSUELINESCollection",s.getData().MATERIALISSUELINESCollection);var i=a.getProperty("/");var n=this.getView();var l=this.oJWT;$.ajax({type:"POST",data:JSON.stringify(i),crossDomain:true,headers:{Authorization:"Bearer "+l},url:backendUrl+"materialIssue/createMaterialIssue",contentType:"application/json",success:function(e,a,s){t.setBusy(false);t.close();o.loadData(backendUrl+"materialIssue/getMaterialIssues",null,true,"GET",false,false,{Authorization:"Bearer "+l});r.show("Material Issue created");$(".sapMMessageToast").css({"background-color":"#256f3a",color:"white"});n.getModel("materialIssue").refresh()},error:function(e,t,a){console.log("Got an error response: "+t+a)}})},textFormatter:function(e){if(e==1){return"Pending"}else if(e==2){return"Approved by Manager"}else if(e==3){return"Approved by Director"}else{return"Rejected"}},dateFormatter:function(e){var t=new Date(e);var a=sap.ui.core.format.DateFormat.getDateInstance({pattern:"YYYY-MM-dd"});var s=a.format(t);return s},buttonFormatter:function(e){if(e==2||e==3){return"Accept"}else if(e==1){return"Attention"}else{return"Reject"}}})});