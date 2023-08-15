sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/m/library","sap/m/MessageToast","sap/ui/model/json/JSONModel","sap/ui/core/library"],function(e,t,a,o,r,s){"use strict";var n=a.ButtonType;var i=a.DialogType;var l=s.ValueState;return e.extend("frontend.bbs.controller.advanceEmployee.List",{onInit:function(){this.getView().byId("advanceEmployeeTableID").setBusy(true);var e=this.getRouter().getHashChanger().getHash();var t=jQuery.sap.storage(jQuery.sap.storage.Type.local);this.oJWT=t.get("jwt");var a=new r;a.loadData(backendUrl+"advanceRequest/getAdvanceRequests",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getOwnerComponent().setModel(a,"advanceRequests");a.dataLoaded().then(function(){this.getView().byId("advanceEmployeeTableID").setBusy(false)}.bind(this));var o=new r(sap.ui.require.toUrl("frontend/bbs/model/sales_order.json"));this.getView().setModel(o,"salesOrder");var s=new r(sap.ui.require.toUrl("frontend/bbs/model/companies.json"));this.getView().setModel(s,"companies");var n=new r;this.getView().setModel(n,"items");this.getView().getModel("items").setProperty("/data",[]);var i=new sap.ui.model.json.JSONModel;var l=new sap.ui.model.json.JSONModel({showCreateButton:true,is_approver:false});this.getView().setModel(l,"viewModel");this.getView().setModel(i,"advanceRequestHeader");var d=new sap.ui.model.json.JSONModel({U_RemainingBudget:0});this.getView().setModel(d,"budgetHeader");var u=new r;u.loadData(backendUrl+"budget/getApprovedBudget",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(u,"budgeting");var g=new sap.ui.model.json.JSONModel;this.getView().setModel(g,"new_ar_items");this.getView().getModel("new_ar_items").setProperty("/ADVANCEREQLINESCollection",[]);var c=this.getOwnerComponent().getModel("userModel");if(c===undefined){const e=this.getOwnerComponent().getEventBus();e.subscribe("username","checktoken",this.toggleCreateButton,this)}else{var h=c.getData();var m={userName:h.user.name,roleId:h.user.role_id,roleName:h.role[0].name,status:"success"};this.toggleCreateButton("username","checkToken",m)}},toggleCreateButton:function(e,t,a){if(a.roleId==4||a.roleId==5){this.getView().getModel("viewModel").setProperty("/showCreateButton",false);this.getView().getModel("viewModel").setProperty("/is_approver",true)}},onCreateButtonClick:function(e){if(!this.createEmployeeAdvanceDialog){this.createEmployeeAdvanceDialog=this.loadFragment({name:"frontend.bbs.view.advanceEmployee.CreateForm"})}this.createEmployeeAdvanceDialog.then(function(e){var t=new sap.ui.model.json.JSONModel({Date:new Date});this.getView().setModel(t,"createFragmentViewModel");var a=this.getView().getModel("budgetHeader");a.setData([]);var o=new sap.ui.model.json.JSONModel;this.getView().setModel(o,"advanceRequestHeader");var r=new sap.ui.model.json.JSONModel;this.getView().setModel(r,"new_ar_items");this.getView().getModel("new_ar_items").setProperty("/ADVANCEREQLINESCollection",[]);this.oDialog=e;this.oDialog.open()}.bind(this))},getRouter:function(){return sap.ui.core.UIComponent.getRouterFor(this)},onNavBack:function(e){var a,o;a=t.getInstance();o=a.getPreviousHash();if(o!==undefined){window.history.go(-1)}else{this.getRouter().navTo("login",{},true)}},_closeDialog:function(){this.oDialog.close()},buttonFormatter:function(e){if(e==2||e==3){return"Accept"}else if(e==1){return"Attention"}else{return"Reject"}},objectFormatter:function(e){if(e==1){return"Warning"}else if(e==2){return"Information"}else if(e==3){return"Success"}else if(e==5){return"Information"}else{return"Error"}},textFormatter:function(e){if(e==1){return"Pending"}else if(e==2){return"Approved by Manager"}else if(e==3){return"Approved by Director"}else if(e==5){return"Transferred"}else{return"Rejected"}},dateFormatter:function(e){var t=new Date(e);var a=sap.ui.core.format.DateFormat.getDateInstance({pattern:"YYYY-MM-dd"});var o=a.format(t);return o},onBudgetChange:async function(e){var t=e.getSource(),a=t.getSelectedKey(),o=t.getValue();if(!a&&o){t.setValueState(l.Error);t.setValueStateText("Please enter a valid Budget Code")}else{t.setValueState(l.None)}if(t.getValueState()==l.None){this.getView().byId("createARForm").setBusy(true);this.getView().byId("ARItemsTableID").setBusy(true);this.getView().getModel("new_ar_items").setProperty("/ADVANCEREQLINESCollection",[]);var s=parseInt(e.getParameters("selectedItem").value);var n=new r;await n.loadData(backendUrl+"budget/getBudgetById?code="+s,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var i=new r;await i.loadData(backendUrl+"coa/getCOAsByBudget?budgetCode="+s,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(i,"accounts");var n=new r;await n.loadData(backendUrl+"budget/getBudgetById?code="+s,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var d=n.getData();var u=d.U_TotalAmount;var g=d.BUDGETUSEDCollection;let t=0;for(let e=0;e<g.length;e++){t+=g[e]["U_Amount"]}d.U_RemainingBudget=u-t;var c=this.getView().getModel("budgetHeader");c.setData(d);this.getView().byId("createARForm").setBusy(false);this.getView().byId("ARItemsTableID").setBusy(false)}},onPress:function(e){var t=this.getOwnerComponent().getRouter();var a=e.getSource();var o=a.getCells()[0].getText();t.navTo("advanceEmployeeDetail",{ID:o})},onAccountCodeChange:async function(e){var t=e.getSource().getSelectedKey();var a=e.getSource().getParent();a.getCells()[1].setBusy(true);a.getCells()[1].setSelectedKey("");a.getCells()[1].setEnabled(true);a.getCells()[1].setEnabled(true);var o=this.getView().getModel("items");var s=o.getData();if(!(t in s)){var n=new r;await n.loadData(backendUrl+"items/getItemsByAccount?accountCode="+t+"",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var i=n.getData();s[t]=i;var l=new sap.ui.model.json.JSONModel(s);this.getView().setModel(l,"items");l.refresh()}a.getCells()[1].bindAggregation("items",{path:"items>/"+t,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})});a.getCells()[1].setBusy(false)},onAddPress:function(e){const t=this.getView().getModel("new_ar_items");var a=t.getData();var o={U_AccountCode:"",U_ItemCode:"",U_Amount:""};a.ADVANCEREQLINESCollection.push(o);var r=new sap.ui.model.json.JSONModel(a);this.getView().setModel(r,"new_ar_items");r.refresh()},onDelete:function(e){var t=e.getParameters().row;var a=t.getIndex();var o=this.getView().getModel("new_ar_items");var r=o.getData().ADVANCEREQLINESCollection;r.splice(a,1);o.setProperty("/ADVANCEREQLINESCollection",r);o.refresh();this.onAmountChange()},onSaveButtonClick:function(e){var t=this.oDialog;t.setBusy(true);var a=this.getView().getModel("advanceRequests");const r=this.getView().getModel("advanceRequestHeader");const s=this.getView().getModel("new_ar_items");r.setProperty("/ADVANCEREQLINESCollection",s.getData().ADVANCEREQLINESCollection);var n=r.getProperty("/");var i=this.getView();var l=this.oJWT;$.ajax({type:"POST",data:JSON.stringify(n),crossDomain:true,headers:{Authorization:"Bearer "+l},url:backendUrl+"advanceRequest/createAdvanceRequest",contentType:"application/json",success:function(e,r,s){t.setBusy(false);t.close();a.loadData(backendUrl+"advanceRequest/getAdvanceRequests",null,true,"GET",false,false,{Authorization:"Bearer "+l});o.show("Advance Request created");$(".sapMMessageToast").css({"background-color":"#256f3a",color:"white"});i.getModel("advanceRequests").refresh()},error:function(e,t,a){console.log("Got an error response: "+t+a)}})},onAmountChange:function(e){const t=this.getView().getModel("new_ar_items");var a=t.getData().ADVANCEREQLINESCollection;const o=this.getView().getModel("createFragmentViewModel");var r=this.getView().getModel("budgetHeader").getData();const s=this.getView().getModel("advanceRequestHeader");let n=0;for(let e=0;e<a.length;e++){n+=a[e]["U_Amount"]}s.setProperty("/U_Amount",n);var i=r.U_RemainingBudget;if(n>i){o.setProperty("/is_amountExceeded",true);o.setProperty("/createButtonEnabled",false);o.setProperty("/amountExceeded","Advance Amount exceeded Budget!")}else{o.setProperty("/is_amountExceeded",false);o.setProperty("/createButtonEnabled",true);o.setProperty("/amountExceeded","")}}})});