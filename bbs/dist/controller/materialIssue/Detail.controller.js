sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/model/json/JSONModel","sap/m/Dialog","sap/m/Button","sap/m/library","sap/m/Text","sap/ui/core/library"],function(e,t,s,a,o,i,r,n){"use strict";var l=i.ButtonType;var u=i.DialogType;var c=n.ValueState;return e.extend("frontend.bbs.controller.materialIssue.Detail",{onInit:async function(){var e=this.getOwnerComponent();this.oRouter=e.getRouter();this.oRouter.getRoute("materialIssueDetail").attachPatternMatched(this._onObjectMatched,this)},_onObjectMatched:async function(e){this.getView().byId("materialIssueLineTableID").setBusy(true);var t=new s({showFooter:false,editable:false,resubmit:false});this.getView().setModel(t,"viewModel");var a=new s;this.getView().setModel(a,"accounts");var o=new s;o.setSizeLimit(5e3);this.getView().setModel(o,"items");this.getView().byId("materialIssuePageID").setBusy(true);var i=jQuery.sap.storage(jQuery.sap.storage.Type.local);this.oJWT=i.get("jwt");this.company=i.get("company");var r=new s;await r.loadData(backendUrl+"checkToken",null,true,"POST",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().bindElement({path:"/value/"+window.decodeURIComponent(e.getParameter("arguments").ID),model:"materialIssue"});var n=e.getParameter("arguments").ID;if(n===undefined){var l=window.location.href;var u=l.split("/");n=u[u.length-1]}const c=new s;c.loadData(backendUrl+"materialIssue/getMaterialIssueById",{code:n,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(c,"materialIssueDetailModel");var g=new s;g.setSizeLimit(500);g.loadData(backendUrl+"budget/getApprovedBudget",{company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(g,"budgeting");c.dataLoaded().then(function(){var e=r.getData();var o=this.getView().getModel("materialIssueDetailModel").getData();if(e.user.role_id==4){t.setProperty("/is_approver",true);t.setProperty("/is_requestor",false);if(o.U_Status==2){t.setProperty("/showFooter",true)}}else if(e.user.role_id==5){t.setProperty("/is_approver",true);t.setProperty("/is_requestor",false);if(o.U_Status==1){t.setProperty("/showFooter",true)}}else if(e.user.role_id==3){t.setProperty("/is_approver",false);t.setProperty("/is_requestor",true);t.setProperty("/resubmit",false);if(o.U_Status==4){t.setProperty("/resubmit",true)}if(o.U_Status==4||o.U_Status==1){t.setProperty("/showFooter",true);t.setProperty("/editable",true)}}const i=new s;i.loadData(backendUrl+"budget/getBudgetById",{code:o.U_BudgetCode,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getOwnerComponent().setModel(i,"budget");a.loadData(backendUrl+"coa/getCOAsByBudget",{budgetCode:o.U_BudgetCode,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});a.refresh();var n=this.getView().byId("materialIssueLineTableID");var l=this.getView().getModel("items");l.setProperty("/data",[]);var u=l.getData();var c=new s;var g=[];console.log(o.MATERIALISSUELINESCollection);for(let e=0;e<o.MATERIALISSUELINESCollection.length;e++){if(!(o.MATERIALISSUELINESCollection[e].U_AccountCode.toString()in g)){g.push(o.MATERIALISSUELINESCollection[e].U_AccountCode)}}var d=[...new Set(g)];for(let e=0;e<d.length;e++){this.getView().byId("materialIssuePageID").setBusy(true);c.loadData(backendUrl+"items/getItemsByAccount?accountCode=",{company:this.company,accountCode:d[e]},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});c.setSizeLimit(5e3);c.dataLoaded().then(function(){var t=c.getData();u.data[d[e]]=t;var s=new sap.ui.model.json.JSONModel(u);s.setSizeLimit(5e3);this.getView().setModel(s,"items");s.refresh();this.getView().byId("materialIssuePageID").setBusy(false)}.bind(this))}for(let e=0;e<o.MATERIALISSUELINESCollection.length;e++){n.getRows()[e].getCells()[1].setBusy(true);let t=o.MATERIALISSUELINESCollection[e].U_AccountCode.toString();n.getRows()[e].getCells()[1].bindAggregation("items",{path:"items>/data/"+t,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})});n.getRows()[e].getCells()[1].setBusy(false)}}.bind(this));this.getView().byId("materialIssueLineTableID").setBusy(false)},onNavBack:function(){var e=t.getInstance();var s=e.getPreviousHash();if(s!==undefined){window.history.go(-1)}else{var a=this.getOwnerComponent().getRouter();a.navTo("dashboard",{},true)}},onApproveButtonClick:function(e){var t=this.getView().byId("materialIssuePageID");var s=this.getView().getModel("viewModel");t.setBusy(true);var i=this.getView().byId("_IDGenText101").getText();const n=this.getView().getModel("materialIssueDetailModel");var g=n.getProperty("/");var d=this.getView();var h=this.oDialog;var p=this.oJWT;$.ajax({type:"POST",data:JSON.stringify({company:this.company,oProperty:g}),headers:{Authorization:"Bearer "+p},crossDomain:true,url:backendUrl+"materialIssue/approveMI",contentType:"application/json",success:function(e,i,n){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:u.Message,title:"Success",state:c.Success,content:new r({text:"Material Issue approved"}),beginButton:new o({type:l.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})});s.setProperty("/showFooter",false)}this.oSuccessMessageDialog.open()},error:function(e,s,i){t.setBusy(false);if(!this.oErrorDialog){this.oErrorDialog=new a({type:u.Message,title:"Error",state:c.Error,content:new r({text:e.responseJSON.msg}),beginButton:new o({type:l.Emphasized,text:"OK",press:function(){this.oErrorDialog.close()}.bind(this)})})}this.oErrorDialog.open()}})},onSaveButtonClick:function(e){var t=this.getView().byId("materialIssuePageID");t.setBusy(true);var s=this.getView().getModel("materialIssueDetailModel");var i=JSON.stringify({company:this.company,data:s.getData()});var n=this.oJWT;$.ajax({type:"POST",data:i,headers:{Authorization:"Bearer "+n},crossDomain:true,url:backendUrl+"materialIssue/saveMI",contentType:"application/json",success:function(e,s,i){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:u.Message,title:"Success",state:c.Success,content:new r({text:"Material Issue saved"}),beginButton:new o({type:l.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,s,i){t.setBusy(false);if(!this.oErrorDialog){this.oErrorDialog=new a({type:u.Message,title:"Error",state:c.Error,content:new r({text:e.responseJSON.msg}),beginButton:new o({type:l.Emphasized,text:"OK",press:function(){this.oErrorDialog.close()}.bind(this)})})}this.oErrorDialog.open()}})},onDelete:function(e){var t=e.getParameters().row;var s=t.getIndex();var a=this.getView().getModel("materialIssueDetailModel");var o=a.getData().MATERIALISSUELINESCollection;o.splice(s,1);a.setProperty("/MATERIALISSUELINESCollection",o);a.refresh()},onBudgetChange:async function(e){var t=e.getSource(),s=t.getSelectedKey(),a=t.getValue();if(!s&&a){t.setValueState(c.Error);t.setValueStateText("Please enter a valid Budget Code")}else{t.setValueState(c.None)}if(t.getValueState()==c.None){this.getView().byId("materialIssuePageID").setBusy(true);var o=this.getView().getModel("accounts");o.loadData(backendUrl+"coa/getCOAsByBudget?",{company:this.company,budgetCode:s},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});o.refresh();var i=this.getView().getModel("materialIssueDetailModel");i.setProperty("/MATERIALISSUELINESCollection",[]);i.refresh();var r=parseInt(e.getParameters("selectedItem").value);var n=this.getView().getModel("budget");await n.loadData(backendUrl+"budget/getBudgetById?code="+r,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});n.refresh();this.getView().byId("materialIssuePageID").setBusy(false)}},onRejectButtonClick:function(e){if(!this.rejectMaterialIssueDialog){this.rejectMaterialIssueDialog=this.loadFragment({name:"frontend.bbs.view.materialIssue.RejectForm"})}this.rejectMaterialIssueDialog.then(function(e){this.oDialog=e;this.oDialog.open()}.bind(this))},_closeDialog:function(){this.oDialog.close()},onConfirmRejectClick:function(){var e=this.getView().byId("materialIssuePageID");var t=this.getView().getModel("materialIssueDetailModel").getData();e.setBusy(true);var s=this.getView().byId("rejectDialog");var i=t.Code;var n=this.getView().byId("RejectionRemarksID").getValue();var g=this.getView().getModel("viewModel");$.ajax({type:"POST",data:{Code:i,Remarks:n,company:this.company},headers:{Authorization:"Bearer "+this.oJWT},crossDomain:true,url:backendUrl+"materialIssue/rejectMI",success:function(t,i,n){s.close();e.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:u.Message,title:"Success",state:c.Success,content:new r({text:"Material Issue rejected"}),beginButton:new o({type:l.Emphasized,text:"OK",press:function(){g.setProperty("/showFooter",false);this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()}.bind(this),error:function(t,s,i){e.setBusy(false);if(!this.oErrorDialog){this.oErrorDialog=new a({type:u.Message,title:"Error",state:c.Error,content:new r({text:t.responseJSON.msg}),beginButton:new o({type:l.Emphasized,text:"OK",press:function(){this.oErrorDialog.close()}.bind(this)})})}this.oErrorDialog.open()}})},onResubmitButtonClick:function(e){var t=this.getView().byId("materialIssuePageID");t.setBusy(true);var s=this.getView().getModel("materialIssueDetailModel");var i=JSON.stringify({company:this.company,data:s.getData()});var n=this.oJWT;var g=this.getView().getModel("viewModel");$.ajax({type:"POST",data:i,headers:{Authorization:"Bearer "+n},crossDomain:true,url:backendUrl+"materialIssue/resubmitMI",contentType:"application/json",success:function(e,s,i){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:u.Message,title:"Success",state:c.Success,content:new r({text:"Material Issue resubmitted"}),beginButton:new o({type:l.Emphasized,text:"OK",press:function(){g.setProperty("/showFooter",false);g.setProperty("/editable",false);this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,s,i){t.setBusy(false);if(!this.oErrorDialog){this.oErrorDialog=new a({type:u.Message,title:"Error",state:c.Error,content:new r({text:e.responseJSON.msg}),beginButton:new o({type:l.Emphasized,text:"OK",press:function(){this.oErrorDialog.close()}.bind(this)})})}this.oErrorDialog.open()}})},onAddPress:function(e){const t=this.getView().getModel("materialIssueDetailModel");var s=t.getData();var a={U_AccountCode:"",U_ItemCode:"",U_Qty:""};console.log(s);s.MATERIALISSUELINESCollection.push(a);var o=new sap.ui.model.json.JSONModel(s);this.getView().setModel(o,"materialIssueDetailModel");o.refresh()},onAccountCodeChange:async function(e){var t=e.getSource().getSelectedKey();var a=e.getSource().getParent();a.getCells()[1].setBusy(true);a.getCells()[1].setSelectedKey("");a.getCells()[1].setEnabled(true);a.getCells()[1].setEnabled(true);var o=this.getView().getModel("items");var i=o.getData();if(!(t.toString()in i)){var r=new s;await r.loadData(backendUrl+"items/getItemsByAccount",{company:this.company,accountCode:t},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var n=r.getData();i[t]=n;var l=new sap.ui.model.json.JSONModel(i);this.getView().setModel(l,"items");l.setSizeLimit(5e3);l.refresh()}a.getCells()[1].bindAggregation("items",{path:"items>/"+t,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})});a.getCells()[1].setBusy(false)},objectFormatter:function(e){if(e==1){return"Warning"}else if(e==2){return"Information"}else if(e==3){return"Success"}else{return"Error"}},textFormatter:function(e){if(e==1){return"Pending"}else if(e==2){return"Approved by Manager"}else if(e==3){return"Approved by Director"}else{return"Rejected"}}})});