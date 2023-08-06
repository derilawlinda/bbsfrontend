sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/model/json/JSONModel","sap/m/Dialog","sap/m/Button","sap/m/library","sap/m/Text","sap/ui/core/library"],function(e,t,s,a,o,i,r,n){"use strict";var l=i.ButtonType;var u=i.DialogType;var d=n.ValueState;return e.extend("frontend.bbs.controller.advanceEmployee.Detail",{onInit:async function(){var e=this.getOwnerComponent();this.oRouter=e.getRouter();this.oRouter.getRoute("advanceEmployeeDetail").attachPatternMatched(this._onObjectMatched,this);var t=new s(sap.ui.require.toUrl("frontend/bbs/model/items.json"));this.getView().setModel(t,"items")},_onObjectMatched:async function(e){var t=new s({showFooter:false,editable:true,resubmit:false,is_finance:false});this.getView().setModel(t,"viewModel");this.getView().byId("advanceRequestPageId").setBusy(true);var a=jQuery.sap.storage(jQuery.sap.storage.Type.local);this.oJWT=a.get("jwt");var o=new s;await o.loadData(backendUrl+"checkToken",null,true,"POST",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().bindElement({path:"/value/"+window.decodeURIComponent(e.getParameter("arguments").ID),model:"advanceRequest"});var i=e.getParameter("arguments").ID;if(i===undefined){var r=window.location.href;var n=r.split("/");i=n[n.length-1]}const l=new s;l.loadData(backendUrl+"advanceRequest/getAdvanceRequestById?code="+i,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(l,"advanceRequestDetailModel");var u=new s;u.loadData(backendUrl+"budget/getApprovedBudget",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getOwnerComponent().setModel(u,"budgeting");l.dataLoaded().then(function(){var e=o.getData();var a=this.getView().getModel("advanceRequestDetailModel").getData();if(e.user.role_id==4){t.setProperty("/editable",false);t.setProperty("/is_approver",true);t.setProperty("/is_requestor",false);if(a.U_Status==2){t.setProperty("/showFooter",true)}}else if(e.user.role_id==5){t.setProperty("/editable",false);t.setProperty("/is_approver",true);t.setProperty("/is_requestor",false);if(a.U_Status==1){t.setProperty("/showFooter",true)}}else if(e.user.role_id==3){t.setProperty("/is_approver",false);t.setProperty("/is_requestor",true);t.setProperty("/resubmit",false);if(a.U_Status==4){t.setProperty("/resubmit",true)}if(a.U_Status==4||a.U_Status==1){t.setProperty("/showFooter",true);t.setProperty("/editable",true)}}else if(e.user.role_id==2){t.setProperty("/is_finance",true);t.setProperty("/is_approver",false);t.setProperty("/is_requestor",false);t.setProperty("/editable",false);if(a.U_Status!=3){t.setProperty("/showFooter",false)}}var i=new s;i.loadData(backendUrl+"coa/getCOAsByBudget?budgetCode="+a.U_BudgetCode,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(i,"accounts");const r=new s;r.loadData(backendUrl+"budget/getBudgetById?code="+a.U_BudgetCode,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getOwnerComponent().setModel(r,"budget");r.dataLoaded().then(function(){var e=r.getData();console.log(e);var t=e.U_TotalAmount;var s=e.BUDGETUSEDCollection;let a=0;if(s.length>0){for(let e=0;e<s.length;e++){a+=s[e]["U_Amount"]}}e.U_RemainingBudget=t-a;var o=this.getView().getModel("budget");o.setData(e);this.getView().byId("advanceRequestPageId").setBusy(false)}.bind(this));var n=this.getView().byId("advanceRequestLineTableID");var l=this.getView().getModel("items");l.setProperty("/data",[]);var u=l.getData();var d=new s;var c=[];for(let e=0;e<a.ADVANCEREQLINESCollection.length;e++){if(!(a.ADVANCEREQLINESCollection[e].U_AccountCode.toString()in c)){c.push(a.ADVANCEREQLINESCollection[e].U_AccountCode)}}var g=[...new Set(c)];for(let e=0;e<g.length;e++){this.getView().byId("advanceRequestPageId").setBusy(true);d.loadData(backendUrl+"items/getItemsByAccount?accountCode="+g[e],null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});d.dataLoaded().then(function(){var t=d.getData();u.data[g[e]]=t;var s=new sap.ui.model.json.JSONModel(u);this.getView().setModel(s,"items");s.refresh();this.getView().byId("advanceRequestPageId").setBusy(false)}.bind(this))}for(let e=0;e<a.ADVANCEREQLINESCollection.length;e++){n.getRows()[e].getCells()[1].setBusy(true);let t=a.ADVANCEREQLINESCollection[e].U_AccountCode.toString();n.getRows()[e].getCells()[1].bindAggregation("items",{path:"items>/data/"+t,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})});n.getRows()[e].getCells()[1].setBusy(false)}}.bind(this))},onAccountCodeChange:async function(e){var t=e.getSource().getSelectedKey();var a=e.getSource().getParent();a.getCells()[1].setBusy(true);a.getCells()[1].setSelectedKey("");a.getCells()[1].setEnabled(true);a.getCells()[1].setEnabled(true);var o=this.getView().getModel("items");var i=o.getData();if(!(t.toString()in i)){var r=new s;await r.loadData(backendUrl+"items/getItemsByAccount?accountCode="+t+"",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var n=r.getData();i[t]=n;var l=new sap.ui.model.json.JSONModel(i);this.getView().setModel(l,"items");l.refresh()}a.getCells()[1].bindAggregation("items",{path:"items>/"+t,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})});a.getCells()[1].setBusy(false)},onAmountChange:function(e){const t=this.getView().getModel("advanceRequestDetailModel");const s=this.getView().getModel("viewModel");var a=this.getView().getModel("budget").getData();console.log(a);var o=t.getData().ADVANCEREQLINESCollection;let i=0;for(let e=0;e<o.length;e++){i+=o[e]["U_Amount"]}const r=this.getView().getModel("advanceRequestDetailModel");r.setProperty("/U_Amount",i);var n=a.U_RemainingBudget;if(i>n){this.getView().byId("advanceAmount").setState(d.Error);this.getView().byId("resubmitButton").setEnabled(false);this.getView().byId("submitButton").setEnabled(false);s.setProperty("/amountExceeded","Advance Amount exceeded Budget!")}else{this.getView().byId("advanceAmount").setState(d.None);this.getView().byId("resubmitButton").setEnabled(true);this.getView().byId("submitButton").setEnabled(true);s.setProperty("/amountExceeded","")}},onBudgetChange:async function(e){this.getView().byId("createARForm").setBusy(true);var t=parseInt(e.getParameters("selectedItem").value);var s=this.getView().getModel("budget");await s.loadData(backendUrl+"budget/getBudgetById?code="+t,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});s.refresh();var a=this.getView().getModel("accounts");a.loadData(backendUrl+"coa/getCOAsByBudget?budgetCode="+t,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});a.refresh();const o=this.getView().getModel("advanceRequestDetailModel");o.setProperty("/U_Amount",0);var i=s.getData();var r=i.U_TotalAmount;var n=i.BUDGETUSEDCollection;let l=0;if(n.length>0){for(let e=0;e<n.length;e++){l+=n[e]["U_Amount"]}}var u=r-l;i.U_RemainingBudget=u;s.setData(i);s.refresh();var d=this.getView().getModel("advanceRequestDetailModel");d.setProperty("/ADVANCEREQLINESCollection",[]);d.refresh();this.onAmountChange();this.getView().byId("createARForm").setBusy(false)},onApproveButtonClick:function(){var e=this.getView().byId("advanceRequestPageId");var t=this.getView().getModel("viewModel");var s=this.getView().byId("_IDGenText101").getText();const i=this.getView().getModel("advanceRequestDetailModel");var n=this.getView().getModel("budget").getData();i.setProperty("/budgeting",n);var c=i.getProperty("/");var g=this.getView();var h=this.oDialog;var v=this.oJWT;$.ajax({type:"POST",data:JSON.stringify(c),headers:{Authorization:"Bearer "+v},crossDomain:true,url:backendUrl+"advanceRequest/approveAR",contentType:"application/json",success:function(e,t,s){if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:u.Message,title:"Success",state:d.Success,content:new r({text:"Advance Request approved"}),beginButton:new o({type:l.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onNavBack:function(){var e=t.getInstance();var s=e.getPreviousHash();if(s!==undefined){window.history.go(-1)}else{var a=this.getOwnerComponent().getRouter();a.navTo("dashboard",{},true)}},onAddPress:function(e){const t=this.getView().getModel("advanceRequestDetailModel");var s=t.getData();var a={U_AccountCode:"",U_ItemCode:"",U_Amount:""};s.ADVANCEREQLINESCollection.push(a);var o=new sap.ui.model.json.JSONModel(s);this.getView().setModel(o,"advanceRequestDetailModel");o.refresh()},onDelete:function(e){var t=e.getParameters().row;var s=t.getIndex();var a=this.getView().getModel("advanceRequestDetailModel");var o=a.getData().ADVANCEREQLINESCollection;o.splice(s,1);a.setProperty("/ADVANCEREQLINESCollection",o);a.refresh();this.onAmountChange()},onSaveButtonClick:function(e){var t=this.getView().byId("advanceRequestPageId");t.setBusy(true);var s=this.getView().getModel("advanceRequestDetailModel");var i=JSON.stringify(s.getData());var n=this.oJWT;$.ajax({type:"POST",data:i,headers:{Authorization:"Bearer "+n},crossDomain:true,url:backendUrl+"advanceRequest/saveAR",contentType:"application/json",success:function(e,s,i){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:u.Message,title:"Success",state:d.Success,content:new r({text:"Advance Request saved"}),beginButton:new o({type:l.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onRejectButtonClick:function(e){if(!this.rejectAdvanceRequestDialog){this.rejectAdvanceRequestDialog=this.loadFragment({name:"frontend.bbs.view.advanceEmployee.RejectForm"})}this.rejectAdvanceRequestDialog.then(function(e){this.oDialog=e;this.oDialog.open()}.bind(this))},_closeDialog:function(){this.oDialog.close()},onConfirmRejectClick:function(){var e=this.getView().byId("advanceRequestPageId");var t=this.getView().getModel("advanceRequestDetailModel").getData();e.setBusy(true);var s=this.getView().byId("rejectDialog");var i=t.Code;var n=this.getView().byId("RejectionRemarksID").getValue();var c=this.getView().getModel("viewModel");$.ajax({type:"POST",data:{Code:i,Remarks:n},headers:{Authorization:"Bearer "+this.oJWT},crossDomain:true,url:backendUrl+"advanceRequest/rejectAR",success:function(t,i,n){s.close();e.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:u.Message,title:"Success",state:d.Success,content:new r({text:"Advance Request rejected"}),beginButton:new o({type:l.Emphasized,text:"OK",press:function(){c.setProperty("/showFooter",false);this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()}.bind(this),error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onResubmitButtonClick:function(e){var t=this.getView().byId("advanceRequestPageId");t.setBusy(true);var s=this.getView().getModel("advanceRequestDetailModel");var i=JSON.stringify(s.getData());var n=this.oJWT;var c=this.getView().getModel("viewModel");$.ajax({type:"POST",data:i,headers:{Authorization:"Bearer "+n},crossDomain:true,url:backendUrl+"advanceRequest/resubmitAR",contentType:"application/json",success:function(e,s,i){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:u.Message,title:"Success",state:d.Success,content:new r({text:"Advance Request resubmitted"}),beginButton:new o({type:l.Emphasized,text:"OK",press:function(){c.setProperty("/showFooter",false);c.setProperty("/editable",false);this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,t,s){console.log("Got an error response: "+t+s)}})}})});