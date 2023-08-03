sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/m/library","sap/ui/model/json/JSONModel","sap/m/MessageToast","sap/ui/core/library","frontend/bbs/libs/lodash"],function(e,t,a,s,r,o){"use strict";var i=a.ButtonType;var n=a.DialogType;var l=o.ValueState;return e.extend("frontend.bbs.controller.materialIssue.Index",{onInit:async function(){this.getView().byId("materialIssueTableID").setBusy(true);var e=this.getRouter().getHashChanger().getHash();var t=jQuery.sap.storage(jQuery.sap.storage.Type.local);this.oJWT=t.get("jwt");var a=new s;a.loadData(backendUrl+"materialIssue/getMaterialIssues",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getOwnerComponent().setModel(a,"materialIssue");a.dataLoaded().then(function(){this.getView().byId("materialIssueTableID").setBusy(false)}.bind(this));var r=new s;this.getView().setModel(r,"items");var o=new sap.ui.model.json.JSONModel({U_RemainingBudget:0});this.getView().setModel(o,"budgetHeader");var i=new s;i.loadData(backendUrl+"budget/getApprovedBudget",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getOwnerComponent().setModel(i,"budgeting");var n=new sap.ui.model.json.JSONModel;this.getView().setModel(n,"new_mi_items");this.getView().getModel("new_mi_items").setProperty("/MATERIALISSUELINESCollection",[])},getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},buttonFormatter:function(e){if(e=="Issued"){return"Accept"}else{return"Attention"}},onPress:function(e){var t=this.getOwnerComponent().getRouter();var a=e.getSource();var s=a.getCells()[0].getText();t.navTo("materialIssueDetail",{ID:s})},onNavBack:function(e){var a,s;a=t.getInstance();s=a.getPreviousHash();if(s!==undefined){window.history.go(-1)}else{this.getRouter().navTo("login",{},true)}},onBudgetChange:async function(e){this.getView().getModel("budgetHeader").setProperty("/",[]);this.getView().getModel("new_mi_items").setProperty("/MATERIALISSUELINESCollection",[]);var t=e.getSource(),a=t.getSelectedKey(),r=t.getValue();if(!a&&r){t.setValueState(l.Error);t.setValueStateText("Please enter a valid Budget Code")}else{t.setValueState(l.None)}if(t.getValueState()==l.None){this.getView().byId("createMIForm").setBusy(true);this.getView().byId("MIItemsTableID").setBusy(true);var o=parseInt(e.getParameters("selectedItem").value);var i=new s;await i.loadData(backendUrl+"budget/getBudgetById?code="+o,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var n=new s;await n.loadData(backendUrl+"coa/getCOAsByBudget?budgetCode="+o,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(n,"accounts");var u=i.getData();var g=u.U_TotalAmount;var d=u.BUDGETUSEDCollection;let t=0;for(let e=0;e<d.length;e++){t+=d[e]["U_Amount"]}u.U_RemainingBudget=g-t;var c=this.getView().getModel("budgetHeader");c.setData(u);this.getView().byId("createMIForm").setBusy(false);this.getView().byId("MIItemsTableID").setBusy(false)}},onAccountCodeChange:async function(e){var t=e.getSource().getSelectedKey();var a=e.getSource().getParent();a.getCells()[1].setBusy(true);a.getCells()[1].setSelectedKey("");a.getCells()[1].setEnabled(true);a.getCells()[1].setEnabled(true);var r=this.getView().getModel("items");var o=r.getData();if(!(t in o)){var i=new s;await i.loadData(backendUrl+"items/getItemsByAccount?accountCode="+t+"",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var n=i.getData();o[t]=n;var l=new sap.ui.model.json.JSONModel(o);this.getView().setModel(l,"items");l.refresh()}a.getCells()[1].bindAggregation("items",{path:"items>/"+t,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})});a.getCells()[1].setBusy(false)},onCreateButtonClick:function(e){if(!this.createMaterialIssueDialog){this.createMaterialIssueDialog=this.loadFragment({name:"frontend.bbs.view.materialIssue.CreateForm"})}this.createMaterialIssueDialog.then(function(e){var t=new sap.ui.model.json.JSONModel({Date:new Date});var a=new sap.ui.model.json.JSONModel;this.getView().setModel(a,"materialIssueHeader");this.getView().setModel(t,"createFragmentViewModel");this.oDialog=e;this.oDialog.open();var s=new sap.ui.model.json.JSONModel;var r=this.getView().getModel("budgetHeader");var o=[];s.setData(o);r.setData(o);this.getView().setModel(s,"materialIssueDetailModel");this.getView().getModel("new_mi_items").setProperty("/MATERIALISSUELINESCollection",[])}.bind(this))},_closeDialog:function(){this.oDialog.close()},onAddPress:function(e){const t=this.getView().getModel("new_mi_items");var a=t.getData();var s={U_AccountCode:"",U_ItemCode:"",U_Qty:""};a.MATERIALISSUELINESCollection.push(s);var r=new sap.ui.model.json.JSONModel(a);this.getView().setModel(r,"new_mi_items");r.refresh()},onSaveButtonClick:function(e){var t=this.oDialog;t.setBusy(true);const a=this.getView().getModel("materialIssueHeader");const s=this.getView().getModel("new_mi_items");var o=this.getView().getModel("materialIssue");a.setProperty("/MATERIALISSUELINESCollection",s.getData().MATERIALISSUELINESCollection);var i=a.getProperty("/");var n=this.getView();var l=this.oJWT;$.ajax({type:"POST",data:JSON.stringify(i),crossDomain:true,headers:{Authorization:"Bearer "+l},url:backendUrl+"materialIssue/createMaterialIssue",contentType:"application/json",success:function(e,a,s){t.setBusy(false);t.close();o.loadData(backendUrl+"materialIssue/getMaterialIssues",null,true,"GET",false,false,{Authorization:"Bearer "+l});r.show("Material Issue created");$(".sapMMessageToast").css({"background-color":"#256f3a",color:"white"});n.getModel("materialIssue").refresh()},error:function(e,t,a){console.log("Got an error response: "+t+a)}})},textFormatter:function(e){if(e==1){return"Pending"}else if(e==2){return"Approved by Manager"}else if(e==3){return"Approved by Director"}else{return"Rejected"}},dateFormatter:function(e){var t=new Date(e);var a=sap.ui.core.format.DateFormat.getDateInstance({pattern:"YYYY-MM-dd"});var s=a.format(t);return s},buttonFormatter:function(e){if(e==2||e==3){return"Accept"}else if(e==1){return"Attention"}else{return"Reject"}},onDelete:function(e){var t=e.getParameters().row;var a=t.getIndex();var s=this.getView().getModel("new_mi_items");var r=s.getData().MATERIALISSUELINESCollection;r.splice(a,1);s.setProperty("/MATERIALISSUELINESCollection",r);s.refresh()}})});