sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/model/json/JSONModel","sap/m/Dialog","sap/m/Button","sap/m/library","sap/m/Text","sap/ui/core/library","sap/m/MessageToast"],function(e,t,r,s,o,a,n,i,l){"use strict";var u=a.ButtonType;var g=a.DialogType;var d=i.ValueState;return e.extend("frontend.bbs.controller.reimbursement.List",{onInit:async function(){this.getView().byId("reimbursementTableID").setBusy(true);var e=this.getRouter().getHashChanger().getHash();var t=jQuery.sap.storage(jQuery.sap.storage.Type.local);this.oJWT=t.get("jwt");var s=new r;s.loadData(backendUrl+"reimbursement/getReimbursements",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getOwnerComponent().setModel(s,"reimbursements");s.dataLoaded().then(function(){this.getView().byId("reimbursementTableID").setBusy(false)}.bind(this));var o=new r(sap.ui.require.toUrl("frontend/bbs/model/companies.json"));this.getView().setModel(o,"companies");var a=new r;this.getView().setModel(a,"items");this.getView().getModel("items").setProperty("/data",[]);var n=new sap.ui.model.json.JSONModel;var i=new sap.ui.model.json.JSONModel({showCreateButton:true,NPWP:[{Name:0},{Name:2.5},{Name:3}]});this.getView().setModel(i,"viewModel");this.getView().setModel(n,"advanceRequestHeader");var l=new sap.ui.model.json.JSONModel({U_RemainingBudget:0});this.getView().setModel(l,"budgetHeader");var u=new r;u.loadData(backendUrl+"budget/getApprovedBudget",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(u,"budgeting");var g=new sap.ui.model.json.JSONModel;this.getView().setModel(g,"new_re_items");this.getView().getModel("new_re_items").setProperty("/REIMBURSEMENTLINESCollection",[]);var d=this.getOwnerComponent().getModel("userModel");if(d===undefined){const e=this.getOwnerComponent().getEventBus();e.subscribe("username","checktoken",this.toggleCreateButton,this)}else{var c=d.getData();var m={userName:c.user.name,roleId:c.user.role_id,roleName:c.role[0].name,status:"success"};this.toggleCreateButton("username","checkToken",m)}},toggleCreateButton:function(e,t,r){if(r.roleId==4||r.roleId==5){this.getView().getModel("viewModel").setProperty("/showCreateButton",false)}},onAmountChange:function(e){const t=this.getView().getModel("new_re_items");var r=t.getData().REIMBURSEMENTLINESCollection;let s=0;for(let e=0;e<r.length;e++){s+=r[e]["U_Amount"]}console.log(s);const o=this.getView().getModel("reimbursementHeader");o.setProperty("/U_TotalAmount",s)},search:function(e,t){if(t!=endTerm){matches=[]}if(!Array.isArray(e))return matches;var r=this;e.forEach(function(e){if(e.subheader===t){const r=e.nodes&&Array.isArray(e.nodes)?e.nodes.filter(e=>e.value===t):[];matches.push(e)}else{r.search(e.nodes,t)}endTerm=t});return matches},onCreateButtonClick:function(e){if(!this.createBudgetingDialog){this.createBudgetingDialog=this.loadFragment({name:"frontend.bbs.view.reimbursement.CreateForm"})}this.createBudgetingDialog.then(function(e){var t=new sap.ui.model.json.JSONModel({Date:new Date});this.getView().setModel(t,"createFragmentViewModel");var r=this.getView().getModel("budgetHeader");r.setData([]);var s=new sap.ui.model.json.JSONModel;this.getView().setModel(s,"reimbursementHeader");var o=new sap.ui.model.json.JSONModel;this.getView().setModel(o,"new_re_items");this.getView().getModel("new_re_items").setProperty("/REIMBURSEMENTLINESCollection",[]);this.oDialog=e;this.oDialog.open()}.bind(this))},onAccountCodeChange:async function(e){var t=e.getSource().getSelectedKey();var s=e.getSource().getParent();s.getCells()[1].setBusy(true);s.getCells()[1].setSelectedKey("");s.getCells()[1].setEnabled(true);s.getCells()[1].setEnabled(true);var o=this.getView().getModel("items");var a=o.getData();if(!(t in a)){var n=new r;await n.loadData(backendUrl+"items/getItemsByAccount?accountCode="+t+"",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var i=n.getData();a[t]=i;var l=new sap.ui.model.json.JSONModel(a);this.getView().setModel(l,"items");l.refresh()}s.getCells()[1].bindAggregation("items",{path:"items>/"+t,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})});s.getCells()[1].setBusy(false)},onBudgetChange:async function(e){var t=e.getSource(),s=t.getSelectedKey(),o=t.getValue();if(!s&&o){t.setValueState(d.Error);t.setValueStateText("Please enter a valid Budget Code")}else{t.setValueState(d.None)}if(t.getValueState()==d.None){this.getView().byId("createReimbursementForm").setBusy(true);this.getView().byId("ReimbursementItemsTableID").setBusy(true);this.getView().getModel("new_re_items").setProperty("/REIMBURSEMENTLINESCollection",[]);var a=parseInt(e.getParameters("selectedItem").value);var n=new r;await n.loadData(backendUrl+"budget/getBudgetById?code="+a,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var i=new r;await i.loadData(backendUrl+"coa/getCOAsByBudget?budgetCode="+a,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(i,"accounts");var n=new r;await n.loadData(backendUrl+"budget/getBudgetById?code="+a,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var l=n.getData();var u=l.U_TotalAmount;var g=l.BUDGETUSEDCollection;let t=0;for(let e=0;e<g.length;e++){t+=g[e]["U_Amount"]}l.U_RemainingBudget=u-t;var c=this.getView().getModel("budgetHeader");c.setData(l);this.getView().byId("createReimbursementForm").setBusy(false);this.getView().byId("ReimbursementItemsTableID").setBusy(false)}},onSaveButtonClick:function(e){var t=this.oDialog;t.setBusy(true);var r=this.getView().getModel("reimbursements");const s=this.getView().getModel("reimbursementHeader");const o=this.getView().getModel("new_re_items");s.setProperty("/REIMBURSEMENTLINESCollection",o.getData().REIMBURSEMENTLINESCollection);var a=s.getProperty("/");var n=this.getView();var i=this.oJWT;$.ajax({type:"POST",data:JSON.stringify(a),crossDomain:true,headers:{Authorization:"Bearer "+i},url:backendUrl+"reimbursement/createReimbursement",contentType:"application/json",success:function(e,s,o){t.setBusy(false);t.close();r.loadData(backendUrl+"reimbursement/getReimbursements",null,true,"GET",false,false,{Authorization:"Bearer "+i});l.show("Reimbursement Request created");$(".sapMMessageToast").css({"background-color":"#256f3a",color:"white"});n.getModel("reimbursements").refresh()},error:function(e,t,r){console.log("Got an error response: "+t+r)}})},getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},_closeDialog:function(){this.oDialog.close()},buttonFormatter:function(e){if(e==2||e==3||e==4){return"Accept"}else if(e==1){return"Attention"}else{return"Reject"}},onNavBack:function(e){var r,s;r=t.getInstance();s=r.getPreviousHash();if(s!==undefined){window.history.go(-1)}else{this.getRouter().navTo("login",{},true)}},onPress:function(e){var t=this.getOwnerComponent().getRouter();var r=e.getSource();var s=r.getCells()[0].getText();t.navTo("reimbursementDetail",{ID:s})},onAddPress:function(e){const t=this.getView().getModel("new_re_items");var r=t.getData();var s={U_AccountCode:"",U_ItemCode:"",U_NPWP:"",U_Amount:0,U_Description:""};r.REIMBURSEMENTLINESCollection.push(s);var o=new sap.ui.model.json.JSONModel(r);this.getView().setModel(o,"new_re_items");o.refresh()},onDelete:function(e){var t=e.getParameters().row;var r=t.getIndex();var s=this.getView().getModel("new_re_items");var o=s.getData().REIMBURSEMENTLINESCollection;o.splice(r,1);s.setProperty("/REIMBURSEMENTLINESCollection",o);s.refresh();this.onAmountChange()},textFormatter:function(e){if(e==1){return"Pending"}else if(e==2){return"Approved by Manager"}else if(e==3){return"Approved by Director"}else{return"Rejected"}},dateFormatter:function(e){var t=new Date(e);var r=sap.ui.core.format.DateFormat.getDateInstance({pattern:"YYYY-MM-dd"});var s=r.format(t);return s},objectFormatter:function(e){if(e==2||e==3){return"Success"}else if(e==1){return"Warning"}else{return"Error"}},onSelectionChange:function(e){console.log(e.getParameters("selected"))}})});