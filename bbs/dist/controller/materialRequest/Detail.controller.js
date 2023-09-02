sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/routing/History","sap/ui/model/json/JSONModel","sap/m/Dialog","sap/m/Button","sap/m/library","sap/m/Text","sap/ui/core/library"],function(e,t,s,a,o,i,r,n){"use strict";var l=i.ButtonType;var u=i.DialogType;var c=n.ValueState;return e.extend("frontend.bbs.controller.materialRequest.Detail",{onInit:async function(){var e=this.getOwnerComponent();this.oRouter=e.getRouter();this.oRouter.getRoute("materialRequestDetail").attachPatternMatched(this._onObjectMatched,this)},_onObjectMatched:function(e){var t=new s({showFooter:false,editable:false,resubmit:false});this.getView().setModel(t,"viewModel");var a=new s;a.setSizeLimit(999999);this.getView().setModel(a,"items");this.getView().byId("materialRequestPageID").setBusy(true);var o=jQuery.sap.storage(jQuery.sap.storage.Type.local);this.oJWT=o.get("jwt");this.company=o.get("company");var i=new s;this.getView().setModel(i,"accounts");this.materialRequestCode=e.getParameter("arguments").materialRequestID;var r=this.getOwnerComponent().getModel("userModel");if(r===undefined){const e=this.getOwnerComponent().getEventBus();e.subscribe("username","checktoken",this.buildForm,this)}else{var n=r.getData();var l={userName:n.user.name,roleId:n.user.role_id,roleName:n.role[0].name,status:"success"};this.buildForm("username","checkToken",l)}},buildForm:function(e,t,a){if(a.status=="error"){alert("Error");this.getView().byId("materialRequestPageID").setBusy(false)}var o=this.materialRequestCode;var i=this.getView().getModel("viewModel");if(this.materialRequestCode===undefined){var r=window.location.href;var n=r.split("/");this.materialRequestCode=n[n.length-1]}const l=new s;this.getView().setModel(l,"materialRequestDetailModel");l.loadData(backendUrl+"materialRequest/getMaterialRequestById",{code:this.materialRequestCode,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});l.dataLoaded().then(function(){var e=this.getView().getModel("materialRequestDetailModel").getData();var t=this.getView().byId("materialReqLineTableID");t.setVisibleRowCount(e.MATERIALREQLINESCollection.length);if(a.roleId==4){i.setProperty("/is_approver",true);i.setProperty("/is_requestor",false);if(e.U_Status==2){i.setProperty("/showFooter",true)}}else if(a.roleId==5){i.setProperty("/is_approver",true);i.setProperty("/is_requestor",false);if(e.U_Status==1){i.setProperty("/showFooter",true)}}else if(a.roleId==3){i.setProperty("/is_approver",false);i.setProperty("/is_requestor",true);i.setProperty("/resubmit",false);if(e.U_Status==4){i.setProperty("/resubmit",true)}if(e.U_Status==4||e.U_Status==1){i.setProperty("/showFooter",true);i.setProperty("/editable",true)}}let o=new s;this.getView().setModel(o,"budget");o.loadData(backendUrl+"budget/getBudgetById?",{code:e.U_BudgetCode,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var r=new s;r.loadData(backendUrl+"getBudget",{company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});this.getView().setModel(r,"budgeting");var n=this.getView().getModel("accounts");n.loadData(backendUrl+"coa/getCOAsByBudget?",{budgetCode:e.U_BudgetCode,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});n.refresh();var l=this.getView().getModel("items");l.setSizeLimit(999999);l.setProperty("/data",[]);var u=l.getData();var c=new s;c.setSizeLimit(999999);var g=[];if(e.MATERIALREQLINESCollection.length>0){for(let t=0;t<e.MATERIALREQLINESCollection.length;t++){if(e.MATERIALREQLINESCollection[t].U_AccountCode){if(!(e.MATERIALREQLINESCollection[t].U_AccountCode.toString()in g)){g.push(e.MATERIALREQLINESCollection[t].U_AccountCode)}}}var d=[...new Set(g)];for(let e=0;e<d.length;e++){this.getView().byId("materialRequestPageID").setBusy(true);c.loadData(backendUrl+"items/getItemsByAccount",{company:this.company,accountCode:d[e]},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});c.dataLoaded().then(function(){var t=c.getData();u.data[d[e]]=t;var s=new sap.ui.model.json.JSONModel(u);this.getView().setModel(s,"items");s.refresh();this.getView().byId("materialRequestPageID").setBusy(false)}.bind(this))}for(let s=0;s<e.MATERIALREQLINESCollection.length;s++){t.getRows()[s].getCells()[1].setBusy(true);if(e.MATERIALREQLINESCollection[s].U_AccountCode){let a=e.MATERIALREQLINESCollection[s].U_AccountCode.toString();t.getRows()[s].getCells()[1].bindAggregation("items",{path:"items>/data/"+a,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})})}t.getRows()[s].getCells()[1].setBusy(false)}}}.bind(this))},onNavBack:function(){var e=t.getInstance();var s=e.getPreviousHash();if(s!==undefined){window.history.go(-1)}else{var a=this.getOwnerComponent().getRouter();a.navTo("dashboard",{},true)}},onApproveButtonClick:function(){var e=this.getView().byId("materialRequestPageID");var t=this.getView().getModel("viewModel");e.setBusy(true);const s=this.getView().getModel("materialRequestDetailModel");var i=s.getProperty("/");var n=this.oJWT;$.ajax({type:"POST",data:JSON.stringify({company:this.company,oProperty:i}),headers:{Authorization:"Bearer "+n},crossDomain:true,url:backendUrl+"materialRequest/approveMR",contentType:"application/json",success:function(s,i,n){e.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:u.Message,title:"Success",state:c.Success,content:new r({text:"Material Request approved"}),beginButton:new o({type:l.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})});t.setProperty("/showFooter",false)}this.oSuccessMessageDialog.open()},error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onRejectButtonClick:function(e){if(!this.rejectMaterialRequestDialog){this.rejectMaterialRequestDialog=this.loadFragment({name:"frontend.bbs.view.materialRequest.RejectForm"})}this.rejectMaterialRequestDialog.then(function(e){this.oDialog=e;this.oDialog.open()}.bind(this))},_closeDialog:function(){this.oDialog.close()},onConfirmRejectClick:function(){var e=this.getView().byId("materialRequestPageID");var t=this.getView().getModel("materialRequestDetailModel").getData();e.setBusy(true);var s=this.getView().byId("rejectDialog");var i=t.Code;var n=this.getView().byId("RejectionRemarksID").getValue();var g=this.getView().getModel("viewModel");$.ajax({type:"POST",data:{Code:i,Remarks:n,company:this.company},headers:{Authorization:"Bearer "+this.oJWT},crossDomain:true,url:backendUrl+"materialRequest/rejectMR",success:function(t,i,n){e.setBusy(false);s.close();if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:u.Message,title:"Success",state:c.Success,content:new r({text:"Material Request rejected"}),beginButton:new o({type:l.Emphasized,text:"OK",press:function(){g.setProperty("/showFooter",false);this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()}.bind(this),error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onAddPress:function(e){const t=this.getView().getModel("materialRequestDetailModel");var s=t.getData();var a={U_AccountCode:"",U_ItemCode:"",U_Qty:""};s.MATERIALREQLINESCollection.push(a);var o=new sap.ui.model.json.JSONModel(s);this.getView().setModel(o,"materialRequestDetailModel");o.refresh()},onDelete:function(e){var t=e.getParameters().row;var s=t.getIndex();var a=this.getView().getModel("materialRequestDetailModel");var o=a.getData().MATERIALREQLINESCollection;o.splice(s,1);a.setProperty("/MATERIALREQLINESCollection",o);a.refresh()},onSaveButtonClick:function(e){var t=this.getView().byId("materialRequestPageID");t.setBusy(true);var s=this.getView().getModel("materialRequestDetailModel");var i=this.oJWT;$.ajax({type:"POST",data:JSON.stringify({company:this.company,data:s.getData()}),headers:{Authorization:"Bearer "+i},crossDomain:true,url:backendUrl+"materialRequest/saveMR",contentType:"application/json",success:function(e,s,i){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:u.Message,title:"Success",state:c.Success,content:new r({text:"Material Request saved"}),beginButton:new o({type:l.Emphasized,text:"OK",press:function(){this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onResubmitButtonClick:function(e){var t=this.getView().byId("materialRequestPageID");t.setBusy(true);var s=this.getView().getModel("materialRequestDetailModel");var i=JSON.stringify({company:this.company,data:s.getData()});var n=this.oJWT;var g=this.getView().getModel("viewModel");$.ajax({type:"POST",data:i,headers:{Authorization:"Bearer "+n},crossDomain:true,url:backendUrl+"materialRequest/resubmitMR",contentType:"application/json",success:function(e,s,i){t.setBusy(false);if(!this.oSuccessMessageDialog){this.oSuccessMessageDialog=new a({type:u.Message,title:"Success",state:c.Success,content:new r({text:"Material Request resubmitted"}),beginButton:new o({type:l.Emphasized,text:"OK",press:function(){g.setProperty("/showFooter",false);g.setProperty("/editable",false);this.oSuccessMessageDialog.close()}.bind(this)})})}this.oSuccessMessageDialog.open()},error:function(e,t,s){console.log("Got an error response: "+t+s)}})},onBudgetChange:async function(e){var t=e.getSource(),s=t.getSelectedKey(),a=t.getValue();if(!s&&a){t.setValueState(c.Error);t.setValueStateText("Please enter a valid Budget Code")}else{t.setValueState(c.None)}if(t.getValueState()==c.None){this.getView().byId("materialRequestPageID").setBusy(true);var o=this.getView().getModel("accounts");o.loadData(backendUrl+"coa/getCOAsByBudget?",{budgetCode:s,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});o.refresh();var i=parseInt(e.getParameters("selectedItem").value);var r=this.getView().getModel("budget");await r.loadData(backendUrl+"budget/getBudgetById?code="+i,null,true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});r.refresh();this.getView().byId("materialRequestPageID").setBusy(false)}},onAccountCodeChange:async function(e){var t=e.getSource().getSelectedKey();var a=e.getSource().getParent();a.getCells()[1].setSelectedKey("");a.getCells()[1].setBusy(true);a.getCells()[1].setEnabled(true);var o=this.getView().getModel("items");o.setSizeLimit(1e3);var i=o.getData();if(!(t in i)){var r=new s;await r.loadData(backendUrl+"items/getItemsByAccount",{accountCode:t,company:this.company},true,"GET",false,false,{Authorization:"Bearer "+this.oJWT});var n=r.getData();i[t]=n;var l=new sap.ui.model.json.JSONModel(i);this.getView().setModel(l,"items");l.refresh()}a.getCells()[1].bindAggregation("items",{path:"items>/"+t,template:new sap.ui.core.Item({key:"{items>ItemCode}",text:"{items>ItemCode} - {items>ItemName}"})});a.getCells()[1].setBusy(false)},objectFormatter:function(e){if(e==1){return"Warning"}else if(e==2){return"Information"}else if(e==3){return"Success"}else{return"Error"}},textFormatter:function(e){if(e==1){return"Pending"}else if(e==2){return"Approved by Manager"}else if(e==3){return"Approved by Director"}else{return"Rejected"}}})});