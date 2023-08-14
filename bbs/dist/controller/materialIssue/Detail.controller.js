sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/model/json/JSONModel","sap/m/Dialog","sap/m/Button","sap/m/library","sap/m/Text","sap/ui/core/library"],function(e,t,s,a,o,i,r,l){"use strict";var n=i.ButtonType;var u=i.DialogType;var g=l.ValueState;return e.extend("frontend.bbs.controller.materialIssue.Detail",{onInit:async function(){var e=this.getOwnerComponent();this.oRouter=e.getRouter();this.oRouter.getRoute("materialIssueDetail").attachPatternMatched(this._onObjectMatched,this)},_onObjectMatched:async function(e){this.getView().byId("materialIssueLineTableID").setBusy(true);var t=new s({showFooter:false,editable:false,resubmit:false});this.getView().setModel(t,"viewModel");var a=new s;this.getView().setModel(a,"accounts");var o=new s;o.setSizeLimit(5e3);this.getView().setModel(o,"items");this.getView().byId("materialIssuePageID").setBusy(true);var i=jQuery.sap.storage(jQuery.sap.storage.Type.local);this.oJWT=i.get("jwt");var r=new s;await r.loadData(backendUrl+"checkToken",null,true,"POST",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().bindElement({path:"/value/"+window.decodeURIComponent(e.getParameter("arguments").ID),model:"materialIssue"});var l=e.getParameter("arguments").ID;if(l===undefined){var n=window.location.href;var u=n.split("/");l=u[u.length-1]}const g=new s;g.loadData(backendUrl+"materialIssue/getMaterialIssueById?code="+l,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(g,"materialIssueDetailModel");var c=new s;c.loadData(backendUrl+"budget/getApprovedBudget",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(c,"budgeting");g.dataLoaded().then(function(){var e=r.getData();var o=this.getView().getModel("materialIssueDetailModel").getData();if(e.user.role_id==4){t.setProperty("/is_approver",true);t.setProperty("/is_requestor",false);if(o.U_Status==2){t.setProperty("/showFooter",true)}}else if(e.user.role_id==5){t.setProperty("/is_approver",true);t.setProperty("/is_requestor",false);if(o.U_Status==1){t.setProperty("/showFooter",true)}}else if(e.user.role_id==3){t.setProperty("/is_approver",false);t.setProperty("/is_requestor",true);t.setProperty("/resubmit",false);if(o.U_Status==4){t.setProperty("/resubmit",true)}if(o.U_Status==4||o.U_Status==1){t.setProperty("/showFooter",true);t.setProperty("/editable",true)}}const i=new s;i.loadData(backendUrl+"budget/getBudgetById?code="+o.U_BudgetCode,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getOwnerComponent().setModel(i,"budget");a.loadData(backendUrl+"coa/getCOAsByBudget?budgetCode="+o.U_BudgetCode,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});a.refresh();var l=this.getView().byId("materialIssueLineTableID");var n=this.getView().getModel("items");n.setProperty("/data",[]);var u=n.getData();var g=new s;var c=[];console.log(o.MATERIALISSUELINESCollection);for(let e=0;e<o.MATERIALISSUELINESCollection.length;e++){if(!(o.MATERIALISSUELINESCollection[e].U_AccountCode.toString()in c)){c.push(o.MATERIALISSUELINESCollection[e].U_AccountCode)}}var d=[...new Set(c)];for(let e=0;e<d.length;e++){this.getView().byId("materialIssuePageID").setBusy(true);g.loadData(backendUrl+"items/getItemsByAccount?accountCode="+d[e],null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});g.dataLoaded().then(function(){var t=g.getData();u.data[d[e]]=t;var s=new sap.ui.model.json.JSONModel(u);this.getView().setModel(s,"items");s.refresh();this.getView().byId("materialIssuePageID").setBusy(false)}.bind(this))}for(let e=0;e<o.MATERIALISSUELINESCollection.length;e++){l.getRows()[e].getCells()[1].setBusy(true);let t=o.MATERIALISSUELINESCollection[e].U_AccountCode.toString();l.getRows()[e].getCells()[1].bindAggregation("items",{path:"items>/data/"+t,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})});l.getRows()[e].getCells()[1].setBusy(false)}}.bind(this));this.getView().byId("materialIssueLineTableID").setBusy(false)},onNavBack:function(){var e=t.getInstance();var s=e.getPreviousHash();if(s!==undefined){window.history.go(-1)}else{var a=this.getOwnerComponent().getRouter();a.navTo("dashboard",{},true)}},onApproveButtonClick:function(e){var t=this.getView().byId("materialIssuePageID");var s=this.getView().getModel("viewModel");t.setBusy(true);var i=this.getView().byId("_IDGenText101").getText();const l=this.getView().getModel("materialIssueDetailModel");var c=l.getProperty("/");var d=this.getView();var h=this.oDialog;var I=this.oJWT;$.ajax({type:"POST",data:JSON.stringify(c),headers:{Authorization:"Bearer "+I},crossDomain:true,url:backendUrl+"materialIssue/approveMI",contentType:"application/json",success:function(e,i,l){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:u.Message,title:"Success",state:g.Success,content:new r({text:"Material Issue approved"}),beginButton:new o({type:n.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})});s.setProperty("/showFooter",false)}this.oSuccessMessageDialog.open()},error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onSaveButtonClick:function(e){var t=this.getView().byId("materialIssuePageID");t.setBusy(true);var s=this.getView().getModel("materialIssueDetailModel");var i=JSON.stringify(s.getData());var l=this.oJWT;$.ajax({type:"POST",data:i,headers:{Authorization:"Bearer "+l},crossDomain:true,url:backendUrl+"materialIssue/saveMI",contentType:"application/json",success:function(e,s,i){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:u.Message,title:"Success",state:g.Success,content:new r({text:"Material Issue saved"}),beginButton:new o({type:n.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onDelete:function(e){var t=e.getParameters().row;var s=t.getIndex();var a=this.getView().getModel("materialIssueDetailModel");var o=a.getData().MATERIALISSUELINESCollection;o.splice(s,1);a.setProperty("/MATERIALISSUELINESCollection",o);a.refresh()},onBudgetChange:async function(e){var t=e.getSource(),s=t.getSelectedKey(),a=t.getValue();if(!s&&a){t.setValueState(g.Error);t.setValueStateText("Please enter a valid Budget Code")}else{t.setValueState(g.None)}if(t.getValueState()==g.None){this.getView().byId("materialIssuePageID").setBusy(true);var o=this.getView().getModel("accounts");o.loadData(backendUrl+"coa/getCOAsByBudget?budgetCode="+s,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});o.refresh();var i=this.getView().getModel("materialIssueDetailModel");i.setProperty("/MATERIALISSUELINESCollection",[]);i.refresh();var r=parseInt(e.getParameters("selectedItem").value);var l=this.getView().getModel("budget");await l.loadData(backendUrl+"budget/getBudgetById?code="+r,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});l.refresh();this.getView().byId("materialIssuePageID").setBusy(false)}},onRejectButtonClick:function(e){if(!this.rejectMaterialIssueDialog){this.rejectMaterialIssueDialog=this.loadFragment({name:"frontend.bbs.view.materialIssue.RejectForm"})}this.rejectMaterialIssueDialog.then(function(e){this.oDialog=e;this.oDialog.open()}.bind(this))},_closeDialog:function(){this.oDialog.close()},onConfirmRejectClick:function(){var e=this.getView().byId("materialIssuePageID");var t=this.getView().getModel("materialIssueDetailModel").getData();e.setBusy(true);var s=this.getView().byId("rejectDialog");var i=t.Code;var l=this.getView().byId("RejectionRemarksID").getValue();var c=this.getView().getModel("viewModel");$.ajax({type:"POST",data:{Code:i,Remarks:l},headers:{Authorization:"Bearer "+this.oJWT},crossDomain:true,url:backendUrl+"materialIssue/rejectMI",success:function(t,i,l){s.close();e.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:u.Message,title:"Success",state:g.Success,content:new r({text:"Material Issue rejected"}),beginButton:new o({type:n.Emphasized,text:"OK",press:function(){c.setProperty("/showFooter",false);this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()}.bind(this),error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onResubmitButtonClick:function(e){var t=this.getView().byId("materialIssuePageID");t.setBusy(true);var s=this.getView().getModel("materialIssueDetailModel");var i=JSON.stringify(s.getData());var l=this.oJWT;var c=this.getView().getModel("viewModel");$.ajax({type:"POST",data:i,headers:{Authorization:"Bearer "+l},crossDomain:true,url:backendUrl+"materialIssue/resubmitMI",contentType:"application/json",success:function(e,s,i){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:u.Message,title:"Success",state:g.Success,content:new r({text:"Material Issue resubmitted"}),beginButton:new o({type:n.Emphasized,text:"OK",press:function(){c.setProperty("/showFooter",false);c.setProperty("/editable",false);this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onAddPress:function(e){const t=this.getView().getModel("materialIssueDetailModel");var s=t.getData();var a={U_AccountCode:"",U_ItemCode:"",U_Qty:""};console.log(s);s.MATERIALISSUELINESCollection.push(a);var o=new sap.ui.model.json.JSONModel(s);this.getView().setModel(o,"materialIssueDetailModel");o.refresh()},onAccountCodeChange:async function(e){var t=e.getSource().getSelectedKey();var a=e.getSource().getParent();a.getCells()[1].setBusy(true);a.getCells()[1].setSelectedKey("");a.getCells()[1].setEnabled(true);a.getCells()[1].setEnabled(true);var o=this.getView().getModel("items");var i=o.getData();if(!(t.toString()in i)){var r=new s;await r.loadData(backendUrl+"items/getItemsByAccount?accountCode="+t+"",null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var l=r.getData();i[t]=l;var n=new sap.ui.model.json.JSONModel(i);this.getView().setModel(n,"items");n.refresh()}a.getCells()[1].bindAggregation("items",{path:"items>/"+t,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})});a.getCells()[1].setBusy(false)},objectFormatter:function(e){if(e==1){return"Warning"}else if(e==2){return"Information"}else if(e==3){return"Success"}else{return"Error"}},textFormatter:function(e){if(e==1){return"Pending"}else if(e==2){return"Approved by Manager"}else if(e==3){return"Approved by Director"}else{return"Rejected"}}})});